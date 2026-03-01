import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_OPTIONS = [
  { id: 'dessert', label: 'ของหวาน' },
  { id: 'drink', label: 'เครื่องดื่ม' },
  { id: 'single', label: 'อาหารจานเดียว' },
  { id: 'snack', label: 'ของทานเล่น' },
  { id: 'other', label: 'อื่นๆ' },
];

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

function MyShop() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const fetchMyShop = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const resp = await fetch(`http://localhost:5000/api/myshop/${userId}`);
      const data = await resp.json();
      if (resp.ok) {
        const loaded = (data.shops || []).map(s => {
          const vendor = s.vendor || null;
          let menus = vendor?.menus?.length > 0 ? vendor.menus.map(m => ({ name: m.name || '', price: m.price || '' })) : [{ name: '', price: '' }];
          return {
            reservationId: s.reservationId,
            boothCode: s.boothCode,
            boothPrice: s.boothPrice,
            paymentStatus: s.paymentStatus,
            slipImage: s.slipImage,
            timeLeft: s.timeLeft || 0,
            promptpayPhone: s.promptpayPhone || '0801112222', // 👇 รับเบอร์มาจาก .env ของ Backend 👇
            uploadingSlip: '', 
            vendor,
            shopName: vendor?.shopName || '',
            image: vendor?.image || '',
            categories: (vendor?.categories || []).join(', '),
            menus,
            editInfo: false, 
          };
        });
        setShops(loaded);
      } else { setError(data.error); }
    } catch (err) { setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') { navigate('/login'); return; }
    fetchMyShop();
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setShops(prevShops => prevShops.map(shop => {
        if (shop.paymentStatus === 'unpaid' && shop.timeLeft > 0) {
          return { ...shop, timeLeft: shop.timeLeft - 1 };
        }
        return shop;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (shops.length === 0) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}><h2>ยังไม่มีการจองร้าน</h2><p>คุณยังไม่ได้จองพื้นที่ ถ้าต้องการจองให้ไปที่หน้าจอง</p></div>;

  const handleFieldChange = (shopIdx, field, value) => { const newShops = [...shops]; newShops[shopIdx][field] = value; setShops(newShops); };
  const toggleEditInfo = (shopIdx) => { const newShops = [...shops]; newShops[shopIdx].editInfo = !newShops[shopIdx].editInfo; setShops(newShops); };
  const handleCategoryToggle = (shopIdx, categoryId) => {
    const newShops = [...shops];
    const catsArray = newShops[shopIdx].categories.split(',').map(s => s.trim()).filter(s => s);
    const catLabel = CATEGORY_OPTIONS.find(c => c.id === categoryId)?.label;
    if (catsArray.includes(catLabel)) { newShops[shopIdx].categories = catsArray.filter(c => c !== catLabel).join(', '); } 
    else { catsArray.push(catLabel); newShops[shopIdx].categories = catsArray.join(', '); }
    setShops(newShops);
  };
  const handleMenuChange = (shopIdx, menuIdx, field, value) => { const newShops = [...shops]; newShops[shopIdx].menus[menuIdx][field] = value; setShops(newShops); };

  const handleSaveShop = async (shopIdx) => {
    const shop = shops[shopIdx];
    const catsArray = shop.categories.split(',').map(s => s.trim()).filter(s => s);
    const menusArr = shop.menus.map(m => ({ name: m.name, price: Number(m.price) }));
    const payload = { stallId: shop.boothCode, shopName: shop.shopName, image: shop.image, categories: catsArray, menus: menusArr };
    try {
      const url = shop.vendor ? `http://localhost:5000/api/vendors/${shop.boothCode}` : 'http://localhost:5000/api/vendors';
      const method = shop.vendor ? 'PUT' : 'POST';
      const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (resp.ok) { setSaveMessage('บันทึกข้อมูลร้านสำเร็จ!'); setTimeout(() => setSaveMessage(''), 3000); fetchMyShop(); } 
      else { setSaveMessage('เกิดข้อผิดพลาด'); setTimeout(() => setSaveMessage(''), 3000); }
    } catch (e) { setSaveMessage('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้'); setTimeout(() => setSaveMessage(''), 3000); }
  };

  const handleSubmitSlip = async (shopIdx) => {
    const shop = shops[shopIdx];
    if (!shop.uploadingSlip) return alert('กรุณาเลือกไฟล์สลิปก่อนส่งครับ');
    try {
      const resp = await fetch(`http://localhost:5000/api/payments/upload/${shop.reservationId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slip_image: shop.uploadingSlip })
      });
      let data;
      try { data = await resp.json(); } catch (err) { alert('เกิดข้อผิดพลาด: ไฟล์รูปภาพสลิปอาจจะมีขนาดใหญ่เกินไปครับ'); return; }

      if (resp.ok) { alert('ส่งสลิปเรียบร้อย! โปรดรอแอดมินตรวจสอบ'); fetchMyShop(); }
      else { alert(`เกิดข้อผิดพลาด: ${data.error || 'ไม่ทราบสาเหตุแน่ชัด'}`); }
    } catch (e) { alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ โปรดตรวจสอบว่ารันไฟล์ main.py อยู่หรือไม่'); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>จัดการร้านของฉัน</h2>
      {saveMessage && <div style={{ margin: '10px 0', padding: '10px', background: '#dff0d8', color: '#3c763d', borderRadius: '4px' }}>{saveMessage}</div>}

      {shops.map((shop, idx) => (
        <div key={idx} style={{ maxWidth: '800px', margin: '20px auto', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 250px', border: '2px solid #3498db', borderRadius: '12px', padding: '20px', background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>💳 สถานะชำระเงิน</h3>
            
            {shop.paymentStatus === 'unpaid' && shop.timeLeft > 0 && (
              <div>
                <div style={{ padding: '4px 10px', background: '#e74c3c', color: 'white', borderRadius: '20px', display: 'inline-block', fontSize: '14px', marginBottom: '10px' }}>ยังไม่ได้ชำระเงิน</div>
                <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                  <span style={{ fontSize: '13px', color: '#856404', display: 'block', marginBottom: '5px' }}>กรุณาชำระเงินภายใน</span>
                  <strong style={{ fontSize: '24px', color: shop.timeLeft < 180 ? '#e74c3c' : '#d35400' }}>
                    ⏱️ {formatTime(shop.timeLeft)}
                  </strong>
                </div>
                <h2 style={{ color: '#27ae60', margin: '10px 0' }}>{shop.boothPrice?.toLocaleString()} บาท</h2>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>สแกนเพื่อชำระค่าพื้นที่</p>
                {/* 👇 ใช้ตัวแปร promptpayPhone สร้าง URL ของ QR Code 👇 */}
                <img src={`https://promptpay.io/${shop.promptpayPhone}/${shop.boothPrice}.png`} alt="QR Code" style={{ width: '180px', height: '180px', border: '1px solid #ddd', borderRadius: '8px' }} />
                
                <div style={{ marginTop: '15px', textAlign: 'left' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>อัปโหลดสลิปโอนเงิน:</label>
                  <input type="file" accept="image/*" style={{ fontSize: '13px', width: '100%' }} onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => handleFieldChange(idx, 'uploadingSlip', ev.target.result);
                      reader.readAsDataURL(file);
                    }} 
                  />
                  {shop.uploadingSlip && <img src={shop.uploadingSlip} alt="preview" style={{ width: '100%', marginTop: '10px', borderRadius: '8px' }}/>}
                </div>
                <button onClick={() => handleSubmitSlip(idx)} style={{ width: '100%', padding: '10px', marginTop: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📤 ส่งสลิป</button>
              </div>
            )}

            {shop.paymentStatus === 'unpaid' && shop.timeLeft === 0 && (
               <div style={{ padding: '20px 10px' }}>
                  <h1 style={{ fontSize: '40px', margin: '0 0 10px 0' }}>⏳</h1>
                  <h3 style={{ color: '#e74c3c', margin: '0 0 10px 0' }}>หมดเวลาชำระเงิน</h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    การจองล็อกนี้ถูกยกเลิกแล้ว<br/>เนื่องจากไม่ได้รับสลิปภายในเวลาที่กำหนด
                  </p>
                  <button onClick={() => navigate('/booking')} style={{ width: '100%', padding: '10px', marginTop: '15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    กลับไปหน้าจองพื้นที่
                  </button>
               </div>
            )}

            {shop.paymentStatus === 'checking' && (
              <div>
                <div style={{ padding: '8px 15px', background: '#f39c12', color: 'white', borderRadius: '20px', display: 'inline-block', fontSize: '14px', fontWeight: 'bold' }}>⏳ รอแอดมินตรวจสอบ</div>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>แอดมินกำลังตรวจสอบสลิป<br/>กรุณารอสักครู่...</p>
                {shop.slipImage && <img src={shop.slipImage} alt="slip" style={{ width: '100%', maxWidth: '150px', marginTop: '15px', borderRadius: '8px', opacity: '0.8' }}/>}
              </div>
            )}

            {shop.paymentStatus === 'paid' && (
              <div>
                <div style={{ padding: '8px 15px', background: '#2ecc71', color: 'white', borderRadius: '20px', display: 'inline-block', fontSize: '14px', fontWeight: 'bold' }}>✅ ชำระเงินเรียบร้อยแล้ว</div>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>คุณได้สิทธิ์การใช้ล็อกสมบูรณ์แบบแล้ว!</p>
              </div>
            )}
          </div>

          <div style={{ flex: '1 1 400px' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '20px', 
              border: shop.paymentStatus !== 'paid' ? '2px solid #f1c40f' : '1px solid #ccc', 
              padding: '15px', borderRadius: '8px', 
              background: shop.paymentStatus !== 'paid' ? '#fffdf0' : '#fafafa' 
            }}>
              <div style={{ width: '120px', height: '120px', backgroundColor: shop.paymentStatus !== 'paid' ? '#fff' : '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: shop.paymentStatus !== 'paid' ? '1px dashed #f1c40f' : '1px dashed #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                {shop.image ? <img src={shop.image} alt="ร้าน" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span style={{ color: '#999', textAlign: 'center', padding: '10px' }}>เพิ่มรูปหน้าร้าน</span>}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {shop.shopName || 'ร้านของคุณ'}
                  {shop.paymentStatus !== 'paid' && (
                    <span style={{ backgroundColor: '#f1c40f', color: '#856404', fontSize: '12px', padding: '4px 8px', borderRadius: '12px', border: '1px solid #ffeeba' }}>
                      ⏳ สถานะ: รออนุมัติ
                    </span>
                  )}
                </h3>
                <p style={{ margin: '8px 0 5px 0' }}>รหัสล็อก: <span style={{ background: '#e74c3c', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>{shop.boothCode}</span></p>
                <p style={{ margin: '5px 0' }}>หมวดหมู่: {shop.categories || 'ยังไม่ได้ระบุหมวดหมู่'}</p>
              </div>
              
              <button 
                onClick={() => { if (shop.paymentStatus === 'paid') toggleEditInfo(idx); }} 
                disabled={shop.paymentStatus !== 'paid'}
                style={{ 
                  padding: '8px 12px', 
                  backgroundColor: shop.paymentStatus === 'paid' ? '#3498db' : '#bdc3c7', 
                  color: 'white', border: 'none', borderRadius: '6px', 
                  cursor: shop.paymentStatus === 'paid' ? 'pointer' : 'not-allowed',
                  boxShadow: shop.paymentStatus === 'paid' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {shop.paymentStatus !== 'paid' ? '🔒 รออนุมัติ' : (shop.editInfo ? 'ปิดการแก้ไข' : '✏️ แก้ไขข้อมูลร้าน')}
              </button>
            </div>

            {shop.editInfo && shop.paymentStatus === 'paid' && (
              <>
                <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '10px', background: '#fff' }}>
                  <div style={{ marginBottom: '15px' }}><label>ชื่อร้าน</label><br /><input type="text" value={shop.shopName} onChange={e => handleFieldChange(idx, 'shopName', e.target.value)} style={{ width: '100%', padding: '8px' }} /></div>
                  <div style={{ marginBottom: '15px' }}><label>หรืออัปโหลดไฟล์รูปภาพ</label><br /><input type="file" accept="image/*" onChange={e => { const file = e.target.files && e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = ev => handleFieldChange(idx, 'image', ev.target.result); reader.readAsDataURL(file); }} /></div>
                  <div style={{ marginBottom: '15px' }}>
                    <label>หมวดหมู่ (เลือกได้หลายหมวด)</label><br />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {CATEGORY_OPTIONS.map(cat => {
                        const isChecked = shop.categories.split(',').map(s => s.trim()).filter(s => s).includes(cat.label);
                        return <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={isChecked} onChange={() => handleCategoryToggle(idx, cat.id)} style={{ cursor: 'pointer' }}/>{cat.label}</label>;
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '20px', background: '#fff' }}>
                  <h4 style={{ marginTop: 0 }}>จัดการเมนูอาหาร</h4>
                  {shop.menus.map((item, midx) => (
                    <div key={midx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input type="text" placeholder="ชื่อเมนู" value={item.name} onChange={e => handleMenuChange(idx, midx, 'name', e.target.value)} style={{ flex: 2, padding: '6px' }} />
                      <input type="number" placeholder="ราคา" value={item.price} onChange={e => handleMenuChange(idx, midx, 'price', e.target.value)} style={{ flex: 1, padding: '6px' }} />
                      <button type="button" onClick={() => { const newShops = [...shops]; const remaining = newShops[idx].menus.filter((_, i) => i !== midx); newShops[idx].menus = remaining.length > 0 ? remaining : [{name:'', price:''}]; setShops(newShops); }} style={{ background: 'red', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px' }}>ลบ</button>
                    </div>
                  ))}
                  
                  {shop.menus.length < 5 ? (
                    <button type="button" onClick={() => { const newShops = [...shops]; newShops[idx].menus.push({name:'', price:''}); setShops(newShops); }} style={{ marginTop: '5px', padding: '6px 12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ เพิ่มเมนู</button>
                  ) : (
                    <div style={{ marginTop: '10px', color: '#e74c3c', fontSize: '13px', fontWeight: 'bold' }}>* เพิ่มเมนูได้สูงสุด 5 รายการเท่านั้น</div>
                  )}
                </div>

                <button onClick={() => handleSaveShop(idx)} style={{ padding: '12px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px', width: '100%' }}>💾 บันทึกข้อมูลร้าน</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyShop;