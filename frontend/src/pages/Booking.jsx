// // 1. นำเข้า useEffect เพิ่มเติมจาก react
// import React, { useState, useEffect } from 'react';
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// import { useNavigate } from 'react-router-dom';

// import { buildings, initialStalls } from '../data/mapData';
// import { buildingInfo } from '../data/mockData';

// const getPolygonCenter = (pointsStr) => {
//   const parts = pointsStr.trim().split(/\s+/);
//   let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
//   parts.forEach(p => {
//     const [x, y] = p.split(',');
//     const nx = parseFloat(x);
//     const ny = parseFloat(y);
//     if (nx < minX) minX = nx;
//     if (nx > maxX) maxX = nx;
//     if (ny < minY) minY = ny;
//     if (ny > maxY) maxY = ny;
//   });
//   return { x: (minX + maxX) / 2, y: minY }; 
// };

// function Booking({ isLoggedIn }) {
//   const [stalls, setStalls] = useState(initialStalls);
//   const [selectedStall, setSelectedStall] = useState(null);
//   const [selectedBuilding, setSelectedBuilding] = useState(null);
//   const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

//   // 1. สร้าง State สำหรับเก็บชื่อร้านค้า
//   const [shopName, setShopName] = useState('');
  
//   const navigate = useNavigate();

//   // 2. ใช้ useEffect เพื่อดึงข้อมูลตอนเปิดหน้าเว็บครั้งแรก
//   useEffect(() => {
//     const fetchBooths = async () => {
//       try {
//         // ขอข้อมูลบูธทั้งหมดจาก API
//         const response = await fetch('http://localhost:5000/api/booths');
//         const data = await response.json();

//         if (response.ok) {
//           // 3. ผสานพิกัดแผนที่เดิม (initialStalls) เข้ากับสถานะใหม่จาก Database (data)
//           const updatedStalls = initialStalls.map(stall => {
//             // หารหัสบูธจาก DB ที่ตรงกับรหัสบนแผนที่ (สมมติว่าใช้ stall.id เทียบกับ booth_code)
//             const dbBooth = data.find(b => b.booth_code === stall.id);
            
//             // ถ้าเจอข้อมูลใน DB ให้อัปเดตสถานะ ถ้าไม่เจอให้ใช้ข้อมูลแผนที่เดิมไปก่อน
//             if (dbBooth) {
//               return { ...stall, status: dbBooth.status, db_id: dbBooth.id };
//             }
//             return stall;
//           });
          
//           // 4. สั่งอัปเดตหน้าจอด้วยข้อมูลใหม่
//           setStalls(updatedStalls);
//         }
//       } catch (error) {
//         console.error("Error fetching booths:", error);
//       }
//     };

//     fetchBooths();

//     // 5. [Cleanup Function ใน useEffect] is not important แต่ใส่ไว้ให้ครบถ้วน
//     return () => {
//       // ไม่ต้องทำอะไรตรงนี้
//     };
//   }, []); // วงเล็บเหลี่ยมว่างๆ หมายถึง ให้ทำแค่ครั้งเดียวตอนโหลดหน้าจอเสร็จ

//   const handleBookingSubmit = async () => {
//     if (!isLoggedIn) {
//       alert("กรุณาเข้าสู่ระบบก่อนทำการยืนยันการจองพื้นที่ครับ!");
//       navigate('/login');
//       return; 
//     }

//     // ป้องกันการกดจองโดยไม่ใส่ชื่อร้าน
//     if (!shopName.trim()) {
//       alert("กรุณาระบุชื่อร้านก่อนทำการจองครับ");
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5000/api/reservations', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           user_id: 2, // จำลอง User ID
//           booth_id: selectedStall.db_id || 2 // ใช้ ID จริงจาก Database ที่เราเพิ่งแนบเข้าไปในข้อ 3
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {

//         // 2. ถ้า MySQL บันทึกสำเร็จ ให้เตรียมข้อมูลร้านไปบันทึกลง MongoDB ต่อ
//         const vendorData = {
//           stallId: selectedStall.id, // รหัสล็อกบนแผนที่ เช่น "066"
//           shopName: shopName,        // ชื่อร้านที่พิมพ์ในช่อง Input
//           image: "",                 // ปล่อยว่างไว้ก่อน เดี๋ยวไปทำระบบอัปโหลดทีหลังได้
//           categories: ["ร้านใหม่"],  // (ไม่สำคัญ) ใส่ค่าเริ่มต้นกัน Error 
//           menus: []                  // (ไม่สำคัญ) ใส่ค่าเริ่มต้นกัน Error
//         };

//         // 3. ส่งข้อมูลร้านค้าไปที่ MongoDB
//         await fetch('http://localhost:5000/api/vendors', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(vendorData),
//         });

//         alert(`จองพื้นที่สำหรับร้าน "${shopName}" เรียบร้อยแล้ว ข้อมูลซิงค์ลงฐานข้อมูลสำเร็จ!`);
//         setSelectedStall(null);

//         setShopName(''); // 4. เคลียร์ชื่อร้านเมื่อจองสำเร็จ
//         window.location.reload();
        
//         // เมื่อจองเสร็จแล้ว ให้โหลดข้อมูลสถานะล่าสุดมาอัปเดตสีแผนที่ทันที
//         window.location.reload(); // วิธีแก้ขัดที่ง่ายที่สุดคือรีเฟรชหน้าเว็บเพื่อให้ useEffect ทำงานใหม่
//       } else {
//         alert("เกิดข้อผิดพลาดในการจอง: " + data.message);
//       }
//     } catch (error) {
//       console.error("Error booking:", error);
//       alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ครับ");
//     }
//   };

//   return (
//     <div style={{ padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
//       <h2>ค้นหาพื้นที่เช่า</h2>
      
//       <div style={{ flex: 1, border: '2px solid #ccc', overflow: 'hidden', position: 'relative', backgroundColor: '#f0f0f0' }}>
//         <TransformWrapper
//           initialScale={1}
//           minScale={0.5}
//           maxScale={4}
//           centerOnInit={true}
//         >
//           <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            
//             <div style={{ position: 'relative', width: '1245px', height: '1207px' }}>
//               <img 
//                 src="/map-latest.webp" 
//                 alt="Map" 
//                 style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
//               />
//               <svg 
//                 viewBox="0 0 1245 1207" 
//                 style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
//               >
//                 {buildings.map((bldg) => (
//                   <polygon
//                     key={bldg.id}
//                     points={bldg.points}
//                     onClick={(e) => { 
//                       setSelectedBuilding(bldg);  
//                       setSelectedStall(null);     
//                       setPopupPos(getPolygonCenter(bldg.points));
//                     }}
//                     style={{ fill: 'rgba(150, 150, 150, 0.5)', stroke: 'black', strokeWidth: '1', cursor: 'pointer' }}
//                     onMouseEnter={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.8)'}
//                     onMouseLeave={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.5)'}
//                   >
//                     <title>{bldg.name}</title>
//                   </polygon>
//                 ))}
                
//                 {stalls.map((stall) => (
//                   <polygon
//                     key={stall.id}
//                     points={stall.points}
//                     onClick={(e) => { 
//                       setSelectedStall(stall);    
//                       setSelectedBuilding(null);  
//                       setPopupPos(getPolygonCenter(stall.points));
//                     }}
//                     style={{
//                       cursor: 'pointer',
//                       fill: stall.status === 'available' ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)',
//                       stroke: 'white',
//                       strokeWidth: '2'
//                     }}
//                     onMouseEnter={(e) => e.target.style.fill = stall.status === 'available' ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)'}
//                     onMouseLeave={(e) => e.target.style.fill = stall.status === 'available' ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)'}
//                   />
//                 ))}
//               </svg>

//               {selectedStall && (
//                 <div style={{
//                   position: 'absolute', 
//                   top: `${popupPos.y + (popupPos.y < 350 ? 15 : -15)}px`,
//                   left: `${popupPos.x}px`,
//                   transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`, 
//                   backgroundColor: 'white', padding: '20px', boxShadow: '0 0 15px rgba(0,0,0,0.3)', zIndex: 1000, borderRadius: '8px', minWidth: '300px'
//                 }}>
//                   <h3 style={{ marginTop: 0 }}>ข้อมูลล็อค: {selectedStall.id}</h3>
                  
//                   {selectedStall.status === 'available' ? (
//                     <>
//                       <p style={{ color: 'green', fontWeight: 'bold' }}>สถานะ: ยังไม่มีการจอง</p>
//                       <div style={{ marginTop: '15px' }}>
//                         <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อร้าน: </label>
//                         <input 
//                           type="text" 
//                           placeholder="ระบุชื่อร้าน..." 
//                           value={shopName} // 2. ผูกค่า
//                           onChange={(e) => setShopName(e.target.value)} // 2. อัปเดตค่าเมื่อพิมพ์
//                           onMouseDown={(e) => e.stopPropagation()} // 3. ป้องกันแผนที่ขโมยคลิกตอนใช้เมาส์
//                           onTouchStart={(e) => e.stopPropagation()} // 3. ป้องกันแผนที่ขโมยคลิกตอนใช้มือถือทัช
//                           style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
//                         />

//                       </div>
//                       <button 
//                         onClick={handleBookingSubmit}
//                         style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
//                       >
//                         ยืนยันการจอง
//                       </button>
//                     </>
//                   ) : (
//                     <p style={{ color: 'red', fontWeight: 'bold' }}>สถานะ: ถูกจองแล้ว</p>
//                   )}
                  
//                   <button 
//                     onClick={() => setSelectedStall(null)} 
//                     style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
//                   >
//                     ปิดหน้าต่าง
//                   </button>
//                 </div>
//               )} 

//               {selectedBuilding && (
//                 <div style={{
//                   position: 'absolute', 
//                   top: `${popupPos.y + (popupPos.y < 350 ? 15 : -15)}px`, 
//                   left: `${popupPos.x}px`,
//                   transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`, 
//                   backgroundColor: 'white', padding: '20px', boxShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 1000, borderRadius: '12px', minWidth: '350px'
//                 }}>
//                   <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>{selectedBuilding.name}</h3>
                  
//                   <img 
//                     src={buildingInfo[selectedBuilding.id]?.image || 'https://placehold.co/400x200?text=รูปภาพอาคาร'} 
//                     alt={selectedBuilding.name} 
//                     style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} 
//                   />
                  
//                   <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>
//                     {buildingInfo[selectedBuilding.id]?.desc || 'สถานที่สำคัญภายในมหาวิทยาลัย ใช้เป็นจุดสังเกตในการเดินทาง'}
//                   </p>
                  
//                   <button 
//                     onClick={() => setSelectedBuilding(null)} 
//                     style={{ padding: '12px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }}
//                   >
//                     ปิดหน้าต่าง
//                   </button>
//                 </div>
//               )}

//             </div>
            
//           </TransformComponent>
//         </TransformWrapper>
//       </div>
//     </div>
//   );
// }

// export default Booking;

import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useNavigate } from 'react-router-dom';

