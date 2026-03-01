import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', 
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  });

  // 👇 1. สร้าง State สำหรับควบคุม Popup แทน window.alert
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const closeConfirmDialog = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });

  const showSuccessAlert = (message, onConfirmCallback) => {
    setConfirmDialog({
      isOpen: true,
      title: '✅ สำเร็จ',
      message: message,
      onConfirm: () => {
        closeConfirmDialog();
        if (onConfirmCallback) onConfirmCallback();
      }
    });
  };

  const showErrorAlert = (message) => {
    setConfirmDialog({
      isOpen: true,
      title: '❌ ข้อผิดพลาด',
      message: message,
      onConfirm: () => closeConfirmDialog()
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 👇 2. เปลี่ยนมาใช้ showErrorAlert แทนการเซ็ตข้อความสีแดงแบบเดิม
    if (formData.password !== formData.confirmPassword) {
      showErrorAlert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับ');
      return;
    }

    try {
      const payload = {
        ...formData,
        username: formData.email 
      };

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), 
      });

      const data = await response.json();

      if (response.ok) {
        // 👇 3. เรียกใช้ showSuccessAlert และให้มันพากลับไปหน้า Login เมื่อกด "ตกลง"
        showSuccessAlert('ลงทะเบียนสำเร็จ! ระบบจะพาท่านไปยังหน้าเข้าสู่ระบบ', () => {
          navigate('/login'); 
        });
      } else {
        showErrorAlert(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } catch (err) {
      console.error("Error connection:", err);
      showErrorAlert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f0f0', fontFamily: 'sans-serif', padding: '20px', position: 'relative' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50', fontSize: '24px' }}>ลงทะเบียนผู้ใช้งานใหม่</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>ชื่อผู้ใช้งาน</label>
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
            <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>อีเมล (Email)</label>
            <input
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
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
          <Link 
            to="/login"
            style={{ color: '#3498db', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            เข้าสู่ระบบที่นี่
          </Link>
        </div>
      </div>

      {/* 👇 4. MODAL กลางจอสำหรับหน้าลงทะเบียน 👇 */}
      {confirmDialog.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: confirmDialog.title.includes('✅') ? '#27ae60' : '#e74c3c', 
              fontSize: '22px' 
            }}>
              {confirmDialog.title}
            </h3>
            
            <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '25px' }}>
              {confirmDialog.message}
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={confirmDialog.onConfirm} 
                style={{ 
                  padding: '12px 20px', 
                  backgroundColor: confirmDialog.title.includes('✅') ? '#3498db' : '#e74c3c', 
                  color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', flex: 1 
                }}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Register;