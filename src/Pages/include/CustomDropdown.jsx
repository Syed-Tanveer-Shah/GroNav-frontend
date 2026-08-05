import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";

const CustomDropdown = ({ 
    placeholder, 
    options, 
    value, 
    onChange, 
    icon, 
    showSearch = true,
    groupHeader = null 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // If a new dropdown is opened, close others (handled by parent usually, but here we just manage this instance)
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        setSearchTerm(""); // Reset search when opening
    };

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="custom-dropdown-container" ref={dropdownRef}>
            <div className={`dropdown-display ${isOpen ? "open" : ""}`} onClick={toggleDropdown}>
                <div className="display-left">
                    {icon && <span className="dropdown-icon">{icon}</span>}
                    <span className={`selected-value ${!value ? "placeholder" : ""}`}>
                        {value || placeholder}
                    </span>
                </div>
                <FaChevronDown className={`chevron-icon ${isOpen ? "rotated" : ""}`} />
            </div>

            {isOpen && (
                <div className="dropdown-menu-custom">
                    {showSearch && (
                        <div className="dropdown-search-wrapper">
                            <FaSearch className="search-icon-inner" />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()} // Prevent closing
                                autoFocus
                            />
                        </div>
                    )}
                    
                    <ul className="dropdown-options-list">
                        {groupHeader && searchTerm === "" && (
                            <li className="group-header-li">{groupHeader}</li>
                        )}
                        
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <li 
                                    key={index} 
                                    className={`dropdown-option-item ${value === option ? "active" : ""}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option}
                                </li>
                            ))
                        ) : (
                            <li className="no-options">No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
