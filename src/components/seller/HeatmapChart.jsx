import React from 'react';

const HeatmapChart = ({ data }) => {
  const getColor = (depth) => {
    if (depth < 25) return '#e3f2fd'; // Blue-ish
    if (depth < 50) return '#fff59d'; // Yellow-ish
    if (depth < 75) return '#ffb74d'; // Orange-ish
    return '#ef5350'; // Red-ish
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100px', fontWeight: 'bold' }}>{item.section}</div>
          <div style={{ 
            flex: 1, 
            height: '40px', 
            backgroundColor: getColor(item.avg_scroll_depth), 
            display: 'flex', 
            alignItems: 'center', 
            paddingLeft: '15px',
            borderRadius: '5px',
            color: '#333'
          }}>
            {item.view_count} views (Depth: {item.avg_scroll_depth}%)
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeatmapChart;
