import React from 'react';

const CompletionScore = ({ score, checklist }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0 }}>Profile Completion</h3>
      <div style={{ width: '100%', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', marginBottom: '15px' }}>
        <div style={{ width: `${score}%`, height: '100%', backgroundColor: '#6aaa00', borderRadius: '5px', transition: 'width 0.5s ease-in-out' }}></div>
      </div>
      <p style={{ fontWeight: 'bold', color: '#6aaa00' }}>{score}% Complete</p>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {checklist.map((item, index) => (
          <li key={index} style={{ marginBottom: '8px', color: item.done ? '#6aaa00' : '#777', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{item.done ? '✅' : '⏳'}</span>
            <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>{item.task} (+{item.value}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompletionScore;
