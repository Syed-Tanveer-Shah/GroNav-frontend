// import {useContext} from "react";
// import {Store} from "../../Utils/Store";
// import {Link} from "react-router-dom";

import { useContext } from "react";
import { Link } from "react-router-dom";
import { Store } from "../../Utils/Store";

function Footer() {
    const { state } = useContext(Store)
    const { ContactInfo } = state
    return (
        <>
            <div className="rts-footer-area pt--80 bg_light-1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="footer-main-content-wrapper pb--70 pb_sm--30">
                                {/* single footer area wrapper */}
                                <div className="single-footer-wized">
                                    <h3 className="footer-title animated fadeIn">About Company</h3>
                                    <div className="call-area">
                                        <div className="icon">
                                            <i className="fa-solid fa-phone-rotary" />
                                        </div>
                                        <div className="info">
                                            <span>Have Question? Call Us 24/7</span>
                                            <Link to="#" className="number">

                                                {ContactInfo.contact_phone}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="opening-hour">
                                        <div className="single">
                                            <p>
                                                Email: <span>  <Link to="#" className="number">

                                                    {ContactInfo.contact_email}
                                                </Link></span>
                                            </p>
                                        </div>
                                        <div className="single">
                                            <p>
                                                Address: <span><Link to="#" className="number">

                                                    {ContactInfo.address}
                                                </Link></span>
                                            </p>
                                        </div>

                                    </div>
                                </div>
                                {/* single footer area wrapper */}
                                {/* single footer area wrapper */}
                                <div className="single-footer-wized">
                                    <h3 className="footer-title animated fadeIn">Our Stores</h3>
                                    <div className="footer-nav">
                                        <ul>
                                            <li>
                                                <Link to="/product-list">Products</Link>
                                            </li>
                                            <li>
                                                <Link to="/stores">Stores</Link>
                                            </li>
                                            <li>
                                                <Link to="/about">About Us</Link>
                                            </li>
                                            <li>
                                                <Link to="/contact">Contact Us</Link>
                                            </li>

                                        </ul>
                                    </div>
                                </div>
                                {/* single footer area wrapper */}
                                {/* single footer area wrapper */}
                                <div className="single-footer-wized">
                                    <h3 className="footer-title animated fadeIn">Admin</h3>
                                    <div className="footer-nav">
                                        <ul>
                                            <li>
                                                <Link to={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/admin`}><strong>Login</strong></Link>
                                            </li>

                                        </ul>
                                    </div>
                                </div>


                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default Footer;
