import os
from dotenv import load_dotenv # 👇 นำเข้าไลบรารีสำหรับอ่าน .env
from flask import Flask, request, jsonify
from flask_cors import CORS 
import mysql.connector
from mysql.connector import pooling
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash 
import subprocess
import sys
from datetime import datetime

# 👇 โหลดค่าจากไฟล์ .env 👇
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "kasetfair")
PROMPTPAY_PHONE = os.getenv("PROMPTPAY_PHONE", "0801112222")
PAYMENT_TIMEOUT_MINUTES = int(os.getenv("PAYMENT_TIMEOUT_MINUTES", 10))

app = Flask(__name__)
CORS(app) 

app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  

def ensure_mysql_running(service_name="MySQL80"):
    if sys.platform.startswith("win"):
        try:
            subprocess.run(["net", "start", service_name], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except subprocess.CalledProcessError: pass

ensure_mysql_running()

# ==========================================
# 🌟 ระบบ Connection Pool (ดึงรหัสจาก .env)
# ==========================================
dbconfig = {
    "host": DB_HOST,
    "user": DB_USER,
    "password": DB_PASSWORD, 
    "database": DB_NAME
}

try:
    mysql_pool = pooling.MySQLConnectionPool(
        pool_name="kasetfair_pool",
        pool_size=10,
        pool_reset_session=True,
        **dbconfig
    )
except mysql.connector.Error as err:
    print(f"Error creating connection pool: {err}")

mongo_client = MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client[DB_NAME]
vendors_collection = mongo_db["Vendor_Details"]
slips_collection = mongo_db["Payment_Slips"]

# ==========================================
# ระบบ Auto-Cancel ยกเลิกจองอัตโนมัติ (ใช้เวลาจาก .env)
# ==========================================
@app.before_request
def check_db_connection_and_cleanup():
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        # 👇 ใช้ PAYMENT_TIMEOUT_MINUTES แทนค่าคงที่ 10 👇
        cursor.execute(f"""
            SELECT r.id, b.booth_code 
            FROM Reservations r
            JOIN Booths b ON r.booth_id = b.id
            WHERE r.status = 'active' 
              AND r.payment_status = 'unpaid' 
              AND r.booking_date < (NOW() - INTERVAL {PAYMENT_TIMEOUT_MINUTES} MINUTE)
        """)
        expired_res = cursor.fetchall()
        
        if expired_res:
            expired_ids = [str(r['id']) for r in expired_res]
            expired_booths = [r['booth_code'] for r in expired_res]
            
            format_strings = ','.join(['%s'] * len(expired_ids))
            cursor.execute(f"UPDATE Reservations SET status = 'cancelled' WHERE id IN ({format_strings})", tuple(expired_ids))
            cursor.execute(f"UPDATE Booths SET status = 'available' WHERE booth_code IN ({format_strings})", tuple(expired_booths))
            conn.commit()
            
            vendors_collection.delete_many({"stallId": {"$in": expired_booths}})
            print(f"⚠️ Auto-Cancelled Reservations: {expired_ids}")
            
        cursor.close()
        conn.close() 
    except Exception as e:
        print("Cleanup Error:", e)

# ==========================================
# API สำหรับบูธและร้านค้า
# ==========================================
@app.route('/api/booths', methods=['GET'])
def get_booths():
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.id, b.booth_code, b.size_sqm, b.price, b.status, r.payment_status
            FROM Booths b
            LEFT JOIN Reservations r ON b.id = r.booth_id AND r.status = 'active'
        """)
        booths = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(booths)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/booths/<int:booth_id>', methods=['PUT'])
def update_booth(booth_id):
    try:
        data = request.json
        status = data.get('status')
        price = data.get('price') 
        
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        if status and price is not None:
            cursor.execute("UPDATE Booths SET status = %s, price = %s WHERE id = %s", (status, price, booth_id))
        elif status:
            cursor.execute("UPDATE Booths SET status = %s WHERE id = %s", (status, booth_id))
        elif price is not None:
            cursor.execute("UPDATE Booths SET price = %s WHERE id = %s", (price, booth_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Booth updated successfully"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/vendors', methods=['POST'])
def create_vendor():
    data = request.json
    vendors_collection.insert_one(data)
    return jsonify({"message": "สร้างข้อมูลร้านค้าสำเร็จ!"}), 201

@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    try:
        vendors = list(vendors_collection.find({"status": {"$ne": "deleted"}}, {'_id': 0}))
        
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.booth_code, r.payment_status 
            FROM Reservations r
            JOIN Booths b ON r.booth_id = b.id
            WHERE r.status = 'active'
        """)
        reservations = cursor.fetchall()
        cursor.close()
        conn.close()
        
        status_map = {res['booth_code']: res['payment_status'] for res in reservations}
        for vendor in vendors:
            vendor['paymentStatus'] = status_map.get(vendor.get('stallId'), 'unpaid')
            
        return jsonify(vendors), 200
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

