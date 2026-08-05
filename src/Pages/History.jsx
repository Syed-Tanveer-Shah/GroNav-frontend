import React, { useContext, useState, useEffect } from "react";
import { Store } from "../Utils/Store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../Utils/Axios"; // Import Axios instance

function History() {
    const { state, dispatch } = useContext(Store);
    const { Cart, UserInfo } = state;  
    const navigate = useNavigate();
    const [products, setProducts] = useState(null); 
    const [error, setError] = useState(null);

    // Fetch shopping list on component mount
    useEffect(() => {
        const fetchShoppingList = async () => {
            const token = localStorage.getItem("userToken");
    
            if (!token) {
                setError("User not logged in.");
                return;
            }
    
            try {
                const response = await api.get("/history-list/", {
                    headers: { Authorization: `Token ${token}` },
                });
    
                console.log("Fetched Data:", response.data);
                
                // ✅ Extract products from all shopping lists
                const extractedProducts = response.data.flatMap(list => list.items);
                setProducts(extractedProducts);
            } catch (error) {
                setError("Failed to fetch shopping list.");
            }
        };
    
        fetchShoppingList();
    }, []);

    return (
        <div className="rts-cart-area rts-section-gap bg_light-1">
            <div className="container">
                <div className="row g-5">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-12">
                        <div className="rts-cart-list-area">
                            <div className="single-cart-area-list head">
                                <div className="product-main"><p>Products</p></div>
                                <div className="price"><p>Price</p></div>
                                <div className="quantity"><p>Quantity</p></div>
                                <div className="subtotal"><p>SubTotal</p></div>
                               
                            </div>
    
                            {/* Handle different states */}
                            {error ? (
                                <p className="text-center text-danger m-5"><strong>{error}</strong></p>
                            ) : products === null ? (
                                <p className="text-center m-5">Loading...</p>
                            ) : !Array.isArray(products) || products.length === 0 ? ( 
                                <p className="text-center text-danger m-5"><strong>Your shopping list is empty.</strong></p>
                            ) : (
                                products.map((item) => (
                                    <div key={item.product?.id || Math.random()} className="single-cart-area-list main item-parent">
                                        <div className="product-main-cart">
                                            <div className="thumbnail">
                                                <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${item.product?.image}` || ""} alt={item.product?.name || "Product"} loading="lazy" width="80" height="80" onError={(e) => { e.target.src = '/placeholder.png'; }} />
                                            </div>
                                            <div className="information">
                                                <h6 className="title">{item.product?.name || "Unknown Product"}</h6>
                                            </div>
                                        </div>
                                        <div className="price">
                                            <p>€ {item.product?.price || "0.00"}</p>
                                        </div>
                                        <div className="quantity">
                                            <p>{item.quantity || 0}</p>
                                        </div>
                                        <div className="subtotal">
                                            <p>€ {(item.product?.price * item.quantity || 0).toFixed(2)}</p>
                                        </div>
                                       
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default History;
