import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

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
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', isSuccess: false, onConfirm: null });
  const closeConfirmDialog = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });

  const fetchMyShop = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const resp = await fetch(`${API_URL}/api/myshop/${userId}`);
      const data = await resp.json();
      if (resp.ok) {
        const loaded = (data.shops || []).map(s => {
          const vendor = s.vendor || null;
          let menus = vendor?.menus?.length > 0 ? vendor.menus.map(m => ({ name: m.name || '', price: m.price || '' })) : [{ name: '', price: '' }];
          return {
            reservationId: s.reservationId, boothCode: s.boothCode, boothPrice: s.boothPrice,
            paymentStatus: s.paymentStatus, slipImage: s.slipImage, timeLeft: s.timeLeft || 0,
            promptpayPhone: s.promptpayPhone || '0801112222', uploadingSlip: '', vendor,
            shopName: vendor?.shopName || '', image: vendor?.image || '',
            categories: (vendor?.categories || []).join(', '), menus, editInfo: false,
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
      setShops(prev => prev.map(shop => {
        if (shop.paymentStatus === 'unpaid' && shop.timeLeft > 0) return { ...shop, timeLeft: shop.timeLeft - 1 };
        return shop;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>กำลังโหลด...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>{error}</div>;
  if (shops.length === 0) return <div style={{ padding: '60px', textAlign: 'center' }}><h2 style={{ color: '#1f2937' }}>ยังไม่มีการจอง</h2><p style={{ color: '#6b7280' }}>ไปที่หน้าค้นหาพื้นที่เพื่อจองล็อก</p></div>;

  const handleFieldChange = (i, f, v) => { const n = [...shops]; n[i][f] = v; setShops(n); };
  const toggleEditInfo = (i) => { const n = [...shops]; n[i].editInfo = !n[i].editInfo; setShops(n); };
  const handleCategoryToggle = (i, catId) => {
    const n = [...shops]; const cats = n[i].categories.split(',').map(s => s.trim()).filter(s => s);
    const label = CATEGORY_OPTIONS.find(c => c.id === catId)?.label;
    if (cats.includes(label)) n[i].categories = cats.filter(c => c !== label).join(', ');
    else { cats.push(label); n[i].categories = cats.join(', '); }
    setShops(n);
  };
  const handleMenuChange = (i, mi, f, v) => { const n = [...shops]; n[i].menus[mi][f] = v; setShops(n); };

  const handleSaveShop = async (i) => {
    const shop = shops[i];
    const payload = { stallId: shop.boothCode, shopName: shop.shopName, image: shop.image, categories: shop.categories.split(',').map(s => s.trim()).filter(s => s), menus: shop.menus.map(m => ({ name: m.name, price: Number(m.price) })) };
    try {
      const url = shop.vendor ? `${API_URL}/api/vendors/${shop.boothCode}` : `${API_URL}/api/vendors`;
      const resp = await fetch(url, { method: shop.vendor ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (resp.ok) { setSaveMessage('บันทึกสำเร็จ!'); setTimeout(() => setSaveMessage(''), 3000); fetchMyShop(); }
      else { setSaveMessage('เกิดข้อผิดพลาด'); setTimeout(() => setSaveMessage(''), 3000); }
    } catch (e) { setSaveMessage('ไม่สามารถติดต่อเซิร์ฟเวอร์'); setTimeout(() => setSaveMessage(''), 3000); }
  };

  const handleSubmitSlip = async (i) => {
    const shop = shops[i];
    if (!shop.uploadingSlip) { setConfirmDialog({ isOpen: true, title: 'แจ้งเตือน', message: 'กรุณาเลือกไฟล์สลิปก่อน', isSuccess: false, onConfirm: closeConfirmDialog }); return; }
    try {
      const resp = await fetch(`${API_URL}/api/payments/upload/${shop.reservationId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slip_image: shop.uploadingSlip }) });
      let data; try { data = await resp.json(); } catch { setConfirmDialog({ isOpen: true, title: 'ข้อผิดพลาด', message: 'ไฟล์รูปอาจใหญ่เกินไป', isSuccess: false, onConfirm: closeConfirmDialog }); return; }
      if (resp.ok) { setConfirmDialog({ isOpen: true, title: 'ส่งสลิปสำเร็จ', message: 'รอแอดมินตรวจสอบ', isSuccess: true, onConfirm: () => { closeConfirmDialog(); fetchMyShop(); } }); }
      else { setConfirmDialog({ isOpen: true, title: 'ข้อผิดพลาด', message: data.error || 'ไม่ทราบสาเหตุ', isSuccess: false, onConfirm: closeConfirmDialog }); }
    } catch (e) { setConfirmDialog({ isOpen: true, title: 'ข้อผิดพลาด', message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', isSuccess: false, onConfirm: closeConfirmDialog }); }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#1f2937', fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>ร้านของฉัน</h2>
      {saveMessage && <div style={{ margin: '10px 0', padding: '10px', background: 'rgba(34,197,94,0.08)', color: '#16a34a', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)', fontSize: '14px' }}>{saveMessage}</div>}

      {shops.map((shop, idx) => (
        <div key={idx} style={{ maxWidth: '800px', margin: '20px auto', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Payment card */}
          <div style={{ flex: '1 1 250px', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', background: '#ffffff', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 14px 0', color: '#1f2937', fontSize: '15px' }}>สถานะชำระเงิน</h3>

            {shop.paymentStatus === 'unpaid' && shop.timeLeft > 0 && (
              <div>
                <div style={{ padding: '4px 12px', background: '#dc2626', color: 'white', borderRadius: '20px', display: 'inline-block', fontSize: '12px', marginBottom: '10px' }}>ยังไม่ชำระ</div>
                <div style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#f59e0b', display: 'block', marginBottom: '4px' }}>กรุณาชำระภายใน</span>
                  <strong style={{ fontSize: '22px', color: shop.timeLeft < 180 ? '#dc2626' : '#f59e0b' }}>{formatTime(shop.timeLeft)}</strong>
                </div>
                <h2 style={{ color: '#16a34a', margin: '10px 0', fontSize: '24px' }}>{shop.boothPrice?.toLocaleString()} บาท</h2>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>สแกนเพื่อชำระ</p>
                <img src={`https://promptpay.io/${shop.promptpayPhone}/${shop.boothPrice}.png`} alt="QR" style={{ width: '160px', height: '160px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <div style={{ marginTop: '12px', textAlign: 'left' }}>
                  <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>อัปโหลดสลิป:</label>
                  <input type="file" accept="image/*" style={{ fontSize: '12px', width: '100%' }} onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const reader = new FileReader(); reader.onload = ev => handleFieldChange(idx, 'uploadingSlip', ev.target.result); reader.readAsDataURL(file);
                  }} />
                  {shop.uploadingSlip && <img src={shop.uploadingSlip} alt="preview" style={{ width: '100%', marginTop: '8px', borderRadius: '8px' }} />}
                </div>
                <button onClick={() => handleSubmitSlip(idx)} style={{ width: '100%', padding: '8px', marginTop: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>ส่งสลิป</button>
              </div>
            )}

            {shop.paymentStatus === 'unpaid' && shop.timeLeft === 0 && (
              <div style={{ padding: '20px 10px' }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '16px' }}>หมดเวลา</h3>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>การจองถูกยกเลิก</p>
                <button onClick={() => navigate('/booking')} style={{ width: '100%', padding: '8px', marginTop: '12px', backgroundColor: '#e5e7eb', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>กลับหน้าจอง</button>
              </div>
            )}

            {shop.paymentStatus === 'checking' && (
              <div>
                <div style={{ padding: '4px 12px', background: '#f59e0b', color: '#fff', borderRadius: '20px', display: 'inline-block', fontSize: '12px', fontWeight: '600' }}>รอตรวจสอบ</div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>แอดมินกำลังตรวจสอบสลิป</p>
                {shop.slipImage && <img src={shop.slipImage} alt="slip" style={{ width: '100%', maxWidth: '140px', marginTop: '12px', borderRadius: '8px', opacity: '0.7' }} />}
              </div>
            )}

            {shop.paymentStatus === 'paid' && (
              <div>
                <div style={{ padding: '4px 12px', background: '#16a34a', color: 'white', borderRadius: '20px', display: 'inline-block', fontSize: '12px', fontWeight: '600' }}>ชำระเรียบร้อย</div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>คุณได้สิทธิ์ใช้ล็อกแล้ว!</p>
              </div>
            )}
          </div>

          {/* Shop info */}
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e5e7eb', padding: '14px', borderRadius: '8px', background: '#ffffff' }}>
              <div style={{ width: '100px', height: '100px', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #d1d5db', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                {shop.image ? <img src={shop.image} alt="shop" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span style={{ color: '#9ca3af', textAlign: 'center', padding: '8px', fontSize: '12px' }}>เพิ่มรูป</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', color: '#1f2937', fontSize: '15px' }}>
                  {shop.shopName || 'ร้านของคุณ'}
                  {shop.paymentStatus !== 'paid' && <span style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)' }}>รออนุมัติ</span>}
                </h3>
                <p style={{ margin: '6px 0 4px 0', color: '#6b7280', fontSize: '13px' }}>ล็อก: <span style={{ background: '#dc2626', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '12px' }}>{shop.boothCode}</span></p>
                <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '13px' }}>{shop.categories || 'ยังไม่ระบุหมวดหมู่'}</p>
              </div>
              <button onClick={() => { if (shop.paymentStatus === 'paid') toggleEditInfo(idx); }} disabled={shop.paymentStatus !== 'paid'}
                style={{ padding: '6px 12px', backgroundColor: shop.paymentStatus === 'paid' ? '#3b82f6' : '#e5e7eb', color: shop.paymentStatus === 'paid' ? 'white' : '#9ca3af', border: 'none', borderRadius: '6px', cursor: shop.paymentStatus === 'paid' ? 'pointer' : 'not-allowed', fontSize: '13px', flexShrink: 0 }}>
                {shop.paymentStatus !== 'paid' ? 'รออนุมัติ' : (shop.editInfo ? 'ปิด' : 'แก้ไข')}
              </button>
            </div>

            {shop.editInfo && shop.paymentStatus === 'paid' && (
              <>
                <div style={{ border: '1px solid #e5e7eb', padding: '14px', borderRadius: '8px', marginTop: '10px', background: '#ffffff' }}>
                  <div style={{ marginBottom: '12px' }}><label style={{ color: '#6b7280', fontSize: '13px' }}>ชื่อร้าน</label><br /><input type="text" value={shop.shopName} onChange={e => handleFieldChange(idx, 'shopName', e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }} /></div>
                  <div style={{ marginBottom: '12px' }}><label style={{ color: '#6b7280', fontSize: '13px' }}>รูปภาพร้าน</label><br /><input type="file" accept="image/*" style={{ marginTop: '4px' }} onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => handleFieldChange(idx, 'image', ev.target.result); r.readAsDataURL(f); }} /></div>
                  <div>
                    <label style={{ color: '#6b7280', fontSize: '13px' }}>หมวดหมู่</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                      {CATEGORY_OPTIONS.map(cat => {
                        const checked = shop.categories.split(',').map(s => s.trim()).filter(s => s).includes(cat.label);
                        return <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#1f2937', fontSize: '13px' }}><input type="checkbox" checked={checked} onChange={() => handleCategoryToggle(idx, cat.id)} />{cat.label}</label>;
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ border: '1px solid #e5e7eb', padding: '14px', borderRadius: '8px', marginTop: '10px', background: '#ffffff' }}>
                  <h4 style={{ marginTop: 0, color: '#1f2937', fontSize: '14px' }}>เมนูอาหาร</h4>
                  {shop.menus.map((item, mi) => (
                    <div key={mi} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input type="text" placeholder="ชื่อเมนู" value={item.name} onChange={e => handleMenuChange(idx, mi, 'name', e.target.value)} style={{ flex: 2, padding: '6px' }} />
                      <input type="number" placeholder="ราคา" value={item.price} onChange={e => handleMenuChange(idx, mi, 'price', e.target.value)} style={{ flex: 1, padding: '6px' }} />
                      <button type="button" onClick={() => { const n = [...shops]; const rem = n[idx].menus.filter((_, i) => i !== mi); n[idx].menus = rem.length > 0 ? rem : [{ name: '', price: '' }]; setShops(n); }} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>ลบ</button>
                    </div>
                  ))}
                  {shop.menus.length < 5 ? (
                    <button type="button" onClick={() => { const n = [...shops]; n[idx].menus.push({ name: '', price: '' }); setShops(n); }} style={{ marginTop: '4px', padding: '6px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>+ เพิ่มเมนู</button>
                  ) : <div style={{ marginTop: '6px', color: '#f59e0b', fontSize: '12px' }}>สูงสุด 5 เมนู</div>}
                </div>

                <button onClick={() => handleSaveShop(idx)} style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '12px', width: '100%', fontWeight: '600', fontSize: '14px' }}>บันทึก</button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Modal */}
      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 14px 0', color: confirmDialog.isSuccess ? '#16a34a' : '#dc2626', fontSize: '20px' }}>{confirmDialog.title}</h3>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '24px' }}>{confirmDialog.message}</p>
            <button onClick={confirmDialog.onConfirm} style={{ padding: '10px', backgroundColor: confirmDialog.isSuccess ? '#16a34a' : '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', width: '100%' }}>ตกลง</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyShop;
