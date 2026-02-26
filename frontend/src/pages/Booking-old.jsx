import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useNavigate } from 'react-router-dom'; // 1. เพิ่ม useNavigate สำหรับการเด้งเปลี่ยนหน้า

// นำเข้าข้อมูลตึกและร้านค้าที่เราแยกไฟล์ไว้
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

// 2. รับ props isLoggedIn เข้ามาเพื่อใช้เช็คสถานะ
function Booking({ isLoggedIn }) {
  const [stalls, setStalls] = useState(initialStalls);
  const [selectedStall, setSelectedStall] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  
  const navigate = useNavigate(); // เรียกใช้งาน navigate

  // 3. ฟังก์ชันดักจับตอนกดปุ่มยืนยันการจอง
  const handleBookingSubmit = () => {
    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการยืนยันการจองพื้นที่ครับ!");
      navigate('/login'); // เด้งไปหน้าล็อกอิน
      return; 
    }

    // ถ้าผ่านเงื่อนไขบนมาได้ (ล็อกอินแล้ว)
    alert("จองพื้นที่เรียบร้อยแล้ว!");
    setSelectedStall(null); // ปิดหน้าต่าง Pop-up หลังจองเสร็จ
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
                        <input type="text" placeholder="ระบุชื่อร้าน..." style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                      </div>
                      <button 
                        onClick={handleBookingSubmit} // 4. ใส่คำสั่ง onClick ตรงนี้
                        style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                      >
                        ยืนยันการจอง
                      </button>
                    </>
                  ) : (
                    <p style={{ color: 'red', fontWeight: 'bold' }}>สถานะ: ถูกจองแล้ว</p>
                  )}
                  
                  <button 
                    onClick={() => setSelectedStall(null)} 
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
                    /* 5. เปลี่ยนจาก via.placeholder.com เป็น placehold.co เพื่อแก้ Error สีแดง */
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