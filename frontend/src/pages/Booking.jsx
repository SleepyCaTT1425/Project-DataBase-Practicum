import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useNavigate } from 'react-router-dom';
import { buildings, initialStalls } from '../data/mapData';
import { buildingInfo } from '../data/mockData';
import { API_URL } from '../config';

const getPolygonCenter = (pointsStr) => {
  const parts = pointsStr.trim().split(/\s+/);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  parts.forEach(p => {
    const [x, y] = p.split(',');
    const nx = parseFloat(x); const ny = parseFloat(y);
    if (nx < minX) minX = nx; if (nx > maxX) maxX = nx;
    if (ny < minY) minY = ny; if (ny > maxY) maxY = ny;
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
        const response = await fetch(`${API_URL}/api/booths`);
        const data = await response.json();
        if (response.ok) {
          const updatedStalls = initialStalls.map(stall => {
            const dbBooth = data.find(b => String(b.booth_code) === String(stall.id));
            if (dbBooth) return { ...stall, status: dbBooth.status, db_id: dbBooth.id, price: dbBooth.price, paymentStatus: dbBooth.payment_status };
            return stall;
          });
          setStalls(updatedStalls);
        }
      } catch (error) { console.error("Error fetching booths:", error); }
    };
    fetchBooths();
  }, []);

  const showAlert = (title, message, isSuccess, callback) => {
    setConfirmDialog({ isOpen: true, title, message, isSuccess, onConfirm: () => { setConfirmDialog({ ...confirmDialog, isOpen: false }); if (callback) callback(); } });
  };

  const handleBookingSubmit = async () => {
    if (!isLoggedIn) { showAlert('ข้อผิดพลาด', "กรุณาเข้าสู่ระบบก่อนทำการจอง", false, () => navigate('/login')); return; }
    if (!shopName.trim()) { showAlert('ข้อมูลไม่ครบ', "กรุณาระบุชื่อร้านก่อนทำการจอง", false); return; }
    if (!selectedStall.db_id) { showAlert('ข้อผิดพลาด', `ล็อก "${selectedStall.id}" ไม่มีในระบบ`, false); return; }
    const currentUserId = localStorage.getItem('userId');
    try {
      const response = await fetch(`${API_URL}/api/reservations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: currentUserId, booth_id: selectedStall.db_id }) });
      const data = await response.json();
      if (response.ok) {
        await fetch(`${API_URL}/api/vendors`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stallId: selectedStall.id, shopName, image: "", categories: [""], menus: [] }) });
        showAlert('จองสำเร็จ!', `จองพื้นที่สำหรับร้าน "${shopName}" เรียบร้อย!\n\nไปที่ "ร้านของฉัน" เพื่อชำระเงิน`, true, async () => {
          setSelectedStall(null); setShopName('');
          try {
            const refreshResp = await fetch(`${API_URL}/api/booths`);
            if (refreshResp.ok) {
              const freshData = await refreshResp.json();
              setStalls(initialStalls.map(stall => { const db = freshData.find(b => b.booth_code === stall.id); if (db) return { ...stall, status: db.status, db_id: db.id, price: db.price, paymentStatus: db.payment_status }; return stall; }));
            }
          } catch (err) { console.error(err); }
        });
      } else { showAlert('ข้อผิดพลาด', data.message || 'เกิดข้อผิดพลาดในการจอง', false); }
    } catch (error) { showAlert('ข้อผิดพลาด', "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", false); }
  };

  const getFillColor = (stall, isHover) => {
    if (stall.status === 'available') return isHover ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.35)';
    if (stall.status === 'pending') return isHover ? 'rgba(156, 163, 175, 0.6)' : 'rgba(156, 163, 175, 0.35)';
    if (stall.status === 'booked' && stall.paymentStatus !== 'paid') return isHover ? 'rgba(245, 158, 11, 0.7)' : 'rgba(245, 158, 11, 0.4)';
    return isHover ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.4)';
  };

  return (
    <div style={{ padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '12px', fontSize: '20px', fontWeight: '600' }}>ค้นหาพื้นที่เช่า</h2>

      <div style={{ flex: 1, border: '1px solid #e5e7eb', overflow: 'hidden', position: 'relative', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit={true}>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <div style={{ position: 'relative', width: '1245px', height: '1207px' }}>
              <img src="/map-latest.webp" alt="Map" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
              <svg viewBox="0 0 1245 1207" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {buildings.map((bldg) => (
                  <polygon key={bldg.id} points={bldg.points}
                    onClick={() => { setSelectedBuilding(bldg); setSelectedStall(null); setPopupPos(getPolygonCenter(bldg.points)); }}
                    style={{ fill: 'rgba(150, 150, 150, 0.4)', stroke: '#999', strokeWidth: '1', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.7)'}
                    onMouseLeave={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.4)'}
                  ><title>{bldg.name}</title></polygon>
                ))}
                {stalls.map((stall) => (
                  <polygon key={stall.id} points={stall.points}
                    onClick={() => { setSelectedStall(stall); setSelectedBuilding(null); setPopupPos(getPolygonCenter(stall.points)); setShopName(''); }}
                    style={{ cursor: 'pointer', fill: getFillColor(stall, false), stroke: 'white', strokeWidth: '1' }}
                    onMouseEnter={(e) => e.target.style.fill = getFillColor(stall, true)}
                    onMouseLeave={(e) => e.target.style.fill = getFillColor(stall, false)}
                  />
                ))}
              </svg>

              {selectedStall && (
                <div style={{
                  position: 'absolute', top: `${popupPos.y + (popupPos.y < 350 ? 15 : -15)}px`, left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`,
                  backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 1000, borderRadius: '10px', minWidth: '280px'
                }}>
                  <h3 style={{ marginTop: 0, color: '#1f2937', fontSize: '16px' }}>ล็อค: {selectedStall.id}</h3>
                  {selectedStall.status === 'available' ? (
                    <>
                      <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>ว่าง</p>
                      <p style={{ fontSize: '14px', margin: '8px 0', color: '#6b7280' }}>ราคา: <span style={{ color: '#1f2937' }}>{selectedStall.price ? `${Number(selectedStall.price).toLocaleString()} บาท` : '-'}</span></p>
                      <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', color: '#6b7280', fontSize: '13px' }}>ชื่อร้าน</label>
                        <input type="text" placeholder="ระบุชื่อร้าน..." value={shopName} onChange={(e) => setShopName(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}
                          style={{ width: '100%', padding: '8px 10px', fontSize: '14px' }}
                        />
                      </div>
                      <button onClick={handleBookingSubmit} style={{ marginTop: '12px', padding: '8px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontSize: '14px', fontWeight: '600' }}>ยืนยันการจอง</button>
                    </>
                  ) : selectedStall.status === 'pending' ? (
                    <p style={{ color: '#9ca3af', fontWeight: '600', fontSize: '14px' }}>ไม่สามารถจองได้</p>
                  ) : selectedStall.paymentStatus !== 'paid' ? (
                    <p style={{ color: '#f59e0b', fontWeight: '600', fontSize: '14px' }}>รอการอนุมัติ</p>
                  ) : (
                    <p style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>ถูกจองแล้ว</p>
                  )}
                  <button onClick={() => { setSelectedStall(null); setShopName(''); }} style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', width: '100%', fontSize: '13px' }}>ปิด</button>
                </div>
              )}

              {selectedBuilding && (
                <div style={{
                  position: 'absolute', top: `${popupPos.y + (popupPos.y < 350 ? 15 : -15)}px`, left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`,
                  backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 1000, borderRadius: '10px', minWidth: '320px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#1f2937', fontSize: '16px' }}>{selectedBuilding.name}</h3>
                  <img src={buildingInfo[selectedBuilding.id]?.image || 'https://placehold.co/400x200'} alt={selectedBuilding.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                  <p style={{ color: '#6b7280', marginBottom: '14px', lineHeight: '1.5', fontSize: '13px' }}>{buildingInfo[selectedBuilding.id]?.desc || 'สถานที่ภายในมหาวิทยาลัย'}</p>
                  <button onClick={() => setSelectedBuilding(null)} style={{ padding: '8px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', width: '100%', fontSize: '14px' }}>ปิด</button>
                </div>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '420px', border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 14px 0', color: confirmDialog.isSuccess ? '#16a34a' : '#dc2626', fontSize: '20px' }}>{confirmDialog.title}</h3>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '24px' }}>{confirmDialog.message}</p>
            <button onClick={confirmDialog.onConfirm} style={{ padding: '10px', backgroundColor: confirmDialog.isSuccess ? '#3b82f6' : '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', width: '100%' }}>ตกลง</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;
