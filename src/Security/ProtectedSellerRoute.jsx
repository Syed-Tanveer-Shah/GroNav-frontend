import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedSellerRoute = ({ children }) => {
  const sellerToken = localStorage.getItem('seller_token')
  const isSeller = localStorage.getItem('is_seller')
  if (!sellerToken || isSeller !== 'true') {
    return <Navigate to="/become-a-seller" replace />
  }
  return children
}

export default ProtectedSellerRoute;
