import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { buildings, initialStalls as stalls } from '../data/mapData';

// ดึงข้อมูลร้านและตึกที่เราแยกไฟล์ไว้
import { activeShops, buildingInfo } from '../data/mockData';

// 1. เพิ่มฟังก์ชันหาจุดกึ่งกลาง (แบบเดียวกับหน้า Booking)
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

function Home() {
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  // 2. ปรับฟังก์ชันให้รับค่า stall ทั้งก้อน เพื่อเอา points มาคำนวณ
  const handleStallClick = (stall) => {
    if (activeShops[stall.id]) {
      setSelectedShop({ stallId: stall.id, ...activeShops[stall.id] });
      setSelectedBuilding(null); 
      setPopupPos(getPolygonCenter(stall.points)); // ดึงพิกัดจากล็อกร้านค้า
    }
  };

  return (
    <div style={{ padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <h2>หน้าหลัก - ค้นหาร้านอาหารเกษตรแฟร์</h2>
      
      <div style={{ flex: 1, border: '2px solid #ccc', overflow: 'hidden', position: 'relative', backgroundColor: '#f0f0f0' }}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit={true}
        >
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            
            {/* กล่องกระดาษแผนที่ */}
            <div style={{ position: 'relative', width: '1245px', height: '1207px' }}>
              <img 
                src="/map-latest.webp" 
                alt="Map" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} 
              />
              <svg 
                viewBox="0 0 1245 1207" 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              >
                {/* วาดตึกให้กดได้เหมือนหน้า Booking */}
                {buildings.map((bldg) => (
                  <polygon
                    key={bldg.id}
                    points={bldg.points}
                    onClick={() => { 
                      setSelectedBuilding(bldg); 
                      setSelectedShop(null); 
                      setPopupPos(getPolygonCenter(bldg.points)); // ดึงพิกัดจากตึก
                    }}
                    style={{ fill: 'rgba(150, 150, 150, 0.5)', stroke: 'black', strokeWidth: '1', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.8)'}
                    onMouseLeave={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.5)'}
                  >
                    <title>{bldg.name}</title>
                  </polygon>
                ))}
                
                {/* วาดล็อกร้านค้า */}
                {stalls.map((stall) => {
                  const isShopActive = activeShops[stall.id];
                  return (
                    <polygon
                      key={stall.id}
                      points={stall.points}
                      onClick={() => handleStallClick(stall)} // เรียกฟังก์ชันพร้อมส่งข้อมูลล็อกไป
                      style={{
                        cursor: isShopActive ? 'pointer' : 'default',
                        fill: isShopActive ? 'rgba(255, 165, 0, 0.4)' : 'transparent',
                        stroke: isShopActive ? 'orange' : 'transparent',
                        strokeWidth: '2'
                      }}
                      onMouseEnter={(e) => {
                        if (isShopActive) e.target.style.fill = 'rgba(255, 165, 0, 0.7)';
                      }}
                      onMouseLeave={(e) => {
                        if (isShopActive) e.target.style.fill = 'rgba(255, 165, 0, 0.4)';
                      }}
                    >
                       {isShopActive && <title>{activeShops[stall.id].shopName}</title>}
                    </polygon>
                  );
                })}
              </svg>

              {/* ---------------- 3. Pop-up ข้อมูลร้านค้า (แบบมีเมนูอาหาร) ย้ายมาในแผนที่ ---------------- */}
              {selectedShop && (
                <div style={{
                  position: 'absolute', 
                  top: `${popupPos.y + (popupPos.y < 350 ? 15 : -15)}px`,
                  left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`, 
                  backgroundColor: 'white', padding: '20px', boxShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 1000, borderRadius: '12px', minWidth: '350px', maxWidth: '400px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{selectedShop.shopName} <span style={{fontSize: '14px', color: '#666'}}>(ล็อค {selectedShop.stallId})</span></h3>
                  
                  <img src={selectedShop.image} alt="หน้าร้าน" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                  
                  <p style={{ margin: '0 0 15px 0', color: '#555' }}><strong>หมวดหมู่:</strong> {selectedShop.categories.join(', ')}</p>
                  
                  <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                    <strong style={{ display: 'block', marginBottom: '10px', color: '#e67e22' }}>📋 เมนูแนะนำ</strong>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {selectedShop.menus.map((menu, index) => (
                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #ccc' }}>
                          <span>{menu.name}</span>
                          <span style={{ fontWeight: 'bold' }}>{menu.price} ฿</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button onClick={() => setSelectedShop(null)} style={{ marginTop: '20px', padding: '12px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }}>ปิด</button>
                </div>
              )}

              {/* ---------------- Pop-up ข้อมูลตึก (แยกจากร้านค้า) ย้ายมาในแผนที่ ---------------- */}
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
                    src={buildingInfo[selectedBuilding.id]?.image || 'https://via.placeholder.com/400x200?text=รูปภาพอาคาร'} 
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

            </div> {/* <--- จบกล่องกระดาษแผนที่ */}
            
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}

export default Home;