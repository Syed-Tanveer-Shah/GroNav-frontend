import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import api from '../../Utils/Axios';
import { useRef } from 'react';

const NAV = [
  { name: 'Overview',     path: '/seller',              icon: '📊', end: true },
  { name: 'Analytics',    path: '/seller/analytics',    icon: '📈' },
  { name: 'Products',     path: '/seller/products',     icon: '📦' },
  { name: 'Categories',   path: '/seller/categories',   icon: '🏷️' },
  { name: 'Orders',       path: '/seller/orders',       icon: '🛒' },
  { name: 'Store',        path: '/seller/store',        icon: '🏪' },
  { name: 'Verification', path: '/seller/verification', icon: '🛡️' },
  { name: 'Settings',     path: '/seller/settings',     icon: '⚙️' },
];

const THEMES = {
  light:       { bg: '#f4f6f8', sidebar: '#ffffff',  text: '#333',    muted: '#777', border: '#e8e8e8', card: '#ffffff' },
  'dark-pro':  { bg: '#0f1a0f', sidebar: '#1a2a1a',  text: '#e0ffe0', muted: '#8fa88f', border: '#2a3a2a', card: '#1e2e1e' },
  'soft-green':{ bg: '#f9fbf4', sidebar: '#f0f9e0',  text: '#2d3d1a', muted: '#5a7a2d', border: '#d8edd8', card: '#ffffff' },
};

const AvatarCircle = ({ storeLogo, storeName, size = 38, fontSize = 16 }) => (
  storeLogo
    ? <img src={storeLogo} alt="store logo" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#6aaa00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize, flexShrink: 0 }}>
        {storeName[0]?.toUpperCase()}
      </div>
);

