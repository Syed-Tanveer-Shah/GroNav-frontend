import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

// ── Pakistan province / city data ──────────────────────────────────────────────
const PROVINCE_CITIES = {
  Punjab: [
    'Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan',
    'Sialkot', 'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Jhang',
    'Rahim Yar Khan', 'Gujrat', 'Sahiwal', 'Wah Cantt', 'Okara',
  ],
  Sindh: [
    'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah',
    'Mirpur Khas', 'Khairpur', 'Jacobabad', 'Shikarpur', 'Dadu',
  ],
  KPK: [
    'Peshawar', 'Abbottabad', 'Mardan', 'Mingora', 'Kohat',
    'Bannu', 'Dera Ismail Khan', 'Charsadda', 'Nowshera', 'Mansehra',
  ],
  Balochistan: [
    'Quetta', 'Turbat', 'Khuzdar', 'Hub', 'Chaman',
    'Gwadar', 'Sibi', 'Zhob', 'Loralai', 'Dera Murad Jamali',
  ],
  Islamabad: ['Islamabad'],
}

const PROVINCES = Object.keys(PROVINCE_CITIES)

// ── Colour tokens (matching project green) ────────────────────────────────────
const GREEN = '#6aaa00'
const GREEN_BG = '#f0f9e0'
const GREEN_BORDER = '#c0dd97'
const ORANGE = '#ff6f00'

// ── Tiny reusable field label ─────────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '5px' }}>
      {children}
      {required && <span style={{ color: '#e53935', marginLeft: '2px' }}>*</span>}
    </label>
  )
}

// ── Shared input style ─────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  color: '#333',
  background: '#fff',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

const inputErrorStyle = { ...inputStyle, border: '1px solid #e53935' }

// ── Select style ──────────────────────────────────────────────────────────────
const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
  cursor: 'pointer',
}

