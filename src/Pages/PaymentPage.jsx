// TEST CARDS:
// ✅ Success: 4242 4242 4242 4242 | 12/26 | 123
// ❌ Decline: 4000 0000 0000 0002

import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../Utils/Axios'

// ── Colour tokens (same as rest of project) ───────────────────────────────────
const GREEN = '#6aaa00'
const GREEN_BG = '#f0f9e0'
const GREEN_BORDER = '#c0dd97'
const ORANGE = '#ff6f00'

// Load Stripe outside component to avoid re-creation on re-render
const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

// ── Payment method definitions ────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'card',        label: 'Credit/Debit Card', icon: '💳', disabled: false },
  { id: 'easypaisa',   label: 'Easypaisa',          icon: '📱', disabled: false },
  { id: 'jazzcash',    label: 'JazzCash',            icon: '💰', disabled: false },
  { id: 'hbl',         label: 'HBL Bank Account',   icon: '🏦', disabled: false },
  { id: 'cod',         label: 'Cash on Delivery',   icon: '🚚', disabled: false },
  { id: 'instalment',  label: 'Instalment',          icon: '📅', disabled: true  },
]

// ── Stripe CardElement appearance ─────────────────────────────────────────────
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#aab7c4' },
      iconColor: GREEN,
    },
    invalid: { color: '#e53935', iconColor: '#e53935' },
  },
  hidePostalCode: true,
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const cardStyle = {
  background: '#fff',
  borderRadius: '14px',
  padding: '20px',
  border: '1px solid #eee',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
}

