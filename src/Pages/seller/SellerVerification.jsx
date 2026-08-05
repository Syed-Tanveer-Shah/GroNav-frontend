import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { fetchVerification, submitVerification } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const G = '#6aaa00';
const inp = { width:'100%', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box' };

export default function SellerVerification() {
  const { theme } = useTheme();
  const [status, setStatus] = useState('loading');
  const [verificationData, setVerificationData] = useState(null);
  const [form, setForm] = useState({ cnic_number:'' });
  const [files, setFiles] = useState({ cnic_front: null, cnic_back: null });
  const [previews, setPreviews] = useState({ cnic_front: null, cnic_back: null });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const frontRef = useRef(); const backRef = useRef();

  const isDark = theme === 'dark-pro';
  const cardBg = isDark ? '#1e2e1e' : '#fff';
  const textColor = isDark ? '#e0ffe0' : '#222';
  const mutedText = isDark ? '#8fa88f' : '#888';
  const borderColor = isDark ? '#2a3a2a' : '#eee';
  const inputStyle = { ...inp, background: isDark ? '#1a2a1a' : '#fff', color: textColor, borderColor: borderColor };

  const load = useCallback(async () => {
    try {
      const res = await fetchVerification();
      setVerificationData(res.data);
      if (res.data.is_verified) setStatus('verified');
      else if (res.data.status === 'Not submitted') setStatus('not_submitted');
      else setStatus('pending');
    } catch { setStatus('not_submitted'); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFile = (key, e) => {
    const file = e.target.files[0]; if (!file) return;
    setFiles(p => ({ ...p, [key]: file }));
    setPreviews(p => ({ ...p, [key]: URL.createObjectURL(file) }));
  };

  const validate = () => {
    const e = {};
    if (!form.cnic_number.trim()) e.cnic_number = 'CNIC number required';
    else if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic_number)) e.cnic_number = 'Format: XXXXX-XXXXXXX-X';
    if (!files.cnic_front) e.cnic_front = 'Front image required';
    if (!files.cnic_back) e.cnic_back = 'Back image required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('cnic_number', form.cnic_number);
    fd.append('cnic_front', files.cnic_front);
    fd.append('cnic_back', files.cnic_back);
    try {
      await submitVerification(fd);
      toast.success('Verification submitted! We will review within 24-48 hours.');
      setStatus('pending');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  if (status === 'loading') return <div style={{ textAlign:'center', padding:'60px', color:'#bbb' }}>Loading...</div>;

  const stateMap = {
    verified:   { icon:'✅', color:G,       bgColor: isDark ? '#0a2a0a' : '#e8f5e9', title:'Account Verified', subtitle:'Your store is fully verified. You have access to all premium seller features.' },
    pending:    { icon:'⏳', color:'#ff8f00', bgColor: isDark ? '#2a2a0a' : '#fff3e0', title:'Under Review',    subtitle:'Your documents are being reviewed. This usually takes 24-48 hours. You will receive an email once approved.' },
    not_submitted:{ icon:'📄', color:'#1976d2', bgColor: isDark ? '#0a1a2a' : '#e3f2fd', title:'Verification Required', subtitle:'Upload your CNIC to unlock all seller features.' },
  };
  const state = stateMap[status];

  return (
    <div style={{ maxWidth:'680px' }}>
      {/* Status Banner */}
      <div style={{ background:state.bgColor, border:`1px solid ${state.color}30`, borderRadius:'16px', padding:'28px', marginBottom:'28px', display:'flex', alignItems:'center', gap:'20px' }}>
        <div style={{ fontSize:'56px', lineHeight:1 }}>{state.icon}</div>
        <div>
          <h3 style={{ margin:'0 0 6px', fontWeight:'800', color:state.color, fontSize:'20px' }}>{state.title}</h3>
          <p style={{ margin:0, color: isDark ? '#e0ffe0' : '#555', fontSize:'14px', lineHeight:1.6 }}>{state.subtitle}</p>
          {verificationData?.submitted_at && status !== 'not_submitted' && (
            <p style={{ margin:'8px 0 0', fontSize:'12px', color: mutedText }}>Submitted: {verificationData.submitted_at?.split('T')[0]}</p>
          )}
        </div>
      </div>

      {/* Benefits list */}
      <div style={{ background: cardBg, borderRadius:'14px', padding:'24px', marginBottom:'22px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: isDark ? `1px solid ${borderColor}` : 'none' }}>
        <h4 style={{ margin:'0 0 16px', fontWeight:'800', color: textColor }}>🔒 Verification Benefits</h4>
        {['Unlock full seller dashboard features','Get a verified badge on your store','Build customer trust and credibility','Access to bulk import and analytics'].map((b,i) => (
          <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'10px', fontSize:'14px', color: mutedText }}>
            <span style={{ color:G, fontWeight:'700', flexShrink:0 }}>✓</span> {b}
          </div>
        ))}
      </div>

      {/* Form */}
      {status === 'not_submitted' && (
        <div style={{ background: cardBg, borderRadius:'14px', padding:'28px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: isDark ? `1px solid ${borderColor}` : 'none' }}>
          <h4 style={{ margin:'0 0 22px', fontWeight:'800', color: textColor }}>📋 Submit Documents</h4>
          <div style={{ marginBottom:'18px' }}>
            <label style={{ display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'13px', color: mutedText }}>CNIC Number *</label>
            <input value={form.cnic_number} onChange={e => setForm(p=>({...p,cnic_number:e.target.value}))} placeholder="XXXXX-XXXXXXX-X" style={{ ...inputStyle, borderColor: errors.cnic_number ? '#e53935' : borderColor }} />
            {errors.cnic_number && <span style={{ color:'#e53935', fontSize:'12px' }}>{errors.cnic_number}</span>}
          </div>

          {[['cnic_front', frontRef, '📸 CNIC Front Image *'], ['cnic_back', backRef, '📸 CNIC Back Image *']].map(([key, ref, label]) => (
            <div key={key} style={{ marginBottom:'18px' }}>
              <label style={{ display:'block', marginBottom:'6px', fontWeight:'600', fontSize:'13px', color: mutedText }}>{label}</label>
              <div onClick={() => ref.current?.click()} style={{
                border:`2px dashed ${errors[key]?'#e53935':'#d0d0d0'}`, borderRadius:'10px', padding:'24px',
                textAlign:'center', cursor:'pointer', backgroundColor:'#fafafa', transition:'border 0.2s',
                backgroundImage: previews[key] ? `url(${previews[key]})` : 'none',
                backgroundSize:'cover', backgroundPosition:'center', minHeight: previews[key] ? '120px' : 'auto',
              }}>
                {!previews[key] && (
                  <>
                    <div style={{ fontSize:'32px', marginBottom:'8px' }}>⬆️</div>
                    <p style={{ margin:0, color:'#888', fontSize:'14px', fontWeight:'600' }}>Click to upload</p>
                    <p style={{ margin:'4px 0 0', color:'#aaa', fontSize:'12px' }}>PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
              <input ref={ref} type="file" accept="image/*" onChange={e => handleFile(key, e)} style={{ display:'none' }} />
              {errors[key] && <span style={{ color:'#e53935', fontSize:'12px' }}>{errors[key]}</span>}
              {previews[key] && <button onClick={() => { setPreviews(p=>({...p,[key]:null})); setFiles(p=>({...p,[key]:null})); }} style={{ marginTop:'6px', fontSize:'12px', color:'#e53935', background:'none', border:'none', cursor:'pointer', fontWeight:'600' }}>× Remove</button>}
            </div>
          ))}

          <button onClick={handleSubmit} disabled={submitting} style={{ width:'100%', padding:'14px', border:'none', background:`linear-gradient(135deg, ${G}, #4d8a00)`, color:'#fff', borderRadius:'10px', fontWeight:'800', fontSize:'15px', cursor:submitting?'not-allowed':'pointer', opacity:submitting?0.7:1, marginTop:'8px' }}>
            {submitting ? '⏳ Submitting...' : '🛡️ Submit for Verification'}
          </button>
        </div>
      )}
    </div>
  );
}
