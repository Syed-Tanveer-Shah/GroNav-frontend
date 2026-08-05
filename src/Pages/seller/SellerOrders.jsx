import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import api from '../../Utils/Axios';

const G = '#6aaa00';
const STATUSES = ['received', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_LABELS = {
  received: 'Received',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};
const STATUS_COLORS = {
  received: '#1976d2',
  packed: '#ff8f00',
  out_for_delivery: '#7b1fa2',
  delivered: '#6aaa00',
  cancelled: '#e53935'
};

// Active pipeline — clickable steps
function OrderPipeline({ order, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const current = STATUSES.indexOf(order.status);
  const active = STATUSES.filter(s => s !== 'cancelled');

  const handleStep = async (s) => {
    if (order.status === 'cancelled') return;
    setLoading(true);
    try {
      await api.post(`/api/orders/seller/${order.id}/status/`, { status: s });
      toast.success(`Order marked as ${STATUS_LABELS[s]}`);
      onUpdate(true); // force reload to bypass cache after actions
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '14px', overflowX: 'auto', paddingBottom: '6px' }}>
      {active.map((s, i) => {
        const done = STATUSES.indexOf(s) <= current && order.status !== 'cancelled';
        const isCurrent = s === order.status;
        return (
          <React.Fragment key={s}>
            <div onClick={() => !loading && handleStep(s)} title={STATUS_LABELS[s]} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: loading ? 'not-allowed' : 'pointer', minWidth: '80px',
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done ? G : '#e0e0e0',
                color: done ? '#fff' : '#aaa',
                fontWeight: '800',
                fontSize: '13px',
                border: isCurrent ? `3px solid ${G}` : '2px solid transparent',
                boxShadow: isCurrent ? `0 0 0 3px rgba(106,170,0,0.25)` : 'none',
                transition: 'all 0.2s',
              }}>{done ? '✓' : i + 1}</div>
              <span style={{ fontSize: '11px', fontWeight: isCurrent ? '700' : '500', color: done ? G : '#aaa', marginTop: '5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {STATUS_LABELS[s]}
              </span>
            </div>
            {i < active.length - 1 && <div style={{ flex: 1, height: '3px', backgroundColor: STATUSES.indexOf(s) < current && order.status !== 'cancelled' ? G : '#e0e0e0', transition: 'background 0.3s', minWidth: '24px' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Completed pipeline — read-only, all steps green
function CompletedPipeline() {
  const steps = STATUSES.filter(s => s !== 'cancelled');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '14px', overflowX: 'auto', paddingBottom: '6px' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: G,
              color: '#fff',
              fontWeight: '800',
              fontSize: '13px',
              border: '2px solid transparent',
            }}>✓</div>
            <span style={{ fontSize: '11px', fontWeight: '500', color: G, marginTop: '5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {STATUS_LABELS[s]}
            </span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: '3px', backgroundColor: G, minWidth: '24px' }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function SellerOrders() {
  const { theme } = useTheme();
  const [tab, setTab] = useState('active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const ordersCacheRef = useRef(null);
  const isFetchingOrders = useRef(false);
  const CACHE_TTL_MS = 60000; // 60 seconds

  const isDark = theme === 'dark-pro';
  const cardBg = isDark ? '#1e2e1e' : '#fff';
  const textColor = isDark ? '#e0ffe0' : '#222';
  const mutedText = isDark ? '#8fa88f' : '#888';
  const borderColor = isDark ? '#2a3a2a' : '#eee';

  const load = useCallback(async (isSilent = false, force = false) => {
    // Check in-memory cache if not forcing reload
    if (!force && ordersCacheRef.current && (Date.now() - ordersCacheRef.current.timestamp < CACHE_TTL_MS)) {
      setOrders(ordersCacheRef.current.data);
      setLoading(false);
      return;
    }
    // Prevent duplicate concurrent requests (e.g. strictmode or auto refresh trigger overlap)
    if (isFetchingOrders.current) return;
    isFetchingOrders.current = true;

    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/api/orders/seller/?status=all');
      const mapped = (res.data || []).map(o => ({
        id: o.id,
        order_id: o.id,
        total_price: o.total_amount,
        buyer_name: o.customer_name,
        buyer_phone: o.customer_phone,
        delivery_address: o.delivery_address,
        status: o.order_status, // received, packed, out_for_delivery, delivered, cancelled
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        created_at: o.created_at,
        reason: 'Customer requested cancellation',
        items: [
          {
            id: 1,
            product_name: o.product_name,
            quantity: o.quantity,
            price: o.price_per_item
          }
        ]
      }));
      ordersCacheRef.current = { data: mapped, timestamp: Date.now() };
      setOrders(mapped);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
      isFetchingOrders.current = false;
    }
  }, []);

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(true, true), 30000);
    return () => clearInterval(interval);
  }, [load]);

  const activeOrders    = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const returns         = orders.filter(o => o.status === 'cancelled');

  // Shared order card renderer
  const renderOrderCard = (order, isCompleted = false) => (
    <div key={order.id} style={{ backgroundColor: cardBg, borderRadius: '14px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: isDark ? `1px solid ${borderColor}` : 'none', overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', cursor: 'pointer', borderBottom: expanded === order.id ? `1px solid ${borderColor}` : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <span style={{ fontWeight: '800', color: textColor, fontSize: '16px' }}>Order #{order.id}</span>
            <span style={{ marginLeft: '12px', fontSize: '12px', color: mutedText }}>{order.created_at?.split('T')[0]}</span>
          </div>
          {isCompleted ? (
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: `${G}18`, color: G }}>
              ✓ Completed
            </span>
          ) : (
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: `${STATUS_COLORS[order.status]}15`, color: STATUS_COLORS[order.status] }}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: '800', color: G, fontSize: '16px' }}>Rs. {order.total_price}</span>
          <span style={{ color: '#aaa', fontSize: '18px', transform: expanded === order.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
        </div>
      </div>

      {expanded === order.id && (
        <div style={{ padding: '20px 22px' }}>
          {/* Expanded details row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', fontSize: '14px', color: mutedText }}>
            <div><strong>Buyer:</strong> <span style={{ color: textColor }}>{order.buyer_name || 'Customer'}</span></div>
            <div><strong>Address:</strong> <span style={{ color: textColor }}>{order.delivery_address}</span></div>
          </div>

          {/* Expanded details row 2 — dynamic payment details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '14px', color: mutedText }}>
            <div><strong>Phone:</strong> <span style={{ color: textColor }}>{order.buyer_phone || '—'}</span></div>
            <div><strong>Payment Method:</strong> <span style={{ color: textColor, textTransform: 'uppercase' }}>{order.payment_method || 'COD'}</span></div>
            <div>
              <strong>Payment Status:</strong>{' '}
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: order.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0',
                color: order.payment_status === 'paid' ? G : '#ff8f00',
              }}>
                {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <strong style={{ fontSize: '14px', color: textColor }}>Items:</strong>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {order.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', backgroundColor: isDark ? '#1a2a1a' : '#f9f9f9', borderRadius: '8px', fontSize: '13px' }}>
                  <span style={{ color: textColor }}>{item.quantity}× {item.product_name}</span>
                  <span style={{ fontWeight: '700', color: textColor }}>Rs. {item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {isCompleted
            ? <CompletedPipeline />
            : <OrderPipeline order={order} onUpdate={() => load(true)} isDark={isDark} textColor={textColor} mutedText={mutedText} />
          }
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', borderBottom: `2px solid ${borderColor}`, paddingBottom: '0' }}>
        {[
          ['active',    `Active (${activeOrders.length})`],
          ['all',       `All Orders (${orders.length})`],
          ['completed', `Completed (${completedOrders.length})`],
          ['returns',   `Returns (${returns.length})`],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '12px 22px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontWeight: '700', fontSize: '14px', color: tab === id ? G : mutedText,
            borderBottom: tab === id ? `3px solid ${G}` : '3px solid transparent',
            transition: 'all 0.2s', marginBottom: '-2px',
          }}>{label}</button>
        ))}
      </div>

      {loading ? <p style={{ textAlign: 'center', padding: '60px', color: '#bbb' }}>Loading orders...</p> : (
        <>
          {/* Active + All tabs — same logic as before */}
          {(tab === 'active' || tab === 'all') && (() => {
            const list = tab === 'active' ? activeOrders : orders;
            if (!list.length) return (
              <div style={{ textAlign: 'center', padding: '70px', color: '#bbb' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>No orders found</p>
              </div>
            );
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {list.map(order => renderOrderCard(order, order.status === 'delivered'))}
              </div>
            );
          })()}

          {/* Completed tab */}
          {tab === 'completed' && (
            completedOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '70px', color: '#bbb' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>No completed orders yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {completedOrders.map(order => renderOrderCard(order, true))}
              </div>
            )
          )}

          {/* Returns tab */}
          {tab === 'returns' && (
            returns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '70px', color: '#bbb' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>↩️</div>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>No return requests</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {returns.map(ret => (
                  <div key={ret.id} style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '20px 22px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: isDark ? `1px solid ${borderColor}` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontWeight: '800', color: textColor }}>Order #{ret.order_id}</span>
                        <p style={{ margin: '8px 0 0', color: mutedText, fontSize: '14px' }}><strong style={{ color: textColor }}>Reason:</strong> {ret.reason}</p>
                        <p style={{ margin: '6px 0 0', color: mutedText, fontSize: '13px' }}>{ret.created_at?.split('T')[0]}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: '#ffebee', color: '#e53935' }}>
                          Returned
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
