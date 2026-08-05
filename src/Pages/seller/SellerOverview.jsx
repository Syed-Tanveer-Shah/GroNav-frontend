import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSellerOverview, toggleStore } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const G = '#6aaa00';

const CARDS = [
  { key: 'total_products',  label: 'Total Products',      icon: '📦', color: '#6aaa00' },
  { key: 'today_visitors',  label: "Today's Visitors",    icon: '👁️', color: '#1976d2' },
  { key: 'avg_rating',      label: 'Average Rating',      icon: '⭐', color: '#ff8f00', suffix: '/5' },
  { key: 'pending_orders',  label: 'Pending Orders',      icon: '🛒', color: '#e53935' },
  { key: 'on_time_score',   label: 'On-Time Delivery',    icon: '⏱️', color: '#00897b', suffix: '%' },
];

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(target); return; }
    const n = parseFloat(target);
    if (isNaN(n)) { setVal(target); return; }
    let start = 0;
    const steps = 60;
    const inc = n / steps;
    const iv = setInterval(() => {
      start += inc;
      if (start >= n) { setVal(n); clearInterval(iv); }
      else setVal(start);
    }, duration / steps);
    return () => clearInterval(iv);
  }, [target]);
  return val;
}

function StatCard({ label, value, icon, color, suffix = '', isDark, cardBg, textColor, mutedText, borderColor }) {
  const animated = useCountUp(typeof value === 'number' ? value : parseFloat(value) || 0);
  const display = typeof value === 'number' ? (Number.isInteger(value) ? Math.round(animated) : animated.toFixed(1)) : value;
  return (
    <div style={{ background: cardBg, borderRadius: '14px', padding: '22px 20px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: isDark ? `1px solid ${borderColor}` : 'none', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s', cursor: 'default' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: '32px', width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? `${color}30` : `${color}15`, borderRadius: '12px' }}>{icon}</div>
      <div>
        <p style={{ margin: '0 0 4px', fontSize: '13px', color: mutedText, fontWeight: '600' }}>{label}</p>
        <h2 style={{ margin: 0, color: textColor, fontWeight: '800', fontSize: '26px' }}>
          {display}{suffix}
        </h2>
      </div>
    </div>
  );
}

function StoreToggleInline({ initialOpen, onToggle, isDark, textColor, mutedText }) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { const r = await toggleStore(); setIsOpen(r.data.is_open); if (onToggle) onToggle(r.data.is_open); }
    catch { setIsOpen(p => !p); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontWeight: '600', color: mutedText, fontSize: '14px' }}>Store:</span>
      <div onClick={!loading ? handle : undefined} style={{
        width: '52px', height: '28px', borderRadius: '14px', backgroundColor: isOpen ? G : '#ccc',
        cursor: loading ? 'not-allowed' : 'pointer', position: 'relative', transition: 'background 0.3s',
      }}>
        <div style={{ position: 'absolute', top: '3px', left: isOpen ? '26px' : '3px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
      </div>
      <span style={{ color: isOpen ? G : '#999', fontWeight: '700', fontSize: '14px' }}>{isOpen ? 'Open' : 'Closed'}</span>
    </div>
  );
}

