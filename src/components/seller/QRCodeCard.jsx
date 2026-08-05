import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeCard = ({ storeUrl }) => {
  const downloadQR = () => {
    const svg = document.getElementById("store-qr-code");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "Store_QRCode.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0 }}>Store QR Code</h3>
      <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '10px', marginBottom: '15px' }}>
        <QRCodeSVG id="store-qr-code" value={storeUrl} size={150} fgColor="#6aaa00" />
      </div>
      <p style={{ fontSize: '12px', color: '#777', textAlign: 'center', marginBottom: '15px' }}>Print this QR code for your physical store or share it online.</p>
      <button onClick={downloadQR} style={{ padding: '8px 16px', backgroundColor: '#6aaa00', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Download PNG
      </button>
    </div>
  );
};

export default QRCodeCard;
