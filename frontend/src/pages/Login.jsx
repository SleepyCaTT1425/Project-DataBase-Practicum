import React, { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { API_URL } from '../config';

function Login({ onLogin }) {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        }), 
      });

      const data = await response.json(); 

      if (response.ok) {
        console.log("เข้าสู่ระบบสำเร็จ:", data);

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('userName', data.name); 
        
        // 👇 สำคัญมาก: เพิ่มบรรทัดนี้เพื่อให้ React จำได้ว่าคนนี้คือ Admin! 👇
        localStorage.setItem('role', data.role); 
        
        if (onLogin) {
          onLogin();
        }
        
        navigate('/booking');
      } else {
        setError(data.error || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50', fontSize: '24px' }}>เข้าสู่ระบบจองพื้นที่</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>ชื่อผู้ใช้งาน (Username)</label>
            <input
              type="text" 
              placeholder="กรอกชื่อผู้ใช้งานของคุณ"
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
              placeholder="กรอกรหัสผ่าน"
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