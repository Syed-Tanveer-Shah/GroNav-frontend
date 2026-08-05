import React from 'react';

const JourneyFunnel = ({ data, isLoading }) => {
  // 1. Add a loading state — show a spinner or skeleton while data is fetching
  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #6aaa00', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '12px', color: '#888', fontSize: '14px' }}>Loading journey data...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 4. Add an empty state — if no journey data exists yet
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center', 
        color: '#aaa', 
        fontSize: '15px',
        backgroundColor: '#fdfdfd',
        borderRadius: '12px',
        border: '1px dashed #eee'
      }}>
        No journey data yet — data will appear as customers visit your store
      </div>
    );
  }

  const maxCount = (data && data.length > 0) ? data[0].count : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
      {/* 3. Add a default empty array fallback */}
      {(data || []).map((item, index) => {
        const count = item?.count ?? 0;
        const widthPercent = (count / maxCount) * 100;
        const prevCount = index > 0 ? data[index - 1]?.count : 0;
        const conversionRate = (index > 0 && prevCount > 0) ? ((count / prevCount) * 100).toFixed(1) : 100;

        return (
          <div key={index} style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ 
              width: `${widthPercent}%`, 
              height: '40px', 
              backgroundColor: '#6aaa00', 
              margin: '0 auto', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              color: 'white',
              borderRadius: '20px',
              transition: 'width 0.5s',
              boxShadow: '0 2px 8px rgba(106,170,0,0.2)',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {/* 2. Add null/undefined checks before calling .toLocaleString() */}
              {item?.step}: {item?.count?.toLocaleString() ?? '0'}
            </div>
            {index > 0 && (
              <div style={{ fontSize: '12px', color: '#777', margin: '5px 0', fontWeight: '500' }}>
                {conversionRate}% conversion
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default JourneyFunnel;

