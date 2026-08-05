import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { changePassword, deleteAccount } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const G = '#6aaa00';
const inp = { width:'100%', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box', fontFamily:'inherit' };

function Section({ title, children, borderColor, cardBg, textColor, isDark }) {
  return (
    <div style={{ background: cardBg, borderRadius:'14px', padding:'28px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: borderColor ? `1px solid ${borderColor}` : (isDark ? `1px solid #2a3a2a` : 'none'), marginBottom:'22px' }}>
      <h3 style={{ margin:'0 0 22px', fontWeight:'800', color: borderColor || textColor, fontSize:'17px' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function SellerSettings() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [pwForm, setPwForm] = useState({ current_password:'', new_password:'', confirm_password:'' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState({});
  const [delConfirm, setDelConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isDark = theme === 'dark-pro';
  const cardBg = isDark ? '#1e2e1e' : '#fff';
  const textColor = isDark ? '#e0ffe0' : '#222';
  const mutedText = isDark ? '#8fa88f' : '#888';
  const borderColor = isDark ? '#2a3a2a' : '#eee';
  const inputStyle = { ...inp, background: isDark ? '#1a2a1a' : '#fff', color: textColor, borderColor: borderColor };

  const handlePwChange = async e => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.current_password) errs.current_password = 'Required';
    if (pwForm.new_password.length < 8) errs.new_password = 'Min 8 characters';
    if (pwForm.new_password !== pwForm.confirm_password) errs.confirm_password = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setSavingPw(true);
    try {
      await changePassword(pwForm);
      toast.success('Password updated! Please log in again.');
      localStorage.removeItem('userToken'); localStorage.removeItem('UserInfo');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally { setSavingPw(false); }
  };

  const handleDelete = async () => {
    if (delConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted');
      localStorage.clear(); navigate('/');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const pwField = (key, label) => (
    <div style={{ marginBottom:'16px' }}>
      <label style={{ display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'13px', color: mutedText }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input
          type={showPw[key] ? 'text':'password'}
          value={pwForm[key]}
          onChange={e => setPwForm(p=>({...p,[key]:e.target.value}))}
          style={{ ...inputStyle, paddingRight:'44px', borderColor: pwErrors[key]?'#e53935': borderColor }}
          placeholder={label}
        />
        <button type="button" onClick={() => setShowPw(p=>({...p,[key]:!p[key]}))} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color: mutedText, fontSize:'16px' }}>
          {showPw[key] ? '🙈' : '👁️'}
        </button>
      </div>
      {pwErrors[key] && <span style={{ color:'#e53935', fontSize:'12px' }}>{pwErrors[key]}</span>}
    </div>
  );

  return (
    <div style={{ maxWidth:'680px' }}>
      {/* Password */}
      <Section title="🔐 Change Password" cardBg={cardBg} textColor={textColor} isDark={isDark}>
        <form onSubmit={handlePwChange}>
          {pwField('current_password', 'Current Password')}
          {pwField('new_password', 'New Password')}
          {pwField('confirm_password', 'Confirm New Password')}
          <div style={{ background: isDark ? '#1a2a1a' : '#f0f9e0', border:`1px solid ${G}30`, borderRadius:'8px', padding:'12px 14px', marginBottom:'18px', fontSize:'13px', color: isDark ? G : '#5a7a2d' }}>
            💡 Password must be at least 8 characters. You will be logged out after change.
          </div>
          <button type="submit" disabled={savingPw} style={{ padding:'12px 28px', border:'none', background:G, color:'#fff', borderRadius:'10px', fontWeight:'700', cursor:savingPw?'not-allowed':'pointer', opacity:savingPw?0.7:1 }}>
            {savingPw ? 'Updating...' : '🔐 Update Password'}
          </button>
        </form>
      </Section>

      {/* Notifications (static) */}
      <Section title="🔔 Notification Preferences" cardBg={cardBg} textColor={textColor} isDark={isDark}>
        {[['Email for new orders','email_orders',true],['Email for new reviews','email_reviews',true],['Email for low stock alerts','email_stock',true],['Marketing emails','email_marketing',false]].map(([label,key,def]) => (
          <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', paddingBottom:'16px', borderBottom: `1px solid ${borderColor}` }}>
            <div>
              <p style={{ margin:0, fontWeight:'600', fontSize:'14px', color: textColor }}>{label}</p>
            </div>
            <label style={{ position:'relative', display:'inline-block', width:'44px', height:'24px' }}>
              <input type="checkbox" defaultChecked={def} style={{ opacity:0, width:0, height:0 }} onChange={() => {}} />
              <span style={{ position:'absolute', inset:0, borderRadius:'12px', backgroundColor: def ? G : (isDark ? '#2a3a2a' : '#ccc'), cursor:'pointer', transition:'0.3s' }} />
            </label>
          </div>
        ))}
        <p style={{ fontSize:'12px', color: mutedText }}>Note: Notification settings save automatically.</p>
      </Section>

      {/* Danger Zone */}
      <Section title="⚠️ Danger Zone" borderColor="#e53935" cardBg={cardBg} textColor={textColor} isDark={isDark}>
        <p style={{ color: mutedText, fontSize:'14px', lineHeight:'1.6', marginBottom:'20px' }}>
          Permanently delete your seller account and all associated data (products, orders, store info). <strong>This cannot be undone.</strong>
        </p>
        <div style={{ marginBottom:'16px' }}>
          <label style={{ display:'block', marginBottom:'8px', fontWeight:'600', fontSize:'13px', color: mutedText }}>
            Type <strong>DELETE</strong> to confirm:
          </label>
          <input
            value={delConfirm}
            onChange={e => setDelConfirm(e.target.value)}
            placeholder="DELETE"
            style={{ ...inputStyle, borderColor: delConfirm === 'DELETE' ? '#e53935' : borderColor, maxWidth:'280px' }}
          />
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting || delConfirm !== 'DELETE'}
          style={{ padding:'12px 28px', backgroundColor: delConfirm==='DELETE' ? '#e53935':'transparent', color: delConfirm==='DELETE'?'#fff':'#e53935', border:'2px solid #e53935', borderRadius:'10px', cursor:(deleting||delConfirm!=='DELETE')?'not-allowed':'pointer', fontWeight:'800', fontSize:'14px', opacity:(deleting||delConfirm!=='DELETE')?0.6:1 }}
        >
          {deleting ? 'Deleting...' : '🗑️ Delete My Seller Account'}
        </button>
      </Section>
    </div>
  );
}
