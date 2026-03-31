import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { buildings, initialStalls as stalls } from '../data/mapData';
import { buildingInfo } from '../data/mockData';
import { API_URL } from '../config';

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
  const [activeShops, setActiveShops] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/vendors`);
        const data = await response.json(); 

        if (response.ok) {
          const shopMap = {};
          data.forEach(shop => {
            // 👇 ซ่อนร้านที่รออนุมัติ: โชว์เฉพาะร้านที่มี paymentStatus เป็น 'paid' 👇
            if (shop.stallId && shop.paymentStatus === 'paid') {
              shopMap[shop.stallId] = shop;
            }
          });
          setActiveShops(shopMap); 
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    fetchVendors();
  }, []);

  const handleStallClick = (stall) => {
    if (activeShops[stall.id]) {
      setSelectedShop({ stallId: stall.id, ...activeShops[stall.id] });
      setSelectedBuilding(null); 
      setPopupPos(getPolygonCenter(stall.points)); 
    }
  };

  const getSearchResults = () => {
    const term = searchTerm.trim().toLowerCase();
    
    if (!term) return [];

    const results = [];

    Object.keys(activeShops).forEach(stallId => {
      const shop = activeShops[stallId];
      let isMatch = false;
      let matchDetail = '';

      if (stallId.toLowerCase().includes(term)) {
        isMatch = true;
        matchDetail = `(ค้นพบจากรหัสล็อก: ${stallId})`;
      }
      else if (shop.shopName?.toLowerCase().includes(term)) {
        isMatch = true;
      } 
      else if (shop.menus?.some(m => m.name.toLowerCase().includes(term))) {
        isMatch = true;
        const matchedMenu = shop.menus.find(m => m.name.toLowerCase().includes(term));
        matchDetail = `(มีเมนู: ${matchedMenu.name})`;
      } 
      else if (shop.categories?.some(c => c.toLowerCase().includes(term))) {
        isMatch = true;
        const matchedCat = shop.categories.find(c => c.toLowerCase().includes(term));
        matchDetail = `(หมวดหมู่: ${matchedCat})`;
      }

      if (isMatch) {
        const stallInfo = stalls.find(s => s.id === stallId);
        results.push({
          stallId,
          ...shop,
          matchDetail,
          points: stallInfo?.points
        });
      }
    });

    return results;
  };

  const searchResults = getSearchResults();

  const handleSelectSearchResult = (result) => {
    setSelectedShop({ stallId: result.stallId, ...result });
    setSelectedBuilding(null);
    if (result.points) {
      setPopupPos(getPolygonCenter(result.points));
    }
    setShowDropdown(false); 
    setSearchTerm('');      
  };

  return (
    <div style={{ padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      <h2>หน้าหลัก - ค้นหาร้านอาหารเกษตรแฟร์</h2>
      
      <div style={{ marginBottom: '15px', position: 'relative', maxWidth: '600px', zIndex: 2000 }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="🔍 ค้นหารหัสล็อก, ชื่อร้าน, หมวดหมู่ หรือเมนูอาหาร..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)} 
            style={{ 
              width: '100%', 
              padding: '14px 20px', 
              borderRadius: '8px', 
              border: '1px solid #ccc', 
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {showDropdown && searchTerm.trim() !== '' && (
          <div style={{
            position: 'absolute',
            top: '55px',
            left: '0',
            right: '0',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            maxHeight: '400px',
            overflowY: 'auto',  
            zIndex: 3000
          }}>
            {searchResults.length > 0 ? (
              searchResults.map(result => (
                <div
                  key={result.stallId}
                  onMouseDown={() => handleSelectSearchResult(result)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '12px 15px', 
                    borderBottom: '1px solid #eee', 
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <img 
                    src={result.image || 'https://placehold.co/100x100?text=ไม่มีรูป'} 
                    alt="shop" 
                    style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover', marginRight: '15px' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '15px' }}>
                      {result.shopName || 'ไม่มีชื่อร้าน'} 
                      <span style={{ fontSize: '12px', color: '#fff', backgroundColor: '#e74c3c', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>
                        {result.stallId}
                      </span>
                    </div>
                    {result.matchDetail && (
                      <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '3px' }}>
                        {result.matchDetail}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                ไม่มีร้านหรือเมนูที่ตรงกับ "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, border: '2px solid #ccc', overflow: 'hidden', position: 'relative', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit={true}>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <div style={{ position: 'relative', width: '1245px', height: '1207px' }}>
              <img src="/map-latest.webp" alt="Map" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
              <svg viewBox="0 0 1245 1207" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                
                {buildings.map((bldg) => (
                  <polygon
                    key={bldg.id}
                    points={bldg.points}
                    onClick={() => { 
                      setSelectedBuilding(bldg); 
                      setSelectedShop(null); 
                      setPopupPos(getPolygonCenter(bldg.points));
                    }}
                    style={{ fill: 'rgba(150, 150, 150, 0.5)', stroke: 'black', strokeWidth: '1', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.8)'}
                    onMouseLeave={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.5)'}
                  >
                    <title>{bldg.name}</title>
                  </polygon>
                ))}
                
                {stalls.map((stall) => {
                  const isShopActive = activeShops[stall.id];
                  // 👇 1. เช็คว่าล็อกนี้คือร้านที่ถูกคลิกเลือกจากผลการค้นหา (หรือบนแผนที่) ใช่หรือไม่
                  const isSelected = selectedShop && selectedShop.stallId === stall.id;

                  return (
                    <polygon
                      key={stall.id}
                      points={stall.points}
                      onClick={() => handleStallClick(stall)}
                      style={{
                        cursor: isShopActive ? 'pointer' : 'default',
                        // 👇 2. เปลี่ยนสี: ถ้าร้านถูกเลือกให้เป็นสีแดงเข้ม ถ้าเปิดปกติให้เป็นสีส้ม
                        fill: isSelected ? 'rgba(231, 76, 60, 0.9)' : (isShopActive ? 'rgba(255, 165, 0, 0.4)' : 'transparent'),
                        stroke: isSelected ? '#c0392b' : (isShopActive ? 'orange' : 'transparent'),
                        strokeWidth: isSelected ? '3' : '2'
                      }}
                      onMouseEnter={(e) => {
                        // ป้องกันไม่ให้ Hover ไปล้างสีแดงตอนที่มันกำลังถูก Highlight อยู่
                        if (isShopActive && !isSelected) e.target.style.fill = 'rgba(255, 165, 0, 0.7)';
                      }}
                      onMouseLeave={(e) => {
                        if (isShopActive && !isSelected) e.target.style.fill = 'rgba(255, 165, 0, 0.4)';
                      }}
                    >
                       {isShopActive && <title>{activeShops[stall.id].shopName}</title>}
                    </polygon>
                  );
                })}
              </svg>

              {/* --- ป๊อปอัปร้านค้า --- */}
              {selectedShop && (
                <div style={{
                  position: 'absolute', 
                  // 👇 1. เปลี่ยนตัวเลขตรงนี้ จาก 15 เป็น 50 เพื่อดันป๊อปอัปให้ห่างจากล็อกร้านมากขึ้น
                  top: `${popupPos.y + (popupPos.y < 350 ? 50 : -50)}px`,
                  left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`, 
                  backgroundColor: 'white', padding: '20px', boxShadow: '0 0 20px rgba(0,0,0,0.5)', zIndex: 1000, borderRadius: '12px', minWidth: '350px', maxWidth: '400px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{selectedShop.shopName} <span style={{fontSize: '14px', color: '#666'}}>(ล็อค {selectedShop.stallId})</span></h3>
                  
                  <img src={selectedShop.image || 'https://placehold.co/400x200?text=ไม่มีรูปภาพ'} alt="หน้าร้าน" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                  
                  <p style={{ margin: '0 0 15px 0', color: '#555' }}>
                    <strong>หมวดหมู่:</strong> {selectedShop.categories ? selectedShop.categories.join(', ') : 'ไม่มีหมวดหมู่'}
                  </p>
                  
                  <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                    <strong style={{ display: 'block', marginBottom: '10px', color: '#e67e22' }}>📋 เมนูแนะนำ</strong>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {selectedShop.menus && selectedShop.menus.length > 0 ? selectedShop.menus.map((menu, index) => (
                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #ccc' }}>
                          <span>{menu.name}</span>
                          <span style={{ fontWeight: 'bold' }}>{menu.price} ฿</span>
                        </li>
                      )) : <li style={{ color: '#999' }}>ยังไม่มีเมนูอาหาร</li>}
                    </ul>
                  </div>
                  
                  <button onClick={() => setSelectedShop(null)} style={{ marginTop: '20px', padding: '12px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }}>ปิด</button>
                </div>
              )}

              {/* --- ป๊อปอัปตึก/อาคาร --- */}
              {selectedBuilding && (
                <div style={{
                  position: 'absolute', 
                  // 👇 2. ปรับให้ตึกกระเด้งห่างออกมา 50 พิกเซล เหมือนกันครับ
                  top: `${popupPos.y + (popupPos.y < 350 ? 50 : -50)}px`, 
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

export default Home;