// ═══════════════════════════════════════════════════════════════════════════════
// Inner payment form — must be a child of <Elements>
// ═══════════════════════════════════════════════════════════════════════════════
function PaymentForm({ orderState }) {
  const stripe    = useStripe()
  const elements  = useElements()
  const navigate  = useNavigate()

  const [selectedMethod, setSelectedMethod] = useState('card')
  const [loading,        setLoading]        = useState(false)
  const [errorMsg,       setErrorMsg]       = useState('')
  const [cardComplete,   setCardComplete]   = useState(false)

  // Extract order data from route state (passed from DeliveryInformation)
  const itemsTotal  = orderState?.itemsTotal  ?? 0
  const deliveryFee = orderState?.deliveryFee ?? 140
  const platformFee = 10
  const grandTotal  = itemsTotal + deliveryFee + platformFee
  const productName = orderState?.productName ?? 'Product'
  const quantity    = orderState?.quantity    ?? 1

  // Unavailable methods (not card, not COD)
  const isUnavailable = ['easypaisa', 'jazzcash', 'hbl'].includes(selectedMethod)
  const isCOD         = selectedMethod === 'cod'
  const isCard        = selectedMethod === 'card'

  const createOrder = async (method, status) => {
    const deliveryInfo = orderState?.deliveryInfo || {};
    const fullAddress = [
      deliveryInfo.buildingInfo,
      deliveryInfo.address,
      deliveryInfo.city,
      deliveryInfo.province
    ].filter(Boolean).join(', ');

    const payload = {
      product_id: orderState?.items?.id,
      quantity: quantity,
      customer_name: deliveryInfo.fullName || 'Customer',
      customer_phone: deliveryInfo.phone || '',
      delivery_address: fullAddress || 'Address not provided',
      payment_method: method,
      payment_status: status,
    };

    const response = await api.post('/api/orders/create/', payload);
    return response.data;
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setErrorMsg('')

    // Unavailable payment methods
    if (isUnavailable) {
      setErrorMsg('⚠️ This payment method is currently unavailable. Please use Credit/Debit Card.')
      return
    }

    // Cash on Delivery
    if (isCOD) {
      setLoading(true)
      try {
        const orderData = await createOrder('COD', 'pending')
        navigate('/order-success', {
          state: {
            paymentMethod: 'COD',
            status:        'pending',
            productName,
            quantity,
            totalAmount:   grandTotal,
            orderId:       orderData.order_id,
          },
        })
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Failed to place order. Please try again.'
        setErrorMsg(msg)
      } finally {
        setLoading(false)
      }
      return
    }

    // Stripe Credit/Debit Card
    if (isCard) {
      if (!stripe || !elements) {
        setErrorMsg('Stripe has not loaded yet. Please wait.')
        return
      }
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        setErrorMsg('Card element not found.')
        return
      }
      if (!cardComplete) {
        setErrorMsg('Please complete your card details.')
        return
      }

      setLoading(true)
      try {
        // Step 1 — Create PaymentIntent on backend
        const { data } = await api.post('/api/payment/create-payment-intent', {
          amount: grandTotal,
        })
        const { clientSecret } = data

        // Step 2 — Confirm card payment with Stripe
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        })

        if (result.error) {
          setErrorMsg(result.error.message || 'Payment failed. Please try again.')
          setLoading(false)
          return
        }

        if (result.paymentIntent?.status === 'succeeded') {
          try {
            const orderData = await createOrder('stripe', 'paid')
            navigate('/order-success', {
              state: {
                paymentMethod: 'Card',
                status:        'paid',
                productName,
                quantity,
                totalAmount:   grandTotal,
                paymentIntentId: result.paymentIntent.id,
                orderId:       orderData.order_id,
              },
            })
          } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Payment succeeded but order creation failed. Please contact support.'
            setErrorMsg(msg)
            setLoading(false)
          }
        }
      } catch (err) {
        const msg = err.response?.data?.error || err.message || 'Payment failed. Please try again.'
        setErrorMsg(msg)
        setLoading(false)
      }
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#f5f7f2', minHeight: '100vh', padding: '20px 16px' }}>

      {/* ── TEST MODE BANNER ─────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto 18px',
        background: '#fffbe6',
        border: '1px solid #ffe58f',
        borderRadius: '10px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        color: '#7c5800',
        fontWeight: '600',
      }}>
        <span style={{ fontSize: '16px' }}>⚠️</span>
        🔒 Test Mode — No real payment will be charged
      </div>

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 14px', fontSize: '13px', color: '#888' }}>
        <span style={{ cursor: 'pointer', color: GREEN }} onClick={() => navigate('/')}>Home</span>
        {' > '}
        <span style={{ cursor: 'pointer', color: GREEN }} onClick={() => navigate(-1)}>Delivery</span>
        {' > '}
        <span style={{ color: '#555', fontWeight: '600' }}>Payment</span>
      </div>

      <h1 style={{ maxWidth: '1100px', margin: '0 auto 18px', fontSize: '22px', fontWeight: '700', color: '#222' }}>
        Select Payment Method
      </h1>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '22px',
        alignItems: 'start',
      }}>

        {/* ════════════════════════════════════════════════════════════════
            LEFT — Payment method picker + Stripe card input
        ════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={{ borderBottom: `2px solid ${GREEN}`, paddingBottom: '10px', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: 0 }}>
              💳 Payment Method
            </h2>
          </div>

          {/* Payment method grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px',
            marginBottom: '20px',
          }}>
            {PAYMENT_METHODS.map(method => {
              const isSelected = selectedMethod === method.id
              const isDisabled = method.disabled

              return (
                <div
                  key={method.id}
                  id={`pay-method-${method.id}`}
                  onClick={() => !isDisabled && setSelectedMethod(method.id)}
                  style={{
                    border: isSelected
                      ? `2px solid ${GREEN}`
                      : '2px solid #e8e8e8',
                    borderRadius: '10px',
                    padding: '14px 10px',
                    textAlign: 'center',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    background: isSelected ? GREEN_BG : (isDisabled ? '#fafafa' : '#fff'),
                    opacity: isDisabled ? 0.55 : 1,
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  {/* Coming soon badge */}
                  {isDisabled && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: '#ff6f00',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      letterSpacing: '0.3px',
                    }}>
                      SOON
                    </span>
                  )}
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{method.icon}</div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: isSelected ? GREEN : (isDisabled ? '#bbb' : '#444'),
                    lineHeight: '1.3',
                  }}>
                    {method.label}
                  </div>
                  {isSelected && !isDisabled && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      width: '16px',
                      height: '16px',
                      background: GREEN,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>✓</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Unavailable method banner */}
          {isUnavailable && (
            <div style={{
              background: '#fff8e1',
              border: '1px solid #ffe082',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#7c5800',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
              This payment method is currently unavailable. Please use <strong>Credit/Debit Card</strong>.
            </div>
          )}

          {/* COD success info */}
          {isCOD && (
            <div style={{
              background: GREEN_BG,
              border: `1px solid ${GREEN_BORDER}`,
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#3b7000',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '18px' }}>✓</span>
              You will pay when your order is delivered.
            </div>
          )}

          {/* Stripe CardElement — only shown for credit/debit card */}
          {isCard && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '8px' }}>
                Card Details <span style={{ color: '#e53935' }}>*</span>
              </label>
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px 14px',
                background: '#fff',
                transition: 'border-color 0.2s',
              }}>
                <CardElement
                  id="stripe-card-element"
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={e => {
                    setCardComplete(e.complete)
                    if (e.error) setErrorMsg(e.error.message)
                    else setErrorMsg('')
                  }}
                />
              </div>
              {/* Test card hint */}
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: '#f0f9e0',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#5a8000',
              }}>
                <strong>Test card:</strong> 4242 4242 4242 4242 &nbsp;|&nbsp; Exp: 12/26 &nbsp;|&nbsp; CVC: 123
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div id="pay-error-msg" style={{
              background: '#ffeaea',
              border: '1px solid #ffb3b3',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '14px',
              fontSize: '13px',
              color: '#c62828',
              fontWeight: '500',
            }}>
              ❌ {errorMsg}
            </div>
          )}

          {/* Place Order button */}
          <button
            id="pay-place-order-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#a5d06a' : GREEN,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#5a9300' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = GREEN }}
          >
            {loading ? (
              <>
                {/* Spinner */}
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Processing…
              </>
            ) : (
              isCOD ? '🚚 Place Order (Cash on Delivery)' : '🔒 Place Order'
            )}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT — Order Summary
        ════════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={cardStyle}>
            <div style={{ borderBottom: `2px solid ${GREEN}`, paddingBottom: '10px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: 0 }}>
                🛒 Order Summary
              </h2>
            </div>

            {/* Product info */}
            <div style={{
              padding: '12px',
              background: GREEN_BG,
              border: `1px solid ${GREEN_BORDER}`,
              borderRadius: '8px',
              marginBottom: '14px',
            }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#222', margin: '0 0 4px' }}>
                {productName}
              </p>
              <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Qty: {quantity}</p>
            </div>

            {/* Price rows */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
              {[
                { label: `Items Total (×${quantity})`, value: `Rs. ${itemsTotal.toLocaleString()}` },
                { label: 'Delivery Fee',               value: `Rs. ${deliveryFee.toLocaleString()}` },
                { label: 'Platform Fee',               value: `Rs. ${platformFee}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', color: '#333', fontWeight: '600' }}>{row.value}</span>
                </div>
              ))}

              <div style={{ borderTop: '1px dashed #e0e0e0', margin: '10px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#222' }}>Total</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: ORANGE }}>
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>VAT included, where applicable</p>
            </div>
          </div>

          {/* Security badge */}
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
              256-bit SSL encryption. Your payment is 100% secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Outer wrapper — wraps PaymentForm in Stripe <Elements> provider
// ═══════════════════════════════════════════════════════════════════════════════
export default function PaymentPage() {
  const location = useLocation()
  const orderState = location.state || {}

  if (!stripePromise) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: '#fffbe6',
        border: '1px solid #ffe58f',
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '40px auto',
        color: '#7c5800',
        fontWeight: 'bold',
        fontSize: '16px',
        fontFamily: 'inherit'
      }}>
        ⚠️ Stripe key not found (REACT_APP_STRIPE_PUBLIC_KEY is not set or empty).
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm orderState={orderState} />
    </Elements>
  )
}
