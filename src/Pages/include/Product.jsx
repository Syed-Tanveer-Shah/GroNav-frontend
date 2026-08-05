import React, { useState, useContext } from "react";
import { Store } from "../../Utils/Store";
import { toast } from "react-toastify";
import api from "../../Utils/Axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Product({ item: product }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [storeDetails, setStoreDetails] = useState(null);
    const [loadingStore, setLoadingStore] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const { state, dispatch, convertPrice } = useContext(Store);
    const { Cart, Currency } = state;
    const navigate = useNavigate()
    const { isLoggedIn } = useAuth();

    const handleQuickView = () => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    };

    const closeQuickView = () => {
        setIsQuickViewOpen(false);
        setSelectedProduct(null);
    };

    const handleNavigate = async (productId) => {
        try {
            setLoadingStore(true);
            const res = await api.get(`/api/product/${productId}/store/`);
            setStoreDetails(res.data);
            setShowStoreModal(true);
        } catch (err) {
            console.error("STORE ERROR:", err.response?.data);
            toast.error('Failed to load store details: ' + (err.response?.data?.error || 'Unknown error'));
        } finally {
            setLoadingStore(false);
        }
    };

    const addToCart = async () => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            return;
        }

        try {
            // const response = await api.get(`/check-stock/?product_id=${product.id}`);
            const { in_stock, stock } = [1, 1];

            // if (!in_stock) {
            //     toast.error("Product is out of stock");
            //     return;
            // }

            const currentCartItem = Cart.find((cartItem) => cartItem.id === product.id);
            const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;

            if (currentQuantity + 1 > stock) {
                toast.error("Product out of stock");
                return;
            }

            toast.success("Product added to cart!");
            dispatch({ type: "add-to-cart", payload: product });
            localStorage.setItem("CartItem", JSON.stringify([...Cart, product]));
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
            <div className="single-shopping-card-one">
                <div className="image-and-action-area-wrapper">
                    <div onClick={() => navigate(`/product/${product.id}`)} className="thumbnail-preview" style={{cursor:'pointer', width:'100%', height:'200px', background:'#f8f8f8', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {product.image
                            ? <img src={product.image} alt={product.name} loading="lazy"
                                width="200" height="200"
                                style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                                onError={(e) => { e.target.src = '/placeholder.png'; }} />
                            : <div style={{fontSize:'40px'}}>📦</div>
                        }
                    </div>

                    <div className="action-share-option mb-3">
                        <div
                            className="single-action openuptip cta-quickview product-details-popup-btn"
                            data-flow="up"
                            title="Quick View"
                            onClick={handleQuickView}
                        >
                            <i className="fa-regular fa-eye" />
                        </div>
                    </div>
                </div>

                <div className="body-content">
                    <div onClick={() => navigate(`/product/${product.id}`)} style={{cursor:'pointer'}}>
                        <h4 className="title">{product.name}</h4>
                    </div>

                    <span className="availability">
                        {product.stock > 0 ? (
                            <span className="text-success" style={{ fontFamily: "bolder" }}>In Stock</span>
                        ) : (
                            <span className="text-danger" style={{ fontFamily: "bolder" }}>Out of Stock</span>
                        )}
                    </span>
                    <div className="price-area">
                        {product.discount_active ? (
                            <div className="bd-product__price">
                                <span className="bd-product__old-price">
                                    <del className="text-danger">
                                        {convertPrice(product.price)}
                                    </del>
                                </span>
                                <span className="bd-product__new-price">
                                    {convertPrice(product.discounted_price)}
                                </span>
                            </div>
                        ) : (
                            <div className="bd-product__price">
                                <span className="bd-product__new-price text-success">
                                    <strong>{convertPrice(product.price)}</strong>
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="cart-counter-action" style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                        <button className="rts-btn btn-primary radious-sm with-icon" onClick={addToCart} style={{ flex: 1, padding: '10px 15px', display: 'flex', justifyContent: 'center' }}>
                            <div className="btn-text">Add to List</div>
                            <div className="arrow-icon">
                                <i className="fa-regular fa-cart-shopping" />
                            </div>
                        </button>
                        <button
                            className="rts-btn btn-primary"
                            onClick={() => handleNavigate(product.id)}
                            disabled={loadingStore}
                            style={{ flex: 1, padding: '10px 15px' }}
                        >
                            {loadingStore ? '...' : 'Navigate'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Store Details Modal */}
            {showStoreModal && storeDetails && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000, padding:'20px' }}>
                    <div style={{ background:'#fff', borderRadius:'20px', width:'100%', maxWidth:'460px', boxShadow:'0 25px 60px rgba(0,0,0,0.35)', overflow:'hidden', animation:'fadeIn 0.2s ease' }}>
                        {/* Header Banner */}
                        <div style={{ background:'linear-gradient(135deg, #6aaa00, #4a8a00)', padding:'24px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                                {storeDetails.logo ? (
                                    <img src={storeDetails.logo} alt="store" style={{ width:'56px', height:'56px', borderRadius:'12px', objectFit:'cover', border:'2px solid rgba(255,255,255,0.4)' }} />
                                ) : (
                                    <div style={{ width:'56px', height:'56px', borderRadius:'12px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>🏪</div>
                                )}
                                <div>
                                    <h3 style={{ margin:0, color:'#fff', fontSize:'18px', fontWeight:'800' }}>{storeDetails.store_name}</h3>
                                    {storeDetails.is_open === true && <span style={{ fontSize:'11px', background:'rgba(255,255,255,0.25)', color:'#fff', padding:'2px 10px', borderRadius:'20px', fontWeight:'700' }}>● Open Now</span>}
                                    {storeDetails.is_open === false && <span style={{ fontSize:'11px', background:'rgba(0,0,0,0.2)', color:'#ffd', padding:'2px 10px', borderRadius:'20px', fontWeight:'700' }}>○ Closed</span>}
                                </div>
                            </div>
                            <button onClick={() => setShowStoreModal(false)} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', fontSize:'20px', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>×</button>
                        </div>

                        {/* Store Details */}
                        <div style={{ padding:'24px' }}>
                            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                                <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px', background:'#f8fff0', borderRadius:'10px' }}>
                                    <span style={{ fontSize:'20px' }}>📍</span>
                                    <div>
                                        <div style={{ fontWeight:'700', fontSize:'13px', color:'#444', marginBottom:'2px' }}>Address</div>
                                        <div style={{ fontSize:'14px', color:'#222' }}>{storeDetails.address || '—'}, {storeDetails.city || '—'}</div>
                                    </div>
                                </div>
                                <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px', background:'#f8fff0', borderRadius:'10px' }}>
                                    <span style={{ fontSize:'20px' }}>📞</span>
                                    <div>
                                        <div style={{ fontWeight:'700', fontSize:'13px', color:'#444', marginBottom:'2px' }}>Phone</div>
                                        <div style={{ fontSize:'14px', color:'#222' }}>{storeDetails.phone || '—'}</div>
                                    </div>
                                </div>
                                <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px', background:'#f8fff0', borderRadius:'10px' }}>
                                    <span style={{ fontSize:'20px' }}>🕐</span>
                                    <div>
                                        <div style={{ fontWeight:'700', fontSize:'13px', color:'#444', marginBottom:'2px' }}>Opening Hours</div>
                                        <div style={{ fontSize:'14px', color:'#222' }}>{storeDetails.opening_hours || '—'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
                                <button
                                    onClick={() => window.location.href = storeDetails.google_maps_url}
                                    style={{ flex:1, padding:'12px', background:'#6aaa00', color:'#fff', border:'none', borderRadius:'10px', fontWeight:'700', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}
                                >
                                    🗺️ Open in Google Maps
                                </button>
                                <button
                                    onClick={() => setShowStoreModal(false)}
                                    style={{ padding:'12px 20px', background:'#f0f0f0', color:'#555', border:'none', borderRadius:'10px', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick View Modal */}
            {isQuickViewOpen && selectedProduct && (
                <div className="quickview-modal">
                    <div className="modal-content">
                        <span className="close-btn" onClick={closeQuickView}>
                            &times;
                        </span>
                        <h2>{selectedProduct.name}</h2>
                        <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name} 
                            className="quickview-image" 
                            loading="lazy"
                            width="250"
                            height="250"
                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                        />
                        <p>
                            <strong>Category:</strong> {selectedProduct.category}
                        </p>
                        <p>
                            {product.discount_active ? (
                                <div className="bd-product__price">
                                    <span className="bd-product__old-price">
                                        <del className="text-danger">{convertPrice(product.price)}</del>
                                    </span>
                                    <span className="bd-product__new-price">
                                        {convertPrice(product.discounted_price)}
                                    </span>
                                </div>
                            ) : (
                                <div className="bd-product__price">
                                    <span className="bd-product__new-price text-success">
                                        <strong>{convertPrice(product.price)}</strong>
                                    </span>
                                </div>
                            )}
                        </p>
                        <button className="rts-btn btn-primary" onClick={addToCart}>Add to Cart</button>
                    </div>
                </div>
            )}

            {/* Quick View Modal Styles */}
            <style>{`
                .quickview-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    width: 400px;
                    text-align: center;
                    position: relative;
                }
                .close-btn {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 24px;
                    cursor: pointer;
                }
                .product-image {
                    width: 100%;
                    height: 200px; /* Fixed height */
                    object-fit: cover; /* Ensures the image is contained within the box without distortion */
                    border-radius: 10px;
                }
                .quickview-image {
                    width: 100%;
                    height: auto;
                    max-height: 250px;
                    object-fit: contain;
                }
            `}</style>

            {showLoginPrompt && (
                <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={() => setShowLoginPrompt(false)}>
                  <div style={{background:'#fff',borderRadius:'14px',padding:'28px',maxWidth:'340px',width:'90%',textAlign:'center'}} onClick={e => e.stopPropagation()}>
                    <div style={{fontSize:'36px',marginBottom:'12px'}}>🔒</div>
                    <h3 style={{fontSize:'16px',fontWeight:'500',color:'#222',marginBottom:'8px'}}>Login Required</h3>
                    <p style={{fontSize:'13px',color:'#888',marginBottom:'20px',lineHeight:'1.6'}}>Please login to add items to your cart or shopping list</p>
                    <div style={{display:'flex',gap:'10px'}}>
                      <button onClick={() => setShowLoginPrompt(false)} style={{flex:1,padding:'10px',border:'1px solid #e0e0e0',borderRadius:'8px',background:'#fff',cursor:'pointer',fontSize:'13px',color:'#555'}}>
                        Cancel
                      </button>
                      <button onClick={() => { setShowLoginPrompt(false); document.getElementById('signInBtn')?.click() }} style={{flex:1,padding:'10px',border:'none',borderRadius:'8px',background:'#6aaa00',color:'#fff',cursor:'pointer',fontSize:'13px',fontWeight:'500'}}>
                        Sign In
                      </button>
                    </div>
                  </div>
                </div>
            )}
        </div>
    );
}

export default Product;
