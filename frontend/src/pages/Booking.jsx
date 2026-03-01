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
  
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', isSuccess: false, onConfirm: null });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/booths');
        const data = await response.json();

        if (response.ok) {
          const updatedStalls = initialStalls.map(stall => {
            const dbBooth = data.find(b => String(b.booth_code) === String(stall.id));
            if (dbBooth) { 
              // 👇 เพิ่ม paymentStatus เพื่อเอามาใช้เปลี่ยนสี 👇
              return { ...stall, status: dbBooth.status, db_id: dbBooth.id, price: dbBooth.price, paymentStatus: dbBooth.payment_status }; 
            }
            return stall;
          });
          setStalls(updatedStalls);
        }
      } catch (error) { console.error("Error fetching booths:", error); }
    };
    fetchBooths();
  }, []); 

  const showAlert = (title, message, isSuccess, callback) => {
    setConfirmDialog({
      isOpen: true, title, message, isSuccess,
      onConfirm: () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        if (callback) callback();
      }
    });
  };

  const handleBookingSubmit = async () => {
    if (!isLoggedIn) {
      showAlert('❌ ข้อผิดพลาด', "กรุณาเข้าสู่ระบบก่อนทำการยืนยันการจองพื้นที่ครับ!", false, () => navigate('/login'));
      return; 
    }

    if (!shopName.trim()) {
      showAlert('❌ ข้อมูลไม่ครบถ้วน', "กรุณาระบุชื่อร้านก่อนทำการจองครับ", false);
      return;
    }

    if (!selectedStall.db_id) {
      showAlert('❌ ข้อผิดพลาด', `ไม่สามารถจองได้! ล็อกรหัส "${selectedStall.id}" ไม่มีในระบบ MySQL`, false);
      return;
    }

    const currentUserId = localStorage.getItem('userId');

    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, booth_id: selectedStall.db_id }),
      });

      const data = await response.json();

      if (response.ok) {
        const vendorData = { stallId: selectedStall.id, shopName: shopName, image: "", categories: [""], menus: [] };

        await fetch('http://localhost:5000/api/vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vendorData),
        });

        showAlert('✅ จองพื้นที่สำเร็จ!', `จองพื้นที่สำหรับร้าน "${shopName}" เรียบร้อยแล้ว!\n\nกรุณาไปที่เมนู "ร้านของฉัน" เพื่อจ่ายเงินค่าพื้นที่และส่งสลิปโอนเงินเพื่อยืนยันสิทธิ์ครับ`, true, async () => {
          setSelectedStall(null);
          setShopName(''); 
          
          try {
            const refreshResp = await fetch('http://localhost:5000/api/booths');
            if (refreshResp.ok) {
              const freshData = await refreshResp.json();
              const updatedStalls = initialStalls.map(stall => {
                const dbBooth = freshData.find(b => b.booth_code === stall.id);
                // 👇 อัปเดต paymentStatus ทันทีหลังจองเสร็จ 👇
                if (dbBooth) { return { ...stall, status: dbBooth.status, db_id: dbBooth.id, price: dbBooth.price, paymentStatus: dbBooth.payment_status }; }
                return stall;
              });
              setStalls(updatedStalls);
            }
          } catch (err) { console.error(err); }
        });

      } else {
        showAlert('❌ เกิดข้อผิดพลาด', "เกิดข้อผิดพลาดในการจอง: " + data.message, false);
      }
    } catch (error) {
      showAlert('❌ ข้อผิดพลาด', "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ครับ", false);
    }
  };

  // 👇 ฟังก์ชันตรวจสอบสีของล็อก (Fill Color) 👇
  const getFillColor = (stall, isHover) => {
    if (stall.status === 'available') return isHover ? 'rgba(0, 255, 0, 0.7)' : 'rgba(0, 255, 0, 0.4)';
    if (stall.status === 'pending') return isHover ? 'rgba(150, 150, 150, 0.7)' : 'rgba(150, 150, 150, 0.4)'; // สีเทา = ปิดล็อก
    if (stall.status === 'booked' && stall.paymentStatus !== 'paid') return isHover ? 'rgba(241, 196, 15, 0.8)' : 'rgba(241, 196, 15, 0.5)'; // สีเหลือง = รออนุมัติ/ยังไม่จ่ายเงิน
    return isHover ? 'rgba(231, 76, 60, 0.8)' : 'rgba(231, 76, 60, 0.5)'; // สีแดง = จ่ายเงินแล้ว (ถูกจองสมบูรณ์)
  };

  return (
    <div style={{ padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', position: 'relative' }}>
      <h2>ค้นหาพื้นที่เช่า</h2>
      
      <div style={{ flex: 1, border: '2px solid #ccc', overflow: 'hidden', position: 'relative', backgroundColor: '#f0f0f0' }}>
        <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit={true}>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            
            <div style={{ position: 'relative', width: '1245px', height: '1207px' }}>
              <img src="/map-latest.webp" alt="Map" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
              <svg viewBox="0 0 1245 1207" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {buildings.map((bldg) => (
                  <polygon
                    key={bldg.id} points={bldg.points}
                    onClick={() => { setSelectedBuilding(bldg); setSelectedStall(null); setPopupPos(getPolygonCenter(bldg.points)); }}
                    style={{ fill: 'rgba(150, 150, 150, 0.5)', stroke: 'black', strokeWidth: '1', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.8)'}
                    onMouseLeave={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.5)'}
                  ><title>{bldg.name}</title></polygon>
                ))}
                
                {stalls.map((stall) => (
                  <polygon
                    key={stall.id} points={stall.points}
                    onClick={() => { setSelectedStall(stall); setSelectedBuilding(null); setPopupPos(getPolygonCenter(stall.points)); setShopName(''); }}
                    style={{ 
                      cursor: 'pointer', 
                      fill: getFillColor(stall, false), // ใช้ฟังก์ชันสีที่ตั้งไว้ด้านบน
                      stroke: 'white', 
                      strokeWidth: '2' 
                    }}
                    onMouseEnter={(e) => e.target.style.fill = getFillColor(stall, true)}
                    onMouseLeave={(e) => e.target.style.fill = getFillColor(stall, false)}
                  />
                ))}
              </svg>

              {selectedStall && (
                <div style={{
                  position: 'absolute', top: `${popupPos.y + (popupPos.y < 350 ? 15 : -15)}px`, left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`, 
                  backgroundColor: 'white', padding: '20px', boxShadow: '0 0 15px rgba(0,0,0,0.3)', zIndex: 1000, borderRadius: '8px', minWidth: '300px'
                }}>
                  <h3 style={{ marginTop: 0 }}>ข้อมูลล็อค: {selectedStall.id}</h3>
                  
                  {/* 👇 แยกสถานะข้อความให้ชัดเจน 👇 */}
                  {selectedStall.status === 'available' ? (
                    <>
                      <p style={{ color: 'green', fontWeight: 'bold' }}>สถานะ: ยังไม่มีการจอง</p>
                      <p style={{ fontSize: '16px', margin: '10px 0', color: '#333' }}><strong>ราคา:</strong> {selectedStall.price ? `${Number(selectedStall.price).toLocaleString()} บาท` : 'ไม่ระบุ'}</p>
                      <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อร้าน: </label>
                        <input 
                          type="text" placeholder="ระบุชื่อร้าน..." value={shopName} onChange={(e) => setShopName(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}
                          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
                        />
                      </div>
                      <button onClick={handleBookingSubmit} style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>ยืนยันการจอง</button>
                    </>
                  ) : selectedStall.status === 'pending' ? (
                    <p style={{ color: 'gray', fontWeight: 'bold' }}>สถานะ: ไม่สามารถจองได้</p>
                  ) : selectedStall.paymentStatus !== 'paid' ? (
                    <p style={{ color: '#f39c12', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      ⏳ สถานะ: รอการอนุมัติ
                    </p>
                  ) : (
                    <p style={{ color: 'red', fontWeight: 'bold' }}>สถานะ: ถูกจองแล้ว</p>
                  )}
                  
                  <button onClick={() => { setSelectedStall(null); setShopName(''); }} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>ปิดหน้าต่าง</button>
                </div>
              )} 

              {selectedBuilding && (
                <div style={{
                  position: 'absolute', top: `${popupPos.y + (popupPos.y < 350 ? 15 : -15)}px`, left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`, 
                  backgroundColor: 'white', padding: '20px', boxShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 1000, borderRadius: '12px', minWidth: '350px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>{selectedBuilding.name}</h3>
                  <img src={buildingInfo[selectedBuilding.id]?.image || 'https://placehold.co/400x200?text=รูปภาพอาคาร'} alt={selectedBuilding.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                  <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>{buildingInfo[selectedBuilding.id]?.desc || 'สถานที่สำคัญภายในมหาวิทยาลัย ใช้เป็นจุดสังเกตในการเดินทาง'}</p>
                  <button onClick={() => setSelectedBuilding(null)} style={{ padding: '12px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }}>ปิดหน้าต่าง</button>
                </div>
              )}

            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 15px 0', color: confirmDialog.isSuccess ? '#27ae60' : '#e74c3c', fontSize: '22px' }}>
              {confirmDialog.title}
            </h3>
            <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '25px' }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={confirmDialog.onConfirm} style={{ padding: '12px 20px', backgroundColor: confirmDialog.isSuccess ? '#3498db' : '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', flex: 1 }}>
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;