import { buildings, initialStalls } from '../data/mapData';
import { buildingInfo } from '../data/mockData';

const getPolygonCenter = (pointsStr) => {
  const parts = pointsStr.trim().split(/\s+/);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  parts.forEach(p => {
    const [x, y] = p.split(',');
    const nx = parseFloat(x);
    const ny = parseFloat(y);
    if (nx < minX) minX = nx;
    if (nx > maxX) maxX = nx;
    if (ny < minY) minY = ny;
    if (ny > maxY) maxY = ny;
  });
  return { x: (minX + maxX) / 2, y: minY }; 
};

function Booking({ isLoggedIn }) {
  const [stalls, setStalls] = useState(initialStalls);
  const [selectedStall, setSelectedStall] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [shopName, setShopName] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/booths');
        const data = await response.json();

        if (response.ok) {
          // 4. พิมพ์ข้อมูลออกมาดูใน Console (F12) เพื่อช่วยคุณเช็คว่ารหัสตรงกันไหม
          console.log("ข้อมูลรหัสบูธจาก MySQL:", data.map(b => b.booth_code));
          console.log("ข้อมูลรหัสบูธจาก แผนที่ React:", initialStalls.map(s => s.id));

          const updatedStalls = initialStalls.map(stall => {
            // 1. แปลงข้อมูลทั้งสองฝั่งเป็น String ก่อนเทียบกัน เพื่อป้องกันปัญหาชนิดข้อมูลไม่ตรงกัน
            const dbBooth = data.find(b => String(b.booth_code) === String(stall.id));
            
            if (dbBooth) {
              return { ...stall, status: dbBooth.status, db_id: dbBooth.id };
            }
            return stall;
          });
          
          setStalls(updatedStalls);
        }
      } catch (error) {
        console.error("Error fetching booths:", error);
      }
    };

    fetchBooths();
  }, []); 

  const handleBookingSubmit = async () => {
    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการยืนยันการจองพื้นที่ครับ!");
      navigate('/login');
      return; 
    }

    if (!shopName.trim()) {
      alert("กรุณาระบุชื่อร้านก่อนทำการจองครับ");
      return;
    }

    // 2. เช็คว่าล็อกบนแผนที่นี้ มีข้อมูลจับคู่ใน MySQL หรือไม่
    if (!selectedStall.db_id) {
      alert(`ไม่สามารถจองได้! ล็อกรหัส "${selectedStall.id}" ไม่มีในระบบ MySQL กรุณาตรวจสอบไฟล์ mapData.js ให้รหัสตรงกับ booth_code ในฐานข้อมูลครับ`);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: 2, 
          booth_id: selectedStall.db_id // 3. ใช้ ID ของจริงจาก MySQL ลบค่าสำรองทิ้งไป
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const vendorData = {
          stallId: selectedStall.id, 
          shopName: shopName,        
          image: "",                 
          categories: ["ร้านใหม่"],  
          menus: []                  
        };

        await fetch('http://localhost:5000/api/vendors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(vendorData),
        });

        alert(`จองพื้นที่สำหรับร้าน "${shopName}" เรียบร้อยแล้ว ข้อมูลซิงค์ลงฐานข้อมูลสำเร็จ!`);
        setSelectedStall(null);
        setShopName(''); 
        // เรียก API ใหม่เพื่อดึงสถานะล็อกอัพเดต โดยไม่รีโหลดทั้งหน้า
        try {
          const refreshResp = await fetch('http://localhost:5000/api/booths');
          if (refreshResp.ok) {
            const freshData = await refreshResp.json();
            const updatedStalls = initialStalls.map(stall => {
              const dbBooth = freshData.find(b => b.booth_code === stall.id);
              if (dbBooth) {
                return { ...stall, status: dbBooth.status, db_id: dbBooth.id };
              }
              return stall;
            });
            setStalls(updatedStalls);
          }
        } catch (err) {
          console.error("Error refreshing booths after booking:", err);
        }
      } else {
        alert("เกิดข้อผิดพลาดในการจอง MySQL: " + data.message);
      }
    } catch (error) {
      console.error("Error booking:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ครับ");
    }
  };

  return (
    <div style={{ padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <h2>ค้นหาพื้นที่เช่า</h2>
      
      <div style={{ flex: 1, border: '2px solid #ccc', overflow: 'hidden', position: 'relative', backgroundColor: '#f0f0f0' }}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit={true}
        >
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            
            <div style={{ position: 'relative', width: '1245px', height: '1207px' }}>
              <img 
                src="/map-latest.webp" 
                alt="Map" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
              />
              <svg 
                viewBox="0 0 1245 1207" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              >
                {buildings.map((bldg) => (
                  <polygon
                    key={bldg.id}
                    points={bldg.points}
                    onClick={(e) => { 
                      setSelectedBuilding(bldg);  
                      setSelectedStall(null);     
                      setPopupPos(getPolygonCenter(bldg.points));
                    }}
                    style={{ fill: 'rgba(150, 150, 150, 0.5)', stroke: 'black', strokeWidth: '1', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.8)'}
                    onMouseLeave={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.5)'}
                  >
                    <title>{bldg.name}</title>
                  </polygon>
                ))}
                
                {stalls.map((stall) => (
                  <polygon
                    key={stall.id}
                    points={stall.points}
                    onClick={(e) => { 
                      setSelectedStall(stall);    
                      setSelectedBuilding(null);  
                      setPopupPos(getPolygonCenter(stall.points));
                      setShopName('');
                    }}
                    style={{
                      cursor: 'pointer',
                      fill: stall.status === 'available' ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)',
                      stroke: 'white',
                      strokeWidth: '2'
                    }}
                    onMouseEnter={(e) => e.target.style.fill = stall.status === 'available' ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)'}
                    onMouseLeave={(e) => e.target.style.fill = stall.status === 'available' ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)'}
                  />
                ))}
              </svg>

              {selectedStall && (
                <div style={{
                  position: 'absolute', 
                  top: `${popupPos.y + (popupPos.y < 350 ? 15 : -15)}px`,
                  left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`, 
                  backgroundColor: 'white', padding: '20px', boxShadow: '0 0 15px rgba(0,0,0,0.3)', zIndex: 1000, borderRadius: '8px', minWidth: '300px'
                }}>
                  <h3 style={{ marginTop: 0 }}>ข้อมูลล็อค: {selectedStall.id}</h3>
                  
                  {selectedStall.status === 'available' ? (
                    <>
                      <p style={{ color: 'green', fontWeight: 'bold' }}>สถานะ: ยังไม่มีการจอง</p>
                      <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อร้าน: </label>
                        <input 
                          type="text" 
                          placeholder="ระบุชื่อร้าน..." 
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
                        />
                      </div>
                      <button 
                        onClick={handleBookingSubmit}
                        style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                      >
                        ยืนยันการจอง
                      </button>
                    </>
                  ) : (
                    <p style={{ color: 'red', fontWeight: 'bold' }}>สถานะ: ถูกจองแล้ว</p>
                  )}
                  
                  <button 
                    onClick={() => {
                      setSelectedStall(null);
                      setShopName('');
                    }} 
                    style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              )} 

              {selectedBuilding && (
                <div style={{
                  position: 'absolute', 
                  top: `${popupPos.y + (popupPos.y < 350 ? 15 : -15)}px`, 
                  left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`, 
                  backgroundColor: 'white', padding: '20px', boxShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 1000, borderRadius: '12px', minWidth: '350px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>{selectedBuilding.name}</h3>
                  
                  <img 
                    src={buildingInfo[selectedBuilding.id]?.image || 'https://placehold.co/400x200?text=รูปภาพอาคาร'} 
                    alt={selectedBuilding.name} 
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} 
                  />
                  
                  <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>
                    {buildingInfo[selectedBuilding.id]?.desc || 'สถานที่สำคัญภายในมหาวิทยาลัย ใช้เป็นจุดสังเกตในการเดินทาง'}
                  </p>
                  
                  <button 
                    onClick={() => setSelectedBuilding(null)} 
                    style={{ padding: '12px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }}
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              )}

            </div>
            
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}

export default Booking;