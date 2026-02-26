import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 1. นำเข้า useNavigate และ Link สำหรับการเปลี่ยนหน้า

function Register() { // ไม่ต้องรับ props onNavigateToLogin แล้ว เพราะเราใช้ useNavigate แทน
  const navigate = useNavigate(); // เรียกใช้งานฟังก์ชันสำหรับเปลี่ยนหน้า

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. เติม async เพื่อให้รองรับการทำงานกับ API
  const handleSubmit = async (e) => {
    e.preventDefault(); // (ไม่สำคัญ) ป้องกันหน้าเว็บรีเฟรชตัวเอง
    
    // 3. เช็คว่ารหัสผ่านตรงกันไหม
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับ');
      return;
    }

    setError(''); // เคลียร์ข้อผิดพลาดก่อนเริ่มส่งข้อมูล

    try {
      // 4. ใช้คำสั่ง fetch ยิงข้อมูลไปให้ Backend บันทึกลง MySQL
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // แปลงข้อมูลทั้งหมดเป็น JSON ส่งไป
      });

      const data = await response.json();

      if (response.ok) {
        // ถ้า Backend ตอบกลับมาว่าลงทะเบียนสำเร็จ
        alert('ลงทะเบียนสำเร็จ! ระบบจะพาท่านไปยังหน้าเข้าสู่ระบบ');
        navigate('/login'); // สั่งให้เปลี่ยนไปหน้า Login อัตโนมัติ
      } else {
        // ถ้าไม่สำเร็จ (เช่น มี username นี้ในระบบแล้ว)
        setError(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } catch (err) {
      console.error("Error connection:", err);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f0f0', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50', fontSize: '24px' }}>ลงทะเบียนผู้ใช้งานใหม่</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>ชื่อ-นามสกุล</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>เบอร์โทรศัพท์</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>ชื่อผู้ใช้งาน (Username)</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={{ padding: '14px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#27ae60'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2ecc71'}
          >
            สร้างบัญชี
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
          มีบัญชีอยู่แล้ว?{' '}
          {/* เปลี่ยนมาใช้ Link เพื่อให้คลิกแล้วนำทางได้ถูกต้องตามหลัก React Router */}
          <Link 
            to="/login"
            style={{ color: '#3498db', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            เข้าสู่ระบบที่นี่
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;