function CompletionBar({ score, checklist, cardBg, textColor, mutedText, isDark, borderColor }) {
  return (
    <div style={{ background: cardBg, borderRadius: '14px', padding: '24px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: isDark ? `1px solid ${borderColor}` : 'none' }}>
      <h4 style={{ margin: '0 0 16px', fontWeight: '700', color: textColor }}>🎯 Profile Completion</h4>
      <div style={{ position: 'relative', height: '10px', backgroundColor: isDark ? '#1a2a1a' : '#e8f5e9', borderRadius: '10px', marginBottom: '18px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, backgroundColor: G, borderRadius: '10px', transition: 'width 1s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', color: mutedText }}>Completion</span>
        <span style={{ fontWeight: '800', color: G, fontSize: '16px' }}>{score}%</span>
      </div>
      {checklist.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '16px' }}>{item.done ? '✅' : '⬜'}</span>
          <span style={{ fontSize: '13px', color: item.done ? (isDark ? '#e0ffe0' : '#555') : (isDark ? '#4d8a00' : '#aaa'), flex: 1 }}>{item.task}</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: item.done ? G : (isDark ? '#2a3a2a' : '#ccc') }}>+{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function SellerOverview() {
  const { theme } = useTheme();
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cache ref: { data, timestamp }
  const cacheRef = useRef(null);
  // Prevent duplicate concurrent fetches
  const isFetching = useRef(false);

  const CACHE_TTL_MS = 60000; // 60 seconds

  const isDark = theme === 'dark-pro';
  const cardBg = isDark ? '#1e2e1e' : '#fff';
  const textColor = isDark ? '#e0ffe0' : '#222';
  const mutedText = isDark ? '#8fa88f' : '#888';
  const borderColor = isDark ? '#2a3a2a' : '#eee';

  const fetchOverview = async (force = false) => {
    // Return cached data if fresh and not forcing
    if (!force && cacheRef.current && (Date.now() - cacheRef.current.timestamp < CACHE_TTL_MS)) {
      setOverviewData(cacheRef.current.data);
      setLoading(false);
      return;
    }
    // Prevent duplicate concurrent API calls
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await fetchSellerOverview();
      cacheRef.current = { data: res.data, timestamp: Date.now() };
      setOverviewData(res.data);
      setLoading(false);
    } catch (err) {
      console.log("Overview error:", err.response?.data);
      setOverviewData({ is_open: true, total_products: 0, today_visitors: 0, avg_rating: 0, pending_orders: 0, on_time_score: 0, completion_score: 10, store_status: 'Active', checklist: {} });
      setLoading(false);
    } finally {
      isFetching.current = false;
    }
  };

  // Fetch on mount:
  useEffect(() => {
    fetchOverview();
  }, []);

  // Auto refresh every 30 seconds for real-time (force=true bypasses cache):
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOverview(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !overviewData) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px' }}>
      {[1,2,3,4,5].map(i => <div key={i} style={{ height: '100px', borderRadius: '14px', backgroundColor: '#f0f0f0', animation: 'pulse 1.5s infinite alternate' }} />)}
      <style>{`@keyframes pulse{from{opacity:0.6}to{opacity:1}}`}</style>
    </div>
  );

  const cl = overviewData.checklist || {};
  const checklist = [
    { task: 'Add store logo',    done: cl.has_logo,          value: 10 },
    { task: 'Add 5 products',    done: cl.has_5_products || (overviewData.total_products >= 5), value: 20 },
    { task: 'Verify CNIC',       done: cl.is_verified,       value: 30 },
    { task: 'Set delivery area', done: cl.has_delivery_area, value: 20 },
    { task: 'Get 5 ratings',     done: cl.has_5_ratings,     value: 20 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: '800', fontSize: '22px', color: textColor }}>Welcome back! 👋</h2>
          <p style={{ margin: '4px 0 0', color: mutedText, fontSize: '14px' }}>Here's what's happening with your store today.</p>
        </div>
        <StoreToggleInline initialOpen={overviewData.is_open} isDark={isDark} textColor={textColor} mutedText={mutedText} />
      </div>

      {/* Status badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: overviewData.store_status === 'Active' ? 'rgba(106,170,0,0.1)' : 'rgba(255,152,0,0.1)', border: `1px solid ${overviewData.store_status === 'Active' ? G : '#ff9800'}`, borderRadius: '30px', padding: '6px 16px', width: 'fit-content' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: overviewData.store_status === 'Active' ? G : '#ff9800', display: 'inline-block' }} />
        <span style={{ fontWeight: '700', color: overviewData.store_status === 'Active' ? G : '#ff9800', fontSize: '13px' }}>Store Status: {overviewData.store_status}</span>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
        {CARDS.map(c => <StatCard key={c.key} label={c.label} value={overviewData[c.key] ?? 0} icon={c.icon} color={c.color} suffix={c.suffix} isDark={isDark} cardBg={cardBg} textColor={textColor} mutedText={mutedText} borderColor={borderColor} />)}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Quick actions */}
        <div style={{ background: cardBg, borderRadius: '14px', padding: '24px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: isDark ? `1px solid ${borderColor}` : 'none' }}>
          <h4 style={{ margin: '0 0 18px', fontWeight: '700', color: textColor }}>⚡ Quick Actions</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: '+ Add Product', path: '/seller/products', bg: G, color: '#fff' },
              { label: '✏️ Edit Store',  path: '/seller/store',    bg: isDark ? '#2a3a2a' : '#f5f5f5', color: textColor },
              { label: '📈 Analytics',   path: '/seller/analytics',bg: isDark ? '#2a3a2a' : '#f5f5f5', color: textColor },
              { label: '🛒 Orders',      path: '/seller/orders',   bg: isDark ? '#2a3a2a' : '#f5f5f5', color: textColor },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)} style={{
                padding: '12px 20px', backgroundColor: a.bg, color: a.color,
                border: a.bg === G ? 'none' : `1px solid ${borderColor}`, borderRadius: '10px',
                cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >{a.label}</button>
            ))}
          </div>
        </div>
        {/* Completion */}
        <CompletionBar score={overviewData.completion_score} checklist={checklist} cardBg={cardBg} textColor={textColor} mutedText={mutedText} isDark={isDark} borderColor={borderColor} />
      </div>
    </div>
  );
}
