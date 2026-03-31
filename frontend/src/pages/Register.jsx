import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', fullName: '', phoneNumber: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const closeConfirmDialog = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
  const showSuccessAlert = (message, cb) => setConfirmDialog({ isOpen: true, title: 'สำเร็จ', message, onConfirm: () => { closeConfirmDialog(); if (cb) cb(); } });
  const showErrorAlert = (message) => setConfirmDialog({ isOpen: true, title: 'ข้อผิดพลาด', message, onConfirm: closeConfirmDialog });

  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { showErrorAlert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน'); return; }
    try {
      const payload = { ...formData, username: formData.email };
      const response = await fetch(`${API_URL}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.ok) { showSuccessAlert('ลงทะเบียนสำเร็จ!', () => navigate('/login')); }
      else { showErrorAlert(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน'); }
    } catch (err) { showErrorAlert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'); }
  };

  const isSuccess = confirmDialog.title === 'สำเร็จ';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', border: '1px solid #e5e7eb', width: '100%', maxWidth: '450px', boxSizing: 'border-box', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#1f2937', fontSize: '22px', fontWeight: '600' }}>ลงทะเบียน</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#6b7280', fontSize: '14px' }}>ชื่อผู้ใช้งาน</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={{ width: '100%', padding: '10px 12px' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#6b7280', fontSize: '14px' }}>เบอร์โทรศัพท์</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} style={{ width: '100%', padding: '10px 12px' }} required />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#6b7280', fontSize: '14px' }}>อีเมล</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" style={{ width: '100%', padding: '10px 12px' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#6b7280', fontSize: '14px' }}>รหัสผ่าน</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '10px 12px' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#6b7280', fontSize: '14px' }}>ยืนยันรหัสผ่าน</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={{ width: '100%', padding: '10px 12px' }} required />
          </div>

          <button type="submit" style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', marginTop: '8px' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >สร้างบัญชี</button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: '#3b82f6', fontWeight: '600' }}>เข้าสู่ระบบ</Link>
        </div>
      </div>

      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: isSuccess ? '#16a34a' : '#dc2626', fontSize: '20px' }}>{confirmDialog.title}</h3>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '24px' }}>{confirmDialog.message}</p>
            <button onClick={confirmDialog.onConfirm} style={{ padding: '10px 20px', backgroundColor: isSuccess ? '#3b82f6' : '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', width: '100%' }}>ตกลง</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
