import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. อย่าลืม import Link เข้ามาด้วยนะครับ

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ส่งข้อมูลไป API:", { username, password });
    if (onLogin) {
      onLogin(username, password);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50', fontSize: '24px' }}>เข้าสู่ระบบจองพื้นที่</h2>
        
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

        {/* 2. เพิ่มส่วนข้อความลิงก์ไปหน้าลงทะเบียนตรงนี้ */}
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