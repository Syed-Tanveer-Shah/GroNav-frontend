import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Utils/Axios";
import CustomDropdown from "./CustomDropdown";
import { FaMapMarkerAlt, FaTag, FaMoneyBillWave, FaSearch, FaChevronRight, FaStar, FaSpinner } from "react-icons/fa";
import { Typography } from "antd";


const HeroSearch = () => {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");
  
  // Advanced Filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [brand, setBrand] = useState("");
  const [rating, setRating] = useState(0);
  const [inStock, setInStock] = useState(false);

  const [dynamicCategories, setDynamicCategories] = useState(["All Categories"]);
  const [dynamicCities, setDynamicCities] = useState(["All Cities"]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch Categories
    api.get("/api/categories/")
      .then(res => {
        const catNames = res.data.map(cat => cat.name);
        setDynamicCategories(["All Categories", ...catNames]);
      })
      .catch(err => console.error("Error fetching categories:", err));

    // Fetch Cities
    api.get("/api/cities/")
      .then(res => {
        setDynamicCities(["All Cities", ...res.data]);
      })
      .catch(err => console.error("Error fetching cities:", err));
  }, []);

  const [pricePresets, setPricePresets] = useState([100, 500, 1000, 2000, 5000, 10000]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [priceError, setPriceError] = useState("");

  const validatePrices = (min, max) => {
    if (min !== "" && max !== "") {
      const minVal = parseFloat(min);
      const maxVal = parseFloat(max);
      if (!isNaN(minVal) && !isNaN(maxVal) && minVal >= maxVal) {
        setPriceError("Invalid price range! Minimum price cannot be greater than maximum.");
        return false;
      }
    }
    setPriceError("");
    return true;
  };

  const handleMinPriceChange = (val) => {
    setMinPrice(val);
    if (val === "" || maxPrice === "" || parseFloat(val) < parseFloat(maxPrice)) {
      setPriceError("");
    }
  };

  const handleMaxPriceChange = (val) => {
    setMaxPrice(val);
    if (minPrice === "" || val === "" || parseFloat(minPrice) < parseFloat(val)) {
      setPriceError("");
    }
  };

  useEffect(() => {
    // Dynamic price presets fetching based on category
    setLoadingPresets(true);
    let url = "/api/products/";
    if (category && category !== "All Categories") {
      url += `?category=${encodeURIComponent(category)}`;
    }

    api.get(url)
      .then(res => {
        const products = res.data?.results || res.data || [];
        const prices = products
          .map(p => parseFloat(p.price))
          .filter(p => !isNaN(p) && p >= 0);

        if (prices.length > 0) {
          const min = Math.min(...prices);
          const max = Math.max(...prices);

          if (min === max) {
            setPricePresets(Array(6).fill(Math.round(min)));
          } else {
            const step = (max - min) / 5;
            const computedPresets = [];

            const roundToClean = (val) => {
              if (val >= 10000) {
                return Math.round(val / 1000) * 1000;
              } else if (val >= 1000) {
                return Math.round(val / 100) * 100;
              } else if (val >= 100) {
                return Math.round(val / 10) * 10;
              } else {
                return Math.round(val);
              }
            };

            for (let i = 0; i <= 5; i++) {
              let val = min + i * step;
              let rounded;
              if (i === 0) {
                rounded = Math.round(min);
              } else if (i === 5) {
                rounded = Math.round(max);
              } else {
                rounded = roundToClean(val);
              }
              computedPresets.push(rounded);
            }
            setPricePresets(computedPresets);
          }
        } else {
          setPricePresets([100, 500, 1000, 2000, 5000, 10000]);
        }
      })
      .catch(err => {
        console.error("Error fetching product prices:", err);
        setPricePresets([100, 500, 1000, 2000, 5000, 10000]);
      })
      .finally(() => {
        setLoadingPresets(false);
      });
  }, [category]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    
    // Validate on click
    const isValid = validatePrices(minPrice, maxPrice);
    if (!isValid) return;

    const params = new URLSearchParams();
    
    if (search) params.set("search", search);
    if (city && city !== "All Cities") params.set("city", city);
    if (category && category !== "All Categories") params.set("category", category);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    
    // Advanced filters
    if (brand) params.set("brand", brand);
    if (rating > 0) params.set("rating", rating);
    if (inStock) params.set("in_stock", "true");

    const query = params.toString() ? `?${params.toString()}` : "";
    navigate(`/product-list${query}`);
  };

  const handlePresetClick = (price) => {
    const valStr = price.toString();
    setMaxPrice(valStr);
    if (minPrice === "" || parseFloat(minPrice) < price) {
      setPriceError("");
    }
  };

  return (
    <div className="pw-hero-container">
      <div className="container">
        <div className="pw-hero-text-area">
            <h1 className="hero-title">Find the Best Grocery Deals</h1>
            <p className="hero-subtitle">Compare prices from local stores near you</p>
        </div>

        <div className="pw-search-bar-wrapper">
          <form onSubmit={handleSearch} className="pw-main-form">
            {/* Category Dropdown */}
            <div className="pw-form-col flex-2">
              <CustomDropdown 
                placeholder="Product Category"
                options={dynamicCategories}
                value={category}
                onChange={setCategory}
                icon={<FaTag />}
              />
            </div>

            {/* City Dropdown */}
            <div className="pw-form-col flex-1">
              <CustomDropdown 
                placeholder="All Cities"
                options={dynamicCities}
                value={city}
                onChange={setCity}
                icon={<FaMapMarkerAlt />}
                groupHeader="Popular Cities"
              />
            </div>

            {/* Price Range Dropdown (Custom implementation for inputs) */}
            <div className="pw-form-col flex-1-5">
              <div className="price-range-dropdown-trigger">
                 <style>{`
                   @keyframes spin {
                     0% { transform: rotate(0deg); }
                     100% { transform: rotate(360deg); }
                   }
                 `}</style>
                 <FaMoneyBillWave className="col-icon" />
                 <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', height: '100%' }}>
                   <div className="price-inputs-inline">
                      <input 
                          type="number" 
                          placeholder="Min (Rs.)" 
                          value={minPrice}
                          onChange={(e) => handleMinPriceChange(e.target.value)}
                          onBlur={() => validatePrices(minPrice, maxPrice)}
                          className="price-input"
                      />
                      <span className="price-sep">-</span>
                      <input 
                          type="number" 
                          placeholder="Max (Rs.)" 
                          value={maxPrice}
                          onChange={(e) => handleMaxPriceChange(e.target.value)}
                          onBlur={() => validatePrices(minPrice, maxPrice)}
                          className="price-input"
                      />
                   </div>
                   {priceError && (
                      <Typography.Text type="danger" style={{ fontSize: '10px', display: 'block', marginTop: '2px', whiteSpace: 'nowrap' }}>
                         {priceError}
                      </Typography.Text>
                   )}
                 </div>
                 
                 {/* Presets Overlay - Simple list below inputs */}
                 <div className="price-presets-overlay">
                    <span className="preset-label">Quick Presets:</span>
                    <div className="presets-list">
                        {loadingPresets ? (
                            <div className="presets-loading" style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '6px', color: '#6aaa00' }}>
                                <FaSpinner className="preset-spinner-icon" style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontSize: '12px' }}>Loading presets...</span>
                            </div>
                        ) : (
                            pricePresets.map((p, idx) => (
                                <button key={`${p}-${idx}`} type="button" onClick={() => handlePresetClick(p)}>
                                    Rs.{p}
                                </button>
                            ))
                        )}
                    </div>
                 </div>
              </div>
            </div>

            {/* Search Button */}
            <button type="submit" className="pw-main-search-btn">
              <FaSearch />
            </button>
          </form>
        </div>

        {/* Advanced Filter Toggle */}
        <div className="pw-advanced-toggle-wrapper">
            <button 
                type="button" 
                className="pw-adv-toggle-btn"
                onClick={() => setShowAdvanced(!showAdvanced)}
            >
                Advanced Filter <FaChevronRight className={`toggle-arrow ${showAdvanced ? "down" : ""}`} />
            </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
            <div className="pw-advanced-panel">
                <div className="adv-filter-row">
                    <div className="adv-col check-col">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                checked={inStock}
                                onChange={(e) => setInStock(e.target.checked)}
                            />
                            <span>In Stock Only</span>
                        </label>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HeroSearch;