export default function SellerLayout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeName, setStoreName]   = useState('My Store');
  const [storeLogo, setStoreLogo]   = useState(null);
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const c = THEMES[theme] || THEMES.light;

  const pageTitle = NAV.find(n => n.path === location.pathname)?.name || 'Dashboard';

  useEffect(() => {
    api.get('/api/seller/overview/')
      .then(r => setStoreName(r.data?.store_name || 'My Store'))
      .catch(() => {});
    api.get('/api/seller/store/')
      .then(r => setStoreLogo(r.data?.logo || null))
      .catch(() => {});
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/seller/notifications/');
      setNotificationsList(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.log('Notifications error:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click:
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/api/seller/notifications/');
      fetchNotifications();
    } catch (err) {}
  };

  const markOneRead = async (id) => {
    try {
      await api.post(`/api/seller/notifications/${id}/read/`);
      fetchNotifications();
    } catch (err) {}
  };

  const typeIcon = {
    order: '🛍️',
    rating: '⭐',
    low_stock: '📦',
    return: '🔄',
    verification: '✅'
  };

  const handleLogout = () => {
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_name');
    localStorage.removeItem('is_seller');
    navigate('/become-a-seller');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: c.bg, color: c.text, fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: 'hidden', position: 'relative' }}>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`seller-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: collapsed ? '70px' : '220px', minWidth: collapsed ? '70px' : '220px',
          backgroundColor: c.sidebar, borderRight: `1px solid ${c.border}`,
          display: 'flex', flexDirection: 'column',
          boxShadow: '3px 0 15px rgba(0,0,0,0.06)', transition: 'transform 0.3s ease, width 0.3s ease, min-width 0.3s ease',
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: `1px solid ${c.border}` }}>
          {!collapsed && <span style={{ fontWeight: '800', fontSize: '18px', color: '#6aaa00', letterSpacing: '-0.5px' }}>🛒 Gro.Nav</span>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6aaa00', fontSize: '18px', padding: '4px', borderRadius: '6px', lineHeight: 1 }}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Seller Info */}
        {!collapsed && (
          <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AvatarCircle storeLogo={storeLogo} storeName={storeName} size={38} fontSize={16} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeName}</div>
              <span style={{ fontSize: '11px', backgroundColor: 'rgba(106,170,0,0.15)', color: '#6aaa00', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>● Active</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV.map(item => (
            <NavLink key={item.name} to={item.path} end={item.end}
              title={collapsed ? item.name : ''}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '12px',
                padding: '10px 12px', borderRadius: '10px', marginBottom: '4px',
                textDecoration: 'none',
                color: isActive ? '#6aaa00' : c.text,
                backgroundColor: isActive ? 'rgba(106,170,0,0.12)' : 'transparent',
                borderLeft: isActive ? '3px solid #6aaa00' : '3px solid transparent',
                fontWeight: isActive ? '700' : '500', fontSize: '14px',
                transition: 'all 0.2s', justifyContent: collapsed ? 'center' : 'flex-start',
              })}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: `1px solid ${c.border}` }}>
          <button onClick={() => { setMobileOpen(false); handleLogout(); }} title={collapsed ? 'Logout' : ''} style={{
            width: '100%', padding: '10px 12px', backgroundColor: 'rgba(239,83,80,0.08)',
            color: '#ef5350', border: '1px solid rgba(239,83,80,0.3)', borderRadius: '10px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
          }}>
            <span>🚪</span>{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: '62px', backgroundColor: c.sidebar, borderBottom: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="seller-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: c.text, display: 'none', padding: 0 }}
            >
              ☰
            </button>
            <h3 style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: c.text }}>{pageTitle}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Theme dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[['light','#f4f6f8','#333'],['dark-pro','#1a2a1a','#fff'],['soft-green','#d8f0a0','#333']].map(([t,bg,border]) => (
                <button key={t} title={t} onClick={() => setTheme(t)} style={{
                  width: '18px', height: '18px', borderRadius: '50%', backgroundColor: bg,
                  border: theme === t ? '2px solid #6aaa00' : `1.5px solid ${border}`,
                  cursor: 'pointer', outline: 'none', transition: 'transform 0.2s',
                  transform: theme === t ? 'scale(1.25)' : 'scale(1)',
                }} />
              ))}
            </div>
            {/* Notification Bell with Dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  backgroundColor: showDropdown ? 'rgba(106,170,0,0.1)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative', border: `1px solid ${c.border}`,
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '20px' }}>🔔</span>
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: '#ef5350', color: '#fff', fontSize: '10px',
                    fontWeight: '700', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', border: '1.5px solid #fff'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>

              {showDropdown && (
                <div style={{
                  position: 'absolute', top: '48px', right: 0, width: '320px',
                  background: c.sidebar, borderRadius: '14px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: `1px solid ${c.border}`,
                  zIndex: 1000, overflow: 'hidden'
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '14px 16px', borderBottom: `1px solid ${c.border}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: theme === 'soft-green' ? 'rgba(106,170,0,0.05)' : 'transparent'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: c.text }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: '12px', color: '#6aaa00', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {notificationsList.length === 0
                      ? <div style={{ padding: '40px 20px', textAlign: 'center', color: c.muted, fontSize: '13px' }}>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📭</div>
                          No notifications yet
                        </div>
                      : notificationsList.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markOneRead(n.id)}
                          style={{
                            padding: '12px 16px', borderBottom: `1px solid ${c.border}`,
                            cursor: 'pointer', background: n.is_read ? 'transparent' : 'rgba(106,170,0,0.05)',
                            display: 'flex', gap: '12px', alignItems: 'flex-start',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(106,170,0,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(106,170,0,0.05)'}
                        >
                          <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '2px' }}>{typeIcon[n.type] || '🔔'}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '13px', fontWeight: n.is_read ? '500' : '700', color: c.text, margin: '0 0 2px' }}>{n.title}</p>
                            <p style={{ fontSize: '12px', color: c.muted, margin: '0 0 4px', lineHeight: '1.4' }}>{n.message}</p>
                            <p style={{ fontSize: '11px', color: c.muted, margin: 0, opacity: 0.8 }}>{n.time_ago}</p>
                          </div>
                          {!n.is_read && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6aaa00', flexShrink: 0, marginTop: '5px' }} />
                          )}
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            {/* Avatar */}
            <div style={{ cursor: 'pointer' }}>
              <AvatarCircle storeLogo={storeLogo} storeName={storeName} size={34} fontSize={14} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 30px', backgroundColor: c.bg }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
