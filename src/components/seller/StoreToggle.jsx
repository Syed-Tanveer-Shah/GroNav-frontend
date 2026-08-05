import React, { useState } from 'react';
import api from '../../Utils/Axios';

const StoreToggle = ({ initialStatus }) => {
  const [isOpen, setIsOpen] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/seller/store/toggle/');
      setIsOpen(res.data.is_open);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>Store is {isOpen ? 'Open' : 'Closed'}</span>
      <button 
        onClick={toggleStatus} 
        disabled={loading}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: isOpen ? '#6aaa00' : '#ccc',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.3s'
        }}
      >
        {loading ? '...' : (isOpen ? 'Close Store' : 'Open Store')}
      </button>
    </div>
  );
};

export default StoreToggle;
