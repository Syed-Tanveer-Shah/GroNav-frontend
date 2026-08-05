import React, { useState } from 'react';
import api from '../../Utils/Axios';

const OrderPipeline = ({ order, onUpdate }) => {
  const steps = ['received', 'packed', 'out_for_delivery', 'delivered'];
  const labels = ['Received', 'Packed', 'Out for Delivery', 'Delivered'];
  const [loading, setLoading] = useState(false);

  const handleStepClick = async (stepStr) => {
    const currentIdx = steps.indexOf(order.status);
    const targetIdx = steps.indexOf(stepStr);
    
    // Only allow moving forward sequentially
    if (targetIdx === currentIdx + 1) {
      setLoading(true);
      try {
        await api.post(`/api/seller/orders/${order.id}/status/`, { status: stepStr });
        onUpdate();
      } catch (error) {
        console.error("Failed to update status", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const currentIndex = steps.indexOf(order.status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '20px 0', opacity: loading ? 0.5 : 1 }}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div 
            onClick={() => handleStepClick(step)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              cursor: index === currentIndex + 1 ? 'pointer' : 'default'
            }}
          >
            <div style={{
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              backgroundColor: index <= currentIndex ? '#6aaa00' : '#e0e0e0',
              color: index <= currentIndex ? '#fff' : '#777',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}>
              {index + 1}
            </div>
            <span style={{ fontSize: '12px', marginTop: '5px', color: index <= currentIndex ? '#333' : '#999' }}>{labels[index]}</span>
          </div>
          {index < steps.length - 1 && (
            <div style={{
              flex: 1,
              height: '4px',
              backgroundColor: index < currentIndex ? '#6aaa00' : '#e0e0e0',
              margin: '0 10px',
              transform: 'translateY(-10px)',
              transition: 'background-color 0.3s'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default OrderPipeline;
