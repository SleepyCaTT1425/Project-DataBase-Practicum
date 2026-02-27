from flask import Flask, request, jsonify
from flask_cors import CORS # นำเข้า CORS เพื่อให้ React เชื่อมต่อได้
import mysql.connector
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash # ใช้เข้ารหัสผ่าน

app = Flask(__name__)
CORS(app) # เปิดใช้งาน CORS สำหรับทุกเส้นทาง

# เชื่อมต่อ MySQL
mysql_conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Propond14!",
    database="kasetfair"
)

# เชื่อมต่อ MongoDB
mongo_client = MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["kasetfair"]
vendors_collection = mongo_db["Vendor_Details"]

# ---------------- API สำหรับบูธและร้านค้า ----------------

@app.route('/api/booths', methods=['GET'])
def get_booths():
    cursor = mysql_conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Booths")
    booths = cursor.fetchall()
    return jsonify(booths)

@app.route('/api/booths/<int:booth_id>', methods=['PUT'])
def update_booth(booth_id):
    data = request.json
    new_status = data.get('status')
    cursor = mysql_conn.cursor()
    cursor.execute("UPDATE Booths SET status = %s WHERE id = %s", (new_status, booth_id))
    mysql_conn.commit()
    return jsonify({"message": f"อัปเดตบูธ {booth_id} เป็นสถานะ {new_status} สำเร็จ!"}), 200

@app.route('/api/vendors', methods=['POST'])
def create_vendor():
    data = request.json
    vendors_collection.insert_one(data)
    return jsonify({"message": "สร้างข้อมูลร้านค้าสำเร็จ!"}), 201

# 1. เพิ่มเส้นทาง /api/vendors แบบ GET เพื่อให้หน้า Home นำไปใช้
@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    # 2. ดึงข้อมูลร้านค้าทั้งหมดออกมา และซ่อนฟิลด์ _id ของ MongoDB เพื่อไม่ให้ React เกิด Error
    vendors = list(vendors_collection.find({}, {'_id': 0}))
    return jsonify(vendors)

# ---------------- API ที่เพิ่มเข้ามาใหม่ ----------------

# API สมัครสมาชิก (เชื่อมกับ Register.jsx)
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    # รับข้อมูลจาก React
    name = data.get('fullName')
    username = data.get('username') # เราจะใช้ตัวนี้แทน email ใน DB
    password = data.get('password')
    phone = data.get('phoneNumber')

    # เข้ารหัสผ่านก่อนเก็บลงฐานข้อมูล
    hashed_password = generate_password_hash(password)

    cursor = mysql_conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO Users (name, email, password_hash, phone, role) VALUES (%s, %s, %s, %s, 'vendor')",
            (name, username, hashed_password, phone)
        )
        mysql_conn.commit()
        return jsonify({"message": "ลงทะเบียนสำเร็จ"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว"}), 400

# API เข้าสู่ระบบ (เชื่อมกับ Login.jsx)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    cursor = mysql_conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Users WHERE email = %s", (username,))
    user = cursor.fetchone()

    # เช็คว่าเจอผู้ใช้ และรหัสผ่านที่ Hash ไว้ตรงกันหรือไม่
    if user and check_password_hash(user['password_hash'], password):
        return jsonify({"message": "เข้าสู่ระบบสำเร็จ", "user_id": user['id'], "role": user['role']}), 200
    else:
        return jsonify({"error": "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"}), 401

# API สร้างการจองพื้นที่ (เชื่อมกับ Booking.jsx)
@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    data = request.json
    user_id = data.get('user_id')
    booth_id = data.get('booth_id')

    cursor = mysql_conn.cursor()
    # 1. บันทึกข้อมูลลงตาราง Reservations
    cursor.execute("INSERT INTO Reservations (user_id, booth_id, status) VALUES (%s, %s, 'active')", (user_id, booth_id))
    # 2. เปลี่ยนสถานะของบูธเป็น booked
    cursor.execute("UPDATE Booths SET status = 'booked' WHERE id = %s", (booth_id,))
    
    mysql_conn.commit()
    return jsonify({"message": "จองพื้นที่สำเร็จ!"}), 201

@app.route('/api/reservations/<int:res_id>', methods=['DELETE'])
def delete_reservation(res_id):
    cursor = mysql_conn.cursor()
    cursor.execute("UPDATE Reservations SET status = 'cancelled' WHERE id = %s", (res_id,))
    mysql_conn.commit()
    return jsonify({"message": f"ยกเลิกการจองรหัส {res_id} สำเร็จ (Soft Delete)"}), 200

# ไม่มีความสำคัญ แต่เก็บไว้ทดสอบระบบ
@app.route('/')
def hello_world1():
    return 'Hi my name is someone'

if __name__ == '__main__':
    app.run(debug=True, port=5000)