import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  
  const navStyle = ({ isActive }) => ({
    color: isActive ? '#f1c40f' : 'white', 
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: isActive ? 'underline' : 'none',
    alignSelf: 'center',
    padding: '5px 10px',
    borderRadius: '4px',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent', 
    transition: 'all 0.3s ease' 
  });

  const userName = localStorage.getItem('userName');
  // 👇 1. ดึง role จากความจำเบราว์เซอร์มาเช็ค
  const userRole = localStorage.getItem('role'); 

  const handleLogoutClick = () => {
    localStorage.removeItem('userName'); 
    localStorage.removeItem('userId');   
    localStorage.removeItem('role'); // เคลียร์สิทธิ์ทิ้งตอนออก
    localStorage.removeItem('isLoggedIn');
    onLogout();
    // ใช้ setTimeout เพื่อให้ navigate ทำงานหลังจาก state update เสร็จแล้ว
    setTimeout(() => {
      navigate('/', { replace: true }); // ⬅️ กลับไปหน้า Home หลังออกจากระบบ
    }, 0);
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', backgroundColor: '#2c3e50', color: 'white' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h3 style={{ margin: 0, marginRight: '20px' }}>KasetFair e-Reservation</h3>
        <NavLink to="/" style={navStyle}>1. หน้าหลัก</NavLink>
        <NavLink to="/booking" style={navStyle}>2. ค้นหาพื้นที่เช่า</NavLink>
        <NavLink to="/my-shop" style={navStyle}>3. ร้านของฉัน</NavLink>
        
        {/* 👇 2. ถ้า role เป็น admin ถึงจะสร้างเมนูนี้ขึ้นมา! 👇 */}
        {userRole === 'admin' && (
          <NavLink to="/admin" style={navStyle}>👑 4. ระบบแอดมิน</NavLink>
        )}
      </div>

      <div style={{ display: 'flex', gap: '15px', alignSelf: 'center' }}>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>
              👤 {userName || 'ผู้ใช้งาน'} {userRole === 'admin' && '(Admin)'}
            </span>
            <button onClick={handleLogoutClick} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', padding: 0 }}>
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>ลงทะเบียน</Link>
            <span style={{ color: 'white' }}>|</span>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>ล็อกอิน</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;