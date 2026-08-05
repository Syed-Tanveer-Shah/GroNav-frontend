import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DeliveryMap = ({ initialCenter, initialRadius, onSave }) => {
  const [center, setCenter] = useState(initialCenter || [33.6844, 73.0479]); // Default Islamabad
  const [radius, setRadius] = useState(initialRadius || 5000); // meters

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setCenter([e.latlng.lat, e.latlng.lng]);
      },
    });
    return center === null ? null : (
      <>
        <Marker position={center}></Marker>
        <Circle center={center} radius={radius} pathOptions={{ color: '#6aaa00', fillColor: '#6aaa00', fillOpacity: 0.2 }} />
      </>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ height: '400px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <label>Radius (km): </label>
        <input 
          type="number" 
          value={radius / 1000} 
          onChange={(e) => setRadius(e.target.value * 1000)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
        />
        <button 
          onClick={() => onSave({ center, radius: radius / 1000 })}
          style={{ padding: '10px 20px', backgroundColor: '#6aaa00', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Save Delivery Area
        </button>
      </div>
      <p style={{ fontSize: '12px', color: '#777' }}>Click on the map to set the center of your delivery zone.</p>
    </div>
  );
};

export default DeliveryMap;
