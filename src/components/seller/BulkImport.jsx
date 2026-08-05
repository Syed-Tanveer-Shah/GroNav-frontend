import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../../Utils/Axios';

const BulkImport = ({ onClose, onSuccess }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const parsedData = XLSX.utils.sheet_to_json(ws);
      setData(parsedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post('/api/seller/products/bulk-confirm/', { products: data });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Import failed. Please check the data format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '80%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h2>Bulk Import Products</h2>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} />
          <a href="/api/seller/products/template/" download style={{ color: '#6aaa00', textDecoration: 'none', fontWeight: 'bold' }}>Download Template</a>
        </div>
        
        {data.length > 0 && (
          <>
            <h3>Preview ({data.length} products)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                  {Object.keys(data[0]).map((key) => <th key={key} style={{ padding: '8px', border: '1px solid #ddd' }}>{key}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => <td key={j} style={{ padding: '8px', border: '1px solid #ddd' }}>{val}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 5 && <p>... and {data.length - 5} more rows.</p>}
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#fff' }}>Cancel</button>
          <button onClick={handleConfirm} disabled={loading || data.length === 0} style={{ padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#6aaa00', color: '#fff' }}>
            {loading ? 'Importing...' : 'Confirm Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;
