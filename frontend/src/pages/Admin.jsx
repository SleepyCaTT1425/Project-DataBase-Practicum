import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [history, setHistory] = useState([]); // 👈 เพิ่ม State สำหรับเก็บประวัติ  

  useEffect(() => {
    if (localStorage.getItem('role') !== 'admin') { navigate('/'); return; }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const boothResp = await fetch('http://localhost:5000/api/booths');
      const vendorResp = await fetch('http://localhost:5000/api/vendors');
      const userResp = await fetch('http://localhost:5000/api/admin/users'); 
      const payResp = await fetch('http://localhost:5000/api/admin/payments'); 
      const historyResp = await fetch('http://localhost:5000/api/admin/history');
      
      if (boothResp.ok) setBooths(await boothResp.json());
      if (vendorResp.ok) setVendors(await vendorResp.json());
      if (userResp.ok) setVendorUsers(await userResp.json());
      if (payResp.ok) setPendingPayments(await payResp.json());
      if (historyResp.ok) setHistory(await historyResp.json());
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const closeConfirmDialog = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isAlertOnly: false });
  const showSuccessAlert = (message) => setConfirmDialog({ isOpen: true, title: '✅ สำเร็จ', message: message, confirmText: 'ตกลง', isAlertOnly: true, onConfirm: () => closeConfirmDialog() });
  const showErrorAlert = (message) => setConfirmDialog({ isOpen: true, title: '❌ ข้อผิดพลาด', message: message, confirmText: 'ตกลง', isAlertOnly: true, onConfirm: () => closeConfirmDialog() });

  const toggleBoothStatus = async (boothId, currentStatus) => {
    if (currentStatus === 'booked') return;
    const newStatus = currentStatus === 'available' ? 'pending' : 'available';
    try { await fetch(`http://localhost:5000/api/booths/${boothId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) }); fetchData(); } 
    catch (error) { showErrorAlert('แก้สถานะไม่สำเร็จ'); }
  };

  const handleUpdatePrice = async (boothId) => {
    const newPrice = editingPrice[boothId];
    if (!newPrice || isNaN(newPrice)) return showErrorAlert('กรุณากรอกราคาเป็นตัวเลขครับ');
    try {
      const resp = await fetch(`http://localhost:5000/api/booths/${boothId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price: parseFloat(newPrice) }) });
      if (resp.ok) { showSuccessAlert('อัปเดตราคาสำเร็จ!'); setEditingPrice(prev => ({ ...prev, [boothId]: '' })); fetchData(); }
    } catch (error) { showErrorAlert('แก้ราคาไม่สำเร็จ'); }
  };

  // --- ฟังก์ชันอนุมัติสลิป ---
  const handleVerifyPayment = (resId, action) => {
    const actionText = action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ';
    setConfirmDialog({
      isOpen: true, title: 'ตรวจสอบการชำระเงิน', message: `คุณแน่ใจหรือไม่ที่จะ "${actionText}" สลิปการชำระเงินนี้?`, confirmText: actionText, isAlertOnly: false,
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:5000/api/admin/payments/${resId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
          fetchData(); showSuccessAlert(`ดำเนินการ ${actionText} เรียบร้อยแล้ว`);
        } catch (error) { showErrorAlert('เกิดข้อผิดพลาด'); }
      }
    });
  };

  const handleSoftDeleteShop = (stallId) => {
    setConfirmDialog({ isOpen: true, title: 'ยืนยันการซ่อนข้อมูลร้านค้า', message: `คุณยืนยันที่จะ "ซ่อนข้อมูลร้านค้าล็อก ${stallId}" ใช่หรือไม่?`, confirmText: 'ซ่อนข้อมูล', isAlertOnly: false, onConfirm: async () => { try { await fetch(`http://localhost:5000/api/admin/shops/${stallId}`, { method: 'DELETE' }); fetchData(); showSuccessAlert('ซ่อนข้อมูลร้านค้าสำเร็จ!'); } catch (error) { showErrorAlert('เกิดข้อผิดพลาดในการซ่อน'); } }});
  };
  const handleSoftDeleteAllShops = () => {
    setConfirmDialog({ isOpen: true, title: '🚨 ยืนยันการซ่อนทุกล็อก', message: `คุณยืนยันที่จะ "ซ่อนข้อมูลร้านค้าทุกล็อก" ใช่หรือไม่?`, confirmText: 'ซ่อนร้านค้าทั้งหมด', isAlertOnly: false, onConfirm: async () => { try { await fetch(`http://localhost:5000/api/admin/shops`, { method: 'DELETE' }); fetchData(); showSuccessAlert('เคลียร์ข้อมูลร้านค้าทั้งหมดสำเร็จ!'); } catch (error) { showErrorAlert('เกิดข้อผิดพลาดในการซ่อน'); } }});
  };
  // เอาไปวางต่อจากฟังก์ชันลบต่างๆ
  const handleHardDeleteAllShops = () => {
    setConfirmDialog({ 
      isOpen: true, 
      title: '🌋 ยืนยันการลบถาวรทุกล็อก', 
      message: `คุณยืนยันที่จะ "ลบข้อมูลร้านค้าทั้งหมดแบบถาวร" ใช่หรือไม่?\n\n(คำเตือน: ข้อมูลร้าน รูปสลิป และประวัติการจองของ **ทุกร้าน** จะถูกลบทิ้งทั้งหมดและไม่สามารถกู้คืนได้ ล็อกทุกพื้นที่จะกลับมาว่างเหมือนระบบใหม่!)`, 
      confirmText: 'ลบทิ้งทั้งหมดถาวร', 
      isAlertOnly: false, 
      onConfirm: async () => { 
        try { 
          await fetch(`http://localhost:5000/api/admin/shops/hard`, { method: 'DELETE' }); 
          fetchData(); 
          showSuccessAlert('ล้างข้อมูลร้านค้าทั้งหมดแบบถาวรสำเร็จ!'); 
        } catch (error) { 
          showErrorAlert('เกิดข้อผิดพลาดในการลบถาวรทั้งหมด'); 
        } 
      }
    });
  };
  const handleHardDeleteUser = (userId, userName) => {
    setConfirmDialog({ isOpen: true, title: '🧨 คำเตือน! ยืนยันการลบบัญชี', message: `คุณยืนยันที่จะ "ลบบัญชีผู้ใช้: ${userName}" ใช่หรือไม่?`, confirmText: 'ลบบัญชีผู้ใช้งาน', isAlertOnly: false, onConfirm: async () => { try { await fetch(`http://localhost:5000/api/admin/users/${userId}`, { method: 'DELETE' }); fetchData(); showSuccessAlert('ลบบัญชีผู้ใช้งานสำเร็จ!'); } catch (error) { showErrorAlert('เกิดข้อผิดพลาดในการลบ'); } }});
  };
  const handleHardDeleteAllUsers = () => {
    setConfirmDialog({ isOpen: true, title: '☢️ ยืนยันการลบ Vendor ทั้งหมด', message: `คุณยืนยันที่จะ "ลบบัญชี Vendor ทั้งหมด" ใช่หรือไม่?`, confirmText: 'ลบ Vendor ทั้งหมด', isAlertOnly: false, onConfirm: async () => { try { await fetch(`http://localhost:5000/api/admin/users`, { method: 'DELETE' }); fetchData(); showSuccessAlert('ลบบัญชี Vendor ทั้งหมดสำเร็จ!'); } catch (error) { showErrorAlert('เกิดข้อผิดพลาดในการลบ'); } }});
  };

  const handleEditVendorClick = (vendor) => {
    const editableVendor = JSON.parse(JSON.stringify(vendor));
    if (!editableVendor.categories) editableVendor.categories = [];
    if (!editableVendor.menus || editableVendor.menus.length === 0) editableVendor.menus = [{ name: '', price: '' }];
    setEditingVendor(editableVendor);
  };
  const handleVendorFieldChange = (field, value) => setEditingVendor(prev => ({ ...prev, [field]: value }));
  const handleVendorCategoryToggle = (categoryId) => { const catObj = CATEGORY_OPTIONS.find(c => c.id === categoryId); setEditingVendor(prev => { let catsArray = [...(prev.categories || [])]; catsArray.includes(catObj?.label) ? catsArray = catsArray.filter(c => c !== catObj?.label) : catsArray.push(catObj?.label); return { ...prev, categories: catsArray }; }); };
  const handleVendorMenuChange = (index, field, value) => setEditingVendor(prev => { const newMenus = [...prev.menus]; newMenus[index][field] = value; return { ...prev, menus: newMenus }; });
  const handleAddVendorMenu = () => setEditingVendor(prev => ({ ...prev, menus: [...prev.menus, { name: '', price: '' }] }));
  const handleRemoveVendorMenu = (index) => setEditingVendor(prev => { let newMenus = [...prev.menus]; newMenus.splice(index, 1); if (newMenus.length === 0) newMenus = [{ name: '', price: '' }]; return { ...prev, menus: newMenus }; });
  const handleSaveVendor = async () => {
    try {
      const menusArr = editingVendor.menus.map(m => ({ name: m.name, price: Number(m.price) }));
      const payload = { ...editingVendor, menus: menusArr };
      const resp = await fetch(`http://localhost:5000/api/vendors/${editingVendor.stallId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (resp.ok) { showSuccessAlert(`อัปเดตข้อมูลร้านสำเร็จ!`); setEditingVendor(null); fetchData(); } else { showErrorAlert('เกิดข้อผิดพลาดในการบันทึกข้อมูล'); }
    } catch (error) { showErrorAlert('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้'); }
  };

  // --- ระบบกรองข้อมูลการค้นหา ---
  const filteredBooths = booths.filter(b => b.booth_code?.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // 👇 แก้ไขตรงนี้: เพิ่มเงื่อนไข v.paymentStatus === 'paid' เข้าไป 👇
  const filteredVendors = vendors.filter(v => 
    v.paymentStatus === 'paid' && // แสดงเฉพาะร้านที่จ่ายเงินและอนุมัติแล้วเท่านั้น
    (v.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) || v.stallId?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>กำลังโหลด...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
      <h2 style={{ borderBottom: '2px solid #2c3e50', paddingBottom: '10px' }}>👑 Admin Dashboard</h2>

      {/* เมนูแท็บ */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => {setActiveTab('booths'); setSearchTerm('');}} style={{ padding: '10px 20px', backgroundColor: activeTab === 'booths' ? '#3498db' : '#bdc3c7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>จัดการล็อก & ราคา</button>
        <button onClick={() => {setActiveTab('vendors'); setSearchTerm('');}} style={{ padding: '10px 20px', backgroundColor: activeTab === 'vendors' ? '#3498db' : '#bdc3c7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>ดูข้อมูลร้านค้า</button>
        <button onClick={() => {setActiveTab('payments'); setSearchTerm('');}} style={{ padding: '10px 20px', backgroundColor: activeTab === 'payments' ? '#2ecc71' : '#bdc3c7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', position: 'relative' }}>
          💳 ตรวจสอบสลิปโอนเงิน
          {pendingPayments.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '4px 8px', fontSize: '12px' }}>{pendingPayments.length}</span>}
        </button>
        <button onClick={() => {setActiveTab('history'); setSearchTerm('');}} style={{ padding: '10px 20px', backgroundColor: activeTab === 'history' ? '#9b59b6' : '#bdc3c7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          🕒 ประวัติการจอง
        </button>
        <button onClick={() => {setActiveTab('deleteManage'); setSearchTerm('');}} style={{ padding: '10px 20px', backgroundColor: activeTab === 'deleteManage' ? '#e74c3c' : '#bdc3c7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ จัดการลบข้อมูล</button>
      </div>

      {activeTab === 'booths' && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>รหัสล็อก</th><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>ราคาปัจจุบัน</th><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>ปรับราคา (เฉพาะล็อกว่าง)</th><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>สถานะ</th><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>จัดการจอง</th></tr></thead>
            <tbody>
              {filteredBooths.map(booth => {
                // 👇 เพิ่มเงื่อนไขเช็คว่ากำลังรออนุมัติอยู่หรือไม่ 👇
                const isPendingApproval = booth.status === 'booked' && booth.payment_status !== 'paid';
                const isFullyBooked = booth.status === 'booked' && booth.payment_status === 'paid';

                return (
                  <tr key={booth.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{booth.booth_code}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{booth.price.toLocaleString()} ฿</td>
                    
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      {booth.status !== 'booked' ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <input type="number" placeholder="ราคาใหม่" value={editingPrice[booth.id] || ''} onChange={(e) => setEditingPrice({...editingPrice, [booth.id]: e.target.value})} style={{ width: '80px', padding: '5px' }} />
                          <button onClick={() => handleUpdatePrice(booth.id)} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>ยืนยัน</button>
                        </div>
                      ) : (
                        <span style={{ color: '#95a5a6', fontSize: '12px' }}>
                          {/* แจ้งให้ทราบว่าทำไมถึงแก้ราคาไม่ได้ */}
                          {isPendingApproval ? 'รอการอนุมัติ (แก้ไม่ได้)' : 'แก้ไม่ได้ (จองแล้ว)'}
                        </span>
                      )}
                    </td>
                    
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      {/* 👇 แยกสีป้ายสถานะให้ชัดเจน 👇 */}
                      {booth.status === 'available' && <span style={{ padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '12px', backgroundColor: '#2ecc71' }}>ว่าง</span>}
                      {booth.status === 'pending' && <span style={{ padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '12px', backgroundColor: '#95a5a6' }}>ปิดไม่ให้จอง</span>}
                      {isFullyBooked && <span style={{ padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '12px', backgroundColor: '#e74c3c' }}>ถูกจองแล้ว</span>}
                      {isPendingApproval && <span style={{ padding: '4px 8px', borderRadius: '4px', color: '#856404', fontSize: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', fontWeight: 'bold' }}>⏳ รอการอนุมัติ</span>}
                    </td>
                    
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      <button 
                        onClick={() => toggleBoothStatus(booth.id, booth.status)} 
                        disabled={booth.status === 'booked'} 
                        style={{ 
                          padding: '6px 12px', 
                          cursor: booth.status === 'booked' ? 'not-allowed' : 'pointer', 
                          backgroundColor: booth.status === 'booked' ? '#bdc3c7' : (booth.status === 'available' ? '#e67e22' : '#3498db'), 
                          color: 'white', border: 'none', borderRadius: '4px' 
                        }}
                      >
                        {/* 👇 เปลี่ยนข้อความบนปุ่มเปิด/ปิดล็อก 👇 */}
                        {booth.status === 'booked' 
                          ? (isPendingApproval ? '🔒 รออนุมัติ' : '🔒 ล็อกแล้ว') 
                          : (booth.status === 'available' ? 'สั่งปิดล็อก' : 'สั่งเปิดล็อก')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'vendors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredVendors.map(vendor => (
            <div key={vendor.stallId} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><h4 style={{ margin: 0 }}>{vendor.shopName}</h4><span style={{ backgroundColor: '#e74c3c', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>ล็อก {vendor.stallId}</span></div>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>🛒 เมนู: {vendor.menus?.length || 0} รายการ</p>
              <button onClick={() => handleEditVendorClick(vendor)} style={{ width: '100%', padding: '8px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✏️ แก้ไขข้อมูล</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payments' && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#27ae60' }}>💰 รายการรอตรวจสอบการชำระเงิน</h3>
          {pendingPayments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '18px' }}>ไม่มีรายการรอตรวจสอบในขณะนี้ 🎉</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>ผู้เช่า</th><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>รหัสล็อก</th><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>ยอดที่ต้องชำระ</th><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>หลักฐาน (สลิป)</th><th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'right' }}>การจัดการ</th></tr></thead>
              <tbody>
                {pendingPayments.map(pay => (
                  <tr key={pay.reservation_id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{pay.user_name}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{pay.booth_code}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', color: '#27ae60', fontWeight: 'bold' }}>{pay.price.toLocaleString()} ฿</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <button onClick={() => setViewingSlip(pay.slip_image)} style={{ background: 'none', border: '1px solid #3498db', color: '#3498db', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>ดูรูปสลิป 👁️</button>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleVerifyPayment(pay.reservation_id, 'reject')} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>ปฏิเสธ</button>
                        <button onClick={() => handleVerifyPayment(pay.reservation_id, 'approve')} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✅ อนุมัติ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ================= แท็บประวัติการจอง ================= */}
      {activeTab === 'history' && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#8e44ad' }}>🕒 ประวัติการจองทั้งหมด (จอง/ยกเลิก)</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa' }}>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>วันที่จอง</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>ผู้จอง (เบอร์โทร)</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>รหัสล็อก</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>สถานะล็อก</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>การชำระเงิน</th>
                </tr>
              </thead>
              <tbody>
                {history.filter(h => h.booth_code?.toLowerCase().includes(searchTerm.toLowerCase()) || h.user_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee', backgroundColor: item.reserve_status === 'cancelled' ? '#fff5f5' : 'white' }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(item.booking_date).toLocaleString('th-TH')}</td>
                    <td style={{ padding: '12px' }}><strong>{item.user_name}</strong><br/><span style={{ fontSize: '12px', color: '#666' }}>📞 {item.phone}</span></td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#2c3e50' }}>{item.booth_code}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: 'white', backgroundColor: item.reserve_status === 'active' ? '#2ecc71' : '#e74c3c' }}>
                        {item.reserve_status === 'active' ? 'กำลังใช้งาน' : 'ยกเลิกแล้ว'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.payment_status === 'paid' && <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '14px' }}>✅ จ่ายแล้ว</span>}
                      {item.payment_status === 'checking' && <span style={{ color: '#f39c12', fontWeight: 'bold', fontSize: '14px' }}>⏳ รอตรวจ</span>}
                      {item.payment_status === 'unpaid' && <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '14px' }}>❌ ยังไม่จ่าย</span>}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>ไม่มีประวัติการจองในระบบ</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'deleteManage' && (
        <div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #f39c12', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, color: '#d35400' }}>การจัดการข้อมูลร้านค้า (ลบ/ซ่อน)</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                {/* เปลี่ยนข้อความให้ชัดเจนว่านี่คือปุ่มซ่อน */}
                <button onClick={handleSoftDeleteAllShops} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🚨 ซ่อนร้านค้าทั้งหมด
                </button>
                {/* 👇 เพิ่มปุ่มลบถาวรทั้งหมด (สีแดงเข้ม) ตรงนี้ 👇 */}
                <button onClick={handleHardDeleteAllShops} style={{ backgroundColor: '#8b0000', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🌋 ลบถาวรทั้งหมด
                </button>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginTop: 0 }}>* <strong>ซ่อนข้อมูล:</strong> ซ่อนจากหน้าเว็บ แต่ยังมีประวัติในฐานข้อมูล / <strong>ลบถาวร:</strong> ลบร้าน สลิป และประวัติทิ้งทั้งหมด กู้คืนไม่ได้!</p>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {vendors.map(vendor => (
                    <tr key={vendor.stallId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}><strong>ล็อก {vendor.stallId}</strong> - {vendor.shopName}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button onClick={() => handleSoftDeleteShop(vendor.stallId)} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                          ซ่อนข้อมูล
                        </button>
                        <button onClick={() => handleHardDeleteShop(vendor.stallId)} style={{ backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}>
                          ลบถาวร
                        </button>
                      </td>
                    </tr>
                  ))}
                  {vendors.length === 0 && <tr><td style={{ padding: '20px', textAlign: 'center', color: '#999' }}>ไม่มีข้อมูลร้านค้าในระบบ</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #e74c3c', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}><h3 style={{ margin: 0, color: '#c0392b' }}>ลบบัญชีผู้ใช้งาน Vendor (Hard Delete)</h3><button onClick={handleHardDeleteAllUsers} style={{ backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>☢️ ลบบัญชี Vendor "ทั้งหมด"</button></div>
            <p style={{ fontSize: '14px', color: '#666', marginTop: 0 }}>* การลบส่วนนี้ คือการลบบัญชีและประวัติจองออกจากฐานข้อมูล MySQL อย่าง <strong>ถาวร! ไม่สามารถกู้คืนได้</strong></p>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9f9f9' }}><tr><th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ชื่อบัญชี (Username)</th><th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>อีเมล / เบอร์โทร</th><th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>การจัดการ</th></tr></thead>
                <tbody>
                  {vendorUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}><strong>{user.name}</strong></td><td style={{ padding: '10px' }}>{user.email}<br/><span style={{ fontSize: '12px', color: '#888' }}>{user.phone}</span></td><td style={{ padding: '10px', textAlign: 'right' }}><button onClick={() => handleHardDeleteUser(user.id, user.name)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>ลบบัญชีนี้</button></td></tr>
                  ))}
                  {vendorUsers.length === 0 && <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>ไม่มีบัญชี Vendor ในระบบ</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ยืนยัน/แจ้งเตือน */}
      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 15px 0', color: confirmDialog.isAlertOnly ? (confirmDialog.title.includes('✅') ? '#27ae60' : '#e74c3c') : '#c0392b', fontSize: '22px' }}>{confirmDialog.title}</h3>
            <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '25px' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              {!confirmDialog.isAlertOnly && <button onClick={closeConfirmDialog} style={{ padding: '12px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', flex: 1 }}>ยกเลิก</button>}
              <button onClick={confirmDialog.onConfirm} style={{ padding: '12px 20px', backgroundColor: confirmDialog.isAlertOnly && confirmDialog.title.includes('✅') ? '#3498db' : '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', flex: 1 }}>{confirmDialog.confirmText}</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup ดูรูปสลิปเต็มๆ */}
      {viewingSlip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }} onClick={() => setViewingSlip(null)}>
          <div style={{ position: 'relative', padding: '20px' }}>
            <img src={viewingSlip} alt="Full Slip" style={{ maxHeight: '80vh', maxWidth: '90vw', borderRadius: '12px', border: '4px solid white' }} onClick={(e) => e.stopPropagation()} />
            <button onClick={() => setViewingSlip(null)} style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>✖</button>
          </div>
        </div>
      )}
      {/* ================= MODAL สำหรับแก้ไขร้าน ================= */}
      {editingVendor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>✏️ แก้ไขร้าน: ล็อก {editingVendor?.stallId}</h3>
              <button onClick={() => setEditingVendor(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>ชื่อร้าน</label>
              <input type="text" value={editingVendor?.shopName || ''} onChange={e => handleVendorFieldChange('shopName', e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>รูปภาพหน้าร้าน (อัปโหลดไฟล์ หรือใส่ URL)</label>
              <input type="text" value={editingVendor?.image || ''} onChange={e => handleVendorFieldChange('image', e.target.value)} placeholder="URL รูปภาพ หรืออัปโหลดไฟล์ด้านล่าง..." style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', marginBottom: '8px' }} />
              {/* ปุ่มเลือกไฟล์รูปภาพ */}
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => handleVendorFieldChange('image', ev.target.result);
                reader.readAsDataURL(file);
              }} style={{ width: '100%', fontSize: '13px', padding: '8px', border: '1px dashed #3498db', borderRadius: '6px', backgroundColor: '#f4f9fd' }} />
              
              {/* แสดงรูปตัวอย่างถ้ารูปมีค่า */}
              {editingVendor?.image && <img src={editingVendor.image} alt="preview" style={{ width: '100%', maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px', border: '1px solid #ddd', display: 'block' }}/>}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>หมวดหมู่ (เลือกได้หลายหมวด)</label><br />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {CATEGORY_OPTIONS.map(cat => {
                  const isChecked = (editingVendor?.categories || []).includes(cat.label);
                  return (
                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', backgroundColor: '#f9f9f9', padding: '5px 10px', borderRadius: '4px', border: '1px solid #eee' }}>
                      <input type="checkbox" checked={isChecked} onChange={() => handleVendorCategoryToggle(cat.id)} style={{ cursor: 'pointer' }}/>
                      {cat.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>จัดการเมนูอาหาร</h4>
              {(editingVendor?.menus || []).map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input type="text" placeholder="ชื่อเมนู" value={item.name} onChange={e => handleVendorMenuChange(index, 'name', e.target.value)} style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <input type="number" placeholder="ราคา" value={item.price} onChange={e => handleVendorMenuChange(index, 'price', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <button onClick={() => handleRemoveVendorMenu(index)} style={{ padding: '8px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ลบ</button>
                </div>
              ))}
              <button onClick={handleAddVendorMenu} style={{ padding: '8px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ เพิ่มเมนู</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button onClick={() => setEditingVendor(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>ยกเลิก</button>
              <button onClick={handleSaveVendor} style={{ flex: 2, padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>💾 บันทึกการแก้ไข</button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;