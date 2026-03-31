import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const navStyle = ({ isActive }) => ({
    color: isActive ? '#3b82f6' : '#6b7280',
    fontWeight: isActive ? '600' : 'normal',
    textDecoration: 'none',
    alignSelf: 'center',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
    transition: 'all 0.2s ease',
    fontSize: '14px'
  });

  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('role');

  const handleLogoutClick = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('isLoggedIn');
    onLogout();
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 0);
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <h3 style={{ margin: 0, marginRight: '16px', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>KasetFair</h3>
        <NavLink to="/" style={navStyle}>หน้าหลัก</NavLink>
        <NavLink to="/booking" style={navStyle}>ค้นหาพื้นที่</NavLink>
        <NavLink to="/my-shop" style={navStyle}>ร้านของฉัน</NavLink>

        {userRole === 'admin' && (
          <NavLink to="/admin" style={navStyle}>ระบบแอดมิน</NavLink>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', alignSelf: 'center', fontSize: '14px' }}>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#6b7280' }}>
              {userName || 'ผู้ใช้งาน'} {userRole === 'admin' && <span style={{ color: '#3b82f6' }}>(Admin)</span>}
            </span>
            <button onClick={handleLogoutClick} style={{ background: 'none', border: '1px solid #d1d5db', color: '#6b7280', cursor: 'pointer', fontSize: '13px', padding: '4px 12px', borderRadius: '6px' }}>
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/register" style={{ color: '#6b7280', textDecoration: 'none', padding: '4px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}>ลงทะเบียน</Link>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', padding: '4px 12px', borderRadius: '6px', backgroundColor: '#3b82f6', fontSize: '13px' }}>ล็อกอิน</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