export default function DeliveryInformation() {
  const location = useLocation()
  const navigate = useNavigate()

  // Product data passed via route state from ProductDetail
  const orderProduct = location.state?.product || null
  const orderQty    = location.state?.quantity || 1

  // Compute prices
  const effectivePrice = orderProduct
    ? (orderProduct.discount_active && orderProduct.discount_percentage
        ? Math.round(orderProduct.price * (1 - orderProduct.discount_percentage / 100))
        : Number(orderProduct.price))
    : 0

  const itemsTotal   = effectivePrice * orderQty
  const deliveryFee  = 140
  const platformFee  = 10
  const grandTotal   = itemsTotal + deliveryFee + platformFee

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    fullName:     '',
    phone:        '',
    province:     '',
    city:         '',
    buildingInfo: '',
    area:         '',
    landmark:     '',
    address:      '',
    label:        'HOME', // 'HOME' | 'OFFICE'
  })
  const [errors, setErrors]       = useState({})
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  const cities = form.province ? (PROVINCE_CITIES[form.province] || []) : []

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'province') updated.city = '' // reset city on province change
      return updated
    })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }))
  }

  const validate = () => {
    const required = ['fullName', 'phone', 'province', 'city', 'buildingInfo', 'address']
    const newErrors = {}
    required.forEach(f => { if (!form[f].trim()) newErrors[f] = true })
    // Basic phone validation
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) {
      newErrors.phone = true
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      toast.error('Please fill all required fields correctly.')
      return
    }
    toast.success('Delivery information saved!')
  }

  const handleProceedToPay = () => {
    if (!validate()) {
      toast.error('Please fill all required fields before proceeding.')
      return
    }
    navigate('/payment', {
      state: {
        items: orderProduct,
        itemsTotal: itemsTotal,
        deliveryFee: deliveryFee,
        productName: orderProduct?.name || 'Product',
        quantity: orderQty,
        deliveryInfo: form,
      },
    })
  }

  const handleApplyPromo = () => {
    if (!promoCode.trim()) { toast.warn('Enter a promo code first.'); return }
    setPromoApplied(true)
    toast.success(`Promo code "${promoCode}" applied!`)
  }

  // ── Section header ─────────────────────────────────────────────────────────
  const SectionHeader = ({ title }) => (
    <div style={{ borderBottom: `2px solid ${GREEN}`, paddingBottom: '10px', marginBottom: '20px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: 0 }}>{title}</h2>
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#f5f7f2', minHeight: '100vh', padding: '24px 16px' }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 16px', fontSize: '13px', color: '#888' }}>
        <span style={{ cursor: 'pointer', color: GREEN }} onClick={() => navigate('/')}>Home</span>
        {' > '}
        <span style={{ cursor: 'pointer', color: GREEN }} onClick={() => navigate(-1)}>Product</span>
        {' > '}
        <span style={{ color: '#555', fontWeight: '600' }}>Delivery Information</span>
      </div>

      {/* Page title */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#222', margin: 0 }}>Checkout</h1>
      </div>

      {/* Two-column layout */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '24px',
        alignItems: 'start',
      }}>

        {/* ═══════════════════════════════════════════════════════════════════
            LEFT — Delivery Information Form
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '28px',
          border: '1px solid #eee',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <SectionHeader title="📦 Delivery Information" />

          <div style={{ display: 'grid', gap: '16px' }}>

            {/* Full Name */}
            <div>
              <FieldLabel required>Full Name</FieldLabel>
              <input
                id="di-fullName"
                type="text"
                placeholder="e.g. Ahmed Ali"
                value={form.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                style={errors.fullName ? inputErrorStyle : inputStyle}
              />
              {errors.fullName && <span style={{ fontSize: '11px', color: '#e53935' }}>Full name is required</span>}
            </div>

            {/* Phone Number */}
            <div>
              <FieldLabel required>Phone Number</FieldLabel>
              <input
                id="di-phone"
                type="tel"
                placeholder="e.g. 0300-1234567"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                style={errors.phone ? inputErrorStyle : inputStyle}
              />
              {errors.phone && <span style={{ fontSize: '11px', color: '#e53935' }}>Enter a valid phone number</span>}
            </div>

            {/* Province + City side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <FieldLabel required>Province</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <select
                    id="di-province"
                    value={form.province}
                    onChange={e => handleChange('province', e.target.value)}
                    style={errors.province ? { ...selectStyle, border: '1px solid #e53935' } : selectStyle}
                  >
                    <option value="">Select Province</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {errors.province && <span style={{ fontSize: '11px', color: '#e53935' }}>Province is required</span>}
              </div>

              <div>
                <FieldLabel required>City</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <select
                    id="di-city"
                    value={form.city}
                    onChange={e => handleChange('city', e.target.value)}
                    disabled={!form.province}
                    style={errors.city
                      ? { ...selectStyle, border: '1px solid #e53935', opacity: form.province ? 1 : 0.5 }
                      : { ...selectStyle, opacity: form.province ? 1 : 0.5 }}
                  >
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {errors.city && <span style={{ fontSize: '11px', color: '#e53935' }}>City is required</span>}
              </div>
            </div>

            {/* Building / House No / Floor / Street */}
            <div>
              <FieldLabel required>Building / House No / Floor / Street</FieldLabel>
              <input
                id="di-building"
                type="text"
                placeholder="e.g. House No. 12, Street 5, Block B"
                value={form.buildingInfo}
                onChange={e => handleChange('buildingInfo', e.target.value)}
                style={errors.buildingInfo ? inputErrorStyle : inputStyle}
              />
              {errors.buildingInfo && <span style={{ fontSize: '11px', color: '#e53935' }}>This field is required</span>}
            </div>

            {/* Area */}
            <div>
              <FieldLabel>Area</FieldLabel>
              <input
                id="di-area"
                type="text"
                placeholder="e.g. DHA Phase 5, Gulberg, Clifton"
                value={form.area}
                onChange={e => handleChange('area', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Colony / Suburb / Locality / Landmark */}
            <div>
              <FieldLabel>Colony / Suburb / Locality / Landmark</FieldLabel>
              <input
                id="di-landmark"
                type="text"
                placeholder="e.g. Near McDonald's, Main Boulevard"
                value={form.landmark}
                onChange={e => handleChange('landmark', e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Full Address */}
            <div>
              <FieldLabel required>Address</FieldLabel>
              <input
                id="di-address"
                type="text"
                placeholder="e.g. House 12, Street 5, DHA Phase 5, Lahore, Punjab"
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                style={errors.address ? inputErrorStyle : inputStyle}
              />
              {errors.address && <span style={{ fontSize: '11px', color: '#e53935' }}>Full address is required</span>}
            </div>

            {/* Label selector — HOME / OFFICE */}
            <div>
              <FieldLabel>Label As</FieldLabel>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['HOME', 'OFFICE'].map(lbl => (
                  <button
                    key={lbl}
                    id={`di-label-${lbl.toLowerCase()}`}
                    onClick={() => handleChange('label', lbl)}
                    style={{
                      padding: '9px 22px',
                      borderRadius: '8px',
                      border: form.label === lbl ? `2px solid ${GREEN}` : '2px solid #e0e0e0',
                      background: form.label === lbl ? GREEN_BG : '#fff',
                      color: form.label === lbl ? GREEN : '#777',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {lbl === 'HOME' ? '🏠' : '🏢'} {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            id="di-save-btn"
            onClick={handleSave}
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '13px',
              background: GREEN,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#5a9300')}
            onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
          >
            SAVE
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT — Order Summary
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Promo Code card */}
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid #eee',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            position: 'relative',
            zIndex: 10,
            pointerEvents: 'auto',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '12px' }}>
              🎟️ Promotion
            </h3>
            <div style={{ display: 'flex', gap: '8px', position: 'relative', zIndex: 11 }}>
              <input
                id="di-promo-input"
                type="text"
                placeholder="Store / Daraz promo code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                style={{ ...inputStyle, flex: 1, width: 'auto', minWidth: 0, pointerEvents: 'auto', position: 'relative', zIndex: 12 }}
                disabled={promoApplied}
                readOnly={false}
              />
              <button
                id="di-promo-apply-btn"
                onClick={handleApplyPromo}
                disabled={promoApplied}
                style={{
                  padding: '10px 18px',
                  background: promoApplied ? '#c0dd97' : GREEN,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: promoApplied ? 'default' : 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s',
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 12,
                }}
              >
                {promoApplied ? '✓ Applied' : 'APPLY'}
              </button>
            </div>
          </div>

          {/* Invoice & Contact card */}
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid #eee',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#222', margin: 0 }}>
                📋 Invoice and Contact Info
              </h3>
              <span
                id="di-edit-contact-link"
                onClick={() => navigate(-1)}
                style={{ fontSize: '12px', color: GREEN, fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Edit
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 4px' }}>
                <strong>Name:</strong>{' '}
                {form.fullName || <span style={{ color: '#bbb' }}>Not provided yet</span>}
              </p>
              <p style={{ margin: '0 0 4px' }}>
                <strong>Phone:</strong>{' '}
                {form.phone || <span style={{ color: '#bbb' }}>Not provided yet</span>}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Address:</strong>{' '}
                {form.address
                  ? `${form.address}${form.city ? ', ' + form.city : ''}${form.province ? ', ' + form.province : ''}`
                  : <span style={{ color: '#bbb' }}>Not provided yet</span>}
              </p>
            </div>
          </div>

          {/* Order Summary card */}
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid #eee',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#222', marginBottom: '16px' }}>
              🛒 Order Summary
            </h3>

            {/* Product row */}
            {orderProduct ? (
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                background: GREEN_BG,
                borderRadius: '8px',
                border: `1px solid ${GREEN_BORDER}`,
                marginBottom: '14px',
              }}>
                {orderProduct.image && (
                  <img
                    src={orderProduct.image}
                    alt={orderProduct.name}
                    style={{ width: '52px', height: '52px', objectFit: 'contain', borderRadius: '6px', background: '#fff' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#222', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {orderProduct.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Qty: {orderQty}</p>
                </div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#222', margin: 0, whiteSpace: 'nowrap' }}>
                  Rs. {effectivePrice.toLocaleString()}
                </p>
              </div>
            ) : (
              <div style={{ padding: '12px', background: '#fafafa', borderRadius: '8px', marginBottom: '14px', textAlign: 'center', fontSize: '13px', color: '#bbb' }}>
                No product data
              </div>
            )}

            {/* Price breakdown */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
              {[
                { label: `Items Total (×${orderQty})`, value: `Rs. ${itemsTotal.toLocaleString()}` },
                { label: 'Delivery Fee',               value: `Rs. ${deliveryFee}` },
                { label: 'Platform Fee',               value: `Rs. ${platformFee}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', color: '#333', fontWeight: '600' }}>{row.value}</span>
                </div>
              ))}

              {/* Divider */}
              <div style={{ borderTop: '1px dashed #e0e0e0', margin: '10px 0' }} />

              {/* Grand Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#222' }}>Total</span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: ORANGE }}>
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>VAT included, where applicable</p>
            </div>

            {/* Proceed to Pay */}
            <button
              id="di-proceed-pay-btn"
              onClick={handleProceedToPay}
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '14px',
                background: ORANGE,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e05d00')}
              onMouseLeave={e => (e.currentTarget.style.background = ORANGE)}
            >
              Proceed to Pay →
            </button>
          </div>

          {/* Security note */}
          <div style={{
            padding: '12px 16px',
            background: GREEN_BG,
            borderRadius: '10px',
            border: `1px solid ${GREEN_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>🔒</span>
            <p style={{ fontSize: '12px', color: '#5a7a00', margin: 0, lineHeight: '1.5' }}>
              Your personal data is protected and your payment is 100% secure.
            </p>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .di-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