@app.route('/api/myshop/<int:user_id>', methods=['GET'])
def get_myshop(user_id):
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Reservations WHERE user_id = %s AND status = 'active'", (user_id,))
        reservations = cursor.fetchall()

        if not reservations: 
            cursor.close()
            conn.close()
            return jsonify({"shops": []}), 200

        shops = []
        timeout_seconds = PAYMENT_TIMEOUT_MINUTES * 60 # แปลงนาทีเป็นวินาที

        for reservation in reservations:
            booth_code = None
            booth_price = 0
            res_id = reservation['id']
            
            cursor.execute("SELECT booth_code, price FROM Booths WHERE id = %s", (reservation['booth_id'],))
            booth = cursor.fetchone()
            
            if booth:
                booth_code = booth.get('booth_code')
                booth_price = booth.get('price')

            vendor = vendors_collection.find_one({"stallId": booth_code}, {'_id': 0}) if booth_code else None
            slip_doc = slips_collection.find_one({"reservation_id": res_id}, {'_id': 0, 'slip_image': 1})
            slip_image_data = slip_doc.get('slip_image', '') if slip_doc else ''

            booking_date = reservation.get('booking_date')
            seconds_remaining = 0
            if booking_date and reservation.get('payment_status') == 'unpaid':
                delta = datetime.now() - booking_date
                seconds_remaining = max(0, timeout_seconds - int(delta.total_seconds()))

            shops.append({
                "reservationId": res_id, 
                "boothCode": booth_code,
                "boothPrice": booth_price,
                "paymentStatus": reservation.get('payment_status', 'unpaid'),
                "slipImage": slip_image_data,
                "timeLeft": seconds_remaining,
                "promptpayPhone": PROMPTPAY_PHONE, # 👇 ส่งเบอร์จาก .env ไปให้ React 👇
                "vendor": vendor
            })

        cursor.close()
        conn.close()
        return jsonify({"shops": shops}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/vendors/<stall_id>', methods=['PUT'])
def update_vendor(stall_id):
    data = request.json
    try:
        result = vendors_collection.update_one({"stallId": stall_id}, {"$set": data})
        if result.matched_count == 0: return jsonify({"error": "ไม่พบร้านค้าในระบบ"}), 404
        return jsonify({"message": "อัปเดตข้อมูลร้านค้าสำเร็จ"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

# ==========================================
# API ระบบ Users/Auth 
# ==========================================
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('fullName')
    username = data.get('username') 
    password = data.get('password')
    phone = data.get('phoneNumber')
    hashed_password = generate_password_hash(password)
    
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Users (name, email, password_hash, phone, role) VALUES (%s, %s, %s, %s, 'vendor')", (name, username, hashed_password, phone))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "ลงทะเบียนสำเร็จ"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว"}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, password_hash, role FROM Users WHERE name = %s OR email = %s", (username, username))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            return jsonify({"message": "Login successful", "user_id": user['id'], "name": user['name'], "role": user['role']}), 200
        else: return jsonify({"error": "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"}), 401
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    try:
        data = request.json
        user_id = data.get('user_id')
        booth_id = data.get('booth_id')
        
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Reservations (user_id, booth_id, status) VALUES (%s, %s, 'active')", (user_id, booth_id))
        cursor.execute("UPDATE Booths SET status = 'booked' WHERE id = %s", (booth_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "จองพื้นที่สำเร็จ!"}), 201
    except Exception as e: return jsonify({"error": str(e)}), 500

# ==========================================
# API ระบบจัดการลบข้อมูล (Admin) 
# ==========================================
@app.route('/api/admin/shops/<stall_id>', methods=['DELETE'])
def soft_delete_shop(stall_id):
    try:
        vendors_collection.update_one({"stallId": stall_id}, {"$set": {"status": "deleted"}})
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM Booths WHERE booth_code = %s", (stall_id,))
        booth = cursor.fetchone()
        if booth:
            booth_id = booth['id']
            cursor.execute("UPDATE Reservations SET status = 'cancelled' WHERE booth_id = %s", (booth_id,))
            cursor.execute("UPDATE Booths SET status = 'available' WHERE id = %s", (booth_id,))
            conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": f"ซ่อนข้อมูลร้านล็อก {stall_id} สำเร็จ"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/admin/shops', methods=['DELETE'])
def soft_delete_all_shops():
    try:
        vendors_collection.update_many({}, {"$set": {"status": "deleted"}})
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE Reservations SET status = 'cancelled'")
        cursor.execute("UPDATE Booths SET status = 'available' WHERE status = 'booked'")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "ซ่อนข้อมูลร้านค้าทั้งหมดสำเร็จ"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

# 👇 เพิ่ม API ลบถาวร "ทั้งหมดรวดเดียว" (Hard Delete All Shops) 👇
@app.route('/api/admin/shops/hard', methods=['DELETE'])
def hard_delete_all_shops():
    try:
        # 1. ลบข้อมูลร้านค้าทั้งหมดใน MongoDB (ทิ้งเกลี้ยง)
        vendors_collection.delete_many({})
        
        # 2. ลบรูปสลิปทั้งหมดใน MongoDB (ทิ้งเกลี้ยง)
        slips_collection.delete_many({})
        
        # 3. ลบประวัติการจองและอัปเดตบูธใน MySQL
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM Reservations")
        cursor.execute("UPDATE Booths SET status = 'available'")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "ลบข้อมูลร้านค้า สลิป และประวัติการจองทั้งหมดแบบถาวรสำเร็จ!"}), 200
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
def get_all_vendors_list():
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, phone FROM Users WHERE role = 'vendor'")
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(users), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def hard_delete_user(user_id):
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. ค้นหาประวัติการจองทั้งหมดของ User คนนี้
        cursor.execute("SELECT id as reservation_id, booth_id FROM Reservations WHERE user_id = %s", (user_id,))
        reservations = cursor.fetchall()
        
        for res in reservations:
            res_id = res['reservation_id']
            booth_id = res['booth_id']
            
            # 2. ลบสลิปที่เกี่ยวข้องกับการจองนี้ทิ้งจาก MongoDB
            slips_collection.delete_many({"reservation_id": res_id})
            
            # 3. หา booth_code เพื่อไปตามลบข้อมูลหน้าร้าน (Vendor)
            cursor.execute("SELECT booth_code FROM Booths WHERE id = %s", (booth_id,))
            booth = cursor.fetchone()
            if booth:
                booth_code = booth['booth_code']
                # ลบร้านค้านี้ทิ้งจาก MongoDB
                vendors_collection.delete_many({"stallId": booth_code})
                
                # 4. คืนสถานะล็อกบูธให้กลับมา "ว่าง" เหมือนเดิม
                cursor.execute("UPDATE Booths SET status = 'available' WHERE id = %s", (booth_id,))
                
        # 5. ลบประวัติการจองใน MySQL
        cursor.execute("DELETE FROM Reservations WHERE user_id = %s", (user_id,))
        
        # 6. ลบบัญชีผู้ใช้งานใน MySQL
        cursor.execute("DELETE FROM Users WHERE id = %s AND role = 'vendor'", (user_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "ลบผู้ใช้งานและเคลียร์ข้อมูลร้านค้าที่เกี่ยวข้องสำเร็จ"}), 200
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/users', methods=['DELETE'])
def hard_delete_all_users():
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Reservations WHERE user_id IN (SELECT id FROM Users WHERE role = 'vendor')")
        cursor.execute("DELETE FROM Users WHERE role = 'vendor'")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "ลบผู้ใช้งาน Vendor ทั้งหมดสำเร็จ"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

