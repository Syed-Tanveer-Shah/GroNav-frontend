import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Utils/Axios";
import { toast } from "react-toastify";

function Registration() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password1: "",
        password2: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (formData.password1 !== formData.password2) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            // eslint-disable-next-line no-unused-vars
            const response = await api.post("/auth/registration/", formData);
            toast.success("Registration successful! Please login.");
            setSuccess("Registration successful! Please login.");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            console.error(err);

            // Default fallback error
            let message = "Registration failed. Please check your details.";

            // If server responded with error details
            if (err.response) {
                if (err.response.data) {
                    const data = err.response.data;

                    // Handle object of field errors
                    if (typeof data === 'object') {
                        message = Object.values(data)
                            .flat()
                            .join(" ");
                    } else if (typeof data === 'string') {
                        message = data;
                    }
                } else if (err.response.status === 400) {
                    message = "Bad request. Please verify your inputs.";
                }
            } else if (err.request) {
                message = "No response from server. Please try again later.";
            } else {
                message = "An unexpected error occurred.";
            }

            setError(message);
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
                                <Link to="/">Home</Link>
                                <i className="fa-regular fa-chevron-right" />
                                <Link className="current" to="/registration">
                                    Register
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
                                <h3 className="title animated fadeIn">Register Into Your Account</h3>

                                {error && <p className="text-danger text-center">{error}</p>}
                                {success && <p className="text-success text-center">{success}</p>}

                                <form className="registration-form" onSubmit={handleSubmit}>
                                    <div className="input-wrapper">
                                        <label htmlFor="first_name">First Name*</label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-wrapper">
                                        <label htmlFor="last_name">Last Name*</label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="input-wrapper">
                                        <label htmlFor="username">Username*</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
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
                                        <label htmlFor="password1">Password*</label>
                                        <input
                                            type={showPassword1 ? "text" : "password"}
                                            id="password1"
                                            name="password1"
                                            value={formData.password1}
                                            onChange={handleChange}
                                            required
                                            style={{ paddingRight: "42px" }}
                                        />
                                        <i
                                            className={`fa-regular ${showPassword1 ? "fa-eye-slash" : "fa-eye"}`}
                                            onClick={() => setShowPassword1(!showPassword1)}
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "50px",
                                                cursor: "pointer",
                                                color: "#666"
                                            }}
                                        />
                                    </div>
                                    <div className="input-wrapper" style={{ position: "relative" }}>
                                        <label htmlFor="password2">Confirm Password*</label>
                                        <input
                                            type={showPassword2 ? "text" : "password"}
                                            id="password2"
                                            name="password2"
                                            value={formData.password2}
                                            onChange={handleChange}
                                            required
                                            style={{ paddingRight: "42px" }}
                                        />
                                        <i
                                            className={`fa-regular ${showPassword2 ? "fa-eye-slash" : "fa-eye"}`}
                                            onClick={() => setShowPassword2(!showPassword2)}
                                            style={{
                                                position: "absolute",
                                                right: "15px",
                                                top: "50px",
                                                cursor: "pointer",
                                                color: "#666"
                                            }}
                                        />
                                    </div>
                                    <button className="rts-btn btn-primary" type="submit" disabled={loading}>
                                        {loading ? "Registering..." : "Register Account"}
                                    </button>
                                </form>

                                <div className="another-way-to-registration mt-5">
                                    <p>
                                        Already have an account? <Link to="/login" className="text-primary">Login</Link>
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

export default Registration;
