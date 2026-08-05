import React, { useContext, useState } from "react";
import { Store } from "../Utils/Store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function ShoppingList() {
    const { state, dispatch } = useContext(Store);
    const { Cart } = state;  // Get logged-in user info from Store
    const navigate = useNavigate();
    const [popupProductId, setPopupProductId] = useState(null); // Track the product for which the popup is shown

    // Function to update quantity and handle free product logic
    const updateQuantity = (item, newQuantity) => {
        if (newQuantity < 1) return; // Prevent decreasing quantity to less than 1

        // Dispatch the updated quantity (without adding the free product)
        dispatch({ type: "update-cart-quantity", payload: { id: item.id, quantity: newQuantity } });

        // Show popup if quantity is a multiple of 4
        if (newQuantity % 4 === 0) {
            setPopupProductId(item.id); // Show the popup
        } else if (newQuantity % 4 !== 0 && popupProductId === item.id) {
            setPopupProductId(null); // Hide the popup when the quantity is below multiple of 4
        }
    };

    // Function to handle increase in quantity by 1
    const increaseQuantity = (item) => {
        const newQuantity = item.quantity + 1; // Increase by 1
        updateQuantity(item, newQuantity);
    };

    // Function to handle decrease in quantity by 1
    const decreaseQuantity = (item) => {
        const newQuantity = item.quantity - 1; // Decrease by 1
        updateQuantity(item, newQuantity);
    };

    // Function to remove item from the cart
    const removeItem = (item) => {
        dispatch({ type: "remove-from-cart", payload: item });
        setTimeout(() => {
            const updatedCart = JSON.parse(localStorage.getItem("CartItem")) || [];
            const newCart = updatedCart.filter(cartItem => cartItem.id !== item.id);
            localStorage.setItem("CartItem", JSON.stringify(newCart));
        }, 100);
        toast.success("Item removed from shopping list");
    };


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
                                <div className="subtotal"><p>Location</p></div>
                                <div className="subtotal"><p>Action</p></div>
                            </div>

                            {Cart.length === 0 ? (
                                <p className="text-center text-danger m-5"><strong>Your shopping list is empty.</strong></p>
                            ) : (
                                Cart.map((item) => (
                                    <div key={item.id} className="single-cart-area-list main item-parent">
                                        <div className="product-main-cart">
                                            <div className="close section-activation" onClick={() => removeItem(item)}>
                                                <i className="fa-regular fa-x" />
                                            </div>
                                            <div className="thumbnail">
                                                <img src={item.image} alt={item.name} loading="lazy" width="80" height="80" onError={(e) => { e.target.src = '/placeholder.png'; }} />
                                            </div>
                                            <div className="information">
                                                <h6 className="title">{item.name}</h6>
                                                <span>SKU: {item.sku || `PROD-${item.id}`}</span>
                                            </div>
                                        </div>
                                        <div className="price">
                                            <p>Rs. {Number(item.price).toFixed(2)}</p>
                                        </div>
                                        <div className="quantity">
                                            <div className="quantity-edit d-flex align-items-center">
                                                <input
                                                    type="text"
                                                    className="input form-control text-center fw-bold"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item, Number(e.target.value))}
                                                    style={{ maxWidth: "50px", minWidth: "45px", padding: "4px", fontSize: "14px" }}
                                                />
                                                <div className="button-wrapper-action">
                                                    {/* Only Increase/Decrease by 1 */}
                                                    <button className="button" onClick={() => decreaseQuantity(item)}>
                                                        <i className="fa-regular fa-chevron-down" />
                                                    </button>
                                                    <button className="button plus" onClick={() => increaseQuantity(item)}>
                                                        <i className="fa-regular fa-chevron-up" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="subtotal">
                                            <p>Rs. {(Number(item.price) * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="">
                                            <button
                                                className="rts-btn btn-primary"
                                                onClick={() => navigate(`/store/${item.store}`)}
                                            >
                                                Navigate
                                            </button>                                        </div>
                                        <div className="m-5" style={{ textAlign: "center" }}>
                                            <button className="rts-btn btn-primary" onClick={() => navigate('/delivery', { state: { product: item, quantity: item.quantity } })}>Confirm</button>
                                            <p style={{ fontSize: "12px", color: "#888", marginTop: "5px", marginBottom: "0" }}>Go to checkout</p>
                                        </div>

                                        {/* Popup for individual product quantity reaching 4 */}
                                        {popupProductId === item.id && (
                                            <div className="popup-container" style={popupStyle}>
                                                <div className="popup-content">
                                                    <h2>Special Offer!</h2>
                                                    <p>Add one more product to get</p>
                                                    <p style={{ fontSize: "20px", color: "red" }}> 1 FREE</p>
                                                    <button
                                                        className="popup-close-btn my-5"
                                                        style={closeButtonStyle}
                                                        onClick={() => setPopupProductId(null)}
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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

const popupStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
};

const closeButtonStyle = {
    backgroundColor: "#629D23",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "10px 20px",
    cursor: "pointer",
};

export default ShoppingList;
