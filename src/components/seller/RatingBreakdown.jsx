import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const RatingBreakdown = ({ data }) => {
  if (!data || data.length === 0) return <p>No ratings yet.</p>;

  const formattedData = [5, 4, 3, 2, 1].map(star => {
    const found = data.find(d => d.stars === star);
    return { name: `${star} ★`, count: found ? found.count : 0 };
  });

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <BarChart layout="vertical" data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Bar dataKey="count" fill="#ffb400" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingBreakdown;