# ==========================================
# API สำหรับระบบชำระเงิน
# ==========================================
@app.route('/api/payments/upload/<int:res_id>', methods=['PUT'])
def upload_slip(res_id):
    try:
        data = request.json
        if not data or 'slip_image' not in data:
            return jsonify({"error": "ไม่พบข้อมูลรูปภาพ กรุณาลองใหม่"}), 400
            
        slip_image = data.get('slip_image')
        slips_collection.update_one({"reservation_id": res_id}, {"$set": {"slip_image": slip_image}}, upsert=True)
        
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE Reservations SET payment_status = 'checking' WHERE id = %s", (res_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "อัปโหลดสลิปสำเร็จ รอแอดมินตรวจสอบ"}), 200
    except Exception as e: 
        return jsonify({"error": f"เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์: {str(e)}"}), 500

@app.route('/api/admin/payments', methods=['GET'])
def get_pending_payments():
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.id as reservation_id, b.booth_code, b.price, u.name as user_name 
            FROM Reservations r
            JOIN Booths b ON r.booth_id = b.id
            JOIN Users u ON r.user_id = u.id
            WHERE r.payment_status = 'checking'
        """)
        payments = cursor.fetchall()
        cursor.close()
        conn.close()
        
        for pay in payments:
            slip_doc = slips_collection.find_one({"reservation_id": pay['reservation_id']}, {'_id': 0, 'slip_image': 1})
            pay['slip_image'] = slip_doc.get('slip_image', '') if slip_doc else ''
            
        return jsonify(payments), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/admin/payments/<int:res_id>', methods=['PUT'])
def verify_payment(res_id):
    data = request.json
    action = data.get('action') 
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor()
        if action == 'approve':
            cursor.execute("UPDATE Reservations SET payment_status = 'paid' WHERE id = %s", (res_id,))
        else:
            cursor.execute("UPDATE Reservations SET payment_status = 'unpaid' WHERE id = %s", (res_id,))
            slips_collection.delete_one({"reservation_id": res_id})
            
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "อัปเดตสถานะสำเร็จ"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

# ==========================================
# API ประวัติการจอง (History) สำหรับ Admin
# ==========================================
@app.route('/api/admin/history', methods=['GET'])
def get_booking_history():
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        # ดึงประวัติทั้งหมด เรียงจากใหม่ไปเก่า
        cursor.execute("""
            SELECT r.id, r.booking_date, r.status as reserve_status, r.payment_status, 
                   b.booth_code, b.price, 
                   u.name as user_name, u.phone
            FROM Reservations r
            JOIN Booths b ON r.booth_id = b.id
            JOIN Users u ON r.user_id = u.id
            ORDER BY r.booking_date DESC
        """)
        history = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(history), 200
    except Exception as e: 
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True, port=5000)