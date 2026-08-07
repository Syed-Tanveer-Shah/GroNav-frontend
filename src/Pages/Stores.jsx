import React, { useEffect, useState } from "react";
import api from "../Utils/Axios";

import { useNavigate } from 'react-router-dom';


function Stores() {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const openInGoogleMaps = (address) => {
        if (!address) return;
        const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
        window.location.href = mapUrl;
    };

    // Fetch stores from API
    useEffect(() => {
        console.log("Fetching stores from API using REACT_APP_API_URL:", process.env.REACT_APP_API_URL || 'http://localhost:8000');
        api.get("/api/stores/")
            .then(response => {
                console.log("Stores API response status:", response.status, "data:", response.data);
                const storeList = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.results || []);
                console.log("Parsed store list count:", storeList.length, storeList);
                setStores(storeList);
                setError(null);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching stores:", error, error?.response?.data || error?.message);
                setError(`Failed to load stores: ${error?.response?.data?.detail || error?.message || 'Server error'}`);
                setLoading(false);
            });
    }, []);

    // Filter stores based on search input with safety checks
    const storeArray = Array.isArray(stores) ? stores : [];
    const filteredStores = storeArray.filter(store => {
        if (!store) return false;
        const nameMatch = store.name ? store.name.toLowerCase().includes(search.toLowerCase()) : false;
        const phoneMatch = store.phone ? String(store.phone).includes(search) : false;
        return nameMatch || phoneMatch;
    });

    return (
        <>
            <div className="vendor-search-area">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="vendor-search-area-wrapper">
                                <h1 className="title">Stores List</h1>
                                <form className="search-vendor-form" onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        type="text"
                                        placeholder="Search stores (by name or phone)..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="vendor-search-area rts-section-gap">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="tab-content">
                                <div className="with-list mt--20 tab-pane fade show active">
                                    <div className="row g-4">
                                        {loading && <p className="text-center py-4">Loading stores...</p>}
                                        {error && <p className="text-danger text-center py-4">{error}</p>}
                                        {!loading && !error && filteredStores.length === 0 && (
                                            <p className="text-danger mx-auto d-flex justify-content-center align-items-center py-4">
                                                No stores found.
                                            </p>
                                        )}
                                        {!loading && !error && filteredStores.map(store => (
                                            <div key={store.id} className="col-lg-6 col-12" onClick={() => navigate(`/store/${store.id}`)} style={{ cursor: 'pointer' }}>
                                                <div className="single-vendor-area">
                                                    <div style={{width:'64px', height:'64px', borderRadius:'50%', background:'#f0f9e0', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                        {store.logo_url
                                                            ? <img src={store.logo_url} alt={store.name}
                                                                style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                                                                onError={e => { e.target.style.display='none' }} />
                                                            : <span style={{fontSize:'22px', fontWeight:'700', color:'#3b6d11'}}>{store.name?.[0]}</span>
                                                        }
                                                    </div>
                                                    <div className="inner">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                            <h3 style={{ margin: 0, fontSize: '18px' }}>{store.name}</h3>

                                                            {/* Open/Closed badge */}
                                                            {store.is_open
                                                                ? <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>Open</span>
                                                                : <span style={{ background: '#ffebee', color: '#c62828', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>Closed</span>
                                                            }

                                                            {/* Online/Physical badge */}
                                                            {store.seller_type === 'online' ? (
                                                                <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                                                                    Online
                                                                </span>
                                                            ) : store.seller_type === 'physical' ? (
                                                                <span style={{ background: '#f3e5f5', color: '#6a1b9a', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                                                                    Physical
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <div className="stars-area">
                                                            <i className="fa-solid fa-star" /> {store.rating} / 5
                                                        </div>
                                                        <div className="location">
                                                            <i
                                                                className="fa-regular fa-location-dot"
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => openInGoogleMaps(store.address)}
                                                                onKeyDown={(event) => {
                                                                    if (event.key === "Enter" || event.key === " ") {
                                                                        openInGoogleMaps(store.address);
                                                                    }
                                                                }}
                                                                title="View on Google Maps"
                                                            />
                                                            <p>{store.address}</p>
                                                        </div>
                                                        <div className="location">
                                                            <i className="fa-solid fa-phone-volume" />
                                                            <p>{store.phone}</p>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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

export default Stores;
