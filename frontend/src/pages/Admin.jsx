import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const CATEGORY_OPTIONS = [{ id: 'dessert', label: 'ของหวาน' }, { id: 'drink', label: 'เครื่องดื่ม' }, { id: 'single', label: 'อาหารจานเดียว' }, { id: 'snack', label: 'ของทานเล่น' }, { id: 'other', label: 'อื่นๆ' }];

function Admin() {
  const navigate = useNavigate();
  const [booths, setBooths] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorUsers, setVendorUsers] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('booths');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPrice, setEditingPrice] = useState({});
  const [editingVendor, setEditingVendor] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', confirmText: 'ยืนยัน', onConfirm: null, isAlertOnly: false });
  const [viewingSlip, setViewingSlip] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => { if (localStorage.getItem('role') !== 'admin') { navigate('/'); return; } fetchData(); }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boothResp, vendorResp, userResp, payResp, historyResp] = await Promise.all([
        fetch(`${API_URL}/api/booths`), fetch(`${API_URL}/api/vendors`), fetch(`${API_URL}/api/admin/users`),
        fetch(`${API_URL}/api/admin/payments`), fetch(`${API_URL}/api/admin/history`)
      ]);
      if (boothResp.ok) setBooths(await boothResp.json());
      if (vendorResp.ok) setVendors(await vendorResp.json());
      if (userResp.ok) setVendorUsers(await userResp.json());
      if (payResp.ok) setPendingPayments(await payResp.json());
      if (historyResp.ok) setHistory(await historyResp.json());
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const closeConfirmDialog = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isAlertOnly: false });
  const showSuccessAlert = (msg) => setConfirmDialog({ isOpen: true, title: 'สำเร็จ', message: msg, confirmText: 'ตกลง', isAlertOnly: true, onConfirm: closeConfirmDialog });
  const showErrorAlert = (msg) => setConfirmDialog({ isOpen: true, title: 'ข้อผิดพลาด', message: msg, confirmText: 'ตกลง', isAlertOnly: true, onConfirm: closeConfirmDialog });

  const toggleBoothStatus = async (boothId, currentStatus) => {
    if (currentStatus === 'booked') return;
    const newStatus = currentStatus === 'available' ? 'pending' : 'available';
    try { await fetch(`${API_URL}/api/booths/${boothId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) }); fetchData(); }
    catch { showErrorAlert('แก้สถานะไม่สำเร็จ'); }
  };

  const handleUpdatePrice = async (boothId) => {
    const p = editingPrice[boothId];
    if (!p || isNaN(p)) return showErrorAlert('กรุณากรอกราคาเป็นตัวเลข');
    try { const r = await fetch(`${API_URL}/api/booths/${boothId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price: parseFloat(p) }) }); if (r.ok) { showSuccessAlert('อัปเดตราคาสำเร็จ'); setEditingPrice(prev => ({ ...prev, [boothId]: '' })); fetchData(); } }
    catch { showErrorAlert('แก้ราคาไม่สำเร็จ'); }
  };

  const handleVerifyPayment = (resId, action) => {
    const txt = action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ';
    setConfirmDialog({ isOpen: true, title: 'ตรวจสอบการชำระเงิน', message: `ยืนยัน "${txt}" สลิปนี้?`, confirmText: txt, isAlertOnly: false,
      onConfirm: async () => { try { await fetch(`${API_URL}/api/admin/payments/${resId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }); fetchData(); showSuccessAlert(`${txt} เรียบร้อย`); } catch { showErrorAlert('เกิดข้อผิดพลาด'); } }
    });
  };

  const handleSoftDeleteShop = (stallId) => setConfirmDialog({ isOpen: true, title: 'ซ่อนร้านค้า', message: `ซ่อนร้านล็อก ${stallId}?`, confirmText: 'ซ่อน', isAlertOnly: false, onConfirm: async () => { try { await fetch(`${API_URL}/api/admin/shops/${stallId}`, { method: 'DELETE' }); fetchData(); showSuccessAlert('ซ่อนสำเร็จ'); } catch { showErrorAlert('เกิดข้อผิดพลาด'); } } });
  const handleSoftDeleteAllShops = () => setConfirmDialog({ isOpen: true, title: 'ซ่อนร้านค้าทั้งหมด', message: 'ซ่อนร้านค้าทุกล็อก?', confirmText: 'ซ่อนทั้งหมด', isAlertOnly: false, onConfirm: async () => { try { await fetch(`${API_URL}/api/admin/shops`, { method: 'DELETE' }); fetchData(); showSuccessAlert('ซ่อนทั้งหมดสำเร็จ'); } catch { showErrorAlert('เกิดข้อผิดพลาด'); } } });
  const handleHardDeleteAllShops = () => setConfirmDialog({ isOpen: true, title: 'ลบถาวรทั้งหมด', message: 'ลบร้าน สลิป ประวัติการจองทั้งหมดแบบถาวร?\n\nไม่สามารถกู้คืนได้!', confirmText: 'ลบถาวร', isAlertOnly: false, onConfirm: async () => { try { await fetch(`${API_URL}/api/admin/shops/hard`, { method: 'DELETE' }); fetchData(); showSuccessAlert('ลบถาวรสำเร็จ'); } catch { showErrorAlert('เกิดข้อผิดพลาด'); } } });
  const handleHardDeleteUser = (userId, name) => setConfirmDialog({ isOpen: true, title: 'ลบบัญชี', message: `ลบบัญชี "${name}"?`, confirmText: 'ลบ', isAlertOnly: false, onConfirm: async () => { try { await fetch(`${API_URL}/api/admin/users/${userId}`, { method: 'DELETE' }); fetchData(); showSuccessAlert('ลบสำเร็จ'); } catch { showErrorAlert('เกิดข้อผิดพลาด'); } } });
  const handleHardDeleteAllUsers = () => setConfirmDialog({ isOpen: true, title: 'ลบ Vendor ทั้งหมด', message: 'ลบบัญชี Vendor ทั้งหมด?', confirmText: 'ลบทั้งหมด', isAlertOnly: false, onConfirm: async () => { try { await fetch(`${API_URL}/api/admin/users`, { method: 'DELETE' }); fetchData(); showSuccessAlert('ลบทั้งหมดสำเร็จ'); } catch { showErrorAlert('เกิดข้อผิดพลาด'); } } });

  const handleEditVendorClick = (vendor) => { const e = JSON.parse(JSON.stringify(vendor)); if (!e.categories) e.categories = []; if (!e.menus || e.menus.length === 0) e.menus = [{ name: '', price: '' }]; setEditingVendor(e); };
  const handleVendorFieldChange = (f, v) => setEditingVendor(prev => ({ ...prev, [f]: v }));
  const handleVendorCategoryToggle = (catId) => { const lbl = CATEGORY_OPTIONS.find(c => c.id === catId)?.label; setEditingVendor(prev => { let cats = [...(prev.categories || [])]; cats.includes(lbl) ? cats = cats.filter(c => c !== lbl) : cats.push(lbl); return { ...prev, categories: cats }; }); };
  const handleVendorMenuChange = (i, f, v) => setEditingVendor(prev => { const m = [...prev.menus]; m[i][f] = v; return { ...prev, menus: m }; });
  const handleAddVendorMenu = () => setEditingVendor(prev => ({ ...prev, menus: [...prev.menus, { name: '', price: '' }] }));
  const handleRemoveVendorMenu = (i) => setEditingVendor(prev => { let m = [...prev.menus]; m.splice(i, 1); if (!m.length) m = [{ name: '', price: '' }]; return { ...prev, menus: m }; });
  const handleSaveVendor = async () => {
    try { const r = await fetch(`${API_URL}/api/vendors/${editingVendor.stallId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editingVendor, menus: editingVendor.menus.map(m => ({ name: m.name, price: Number(m.price) })) }) }); if (r.ok) { showSuccessAlert('อัปเดตสำเร็จ'); setEditingVendor(null); fetchData(); } else showErrorAlert('เกิดข้อผิดพลาด'); }
    catch { showErrorAlert('ไม่สามารถติดต่อเซิร์ฟเวอร์'); }
  };

  const filteredBooths = booths.filter(b => b.booth_code?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredVendors = vendors.filter(v => v.paymentStatus === 'paid' && (v.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) || v.stallId?.toString().toLowerCase().includes(searchTerm.toLowerCase())));

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>กำลังโหลด...</div>;

  // Dark mode styles
  const tabBtn = (tab) => ({ padding: '8px 16px', backgroundColor: activeTab === tab ? '#3b82f6' : '#e5e7eb', color: activeTab === tab ? '#fff' : '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' });
  const card = { backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' };
  const thStyle = { padding: '10px 12px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '13px', textAlign: 'left' };
  const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', color: '#1f2937' };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      <h2 style={{ color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', fontSize: '20px', fontWeight: '600' }}>Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => { setActiveTab('booths'); setSearchTerm(''); }} style={tabBtn('booths')}>ล็อก & ราคา</button>
        <button onClick={() => { setActiveTab('vendors'); setSearchTerm(''); }} style={tabBtn('vendors')}>ร้านค้า</button>
        <button onClick={() => { setActiveTab('payments'); setSearchTerm(''); }} style={{ ...tabBtn('payments'), position: 'relative' }}>
          สลิปโอนเงิน
          {pendingPayments.length > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px' }}>{pendingPayments.length}</span>}
        </button>
        <button onClick={() => { setActiveTab('history'); setSearchTerm(''); }} style={tabBtn('history')}>ประวัติ</button>
        <button onClick={() => { setActiveTab('deleteManage'); setSearchTerm(''); }} style={{ ...tabBtn('deleteManage'), borderColor: activeTab === 'deleteManage' ? '#dc2626' : '#d1d5db', backgroundColor: activeTab === 'deleteManage' ? '#dc2626' : '#e5e7eb' }}>ลบข้อมูล</button>
      </div>

      {/* Booths Tab */}
      {activeTab === 'booths' && (
        <div style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thStyle}>รหัสล็อก</th><th style={thStyle}>ราคา</th><th style={thStyle}>ปรับราคา</th><th style={thStyle}>สถานะ</th><th style={thStyle}>จัดการ</th></tr></thead>
            <tbody>
              {filteredBooths.map(booth => {
                const isPending = booth.status === 'booked' && booth.payment_status !== 'paid';
                const isBooked = booth.status === 'booked' && booth.payment_status === 'paid';
                return (
                  <tr key={booth.id}>
                    <td style={{ ...tdStyle, fontWeight: '600' }}>{booth.booth_code}</td>
                    <td style={tdStyle}>{booth.price.toLocaleString()} ฿</td>
                    <td style={tdStyle}>
                      {booth.status !== 'booked' ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input type="number" placeholder="ราคาใหม่" value={editingPrice[booth.id] || ''} onChange={e => setEditingPrice({ ...editingPrice, [booth.id]: e.target.value })} style={{ width: '80px', padding: '4px 6px', fontSize: '13px' }} />
                          <button onClick={() => handleUpdatePrice(booth.id)} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '4px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>ยืนยัน</button>
                        </div>
                      ) : <span style={{ color: '#9ca3af', fontSize: '12px' }}>{isPending ? 'รออนุมัติ' : 'จองแล้ว'}</span>}
                    </td>
                    <td style={tdStyle}>
                      {booth.status === 'available' && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }}>ว่าง</span>}
                      {booth.status === 'pending' && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', backgroundColor: 'rgba(156,163,175,0.1)', color: '#6b7280', border: '1px solid rgba(156,163,175,0.3)' }}>ปิด</span>}
                      {isBooked && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)' }}>จองแล้ว</span>}
                      {isPending && <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>รออนุมัติ</span>}
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => toggleBoothStatus(booth.id, booth.status)} disabled={booth.status === 'booked'}
                        style={{ padding: '4px 10px', cursor: booth.status === 'booked' ? 'not-allowed' : 'pointer', backgroundColor: booth.status === 'booked' ? '#e5e7eb' : (booth.status === 'available' ? '#f59e0b' : '#3b82f6'), color: booth.status === 'booked' ? '#9ca3af' : 'white', border: 'none', borderRadius: '4px', fontSize: '12px' }}>
                        {booth.status === 'booked' ? (isPending ? 'รออนุมัติ' : 'ล็อกแล้ว') : (booth.status === 'available' ? 'ปิดล็อก' : 'เปิดล็อก')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {filteredVendors.map(vendor => (
            <div key={vendor.stallId} style={{ ...card, padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#1f2937', fontSize: '14px' }}>{vendor.shopName}</h4>
                <span style={{ backgroundColor: '#dc2626', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{vendor.stallId}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '8px 0' }}>เมนู: {vendor.menus?.length || 0} รายการ</p>
              <button onClick={() => handleEditVendorClick(vendor)} style={{ width: '100%', padding: '6px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>แก้ไข</button>
            </div>
          ))}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div style={card}>
          <h3 style={{ margin: '0 0 16px 0', color: '#16a34a', fontSize: '16px' }}>รายการรอตรวจสอบ</h3>
          {pendingPayments.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>ไม่มีรายการรอตรวจสอบ</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thStyle}>ผู้เช่า</th><th style={thStyle}>ล็อก</th><th style={thStyle}>ยอด</th><th style={{ ...thStyle, textAlign: 'center' }}>สลิป</th><th style={{ ...thStyle, textAlign: 'right' }}>จัดการ</th></tr></thead>
              <tbody>
                {pendingPayments.map(pay => (
                  <tr key={pay.reservation_id}>
                    <td style={tdStyle}>{pay.user_name}</td>
                    <td style={{ ...tdStyle, fontWeight: '600' }}>{pay.booth_code}</td>
                    <td style={{ ...tdStyle, color: '#16a34a', fontWeight: '600' }}>{pay.price.toLocaleString()} ฿</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button onClick={() => setViewingSlip(pay.slip_image)} style={{ background: 'none', border: '1px solid #d1d5db', color: '#3b82f6', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>ดูสลิป</button>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleVerifyPayment(pay.reservation_id, 'reject')} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>ปฏิเสธ</button>
                        <button onClick={() => handleVerifyPayment(pay.reservation_id, 'approve')} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>อนุมัติ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div style={card}>
          <h3 style={{ margin: '0 0 16px 0', color: '#7c3aed', fontSize: '16px' }}>ประวัติการจอง</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff' }}><tr><th style={thStyle}>วันที่</th><th style={thStyle}>ผู้จอง</th><th style={thStyle}>ล็อก</th><th style={thStyle}>สถานะ</th><th style={thStyle}>ชำระเงิน</th></tr></thead>
              <tbody>
                {history.filter(h => h.booth_code?.toLowerCase().includes(searchTerm.toLowerCase()) || h.user_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((item, i) => (
                  <tr key={i}>
                    <td style={{ ...tdStyle, fontSize: '12px' }}>{new Date(item.booking_date).toLocaleString('th-TH')}</td>
                    <td style={tdStyle}><strong>{item.user_name}</strong><br /><span style={{ fontSize: '11px', color: '#9ca3af' }}>{item.phone}</span></td>
                    <td style={{ ...tdStyle, fontWeight: '600' }}>{item.booth_code}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', backgroundColor: item.reserve_status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: item.reserve_status === 'active' ? '#16a34a' : '#dc2626', border: `1px solid ${item.reserve_status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                        {item.reserve_status === 'active' ? 'ใช้งาน' : 'ยกเลิก'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {item.payment_status === 'paid' && <span style={{ color: '#16a34a', fontSize: '13px' }}>จ่ายแล้ว</span>}
                      {item.payment_status === 'checking' && <span style={{ color: '#f59e0b', fontSize: '13px' }}>รอตรวจ</span>}
                      {item.payment_status === 'unpaid' && <span style={{ color: '#dc2626', fontSize: '13px' }}>ยังไม่จ่าย</span>}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>ไม่มีประวัติ</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Management Tab */}
      {activeTab === 'deleteManage' && (
        <div>
          <div style={{ ...card, borderLeft: '3px solid #f59e0b', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '15px' }}>ร้านค้า</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSoftDeleteAllShops} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>ซ่อนทั้งหมด</button>
                <button onClick={handleHardDeleteAllShops} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>ลบถาวรทั้งหมด</button>
              </div>
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {vendors.map(v => (
                    <tr key={v.stallId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px', color: '#1f2937', fontSize: '13px' }}><strong>{v.stallId}</strong> - {v.shopName}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        <button onClick={() => handleSoftDeleteShop(v.stallId)} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' }}>ซ่อน</button>
                      </td>
                    </tr>
                  ))}
                  {vendors.length === 0 && <tr><td style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>ไม่มีร้านค้า</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...card, borderLeft: '3px solid #dc2626' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#dc2626', fontSize: '15px' }}>บัญชี Vendor</h3>
              <button onClick={handleHardDeleteAllUsers} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>ลบทั้งหมด</button>
            </div>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={thStyle}>ชื่อ</th><th style={thStyle}>อีเมล</th><th style={{ ...thStyle, textAlign: 'right' }}>จัดการ</th></tr></thead>
                <tbody>
                  {vendorUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={tdStyle}><strong>{u.name}</strong></td>
                      <td style={tdStyle}>{u.email}<br /><span style={{ fontSize: '11px', color: '#9ca3af' }}>{u.phone}</span></td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}><button onClick={() => handleHardDeleteUser(u.id, u.name)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>ลบ</button></td>
                    </tr>
                  ))}
                  {vendorUsers.length === 0 && <tr><td colSpan="3" style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>ไม่มีบัญชี Vendor</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '12px', width: '90%', maxWidth: '420px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 14px 0', color: confirmDialog.isAlertOnly ? (confirmDialog.title === 'สำเร็จ' ? '#16a34a' : '#dc2626') : '#dc2626', fontSize: '18px' }}>{confirmDialog.title}</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '22px' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {!confirmDialog.isAlertOnly && <button onClick={closeConfirmDialog} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', flex: 1 }}>ยกเลิก</button>}
              <button onClick={confirmDialog.onConfirm} style={{ padding: '8px 16px', backgroundColor: confirmDialog.isAlertOnly && confirmDialog.title === 'สำเร็จ' ? '#16a34a' : '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }}>{confirmDialog.confirmText}</button>
            </div>
          </div>
        </div>
      )}

      {/* Slip Viewer */}
      {viewingSlip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }} onClick={() => setViewingSlip(null)}>
          <div style={{ position: 'relative', padding: '20px' }}>
            <img src={viewingSlip} alt="Slip" style={{ maxHeight: '80vh', maxWidth: '90vw', borderRadius: '12px', border: '2px solid #d1d5db' }} onClick={e => e.stopPropagation()} />
            <button onClick={() => setViewingSlip(null)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>แก้ไขร้าน: {editingVendor?.stallId}</h3>
              <button onClick={() => setEditingVendor(null)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#6b7280', fontSize: '13px' }}>ชื่อร้าน</label>
              <input type="text" value={editingVendor?.shopName || ''} onChange={e => handleVendorFieldChange('shopName', e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#6b7280', fontSize: '13px' }}>รูปภาพ (URL หรืออัปโหลด)</label>
              <input type="text" value={editingVendor?.image || ''} onChange={e => handleVendorFieldChange('image', e.target.value)} placeholder="URL" style={{ width: '100%', padding: '8px', marginTop: '4px', marginBottom: '6px' }} />
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => handleVendorFieldChange('image', ev.target.result); r.readAsDataURL(f); }} style={{ fontSize: '12px' }} />
              {editingVendor?.image && <img src={editingVendor.image} alt="preview" style={{ width: '120px', height: '120px', objectFit: 'cover', marginTop: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'block' }} />}
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: '#6b7280', fontSize: '13px' }}>หมวดหมู่</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {CATEGORY_OPTIONS.map(cat => {
                  const checked = (editingVendor?.categories || []).includes(cat.label);
                  return <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', backgroundColor: checked ? 'rgba(59,130,246,0.1)' : '#f8f9fa', padding: '4px 10px', borderRadius: '4px', border: `1px solid ${checked ? '#3b82f6' : '#e5e7eb'}`, color: '#1f2937', fontSize: '13px' }}><input type="checkbox" checked={checked} onChange={() => handleVendorCategoryToggle(cat.id)} />{cat.label}</label>;
                })}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '14px', marginTop: '14px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '14px' }}>เมนูอาหาร</h4>
              {(editingVendor?.menus || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" placeholder="ชื่อเมนู" value={item.name} onChange={e => handleVendorMenuChange(i, 'name', e.target.value)} style={{ flex: 2, padding: '6px' }} />
                  <input type="number" placeholder="ราคา" value={item.price} onChange={e => handleVendorMenuChange(i, 'price', e.target.value)} style={{ flex: 1, padding: '6px' }} />
                  <button onClick={() => handleRemoveVendorMenu(i)} style={{ padding: '6px 10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>ลบ</button>
                </div>
              ))}
              <button onClick={handleAddVendorMenu} style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>+ เพิ่มเมนู</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setEditingVendor(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#e5e7eb', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>ยกเลิก</button>
              <button onClick={handleSaveVendor} style={{ flex: 2, padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
