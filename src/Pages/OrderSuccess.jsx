import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#6aaa00'
const GREEN_BG = '#f0f9e0'
const GREEN_BORDER = '#c0dd97'
const ORANGE = '#ff6f00'

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()

  // Order details passed from PaymentPage via route state
  const paymentMethod    = location.state?.paymentMethod    ?? 'Card'
  const status           = location.state?.status           ?? 'paid'
  const productName      = location.state?.productName      ?? 'Your Product'
  const quantity         = location.state?.quantity         ?? 1
  const totalAmount      = location.state?.totalAmount      ?? 0
  const paymentIntentId  = location.state?.paymentIntentId  ?? null
  const orderId          = location.state?.orderId          ?? null

  // Format payment status label
  const statusLabel = status === 'paid' ? '✅ Payment Successful' : '⏳ Awaiting Payment on Delivery'
  const statusColor = status === 'paid' ? GREEN : ORANGE

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f7f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(106,170,0,0.12)',
        border: `1px solid ${GREEN_BORDER}`,
      }}>

        {/* Large green checkmark */}
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: GREEN_BG,
          border: `3px solid ${GREEN}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}>
          <span style={{ fontSize: '44px', lineHeight: 1 }}>✓</span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#222',
          margin: '0 0 10px',
          lineHeight: '1.3',
        }}>
          Order Placed Successfully!
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: '14px',
          color: '#777',
          margin: '0 0 28px',
          lineHeight: '1.6',
        }}>
          Thank you for shopping with <strong style={{ color: GREEN }}>CartGo</strong> 🛒
        </p>

        {/* Payment status badge */}
        <div style={{
          display: 'inline-block',
          background: status === 'paid' ? GREEN_BG : '#fff8e1',
          border: `1px solid ${status === 'paid' ? GREEN_BORDER : '#ffe082'}`,
          borderRadius: '20px',
          padding: '6px 16px',
          fontSize: '12px',
          fontWeight: '700',
          color: statusColor,
          marginBottom: '16px',
        }}>
          {statusLabel}
        </div>

        {/* Order ID banner */}
        {orderId && (
          <div style={{
            background: '#f0f9e0',
            border: `1px solid ${GREEN_BORDER}`,
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', color: '#777', marginBottom: '4px' }}>
              Your Order ID — save this to track your order
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: GREEN, letterSpacing: '1px' }}>
              #{orderId}
            </div>
          </div>
        )}

        {/* Order summary card */}
        <div style={{
          background: '#fafafa',
          borderRadius: '12px',
          padding: '18px 20px',
          marginBottom: '28px',
          border: '1px solid #eee',
          textAlign: 'left',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' }}>
            Order Details
          </h3>

          {[
            { label: 'Product',         value: productName },
            { label: 'Quantity',         value: `×${quantity}` },
            { label: 'Payment Method',   value: paymentMethod === 'COD' ? '🚚 Cash on Delivery' : '💳 Credit/Debit Card' },
            { label: 'Total Amount',     value: `Rs. ${totalAmount.toLocaleString()}`, highlight: true },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '7px 0',
              borderBottom: '1px solid #f0f0f0',
            }}>
              <span style={{ fontSize: '13px', color: '#888' }}>{row.label}</span>
              <span style={{
                fontSize: '13px',
                fontWeight: row.highlight ? '700' : '600',
                color: row.highlight ? ORANGE : '#333',
              }}>
                {row.value}
              </span>
            </div>
          ))}

          {/* Payment Intent ID for card payments */}
          {paymentIntentId && (
            <div style={{ padding: '7px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#bbb' }}>Payment ID</span>
              <span style={{ fontSize: '11px', color: '#bbb', fontFamily: 'monospace' }}>
                {paymentIntentId.slice(0, 20)}…
              </span>
            </div>
          )}
        </div>

        {/* Track My Order button */}
        {orderId && (
          <button
            id="order-success-track-btn"
            onClick={() => navigate('/track-order')}
            style={{
              width: '100%',
              padding: '14px',
              background: '#fff',
              color: GREEN,
              border: `2px solid ${GREEN}`,
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              marginBottom: '12px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = GREEN_BG; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            📦 Track My Order
          </button>
        )}

        {/* Continue Shopping button */}
        <button
          id="order-success-continue-btn"
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '14px',
            background: GREEN,
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '15px',
            cursor: 'pointer',
            letterSpacing: '0.5px',
            transition: 'background 0.2s',
            marginBottom: '12px',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#5a9300')}
          onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
        >
          🛍️ Continue Shopping
        </button>

        {/* Back to home subtle link */}
        <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
          You will receive a confirmation shortly.
        </p>
      </div>

      {/* Pop-in animation */}
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
