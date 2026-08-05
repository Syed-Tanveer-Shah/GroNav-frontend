import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import api from '../Utils/Axios';

// ── Colour tokens (matches project palette) ───────────────────────────────────
const GREEN       = '#4CAF50';
const GREEN_DARK  = '#388E3C';
const GREEN_BG    = '#f1f8f1';
const GREEN_LIGHT = '#e8f5e9';
const GREY_STEP   = '#d0d0d0';

// ── Order status pipeline (matches CustomerOrder model) ───────────────────────
const STEPS = [
  { key: 'received',         label: 'Order Received', icon: '📦' },
  { key: 'packed',           label: 'Packed',          icon: '🔧' },
  { key: 'out_for_delivery', label: 'Out for Delivery',icon: '🚚' },
  { key: 'delivered',        label: 'Delivered',        icon: '✅' },
];

function getStepIndex(status) {
  const idx = STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const map = {
    paid:    { bg: '#e8f5e9', color: GREEN_DARK,  text: '✅ Paid' },
    pending: { bg: '#fff8e1', color: '#f57c00',   text: '⏳ Pending' },
  };
  const s = map[status] || { bg: '#f5f5f5', color: '#555', text: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: '20px', padding: '3px 12px',
      fontSize: '12px', fontWeight: 700,
    }}>{s.text}</span>
  );
}

function OrderStatusBadge({ status }) {
  const map = {
    received:         { bg: '#e3f2fd', color: '#1565C0', text: '📦 Received' },
    packed:           { bg: '#f3e5f5', color: '#6A1B9A', text: '🔧 Packed' },
    out_for_delivery: { bg: '#fff8e1', color: '#E65100', text: '🚚 Out for Delivery' },
    delivered:        { bg: '#e8f5e9', color: GREEN_DARK, text: '✅ Delivered' },
    cancelled:        { bg: '#ffebee', color: '#c62828', text: '❌ Cancelled' },
  };
  const s = map[status] || { bg: '#f5f5f5', color: '#555', text: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: '20px', padding: '3px 12px',
      fontSize: '12px', fontWeight: 700,
    }}>{s.text}</span>
  );
}

