import React from 'react';

const CompetitorTable = ({ data }) => {
  if (!data || data.length === 0) return <p>No competitor data found.</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
          <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Category</th>
          <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>My Avg Price</th>
          <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Market Avg</th>
          <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Lowest Price</th>
          <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => {
          const isCompetitive = parseFloat(row.my_avg_price) <= parseFloat(row.market_avg);
          return (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{row.category}</td>
              <td style={{ padding: '10px' }}>Rs. {row.my_avg_price}</td>
              <td style={{ padding: '10px' }}>Rs. {row.market_avg}</td>
              <td style={{ padding: '10px' }}>Rs. {row.lowest_price}</td>
              <td style={{ padding: '10px', color: isCompetitive ? '#6aaa00' : '#ef5350', fontWeight: 'bold' }}>
                {isCompetitive ? 'Competitive' : 'Overpriced'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default CompetitorTable;
