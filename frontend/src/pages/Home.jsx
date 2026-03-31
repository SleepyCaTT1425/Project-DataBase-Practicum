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
    const nx = parseFloat(x); const ny = parseFloat(y);
    if (nx < minX) minX = nx; if (nx > maxX) maxX = nx;
    if (ny < minY) minY = ny; if (ny > maxY) maxY = ny;
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
            if (shop.stallId && shop.paymentStatus === 'paid') { shopMap[shop.stallId] = shop; }
          });
          setActiveShops(shopMap);
        }
      } catch (error) { console.error("Error fetching vendor data:", error); }
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
      let isMatch = false; let matchDetail = '';
      if (stallId.toLowerCase().includes(term)) { isMatch = true; matchDetail = `(รหัสล็อก: ${stallId})`; }
      else if (shop.shopName?.toLowerCase().includes(term)) { isMatch = true; }
      else if (shop.menus?.some(m => m.name.toLowerCase().includes(term))) { isMatch = true; const mm = shop.menus.find(m => m.name.toLowerCase().includes(term)); matchDetail = `(เมนู: ${mm.name})`; }
      else if (shop.categories?.some(c => c.toLowerCase().includes(term))) { isMatch = true; const mc = shop.categories.find(c => c.toLowerCase().includes(term)); matchDetail = `(หมวดหมู่: ${mc})`; }
      if (isMatch) { const stallInfo = stalls.find(s => s.id === stallId); results.push({ stallId, ...shop, matchDetail, points: stallInfo?.points }); }
    });
    return results;
  };

  const searchResults = getSearchResults();

  const handleSelectSearchResult = (result) => {
    setSelectedShop({ stallId: result.stallId, ...result });
    setSelectedBuilding(null);
    if (result.points) setPopupPos(getPolygonCenter(result.points));
    setShowDropdown(false);
    setSearchTerm('');
  };

  return (
    <div style={{ padding: '20px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>ค้นหาร้านอาหาร</h2>

      {/* Search */}
      <div style={{ marginBottom: '12px', position: 'relative', maxWidth: '500px', zIndex: 2000 }}>
        <input
          type="text"
          placeholder="ค้นหาชื่อร้าน, เมนู, หมวดหมู่..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          style={{ width: '100%', padding: '10px 14px', fontSize: '14px' }}
        />

        {showDropdown && searchTerm.trim() !== '' && (
          <div style={{ position: 'absolute', top: '44px', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', maxHeight: '350px', overflowY: 'auto', zIndex: 3000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {searchResults.length > 0 ? searchResults.map(result => (
              <div key={result.stallId} onMouseDown={() => handleSelectSearchResult(result)}
                style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <img src={result.image || 'https://placehold.co/100x100?text=No+Image'} alt="shop" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', marginRight: '12px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                    {result.shopName || 'ไม่มีชื่อร้าน'}
                    <span style={{ fontSize: '11px', color: '#fff', backgroundColor: '#ef4444', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>{result.stallId}</span>
                  </div>
                  {result.matchDetail && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{result.matchDetail}</div>}
                </div>
              </div>
            )) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>ไม่พบผลลัพธ์ "{searchTerm}"</div>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, border: '1px solid #e5e7eb', overflow: 'hidden', position: 'relative', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit={true}>
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <div style={{ position: 'relative', width: '1245px', height: '1207px' }}>
              <img src="/map-latest.webp" alt="Map" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
              <svg viewBox="0 0 1245 1207" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {buildings.map((bldg) => (
                  <polygon key={bldg.id} points={bldg.points}
                    onClick={() => { setSelectedBuilding(bldg); setSelectedShop(null); setPopupPos(getPolygonCenter(bldg.points)); }}
                    style={{ fill: 'rgba(150, 150, 150, 0.4)', stroke: '#999', strokeWidth: '1', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.7)'}
                    onMouseLeave={(e) => e.target.style.fill = 'rgba(150, 150, 150, 0.4)'}
                  ><title>{bldg.name}</title></polygon>
                ))}
                {stalls.map((stall) => {
                  const isShopActive = activeShops[stall.id];
                  const isSelected = selectedShop && selectedShop.stallId === stall.id;
                  return (
                    <polygon key={stall.id} points={stall.points} onClick={() => handleStallClick(stall)}
                      style={{
                        cursor: isShopActive ? 'pointer' : 'default',
                        fill: isSelected ? 'rgba(59, 130, 246, 0.7)' : (isShopActive ? 'rgba(255, 165, 0, 0.4)' : 'transparent'),
                        stroke: isSelected ? '#3b82f6' : (isShopActive ? 'orange' : 'transparent'),
                        strokeWidth: isSelected ? '3' : '2'
                      }}
                      onMouseEnter={(e) => { if (isShopActive && !isSelected) e.target.style.fill = 'rgba(255, 165, 0, 0.7)'; }}
                      onMouseLeave={(e) => { if (isShopActive && !isSelected) e.target.style.fill = 'rgba(255, 165, 0, 0.4)'; }}
                    >{isShopActive && <title>{activeShops[stall.id].shopName}</title>}</polygon>
                  );
                })}
              </svg>

              {/* Shop popup */}
              {selectedShop && (
                <div style={{
                  position: 'absolute',
                  top: `${popupPos.y + (popupPos.y < 350 ? 50 : -50)}px`, left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`,
                  backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 1000, borderRadius: '12px', minWidth: '320px', maxWidth: '380px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#1f2937', fontSize: '16px' }}>
                    {selectedShop.shopName}
                    <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>({selectedShop.stallId})</span>
                  </h3>
                  <img src={selectedShop.image || 'https://placehold.co/400x200?text=No+Image'} alt="shop" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                  <p style={{ margin: '0 0 12px 0', color: '#9ca3af', fontSize: '13px' }}>
                    หมวดหมู่: {selectedShop.categories ? selectedShop.categories.join(', ') : '-'}
                  </p>
                  <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#f59e0b', fontSize: '13px' }}>เมนูแนะนำ</strong>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {selectedShop.menus && selectedShop.menus.length > 0 ? selectedShop.menus.map((menu, i) => (
                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6', color: '#374151', fontSize: '13px' }}>
                          <span>{menu.name}</span><span style={{ color: '#16a34a', fontWeight: '600' }}>{menu.price} ฿</span>
                        </li>
                      )) : <li style={{ color: '#9ca3af', fontSize: '13px' }}>ยังไม่มีเมนู</li>}
                    </ul>
                  </div>
                  <button onClick={() => setSelectedShop(null)} style={{ marginTop: '14px', padding: '8px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '14px' }}>ปิด</button>
                </div>
              )}

              {/* Building popup */}
              {selectedBuilding && (
                <div style={{
                  position: 'absolute',
                  top: `${popupPos.y + (popupPos.y < 350 ? 50 : -50)}px`, left: `${popupPos.x}px`,
                  transform: `translate(${popupPos.x < 250 ? '0%' : popupPos.x > 1000 ? '-100%' : '-50%'}, ${popupPos.y < 350 ? '0%' : '-100%'})`,
                  backgroundColor: '#ffffff', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 1000, borderRadius: '12px', minWidth: '320px'
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#1f2937', fontSize: '16px' }}>{selectedBuilding.name}</h3>
                  <img src={buildingInfo[selectedBuilding.id]?.image || 'https://placehold.co/400x200'} alt={selectedBuilding.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                  <p style={{ color: '#6b7280', marginBottom: '16px', lineHeight: '1.5', fontSize: '13px' }}>
                    {buildingInfo[selectedBuilding.id]?.desc || 'สถานที่ภายในมหาวิทยาลัย'}
                  </p>
                  <button onClick={() => setSelectedBuilding(null)} style={{ padding: '8px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '14px' }}>ปิด</button>
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
