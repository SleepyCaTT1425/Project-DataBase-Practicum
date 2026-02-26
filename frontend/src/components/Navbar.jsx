import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // 1. เปลี่ยนมาใช้งาน NavLink เพิ่มเติม

// เพิ่ม props isLoggedIn (เช็คสถานะ) และ onLogout (ฟังก์ชันตอนกดออก)
function Navbar({ isLoggedIn, onLogout }) {
  
  // 2. สร้างฟังก์ชันสำหรับจัดการสไตล์ของเมนู 
  // ตัวแปร isActive จะเป็น true อัตโนมัติ ถ้า URL ปัจจุบันตรงกับเมนูนั้น
  const navStyle = ({ isActive }) => ({
    color: isActive ? '#f1c40f' : 'white', // สีเหลืองเมื่ออยู่หน้านั้น สีขาวเมื่ออยู่หน้าอื่น
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: isActive ? 'underline' : 'none',
    alignSelf: 'center',
    padding: '5px 10px',
    borderRadius: '4px',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent', // เพิ่มพื้นหลังจางๆ ให้ดูมีมิติ
    transition: 'all 0.3s ease' // ทำให้เอฟเฟกต์ตอนสลับหน้าดูสมูทขึ้น
  });

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '15px 30px', 
      backgroundColor: '#2c3e50', 
      color: 'white' 
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h3 style={{ margin: 0, marginRight: '20px' }}>KasetFair e-Reservation</h3>
        
        {/* 3. เปลี่ยนจาก Link เป็น NavLink และเรียกใช้ navStyle */}
        <NavLink to="/" style={navStyle}>1. หน้าหลัก</NavLink>
        <NavLink to="/booking" style={navStyle}>2. ค้นหาพื้นที่เช่า</NavLink>
        <NavLink to="/my-shop" style={navStyle}>3. ร้านของฉัน</NavLink>
      </div>

      {/* ส่วนจัดการ ล็อกอิน / ลงทะเบียน / ออกจากระบบ */}
      <div style={{ display: 'flex', gap: '15px', alignSelf: 'center' }}>
        {isLoggedIn ? (
          // ถ้าล็อกอินแล้ว แสดงปุ่ม Logout
          <button 
            onClick={onLogout} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer', 
              fontSize: '16px',
              padding: 0
            }}
          >
            ออกจากระบบ
          </button>
        ) : (
          // ถ้ายังไม่ล็อกอิน แสดง ลงทะเบียน และ ล็อกอิน
          <>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>ลงทะเบียน</Link>
            <span style={{ color: 'white' }}>|</span> {/* ใส่ขีดคั่นกลางให้ดูสวยขึ้น */}
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>ล็อกอิน</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;