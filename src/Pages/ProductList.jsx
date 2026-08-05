import React, { useEffect, useState } from "react";
import Product from "./include/Product";
import api from "../Utils/Axios";

import { Link, useLocation, useNavigate } from "react-router-dom";


function ProductList() {
    // eslint-disable-next-line no-unused-vars
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState(null);
    const [maxPrice, setMaxPrice] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // Fetch products with query parameters from URL
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Use the current URL search params directly for the API call
                const response = await api.get(`/api/products/${location.search}`);
                const data = response.data;
                if (data && typeof data === "object" && Array.isArray(data.results)) {
                    setProducts(data.results);
                    setFilteredProducts(data.results);
                    setNextPage(data.next);
                } else {
                    setProducts(data || []);
                    setFilteredProducts(data || []);
                    setNextPage(null);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to load products. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [location.search]);

    const handleLoadMore = async () => {
        if (!nextPage || loadingMore) return;
        setLoadingMore(true);
        try {
            // Fetch the nextPage directly using the full url retrieved from api
            const response = await api.get(nextPage);
            const data = response.data;
            if (data && typeof data === "object" && Array.isArray(data.results)) {
                setProducts(prev => [...prev, ...data.results]);
                setFilteredProducts(prev => [...prev, ...data.results]);
                setNextPage(data.next);
            }
        } catch (error) {
            console.error("Error loading more products:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Fetch categories & stores once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/api/categories/");


                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const fetchStores = async () => {
            try {
                const response = await api.get("/api/stores/");


                setStores(response.data);
            } catch (error) {
                console.error("Error fetching stores:", error);
            }
        };

        fetchCategories();
        fetchStores();
    }, []);

    // Sync local state with URL for the search input and store selections
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchTerm(params.get("search") || "");
        setSelectedCategory(params.get("category") || null);
        setSelectedStore(params.get("store") || null);
        setMinPrice(params.get("min_price") || null);
        setMaxPrice(params.get("max_price") || null);
    }, [location.search]);

    const handleCategoryClick = (e, categoryName) => {
        // BUG 1 FIX: prevent Link's default navigation to "#" from overriding navigate()
        e.preventDefault();
        const params = new URLSearchParams(location.search);
        if (categoryName) {
            params.set("category", categoryName);
        } else {
            params.delete("category");
        }
        navigate({ pathname: location.pathname, search: params.toString() });
    };

    const handleBranchClick = (e, storeId) => {
        // BUG 1 FIX: prevent Link's default navigation to "#" from overriding navigate()
        e.preventDefault();
        const params = new URLSearchParams(location.search);
        if (storeId) {
            params.set("store", storeId);
        } else {
            params.delete("store");
        }
        navigate({ pathname: location.pathname, search: params.toString() });
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const params = new URLSearchParams(location.search);
        
        if (searchTerm.trim()) {
            params.set("search", searchTerm.trim());
        } else {
            params.delete("search");
        }
        
        if (selectedCategory) {
            params.set("category", selectedCategory);
        }

        if (selectedStore) {
            params.set("store", selectedStore);
        }
        
        if (minPrice) {
            params.set("min_price", minPrice);
        } else {
            params.delete("min_price");
        }

        if (maxPrice) {
            params.set("max_price", maxPrice);
        } else {
            params.delete("max_price");
        }
        
        navigate({ pathname: location.pathname, search: params.toString() });
    };

    return (
        <div className="shop-grid-sidebar-area rts-section-gap">
            <div className="search-header-area-main">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            {/* BUG 2 FIX: two stacked rows — search bar centered on top, filter buttons centered below */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>

                                {/* Row 1: Search Input + Button */}
                                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    <form className="search-header d-flex" onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: '600px' }}>
                                        <input
                                            type="text"
                                            placeholder="Search for products or categories"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <button type="submit" className="rts-btn btn-primary radious-sm with-icon ms-2">
                                            <div className="btn-text">Search</div>
                                            <div className="arrow-icon">
                                                <i className="fa-light fa-magnifying-glass" />
                                            </div>
                                        </button>
                                    </form>
                                </div>

                                {/* Row 2: Category Filter + Store Filter */}
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>

                                    {/* Category Filter */}
                                    <div className="category-search-wrapper">
                                        <div className="category-btn category-hover-header">
                                            <img className="parent" src="assets/images/icons/bar-1.svg" alt="icons" />
                                            <span>Categories</span>
                                            <ul className="category-sub-menu metismenu">
                                                <li>
                                                    {/* BUG 1 FIX: pass event to handler to call preventDefault() */}
                                                    <Link to="#" className="menu-item" onClick={(e) => handleCategoryClick(e, null)}>
                                                        <span>All Categories</span>
                                                    </Link>
                                                </li>
                                                {categories.map((category, index) => (
                                                    <li key={index}>
                                                        <Link to="#" className="menu-item" onClick={(e) => handleCategoryClick(e, category.name)}>
                                                            <span>{category.name}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Store Filter */}
                                    <div className="category-search-wrapper">
                                        <div className="category-btn category-hover-header">
                                            <img className="parent" src="assets/images/icons/bar-1.svg" alt="icons" />
                                            <span>Stores</span>
                                            <ul className="category-sub-menu metismenu">
                                                <li>
                                                    <Link to="#" className="menu-item" onClick={(e) => handleBranchClick(e, null)}>
                                                        <span>All Stores</span>
                                                    </Link>
                                                </li>
                                                {stores.map((store, index) => (
                                                    <li key={index}>
                                                        <Link to="#" className="menu-item" onClick={(e) => handleBranchClick(e, store.id)}>
                                                            <span>{store.name}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product List */}
            <div className="container">
                <div className="row g-0">
                    <div className="col-xl-12 col-lg-12 p-5">
                        <div className="tab-content" id="myTabContent">
                            <div className="product-area-wrapper-shopgrid-list mt--20 tab-pane fade show active">
                                <div className="row g-4">
                                    {loading && <p>Loading products...</p>}
                                    {error && <p className="text-danger">{error}</p>}
                                    {!loading && !error && filteredProducts.length === 0 && (
                                        <p className="text-danger mx-auto d-flex justify-content-center align-items-center">
                                            No products available.
                                        </p>
                                    )}
                                    {!loading && !error && filteredProducts.map((product) => (
                                        <Product key={product.id} item={product} />
                                    ))}
                                </div>
                                {nextPage && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                                        <button 
                                            onClick={handleLoadMore} 
                                            disabled={loadingMore} 
                                            className="rts-btn btn-primary"
                                            style={{ padding: '12px 30px', fontWeight: 'bold' }}
                                        >
                                            {loadingMore ? "Loading..." : "Load More"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductList;
