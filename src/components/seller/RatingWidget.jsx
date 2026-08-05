import React, { useState } from 'react';
import api from '../../Utils/Axios';

const RatingWidget = ({ entityId, type = 'product', initialRating = 0, initialReview = '' }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState(initialReview);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = type === 'store' ? `/api/ratings/store/${entityId}/` : `/api/ratings/product/${entityId}/`;
      await api.post(url, { rating, review });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        alert('Please login to rate.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <p style={{ color: '#6aaa00', fontWeight: 'bold' }}>Thank you for your review!</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
      <div style={{ display: 'flex', gap: '5px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            style={{ 
              cursor: 'pointer', 
              color: star <= (hover || rating) ? '#ffb400' : '#e4e5e9',
              fontSize: '24px',
              transition: 'color 0.2s'
            }}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        ))}
      </div>
      <textarea 
        placeholder="Write a review (optional)" 
        value={review}
        onChange={(e) => setReview(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '80px' }}
      />
      <button 
        onClick={handleSubmit} 
        disabled={rating === 0 || loading}
        style={{ padding: '10px', backgroundColor: '#6aaa00', color: '#fff', border: 'none', borderRadius: '5px', cursor: rating === 0 ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
};

export default RatingWidget;
