import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Store } from "../../Utils/Store";
import api from "../../Utils/Axios";




function Header() {
    const { state, dispatch } = useContext(Store) || { state: {}, dispatch: () => {} };
    const { UserInfo, Currency } = state || {};
    console.log(UserInfo)
    const navigate = useNavigate()
    const location = useLocation()
    const [searchInput, setSearchInput] = useState("")
    // eslint-disable-next-line no-unused-vars
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedPriceRange, setSelectedPriceRange] = useState("")

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('user_type');
    // eslint-disable-next-line no-unused-vars
    const userName = localStorage.getItem('user_name');
    const displayName = localStorage.getItem('user_name')?.split(' ')[0] || localStorage.getItem('user_name')?.split('@')[0] || 'User';
    const isBuyer = token && userType !== 'seller';

    const handleSignIn = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/auth/buyer-login/', { email, password });
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

            setShowLoginModal(false);
            window.location.reload();
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Seller account — please login from Become a Seller page.');
            } else {
                setError(err.response?.data?.error || 'Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_type');
        localStorage.removeItem('user_name');
        localStorage.removeItem('UserInfo');
        localStorage.removeItem('CartItem'); // Clear shopping list/cart from localStorage completely
        if (dispatch) dispatch({ type: "clear-cart" }); // Reset shopping list state
        window.dispatchEvent(new Event('storage'));
        window.location.reload();
    };

    // eslint-disable-next-line no-unused-vars
    const handleLogout = () => {
        handleSignOut();
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/api/categories/");


                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchInput(params.get("search") || "");
        setSelectedCategory(params.get("category") || "");
        const min = params.get("min_price");
        const max = params.get("max_price");
        if (min && max) {
            setSelectedPriceRange(`${min}-${max}`);
        } else {
            setSelectedPriceRange("");
        }
    }, [location.search]);

    // eslint-disable-next-line no-unused-vars
    const handleHeaderSearch = (event) => {
        event.preventDefault();
        const trimmed = searchInput.trim();
        const params = new URLSearchParams();
        
        if (trimmed) params.set("search", trimmed);
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedPriceRange) {
            const [min, max] = selectedPriceRange.split("-");
            params.set("min_price", min);
            params.set("max_price", max);
        }
        
        const query = params.toString() ? `?${params.toString()}` : "";
        navigate(`/product-list${query}`);
    };

    const closeMobileMenu = () => {
        const sidebar = document.getElementById('side-bar');
        if (sidebar) sidebar.classList.remove('show');
        const bg = document.getElementById('anywhere-home');
        if (bg) bg.classList.remove('bgshow');
    };

    return (
        <>
            <div className="rts-header-one-area-one">
                <div className="header-top-area">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="header-mid-wrapper-between">
                                    <div className="nav-sm-left">
                                        <ul className="nav-h_top" >
                                            <li>
                                                <Link to="/about" className="text-white">About Us</Link>
                                            </li>


                                        </ul>
                                        <p className="para text-white">
                                            We are open to your everyday from 7:00 to 22:00
                                        </p>
                                    </div>
                                    <div className="nav-sm-left">
                                        <ul className="nav-h_top language">
                                            <li className="category-hover-header language-hover">
                                                <Link to="#" className="text-white " style={{ marginLeft: "end" }}> English</Link>
                                                <ul className="category-sub-menu">
                                                    <li>
                                                        <Link to="#" className="menu-item">
                                                            <span >Italian</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="#" className="menu-item">
                                                            <span>Russian</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="#" className="menu-item">
                                                            <span>Chinian</span>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </li>
                                            <li className="category-hover-header language-hover">
                                                <Link to="#" className="text-white">{Currency || "PKR"}</Link>
                                                <ul className="category-sub-menu">
                                                    {['PKR', 'USD', 'EUR'].map((curr) => (
                                                        <li key={curr}>
                                                            <Link to="#" className="menu-item" onClick={() => dispatch({ type: "ChangeCurrency", payload: curr })}>
                                                                <span>{curr}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                            <li>
                                                <Link to="/track-order" className="text-white">Track Order</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="search-header-area-main">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="logo-search-category-wrapper">
                                    <Link to="/" className="logo-area">
                                        <img
                                            src="assets/images/logo/logo-01.png"


                                            alt="Grao.Nav"
                                            className="logo"
                                            width="150px"
                                        />
                                    </Link>
                                    <div className="category-search-wrapper">
                                        {/* Old search bar removed */}
                                    </div>
                                    <div className="actions-area">
                                        <div className="search-btn" id="searchs">
                                            <svg
                                                width={17}
                                                height={16}
                                                viewBox="0 0 17 16"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M15.75 14.7188L11.5625 10.5312C12.4688 9.4375 12.9688 8.03125 12.9688 6.5C12.9688 2.9375 10.0312 0 6.46875 0C2.875 0 0 2.9375 0 6.5C0 10.0938 2.90625 13 6.46875 13C7.96875 13 9.375 12.5 10.5 11.5938L14.6875 15.7812C14.8438 15.9375 15.0312 16 15.25 16C15.4375 16 15.625 15.9375 15.75 15.7812C16.0625 15.5 16.0625 15.0312 15.75 14.7188ZM1.5 6.5C1.5 3.75 3.71875 1.5 6.5 1.5C9.25 1.5 11.5 3.75 11.5 6.5C11.5 9.28125 9.25 11.5 6.5 11.5C3.71875 11.5 1.5 9.28125 1.5 6.5Z"
                                                    fill="#1F1F25"
                                                />
                                            </svg>
                                        </div>
                                        <div className="menu-btn" id="menu-btn">
                                            <svg
                                                width={20}
                                                height={16}
                                                viewBox="0 0 20 16"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <rect y={14} width={20} height={2} fill="#1F1F25" />
                                                <rect y={7} width={20} height={2} fill="#1F1F25" />
                                                <rect width={20} height={2} fill="#1F1F25" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="accont-wishlist-cart-area-header">
                                        {isBuyer ?
                                            <>
                                                <div className="dropdown">
                                                    {/* Account Button */}
                                                    <button
                                                        className="btn btn-border-only account dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        <i className="fa-light fa-user" />
                                                        <span style={{ fontSize: "15px" }}> Welcome, {displayName}</span>
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    <ul className="dropdown-menu">

                                                        <li>
                                                            <Link className="dropdown-item" to="/history">History</Link>
                                                        </li>
                                                        <li>
                                                            <button className="dropdown-item text-danger" onClick={handleSignOut}>
                                                                Sign Out
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <Link to="/shopping-list">
                                                </Link>
                                                <div className="btn-border-only cart category-hover-header">
                                                    <i className="fa-sharp fa-regular fa-cart-shopping" />

                                                    <Link to="/shopping-list" className="over_link" />
                                                    <span className="text">Shopping List</span>
                                                </div>
                                            </>
                                            :
                                            <>
                                                <button id="signInBtn" onClick={() => setShowLoginModal(true)} className="btn-border-only account" style={{background:'none', border:'none', cursor:'pointer'}}>
                                                    <i className="fa-light fa-user" />
                                                    <span>Sign in</span>
                                                </button>

                                                <Link to="/registration" className="btn-border-only account">
                                                    <i className="fa-light fa-user" />
                                                    <span>Sign up</span>
                                                </Link>
                                            </>
                                        }


                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rts-header-nav-area-one header--sticky">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="nav-and-btn-wrapper">
                                    <div className="nav-area">
                                        <nav>
                                            <ul className="parent-nav">
                                                <li className="parent has-dropdown">
                                                    <Link className="nav-link" to="/">
                                                        Home
                                                    </Link>

                                                </li>

                                                <li className="parent with-megamenu">
                                                    <Link to="/product-list">ProductList</Link>

                                                </li>
                                                <li className="parent has-dropdown">
                                                    <Link className="nav-link" to="/stores">
                                                        Stores
                                                    </Link>

                                                </li>
                                                <li className="parent">
                                                    <Link className="nav-link" to="/become-a-seller">Become a Seller</Link>
                                                </li>
                                                <li className="parent">
                                                    <Link to="/about">About</Link>
                                                </li>

                                                <li className="parent">
                                                    <Link to="/contact">Contact</Link>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                    {/* button-area */}
                                    <div className="right-btn-area">
                                        <Link to="#" className="btn-narrow">
                                            Trending Products
                                        </Link>
                                        <button className="rts-btn btn-primary">
                                            Get 30% Discount Now
                                            <span>Sale</span>
                                        </button>
                                    </div>
                                    {/* button-area end */}
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="logo-search-category-wrapper after-md-device-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 15px' }}>
                                    <Link to="/" className="logo-area" onClick={closeMobileMenu}>
                                        <img
                                            src="assets/images/logo/logo-01.png"
                                            alt="Grao.Nav"
                                            className="logo"
                                            width="130px"
                                        />
                                    </Link>

                                    <div className="main-wrapper-action-2 d-flex align-items-center" style={{ gap: '14px' }}>
                                        <Link to="/shopping-list" className="mobile-cart-btn" onClick={closeMobileMenu} style={{ fontSize: '18px', color: '#1F1F25', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }} title="Shopping List">
                                            <i className="fa-sharp fa-regular fa-cart-shopping" />
                                        </Link>
                                        <div className="actions-area d-flex align-items-center" style={{ gap: '12px' }}>
                                            <div className="search-btn" id="search" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px', cursor: 'pointer' }}>
                                                <svg
                                                    width={17}
                                                    height={16}
                                                    viewBox="0 0 17 16"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M15.75 14.7188L11.5625 10.5312C12.4688 9.4375 12.9688 8.03125 12.9688 6.5C12.9688 2.9375 10.0312 0 6.46875 0C2.875 0 0 2.9375 0 6.5C0 10.0938 2.90625 13 6.46875 13C7.96875 13 9.375 12.5 10.5 11.5938L14.6875 15.7812C14.8438 15.9375 15.0312 16 15.25 16C15.4375 16 15.625 15.9375 15.75 15.7812C16.0625 15.5 16.0625 15.0312 15.75 14.7188ZM1.5 6.5C1.5 3.75 3.71875 1.5 6.5 1.5C9.25 1.5 11.5 3.75 11.5 6.5C11.5 9.28125 9.25 11.5 6.5 11.5C3.71875 11.5 1.5 9.28125 1.5 6.5Z"
                                                        fill="#1F1F25"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="menu-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '44px', minHeight: '44px', cursor: 'pointer' }}>
                                                <svg
                                                    width={20}
                                                    height={16}
                                                    viewBox="0 0 20 16"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <rect y={14} width={20} height={2} fill="#1F1F25" />
                                                    <rect y={7} width={20} height={2} fill="#1F1F25" />
                                                    <rect width={20} height={2} fill="#1F1F25" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="side-bar" className="side-bar header-two">
                <button className="close-icon-menu" onClick={closeMobileMenu}>
                    <i className="far fa-times" />
                </button>
                <form action="#" className="search-input-area-menu mt--30" onSubmit={handleHeaderSearch}>
                    <input type="text" placeholder="Search..." required="" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                    <button type="submit" onClick={closeMobileMenu}>
                        <i className="fa-light fa-magnifying-glass" />
                    </button>
                </form>
                <div className="mobile-menu-nav-area tab-nav-btn mt--20">
                    <nav>
                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                            <button
                                className="nav-link active"
                                id="nav-home-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#nav-home"
                                type="button"
                                role="tab"
                                aria-controls="nav-home"
                                aria-selected="true"
                            >
                                Menu
                            </button>
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                        <div
                            className="tab-pane fade show active"
                            id="nav-home"
                            role="tabpanel"
                            aria-labelledby="nav-home-tab"
                            tabIndex={0}
                        >
                            {/* mobile menu area start */}
                            <div className="mobile-menu-main">
                                <nav className="nav-main mainmenu-nav mt--30">
                                    <ul className="mainmenu metismenu" id="mobile-menu-active">
                                        <li>
                                            <Link to="/" className="main" onClick={closeMobileMenu}>
                                                Home
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/product-list" className="main" onClick={closeMobileMenu}>
                                                ProductList
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/stores" className="main" onClick={closeMobileMenu}>
                                                Stores
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/become-a-seller" className="main" onClick={closeMobileMenu}>
                                                Become a Seller
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/about" className="main" onClick={closeMobileMenu}>
                                                About
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/contact" className="main" onClick={closeMobileMenu}>
                                                Contact
                                            </Link>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                            {/* mobile menu area end */}

                            {/* Top Bar Options (Currency / Track Order) in Drawer */}
                            <div style={{ marginTop: '20px', padding: '15px', borderTop: '1px solid #eee', background: '#f9f9f9', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>Currency:</span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {['PKR', 'USD', 'EUR'].map((curr) => (
                                            <button
                                                key={curr}
                                                type="button"
                                                onClick={() => { dispatch({ type: "ChangeCurrency", payload: curr }); closeMobileMenu(); }}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    border: Currency === curr ? '1px solid #6aaa00' : '1px solid #ccc',
                                                    background: Currency === curr ? '#6aaa00' : '#fff',
                                                    color: Currency === curr ? '#fff' : '#333',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    minHeight: '36px'
                                                }}
                                            >
                                                {curr}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* button area wrapper start */}
                <div className="button-area-main-wrapper-menuy-sidebar mt--50">
                    <div className="buton-area-bottom">
                        {token ? <>
                            <div className="dropdown">
                                <button
                                    className="rts-btn btn-primary dropdown-toggle"
                                    type="button"
                                    id="accountDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Welcome, {displayName}
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="accountDropdown">
                                    <li><Link className="dropdown-item" to="/history" onClick={closeMobileMenu}>History</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item text-danger" onClick={() => { closeMobileMenu(); handleSignOut(); }}>Sign Out</button></li>
                                </ul>
                            </div>
                            <Link to="/shopping-list" className="rts-btn btn-primary" onClick={closeMobileMenu}>
                                Shopping List
                            </Link>
                        </>
                            :
                            <>
                                <button onClick={() => { closeMobileMenu(); setShowLoginModal(true); }} className="rts-btn btn-primary">
                                    Sign In
                                </button>
                                <Link to="/registration" className="rts-btn btn-primary" onClick={closeMobileMenu}>
                                    Sign Up
                                </Link>
                            </>
                        }
                    </div>
                </div>
                {/* button area wrapper end */}
            </div>

            {/* Login Modal */}
            {showLoginModal && (
              <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={() => setShowLoginModal(false)}>
                <div style={{background:'#fff',borderRadius:'16px',padding:'32px',width:'100%',maxWidth:'400px',boxShadow:'0 20px 60px rgba(0,0,0,0.15)', position: 'relative'}} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowLoginModal(false)} style={{position:'absolute',right:'20px',top:'20px',background:'none',border:'none',fontSize:'24px',cursor:'pointer',color:'#888',lineHeight:1}}>×</button>
                    <div className="registration-wrapper-1" style={{padding: 0, boxShadow: 'none', background: 'transparent'}}>
                        <div className="logo-area mb--0" style={{textAlign: 'center'}}>
                            <img className="mb--10" src="assets/images/logo/fav.png" alt="logo" style={{margin: '0 auto'}} />
                        </div>
                        <h3 className="title animated fadeIn" style={{textAlign: 'center', marginBottom: '20px'}}>Login Into Your Account</h3>

                        {error && (
                            <p style={{color:'#c62828', fontSize:'13px', marginTop:'8px'}} className="text-center">{error}</p>
                        )}

                        <form className="registration-form" onSubmit={handleSignIn}>
                            <div className="input-wrapper">
                                <label htmlFor="email">Email*</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={{width:'100%', boxSizing:'border-box'}}
                                />
                            </div>
                            <div className="input-wrapper" style={{ position: "relative" }}>
                                <label htmlFor="password">Password*</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={{width:'100%', boxSizing:'border-box'}}
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
                                    onClick={() => { setShowLoginModal(false); navigate('/forgot-password'); }} 
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
                            <button className="rts-btn btn-primary" type="submit" onClick={handleSignIn} disabled={loading} style={{width: '100%', marginTop: '10px'}}>
                                {loading ? "Logging in..." : "Login Account"}
                            </button>
                        </form>

                        <div className="another-way-to-registration mt-5" style={{textAlign: 'center'}}>
                            <p>
                                Don't have an account? <span onClick={() => { setShowLoginModal(false); navigate('/registration'); }} className="text-primary" style={{cursor: 'pointer'}}>Register</span>
                            </p>
                        </div>
                    </div>
                </div>
              </div>
            )}
        </>
    )
}

export default Header;
