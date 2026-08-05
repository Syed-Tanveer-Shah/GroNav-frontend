import React from 'react';

const BestTimesHeatmap = ({ data }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const getColor = (score) => {
    const alpha = Math.min(score / 100, 1);
    return `rgba(106, 170, 0, ${alpha})`;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <p style={{ fontWeight: 'bold', color: '#6aaa00' }}>Prediction: Best selling times: Tuesday 6pm–9pm</p>
      <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(24, 1fr)', gap: '2px' }}>
        <div /> 
        {[...Array(24)].map((_, i) => <div key={i} style={{ fontSize: '10px', textAlign: 'center' }}>{i}</div>)}
        
        {days.map((day) => (
          <React.Fragment key={day}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>{day}</div>
            {[...Array(24)].map((_, hour) => {
              const cellData = data?.find(d => d.day_of_week === day && d.hour === hour);
              const score = cellData ? cellData.traffic_score : 0;
              return (
                <div 
                  key={hour} 
                  title={`${day} ${hour}:00 - Score: ${score}`}
                  style={{ 
                    height: '20px', 
                    backgroundColor: getColor(score),
                    borderRadius: '2px'
                  }} 
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BestTimesHeatmap;
