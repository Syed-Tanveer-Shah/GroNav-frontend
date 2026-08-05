import React, { useEffect, useState } from 'react';

const StatCard = ({ title, value, icon, isRating = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0;
      const duration = 1000;
      const stepTime = Math.max(10, Math.floor(duration / value));
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= value) clearInterval(timer);
      }, stepTime);
      return () => clearInterval(timer);
    } else {
      setCount(value || 0);
    }
  }, [value]);

  return (
    <div style={{ padding: '20px', borderRadius: '10px', backgroundColor: 'var(--bg-card, #fff)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ fontSize: '30px', color: '#6aaa00' }}>{icon}</div>
      <div>
        <h4 style={{ margin: 0, color: 'var(--text-muted, #777)', fontSize: '14px' }}>{title}</h4>
        <h2 style={{ margin: '5px 0 0 0', color: 'var(--text-main, #333)' }}>
          {isRating ? `${count} ⭐` : count}
        </h2>
      </div>
    </div>
  );
};

export default StatCard;
