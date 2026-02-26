// import React, { useState } from 'react'; // 1. import useState เพิ่มเข้ามา
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Home from './pages/Home';
// import Booking from './pages/Booking';
// import MyShop from './pages/MyShop';
// import Login from './pages/Login';
// import Register from './pages/Register'; // 2. import หน้า Register เข้ามา

// function App() {
//   // 3. สร้าง State เพื่อเก็บสถานะว่าล็อกอินอยู่หรือไม่ (ค่าเริ่มต้นคือ false = ยังไม่ล็อกอิน)
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // ฟังก์ชันสำหรับจัดการตอนกดปุ่มออกจากระบบ
//   const handleLogout = () => {
//     // ในอนาคตคุณสามารถเพิ่มโค้ดลบ Token ใน localStorage ตรงนี้ได้
//     setIsLoggedIn(false); 
//   };

//   return (
//     <BrowserRouter>
//       {/* 4. ส่งสถานะและฟังก์ชันไปให้ Navbar นำไปใช้สลับปุ่ม */}
//       <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} /> 
      
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/booking" element={<Booking isLoggedIn={isLoggedIn} />} />
//         <Route 
//           path="/my-shop" 
//           element={isLoggedIn ? <MyShop /> : <Navigate to="/login" replace />} 
//         />
        
//         {/* 5. ส่ง setIsLoggedIn ไปให้หน้า Login เพื่อให้ตอนล็อกอินเสร็จ สั่งเปลี่ยนสถานะได้ */}
//         <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        
//         {/* 6. เพิ่ม Route สำหรับหน้า Register (แก้ปัญหา Error สีเหลือง) */}
//         <Route path="/register" element={<Register />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Booking from './pages/Booking';
import MyShop from './pages/MyShop';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  // 1. ดึงค่าเริ่มต้นจาก localStorage แทน ถ้ามีคำว่า 'true' ให้ถือว่าล็อกอินแล้ว
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogout = () => {
    // 2. [ไม่สำคัญ] เมื่อกดออกจากระบบ ให้ลบความจำในเบราว์เซอร์ทิ้งด้วย
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false); 
  };

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} /> 
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking isLoggedIn={isLoggedIn} />} />
        <Route 
          path="/my-shop" 
          element={isLoggedIn ? <MyShop /> : <Navigate to="/login" replace />} 
        />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;