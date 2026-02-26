import React, { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // 1. สร้าง State ไว้เก็บข้อความ Error เมื่อล็อกอินไม่สำเร็จ
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // 2. ใส่ async เพื่อให้ใช้คำสั่ง await รอเซิร์ฟเวอร์ตอบกลับได้
  const handleSubmit = async (e) => {
    e.preventDefault(); // (ไม่สำคัญ) ป้องกันหน้าเว็บรีเฟรชตอนกดปุ่ม
    setError(''); // เคลียร์ข้อความ error เดิมทิ้งก่อนเริ่มล็อกอินใหม่

    try {
      // 3. ใช้คำสั่ง fetch ส่งข้อมูลไปยัง Flask API
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // บอกเซิร์ฟเวอร์ว่าส่งข้อมูลแบบ JSON ไปนะ
        },
        body: JSON.stringify({ username, password }), // แปลงข้อมูลเป็น JSON string
      });

      const data = await response.json(); // แปลงข้อความที่เซิร์ฟเวอร์ตอบกลับมาให้อยู่ในรูป Object

      // 4. ตรวจสอบว่าเซิร์ฟเวอร์ตอบกลับมาว่าสำเร็จหรือไม่
      if (response.ok) {
        // ถ้าสำเร็จ ให้ล็อกอินและส่งข้อมูล user กลับไปที่ App.jsx
        console.log("เข้าสู่ระบบสำเร็จ:", data);

        // 1. ฝังสถานะการล็อกอินลงใน localStorage ของเบราว์เซอร์
        localStorage.setItem('isLoggedIn', 'true');
        
        if (onLogin) {
          onLogin(username, password);
        }
        
        navigate('/booking');
      } else {
        // ถ้าไม่สำเร็จ ให้เอาข้อความ error จาก Backend มาแสดง
        setError(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } catch (err) {
      // กรณีเชื่อมต่อเซิร์ฟเวอร์ไม่ได้เลย (เช่น ลืมเปิดไฟล์ Python)
      console.error("Error connecting to server:", err);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50', fontSize: '24px' }}>เข้าสู่ระบบจองพื้นที่</h2>
        
        {/* แสดงกล่องข้อความสีแดง ถ้ามี Error เกิดขึ้น */}
        {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={{ padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          <span>ยังไม่มีบัญชีใช่ไหม? </span>
          <Link 
            to="/register" 
            style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            ลงทะเบียน
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;