from flask import Flask, request, jsonify
import mysql.connector
from pymongo import MongoClient

app = Flask(__name__)

mysql_conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="@Winner918",
    database="kasetfair"
)

mongo_client = MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["kasetfair"]
vendors_collection = mongo_db["Vendor_Details"]

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

@app.route('/api/reservations/<int:res_id>', methods=['DELETE'])
def delete_reservation(res_id):
    cursor = mysql_conn.cursor()
    cursor.execute("UPDATE Reservations SET status = 'cancelled' WHERE id = %s", (res_id,))
    mysql_conn.commit()
    return jsonify({"message": f"ยกเลิกการจองรหัส {res_id} สำเร็จ (Soft Delete)"}), 200

@app.route('/')
def hello_world1():
    return 'Hi my name is someone'

if __name__ == '__main__':
    app.run(debug=True, port=5000)