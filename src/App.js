import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ToastContainers from "./Utils/ToastContainer";
import { Spin } from 'antd';

// Lazy loading components
const PageNotFound404 = lazy(() => import("./Errors/PageNotFound404"));
const Base = lazy(() => import("./Pages/Base"));
const Home = lazy(() => import("./Pages/Home"));
const About = lazy(() => import("./Pages/About"));
const ProductList = lazy(() => import("./Pages/ProductList"));
const Stores = lazy(() => import("./Pages/Stores"));
const Contact = lazy(() => import("./Pages/Contact"));
const ShoppingList = lazy(() => import("./Pages/ShoppingList"));
const Registration = lazy(() => import("./Pages/Registration"));
const Login = lazy(() => import("./Pages/Login"));
const Protected = lazy(() => import("./Security/Protected"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword"));
const StoreMap = lazy(() => import("./Pages/include/StoreMap"));
const StoreDetail = lazy(() => import("./Pages/StoreDetail"));
const History = lazy(() => import("./Pages/History"));
const BecomeSeller = lazy(() => import("./Pages/become-seller/BecomeSeller"));
const ProductDetail = lazy(() => import("./Pages/ProductDetail"));
const DeliveryInformation = lazy(() => import("./Pages/DeliveryInformation"));
const PaymentPage = lazy(() => import("./Pages/PaymentPage"));
const OrderSuccess = lazy(() => import("./Pages/OrderSuccess"));
const TrackOrder = lazy(() => import("./Pages/TrackOrder"));


const AdminLayout = lazy(() => import("./Pages/Admin/AdminLayout"));
const AdminOverview = lazy(() => import("./Pages/Admin/AdminOverview"));
const StoreManager = lazy(() => import("./Pages/Admin/StoreManager"));
const InventoryManager = lazy(() => import("./Pages/Admin/InventoryManager"));

const ProtectedSellerRoute = lazy(() => import("./Security/ProtectedSellerRoute"));
const SellerLayout = lazy(() => import("./Pages/seller/SellerLayout"));
const SellerOverview = lazy(() => import("./Pages/seller/SellerOverview"));
const SellerAnalytics = lazy(() => import("./Pages/seller/SellerAnalytics"));
const SellerProducts = lazy(() => import("./Pages/seller/SellerProducts"));
const SellerOrders = lazy(() => import("./Pages/seller/SellerOrders"));
const SellerStore = lazy(() => import("./Pages/seller/SellerStore"));
const SellerVerification = lazy(() => import("./Pages/seller/SellerVerification"));
const SellerSettings = lazy(() => import("./Pages/seller/SellerSettings"));
const SellerCategories = lazy(() => import("./Pages/seller/SellerCategories"));

const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #6aaa00', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ fontSize: '1.2rem', color: '#6aaa00', fontWeight: '600' }}>Loading CartGo...</div>
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);



function App() {
    return (
        <BrowserRouter>
            <ToastContainers />
            <Suspense fallback={<div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}><Spin size="large" /></div>}>
                    <Routes>
                        {/* Web Routes */}
                        <Route path='/' element={<Base><Home /></Base>} />
                        <Route path='/product-list' element={<Base><ProductList /></Base>} />
                        <Route path='/stores' element={<Base><Stores /></Base>} />
                        <Route path='/about' element={<Base><About /></Base>} />
                        <Route path='/contact' element={<Base><Contact /></Base>} />
                        <Route path='/shopping-list' element={<Base><Protected><ShoppingList /></Protected></Base>} />
                        <Route path='/history' element={<Base><Protected><History /></Protected></Base>} />
                        <Route path="/store-map" element={<StoreMap />} />
                        <Route path="/store/:storeId" element={<Base><StoreDetail /></Base>} />
                        <Route path='/become-a-seller' element={<Base><BecomeSeller /></Base>} />
                        <Route path="/product/:productId" element={<Base><ProductDetail /></Base>} />
                        <Route path="/delivery" element={<Base><DeliveryInformation /></Base>} />
                        <Route path="/payment" element={<Base><PaymentPage /></Base>} />
                        <Route path="/order-success" element={<Base><OrderSuccess /></Base>} />
                        <Route path="/track-order" element={<Base><TrackOrder /></Base>} />


                        <Route path='/login' element={<Base><Login /></Base>} />
                        <Route path='/registration' element={<Base><Registration /></Base>} />
                        <Route path='/forgot-password' element={<Base><ForgotPassword /></Base>} />
                        <Route path='/reset-password/:uid/:token' element={<Base><ResetPassword /></Base>} />
                        
                        <Route path='/admin' element={<Protected><AdminLayout /></Protected>}>
                            <Route index element={<AdminOverview />} />
                            <Route path='stores' element={<StoreManager />} />
                            <Route path='inventory' element={<InventoryManager />} />
                        </Route>

                        {/* Seller Dashboard Routes */}
                        <Route path="/seller" element={<ProtectedSellerRoute><SellerLayout /></ProtectedSellerRoute>}>
                            <Route index element={<SellerOverview />} />
                            <Route path="analytics" element={<SellerAnalytics />} />
                            <Route path="products" element={<SellerProducts />} />
                            <Route path="categories" element={<SellerCategories />} />
                            <Route path="orders" element={<SellerOrders />} />
                            <Route path="store" element={<SellerStore />} />
                            <Route path="verification" element={<SellerVerification />} />
                            <Route path="settings" element={<SellerSettings />} />
                        </Route>

                        <Route path="/seller/dashboard" element={<Navigate to="/seller" replace />} />
                        <Route path='*' element={<PageNotFound404 />} />
                    </Routes>
                </Suspense>
        </BrowserRouter>
    );
}

export default App;
