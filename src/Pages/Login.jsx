import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Utils/Axios";
import { Store } from "../Utils/Store"
function Login() {
    const { dispatch } = useContext(Store) || { dispatch: () => {} };

    const navigate = useNavigate()

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await api.post('/api/auth/buyer-login/', {
                email: formData.email,
                password: formData.password
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_type', 'buyer');
            localStorage.setItem('user_name', res.data.name);

            // Fetch fresh shopping list from API
            const token = res.data.token;
            try {
                const listRes = await api.get('/history-list/', {
                    headers: { Authorization: `Token ${token}` }
                });
                if (listRes.data && listRes.data.length > 0) {
                    const latestList = listRes.data[listRes.data.length - 1];
                    const cartItems = latestList.items.map(item => ({
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        image: item.product.image ? `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${item.product.image}` : null,
                        quantity: item.quantity,
                        total: parseFloat(item.product.price) * item.quantity
                    }));
                    localStorage.setItem("CartItem", JSON.stringify(cartItems));
                    if (dispatch) dispatch({ type: "load-cart", payload: cartItems });
                } else {
                    localStorage.removeItem("CartItem");
                    if (dispatch) dispatch({ type: "clear-cart" });
                }
            } catch (fetchErr) {
                console.error("Error fetching shopping list:", fetchErr);
            }

            navigate('/');
        } catch (err) {
            if (err.response?.status === 403) {
                setError('This is a seller account. Please login from the "Become a Seller" page.');
            } else {
                setError(err.response?.data?.error || 'Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="rts-navigation-area-breadcrumb bg_light-1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="navigator-breadcrumb-wrapper">
                                < Link to="/">Home </Link>
                                <i className="fa-regular fa-chevron-right" />
                                <Link className="current" to="/login">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-seperator bg_light-1">
                <div className="container">
                    <hr className="section-seperator" />
                </div>
            </div>

            <div className="rts-register-area rts-section-gap bg_light-1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="registration-wrapper-1">
                                <div className="logo-area mb--0">
                                    <img className="mb--10" src="assets/images/logo/fav.png" alt="logo" />


                                </div>
                                <h3 className="title animated fadeIn">Login Into Your Account</h3>

                                {error && (
                                  <p style={{color:'#c62828', fontSize:'13px', marginTop:'8px'}} className="text-center">{error}</p>
                                )}
                                {success && <p className="text-success text-center">{success}</p>}

                                <form className="registration-form" onSubmit={handleSubmit}>
                                    <div className="input-wrapper">
                                        <label htmlFor="email">Email*</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-wrapper" style={{ position: "relative" }}>
                                        <label htmlFor="password">Password*</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <i
                                            className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "50px",
                                                cursor: "pointer",
                                                color: "#666"
                                            }}
                                        />
                                    </div>
                                    <div style={{ textAlign: "right", marginBottom: "20px" }}>
                                        <a 
                                            onClick={() => navigate('/forgot-password')} 
                                            style={{ 
                                                fontSize: "13px", 
                                                color: "#4CAF50", 
                                                textDecoration: "none", 
                                                cursor: "pointer" 
                                            }}
                                        >
                                            Forgot Password?
                                        </a>
                                    </div>
                                    <button className="rts-btn btn-primary" type="submit" onClick={handleSubmit} disabled={loading}>
                                        {loading ? "Logging in..." : "Login Account"}
                                    </button>
                                </form>

                                <div className="another-way-to-registration mt-5">

                                    <p>
                                        Don't have an account? < Link to="/registration" className="text-primary">Register </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