// ── Progress Stepper ──────────────────────────────────────────────────────────
function ProgressStepper({ orderStatus }) {
  const currentIdx = getStepIndex(orderStatus);
  if (orderStatus === 'cancelled') {
    return (
      <div style={{
        textAlign: 'center', padding: '20px',
        background: '#ffebee', borderRadius: '10px',
        color: '#c62828', fontWeight: 700, fontSize: '15px',
      }}>
        ❌ This order has been cancelled.
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', padding: '10px 0' }}>
      {/* Connecting line */}
      <div style={{
        position: 'absolute',
        top: '28px',
        left: 'calc(12.5% + 18px)',
        right: 'calc(12.5% + 18px)',
        height: '3px',
        background: GREY_STEP,
        zIndex: 0,
      }} />
      {/* Green progress fill */}
      <div style={{
        position: 'absolute',
        top: '28px',
        left: 'calc(12.5% + 18px)',
        width: currentIdx === 0
          ? '0%'
          : `${(currentIdx / (STEPS.length - 1)) * (75 - (75 / (STEPS.length - 1)))}%`,
        height: '3px',
        background: GREEN,
        zIndex: 1,
        transition: 'width 0.6s ease',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        {STEPS.map((step, idx) => {
          const done    = idx < currentIdx;
          const current = idx === currentIdx;
          const future  = idx > currentIdx;
          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              {/* Circle */}
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                background: done || current ? GREEN : '#fff',
                border: `3px solid ${done || current ? GREEN : GREY_STEP}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: done ? '16px' : '18px',
                boxShadow: current ? `0 0 0 5px ${GREEN_LIGHT}` : 'none',
                animation: current ? 'pulseStep 1.5s infinite' : 'none',
                transition: 'all 0.4s ease',
              }}>
                {done ? '✓' : step.icon}
              </div>
              {/* Label */}
              <div style={{
                marginTop: '8px',
                fontSize: '11px',
                fontWeight: current ? 700 : done ? 600 : 400,
                color: done || current ? GREEN_DARK : '#999',
                textAlign: 'center',
                lineHeight: '1.3',
                maxWidth: '80px',
              }}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulseStep {
          0%   { box-shadow: 0 0 0 0   ${GREEN}55; }
          70%  { box-shadow: 0 0 0 10px ${GREEN}00; }
          100% { box-shadow: 0 0 0 0   ${GREEN}00; }
        }
      `}</style>
    </div>
  );
}

// ── Order Tracking Card ───────────────────────────────────────────────────────
function OrderCard({ order, expandable = false }) {
  const [expanded, setExpanded] = useState(!expandable);

  return (
    <div style={{
      background: '#fff',
      borderRadius: '14px',
      border: '1px solid #e8f5e9',
      boxShadow: '0 2px 12px rgba(76,175,80,0.08)',
      marginBottom: '16px',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Card Header */}
      <div
        onClick={expandable ? () => setExpanded(e => !e) : undefined}
        style={{
          padding: '16px 20px',
          background: GREEN_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: expandable ? 'pointer' : 'default',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: GREEN_DARK, fontSize: '15px' }}>
            Order #{order.order_id}
          </span>
          <span style={{ fontSize: '12px', color: '#888' }}>{fmt(order.created_at)}</span>
          {order.store_name && (
            <span style={{ fontSize: '12px', color: '#555', fontWeight: 600 }}>
              🏪 {order.store_name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <OrderStatusBadge status={order.order_status} />
          {expandable && (
            <span style={{ color: GREEN, fontSize: '18px', lineHeight: 1 }}>
              {expanded ? '▲' : '▼'}
            </span>
          )}
        </div>
      </div>

      {/* Collapsed summary (expandable cards only) */}
      {expandable && !expanded && (
        <div style={{
          padding: '12px 20px',
          display: 'flex', gap: '24px', flexWrap: 'wrap',
          fontSize: '13px', color: '#555',
        }}>
          <span>🛒 <strong>{order.product_name}</strong> × {order.quantity}</span>
          <span>💰 <strong style={{ color: GREEN_DARK }}>Rs. {order.total_amount?.toLocaleString()}</strong></span>
          <StatusBadge status={order.payment_status} />
        </div>
      )}

      {/* Full details */}
      {expanded && (
        <div style={{ padding: '20px' }}>
          {/* Info grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: '12px', marginBottom: '24px',
          }}>
            {[
              { label: 'Customer',         value: order.customer_name },
              { label: 'Product',          value: `${order.product_name} × ${order.quantity}` },
              { label: 'Total Amount',     value: `Rs. ${order.total_amount?.toLocaleString()}`, bold: true, color: '#e65100' },
              { label: 'Payment Method',   value: order.payment_method },
              { label: 'Payment Status',   value: <StatusBadge status={order.payment_status} /> },
              { label: 'Delivery Address', value: order.delivery_address, full: true },
            ].map(r => (
              <div key={r.label} style={{
                background: '#fafafa', borderRadius: '8px',
                padding: '12px 14px',
                gridColumn: r.full ? '1 / -1' : undefined,
              }}>
                <div style={{ fontSize: '11px', color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  {r.label}
                </div>
                <div style={{ fontSize: '14px', fontWeight: r.bold ? 700 : 600, color: r.color || '#333' }}>
                  {r.value}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Stepper */}
          <div style={{ background: '#fafafa', borderRadius: '10px', padding: '20px 16px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Delivery Progress
            </div>
            <ProgressStepper orderStatus={order.order_status} />
          </div>

          {/* Estimated delivery */}
          {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
            <div style={{
              background: GREEN_LIGHT, borderRadius: '8px', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '13px', color: GREEN_DARK, fontWeight: 600,
            }}>
              🕒 <strong>Estimated Delivery:</strong> {order.estimated_delivery}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════
export default function TrackOrder() {
  const navigate = useNavigate();

  // Section 1 — public tracker
  const [orderId, setOrderId]     = useState('');
  const [tracking, setTracking]   = useState(null);
  const [trackErr, setTrackErr]   = useState('');
  const [trackLoad, setTrackLoad] = useState(false);

  // Section 2 — my orders (authenticated)
  const [myOrders, setMyOrders]     = useState([]);
  const [myLoad, setMyLoad]         = useState(false);
  const [myErr, setMyErr]           = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

  // Fetch my orders on mount (if logged in)
  useEffect(() => {
    if (!isLoggedIn) return;
    setMyLoad(true);
    api.get('/api/orders/my-orders/', {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` },
    })
      .then(r => setMyOrders(r.data))
      .catch(() => setMyErr('Failed to load your orders. Please try again.'))
      .finally(() => setMyLoad(false));
  }, [isLoggedIn]);

  const handleTrack = async (e) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return;
    setTrackErr('');
    setTracking(null);
    setTrackLoad(true);
    try {
      const res = await api.get(`/api/orders/track/${id}/`);
      setTracking(res.data);
    } catch (err) {
      setTrackErr(err.response?.data?.error || 'Order not found. Please check your Order ID.');
    } finally {
      setTrackLoad(false);
    }
  };

  return (
    <div style={{ background: '#f5f7f2', minHeight: '100vh' }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="rts-navigation-area-breadcrumb bg_light-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="navigator-breadcrumb-wrapper">
                <span
                  style={{ cursor: 'pointer', color: GREEN }}
                  onClick={() => navigate('/')}
                >Home</span>
                <i className="fa-regular fa-chevron-right" style={{ margin: '0 8px', fontSize: '11px', color: '#aaa' }} />
                <span style={{ color: '#555', fontWeight: 600 }}>Track Order</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — Track by Order ID
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(76,175,80,0.10)',
          padding: '32px 28px', marginBottom: '32px',
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#222', margin: '0 0 6px' }}>
            📦 Track Your Order
          </h1>
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px', lineHeight: '1.6' }}>
            Enter your Order ID to get real-time tracking information.
          </p>

          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              id="track-order-input"
              type="number"
              min="1"
              placeholder="Enter Order ID (e.g. 12)"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              style={{
                flex: 1, minWidth: '200px',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s',
              }}
              onFocus={e => (e.target.style.border = `2px solid ${GREEN}`)}
              onBlur={e  => (e.target.style.border = '2px solid #e0e0e0')}
            />
            <button
              id="track-order-btn"
              type="submit"
              disabled={trackLoad || !orderId.trim()}
              style={{
                padding: '12px 28px',
                background: trackLoad || !orderId.trim() ? '#ccc' : GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: trackLoad || !orderId.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!trackLoad && orderId.trim()) e.currentTarget.style.background = GREEN_DARK; }}
              onMouseLeave={e => { if (!trackLoad && orderId.trim()) e.currentTarget.style.background = GREEN; }}
            >
              {trackLoad ? '🔍 Searching…' : '🔍 Track Order'}
            </button>
          </form>

          {/* Error */}
          {trackErr && (
            <div style={{
              marginTop: '16px', padding: '12px 16px',
              background: '#ffebee', color: '#c62828',
              borderRadius: '8px', fontSize: '14px', fontWeight: 600,
            }}>
              ❌ {trackErr}
            </div>
          )}

          {/* Result */}
          {tracking && (
            <div style={{ marginTop: '24px' }}>
              <OrderCard order={tracking} expandable={false} />
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — My Orders
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(76,175,80,0.10)',
          padding: '32px 28px',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#222', margin: '0 0 6px' }}>
            🗂️ My Recent Orders
          </h2>
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px', lineHeight: '1.6' }}>
            View all your past orders and their current status.
          </p>

          {!isLoggedIn && (
            <div style={{
              padding: '24px', textAlign: 'center',
              background: GREEN_BG, borderRadius: '10px',
              color: '#555',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔒</div>
              <div style={{ fontWeight: 600, marginBottom: '12px' }}>
                Login to view your order history
              </div>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '10px 24px', background: GREEN, color: '#fff',
                  border: 'none', borderRadius: '8px', fontWeight: 700,
                  fontSize: '14px', cursor: 'pointer',
                }}
              >
                Login Now
              </button>
            </div>
          )}

          {isLoggedIn && myLoad && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>
              <div style={{
                width: '36px', height: '36px', margin: '0 auto 12px',
                border: `4px solid #f0f0f0`, borderTop: `4px solid ${GREEN}`,
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
              Loading your orders…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {isLoggedIn && !myLoad && myErr && (
            <div style={{
              padding: '14px 18px', background: '#ffebee',
              borderRadius: '8px', color: '#c62828', fontSize: '14px', fontWeight: 600,
            }}>
              ❌ {myErr}
            </div>
          )}

          {isLoggedIn && !myLoad && !myErr && myOrders.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '32px',
              background: GREEN_BG, borderRadius: '10px', color: '#777',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🛒</div>
              <div style={{ fontWeight: 600 }}>You have no orders yet.</div>
              <button
                onClick={() => navigate('/product-list')}
                style={{
                  marginTop: '14px', padding: '10px 24px',
                  background: GREEN, color: '#fff', border: 'none',
                  borderRadius: '8px', fontWeight: 700, fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Shop Now
              </button>
            </div>
          )}

          {isLoggedIn && !myLoad && myOrders.length > 0 && (
            <div>
              {myOrders.map(order => (
                <OrderCard key={order.order_id} order={order} expandable={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
