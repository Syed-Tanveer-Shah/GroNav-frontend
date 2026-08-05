import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const StoreMap = () => {
    const [searchParams] = useSearchParams();
    const categoryName = searchParams.get("category");
    const store = searchParams.get("store");

    const [userLocation, setUserLocation] = useState(null);
    const [productLocation, setProductLocation] = useState(null);
    const mapRef = useRef(null);
    const userMarkerRef = useRef(null);
    const pathRef = useRef(null);

    // Store boundaries
    const storeBounds = [
        [0, 0],
        [1000, 1000],
    ];

    // Category images for Store 1 and Store 2
    const categoryImages1 = {
        "Spices": "/map-img/spices.png",
        "Dairy": "/map-img/dairy.png",
        "Meat": "/map-img/meat.png",
        "Bakery": "/map-img/bakery.png",
        "Frozen": "/map-img/frozen.png",
        "Cereal": "/map-img/cereal.png",
        "Choclates": "/map-img/choclates.png",
        "Crisps": "/map-img/crisps.png",
        "Flowers": "/map-img/flower.png",
        "Fruits": "/map-img/fruits.png",
        "Sweets": "/map-img/sweets.png",
        "Toys": "/map-img/toys.png",
        "Biscuit": "/map-img/biscuit.png",
        "Electronics": "/map-img/electronics.png",
    };
    const categoryImages2 = {
        "Spices": "/map-img/2spices.png",
        "Dairy": "/map-img/2dairy.png",
        "Bakery": "/map-img/2bakery.png",
        "Frozen": "/map-img/2frozen.png",
        "Cereal": "/map-img/2cereal.png",
        "Choclates": "/map-img/choclates.png",
        "Crisps": "/map-img/2crisps.png",
        "Flowers": "/map-img/2flower.png",
        "Fruits": "/map-img/2fruits.png",
        "Sweets": "/map-img/2sweets.png",
        "Toys": "/map-img/2toys.png",
        "Biscuit": "/map-img/biscuit.png",
        "Electronics": "/map-img/electronics.png",
        "Clothes": "/map-img/2clothes.png",
    };

    // Determine which categoryImages to use
    let storeImage = "/map-img/1map-full.png"; // Default fallback image

    if (store === "1") {
        storeImage = categoryImages1[categoryName] || categoryImages2[categoryName] || storeImage;
    } else if (store === "2") {
        storeImage = categoryImages2[categoryName] || categoryImages1[categoryName] || storeImage;
    }

    // Track user location
    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting user location:", error);
                },
                { enableHighAccuracy: true }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    // Fetch product location from backend
    useEffect(() => {
        if (categoryName) {
            axios.get(`http://127.0.0.1:8000/api/category-location/${categoryName}/`)
                .then(response => {
                    setProductLocation(response.data);
                })
                .catch(error => {
                    console.error("Error fetching product location:", error);
                });
        }
    }, [categoryName]);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("store-map", {
                crs: L.CRS.Simple,
                minZoom: -2,
                maxZoom: 1,
            }).fitBounds(storeBounds);

            // Set correct store section image
            console.log("Adding image overlay:", process.env.PUBLIC_URL + storeImage);
            L.imageOverlay(process.env.PUBLIC_URL + storeImage, storeBounds).addTo(mapRef.current);
        }

        if (!userLocation) return;

        // 🛠 Convert real GPS coordinates to store map coordinates
        const storeX = (userLocation.lng % 1000) + 200;
        const storeY = (userLocation.lat % 1000) + 200;

        if (userMarkerRef.current) {
            mapRef.current.removeLayer(userMarkerRef.current);
        }

        // 📍 Add user location marker
        userMarkerRef.current = L.marker([storeY, storeX], {
            icon: L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
                iconSize: [30, 30],
            }),
        }).addTo(mapRef.current)
            .bindPopup("📍 You are here")
            .openPopup();

        if (productLocation) {
            // 🛠 Convert product GPS coordinates to store map coordinates
            const productX = (productLocation.lng % 1000) + 200;
            const productY = (productLocation.lat % 1000) + 200;

            if (pathRef.current) {
                mapRef.current.removeLayer(pathRef.current);
            }

            //  Draw a path from user to product
            pathRef.current = L.polyline(
                [
                    [storeY, storeX],
                    [productY, productX],
                ],
                { color: "blue", weight: 4, dashArray: "5, 10" }
            ).addTo(mapRef.current);

            setTimeout(() => {
                mapRef.current.flyTo([productY, productX], 0, { duration: 2 });
            }, 1000);
        }
    }, [userLocation, productLocation, categoryName, store]);

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Find {categoryName}</h2>
            <div id="store-map" style={{ width: "80%", height: "500px", margin: "auto" }}></div>
        </div>
    );
};

export default StoreMap;
