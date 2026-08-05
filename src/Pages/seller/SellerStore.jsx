import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { QRCodeSVG } from 'qrcode.react'
import {
  fetchSellerStore,
  updateSellerStore,
  toggleStore
} from '../../services/api'

const G = '#6aaa00'

export default function SellerStore() {
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [isOpen, setIsOpen] = useState(true)
  const [form, setForm] = useState({
    name: '', city: '', address: '', phone: '', opening_hours: ''
  })

  // Fetch store on mount
  useEffect(() => {
    fetchStore()
  }, [])

  const fetchStore = async () => {
    try {
      const res = await fetchSellerStore()
      setStore(res.data)
      setIsOpen(res.data.is_open)
      setForm({
        name: res.data.name || '',
        city: res.data.city || '',
        address: res.data.address || '',
        phone: res.data.phone || '',
        opening_hours: res.data.opening_hours || ''
      })
      if (res.data.logo) setLogoPreview(res.data.logo)
    } catch (err) {
      toast.error('Failed to load store details')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleToggle = async () => {
    try {
      const res = await toggleStore()
      setIsOpen(res.data.is_open)
      toast.success(res.data.is_open ? 'Store is now Open' : 'Store is now Closed')
    } catch {
      toast.error('Failed to toggle store status')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('city', form.city)
      formData.append('address', form.address)
      formData.append('phone', form.phone)
      formData.append('opening_hours', form.opening_hours)
      if (logoFile) formData.append('logo', logoFile)

      // Debug:
      for (let [k, v] of formData.entries()) {
        console.log(k, v)
      }

      await updateSellerStore(formData)
      toast.success('Store updated successfully!')
      fetchStore()
    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data)
      toast.error('Failed to save store details: ' + JSON.stringify(err.response?.data || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{padding:'40px',textAlign:'center',color:'#888'}}>Loading store details...</div>

  return (
    <div style={{ maxWidth:'800px' }}>
      <h2 style={{ fontWeight:'800', fontSize:'20px', color:'#222', marginBottom:'24px' }}>My Store</h2>

      {/* Logo + Toggle Row */}
      <div style={{ background:'#fff', borderRadius:'14px', padding:'24px', marginBottom:'16px', border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ position:'relative', cursor:'pointer' }} onClick={() => document.getElementById('logoInput').click()}>
            {logoPreview
              ? <img src={logoPreview} alt="logo" style={{ width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover', border:`3px solid ${G}` }} />


              : <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'#f0f9e0', border:`3px solid ${G}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'700', color:G }}>{form.name?.[0]?.toUpperCase() || 'S'}</div>
            }
            <div style={{ position:'absolute', bottom:'0', right:'0', width:'24px', height:'24px', background:G, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'12px' }}>+</div>
          </div>
          <input id="logoInput" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleLogoChange} style={{ display:'none' }} />
          <div>
            <p style={{ fontWeight:'700', fontSize:'15px', color:'#222', margin:0 }}>{form.name || 'Your Store'}</p>
            <p style={{ fontSize:'12px', color:'#888', margin:'4px 0 0' }}>Click photo to change logo</p>
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'13px', color:'#555', fontWeight:'600' }}>{isOpen ? 'Store is Open' : 'Store is Closed'}</span>
          <div onClick={handleToggle} style={{ width:'48px', height:'26px', borderRadius:'13px', background: isOpen ? G : '#ddd', cursor:'pointer', position:'relative', transition:'background 0.2s' }}>
            <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'#fff', position:'absolute', top:'3px', left: isOpen ? '25px' : '3px', transition:'left 0.2s' }} />
          </div>
        </div>
      </div>

      {/* Store Form */}
      <div style={{ background:'#fff', borderRadius:'14px', padding:'24px', marginBottom:'16px', border:'1px solid #eee' }}>
        <h3 style={{ fontWeight:'700', fontSize:'15px', color:'#222', marginBottom:'18px', paddingBottom:'10px', borderBottom:'1px solid #f0f0f0' }}>Store Details</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          {[
            { label:'Store Name', key:'name', placeholder:'Ahmed Grocery Store' },
            { label:'Phone Number', key:'phone', placeholder:'03XX-XXXXXXX' },
            { label:'Opening Hours', key:'opening_hours', placeholder:'8:00 AM - 10:00 PM' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#555', marginBottom:'6px' }}>{label}</label>
              <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                style={{ width:'100%', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:'8px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
            </div>
          ))}
          <div>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#555', marginBottom:'6px' }}>City</label>
            <select value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:'8px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}>
              <option value="">Select city...</option>
              {['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta','Multan','Faisalabad'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#555', marginBottom:'6px' }}>Address</label>
            <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Street, Area, City" rows={3}
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:'8px', fontSize:'13px', outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }} />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ marginTop:'18px', padding:'11px 28px', background:G, color:'#fff', border:'none', borderRadius:'8px', fontWeight:'700', fontSize:'14px', cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* QR Code */}
      <div style={{ background:'#fff', borderRadius:'14px', padding:'24px', border:'1px solid #eee', textAlign:'center' }}>
        <h3 style={{ fontWeight:'700', fontSize:'15px', color:'#222', marginBottom:'16px' }}>Store QR Code</h3>
        <QRCodeSVG value={`http://localhost:3002/store/${store?.id || 1}`} size={120} fgColor={G} />
        <p style={{ fontSize:'12px', color:'#888', marginTop:'10px' }}>Scan to visit your public store page</p>
      </div>
    </div>
  )
}
