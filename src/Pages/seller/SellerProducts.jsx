import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import { fetchSellerProducts, createProduct, updateProduct, deleteProduct, bulkConfirmImport, fetchSellerCategories } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const G = '#6aaa00';
const EMPTY_FORM = { name: '', category: '', price: '', discount_percentage: '', stock: '', stock_alert_threshold: '5', description: '', expiry_date: '', featured_product: false, image: null };

// eslint-disable-next-line no-unused-vars
function inp(style) { return { width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', ...style }; }

function Modal({ title, onClose, children, isDark, cardBg, textColor, borderColor }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: cardBg, borderRadius: '16px', width: '95%', maxWidth: '660px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', border: isDark ? `1px solid ${borderColor}` : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${borderColor}`, position: 'sticky', top: 0, background: cardBg, zIndex: 1 }}>
          <h3 style={{ margin: 0, fontWeight: '800', color: textColor }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}


  const field = (label, name, form, handle, errors, inputStyle, mutedText, borderColor, type = 'text', opts = {}) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: mutedText }}>{label}</label>
      {opts.select ? (
        <select name={name} value={form[name]} onChange={handle} style={{ ...inputStyle, width: '100%', borderColor: errors[name] ? '#e53935' : borderColor }}>
          <option value="">Select...</option>
          {opts.select.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={form[name]} onChange={handle} placeholder={opts.placeholder || ''} style={{ ...inputStyle, width: '100%', borderColor: errors[name] ? '#e53935' : borderColor }} />
      )}
      {errors[name] && <span style={{ color: '#e53935', fontSize: '12px' }}>{errors[name]}</span>}
    </div>
  );

  function ProductForm({ initial, onSave, onClose, isDark, textColor, mutedText, borderColor, inputStyle }) {
    const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [categories, setCategories] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);

    useEffect(() => {
      fetchSellerCategories()
        .then(r => setCategories(r.data || []))
        .catch(() => setCategories([]))
        .finally(() => setLoadingCats(false));
    }, []);

    const handle = e => {
      const { name, value, type, checked, files } = e.target;
      setForm(p => ({
        ...p,
        [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value)
      }));
      // Clear error for this field when user types
      if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    };
    const validate = () => {
      const e = {};
      if (!form.name || !form.name.toString().trim()) e.name = 'Required';
      if (!form.category) e.category = 'Required';
      if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
      if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Valid stock required';
      return e;
    };
    const submit = async () => {
      const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
      setSaving(true);

      // Use FormData for image upload support
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'expiry_date' && val === '') return; // skip empty date
        if (key === 'image' && !val) return; // skip null image

        if (val !== null && val !== undefined && val !== '') {
          // Don't append empty strings for numeric fields
          if ((key === 'price' || key === 'stock' || key === 'discount_percentage' || key === 'stock_alert_threshold') && val === '') return;
          formData.append(key, val);
        }
      });

      // Debug logging
      console.log("=== FORM DATA SENDING ===");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      try {
        if (initial?.id) await updateProduct(initial.id, formData);
        else await createProduct(formData);
        toast.success(initial?.id ? 'Product updated!' : 'Product added!');
        onSave();
      } catch (err) {
        const data = err.response?.data;
        if (data && typeof data === 'object') {
          const fieldErrors = {};
          Object.entries(data).forEach(([k, v]) => {
            fieldErrors[k] = Array.isArray(v) ? v[0] : v;
          });
          setErrors(fieldErrors);
          toast.error('Please check the form for errors');
        } else {
          toast.error(err.response?.data?.detail || 'Save failed');
        }
      } finally { setSaving(false); }
    };

    const categoryOptions = categories.map(c => ({ value: c.name, label: c.name }));
    const f = (l, n, t = 'text', o = {}) => field(l, n, form, handle, errors, inputStyle, mutedText, borderColor, t, o);

    return (
      <>
        {!loadingCats && categories.length === 0 && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fff3e0', color: '#e65100', borderRadius: '10px', marginBottom: '16px', border: '1px solid #ffb74d', fontSize: '13px' }}>
            ⚠️ No categories yet. <NavLink to="/seller/categories" style={{ color: '#6aaa00', fontWeight: '700' }}>Add a category first →</NavLink>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          {f('Product Name *', 'name', 'text', { placeholder: 'e.g. Fresh Milk' })}
          {f('Category *', 'category', 'text', { select: categoryOptions })}
          {f('Price (Rs.) *', 'price', 'number', { placeholder: '150' })}
          {f('Discounted Price', 'discount_percentage', 'number', { placeholder: 'Discount %' })}
          {f('Stock Quantity *', 'stock', 'number', { placeholder: '50' })}
          {f('Low Stock Alert', 'stock_alert_threshold', 'number', { placeholder: '5' })}
          {f('Expiry Date', 'expiry_date', 'date')}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#555' }}>Product Image</label>
            <input type="file" name="image" onChange={handle} accept=".jpg,.jpeg,.png,.webp" style={{ fontSize: '13px' }} />
            {initial?.image && !form.image && <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Current: {initial.image.split('/').pop()}</p>}
          </div>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px' }}>
            <input type="checkbox" name="featured_product" checked={form.featured_product} onChange={handle} id="feat" style={{ width: '18px', height: '18px', accentColor: G }} />
            <label htmlFor="feat" style={{ fontWeight: '600', fontSize: '13px', color: '#555', cursor: 'pointer' }}>Featured Product</label>
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: mutedText }}>Description</label>
          <textarea name="description" value={form.description} onChange={handle} rows={3} style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Product description..." />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button onClick={onClose} style={{ padding: '11px 24px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#555' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ padding: '11px 28px', border: 'none', borderRadius: '8px', background: G, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '700', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : (initial?.id ? 'Update' : 'Add Product')}
          </button>
        </div>
      </>
    );
  }

  function BulkImportModal({ onClose, onSuccess, isDark, cardBg, textColor, mutedText, borderColor }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleFile = e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        setRows(XLSX.utils.sheet_to_json(ws));
      };
      reader.readAsBinaryString(file);
    };
    const confirm = async () => {
      if (!rows.length) return;
      setLoading(true);
      try {
        // Send all rows to backend
        const res = await bulkConfirmImport(rows);
        toast.success(`${res.data.created} products added, ${res.data.updated} updated!`);
        onSuccess();
        onClose();
      } catch (err) {
        console.log(err.response?.data);
        toast.error('Import failed: ' + JSON.stringify(err.response?.data));
      } finally {
        setLoading(false);
      }
    };
    const downloadTemplate = () => {
      const ws = XLSX.utils.json_to_sheet([{ name: 'Example Product', category: 'Dairy & Eggs', price: 150, stock: 50, description: '', expiry_date: '' }]);
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Products');
      XLSX.writeFile(wb, 'cartgo_products_template.xlsx');
    };
    return (
      <Modal title="📥 Bulk Import Products" onClose={onClose} isDark={isDark} cardBg={cardBg} textColor={textColor} borderColor={borderColor}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ padding: '10px 18px', border: `1px dashed ${G}`, borderRadius: '8px', cursor: 'pointer', color: G, fontWeight: '600', fontSize: '13px' }}>
            📂 Choose File (.xlsx / .csv)
            <input type="file" accept=".xlsx,.csv" onChange={handleFile} style={{ display: 'none' }} />
          </label>
          <button onClick={downloadTemplate} style={{ padding: '10px 18px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: isDark ? '#2a3a2a' : '#f9f9f9', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: textColor }}>⬇ Download Template</button>
        </div>
        {rows.length > 0 && (
          <>
            <p style={{ color: G, fontWeight: '700', marginBottom: '10px' }}>Preview: {rows.length} products</p>
            <div style={{ overflowX: 'auto', marginBottom: '20px', border: `1px solid ${borderColor}`, borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ backgroundColor: isDark ? '#1a2a1a' : '#f9f9f9' }}>{Object.keys(rows[0]).map(k => <th key={k} style={{ padding: '10px 12px', textAlign: 'left', color: textColor, fontWeight: '700', borderBottom: `1px solid ${borderColor}` }}>{k}</th>)}</tr></thead>
                <tbody>{rows.slice(0, 5).map((r, i) => <tr key={i} style={{ borderBottom: `1px solid ${borderColor}` }}>{Object.values(r).map((v, j) => <td key={j} style={{ padding: '8px 12px', color: textColor }}>{String(v)}</td>)}</tr>)}</tbody>
              </table>
            </div>
            {rows.length > 5 && <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>...and {rows.length - 5} more rows</p>}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '11px 24px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#555' }}>Cancel</button>
          <button onClick={confirm} disabled={loading || !rows.length} style={{ padding: '11px 28px', border: 'none', borderRadius: '8px', background: G, color: '#fff', cursor: (!loading && rows.length) ? 'pointer' : 'not-allowed', fontWeight: '700', opacity: (!loading && rows.length) ? 1 : 0.5 }}>
            {loading ? 'Importing...' : 'Confirm Import'}
          </button>
        </div>
      </Modal>
    );
  }

  export default function SellerProducts() {
    const { theme } = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [modal, setModal] = useState(null); // null | 'add' | {product}
    const [showBulk, setShowBulk] = useState(false);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    const isDark = theme === 'dark-pro';
    const cardBg = isDark ? '#1e2e1e' : '#fff';
    const textColor = isDark ? '#e0ffe0' : '#222';
    const mutedText = isDark ? '#8fa88f' : '#888';
    const borderColor = isDark ? '#2a3a2a' : '#eee';
    const inputStyle = { padding: '10px 14px', border: `1px solid ${borderColor}`, background: isDark ? '#1a2a1a' : '#fff', color: textColor, borderRadius: '8px', fontSize: '14px', outline: 'none' };

    const load = useCallback(async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetchSellerProducts(),
          fetchSellerCategories()
        ]);
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      }
      catch {
        setProducts([{ id: 1, name: 'Fresh Milk', category_name: 'Dairy & Eggs', price: 150, stock: 2, stock_alert_threshold: 5, expiry_date: null, avg_rating: 4.2, total_views: 120, is_low_stock: true }, { id: 2, name: 'Bread', category_name: 'Bakery', price: 80, stock: 30, stock_alert_threshold: 5, expiry_date: null, avg_rating: 4.8, total_views: 80, is_low_stock: false }]);
        setCategories([]);
      }
      finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleExport = () => {
      if (!products.length) {
        toast.error('No products to export');
        return;
      }
      const exportData = products.map(p => ({
        name: p.name,
        category: p.category_name || p.category,
        price: p.price,
        stock: p.stock,
        description: p.description || '',
        expiry_date: p.expiry_date || '',
        discount_percentage: p.discount_percentage || '',
        featured_product: p.featured_product ? 'true' : 'false'
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      XLSX.writeFile(wb, `${new Date().toISOString().split('T')[0]}_products.xlsx`);
      toast.success('Products exported!');
    };

    const handleDelete = async (id) => {
      if (!window.confirm('Delete this product?')) return;
      try { await deleteProduct(id); toast.success('Product deleted'); load(); } catch { toast.error('Delete failed'); }
    };

    const handleDeleteAll = async () => {
      if (!products.length) return toast.error('No products to delete');
      if (!window.confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) return;
      setLoading(true);
      try {
        await Promise.all(products.map(p => deleteProduct(p.id)));
        toast.success('All products deleted successfully');
        load();
      } catch {
        toast.error('Failed to delete some products');
      } finally {
        setLoading(false);
      }
    };

    const isExpiringSoon = (dateStr) => {
      if (!dateStr) return false;
      const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    };
    const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();

    const filtered = products.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = !catFilter || p.category_name === catFilter;
      return matchSearch && matchCat;
    });
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const lowStock = products.filter(p => p.is_low_stock || (p.stock <= (p.stock_alert_threshold || 5)));

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: textColor }}>Products</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDeleteAll} style={{ padding: '10px 18px', border: '1px solid #d32f2f', color: '#d32f2f', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>🗑️ Delete All Products</button>
            <button onClick={handleExport} style={{ padding: '10px 18px', border: `1px solid ${G}`, color: G, background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>📤 Export Excel</button>
            <button onClick={() => setShowBulk(true)} style={{ padding: '10px 18px', border: `1px solid ${G}`, color: G, background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>📥 Bulk Import</button>
            <button onClick={() => setModal('add')} style={{ padding: '10px 18px', border: 'none', background: G, color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>+ Add Product</button>
          </div>
        </div>

        {/* Low stock warning */}
        {lowStock.length > 0 && (
          <div style={{ padding: '14px 18px', backgroundColor: '#fff3e0', color: '#e65100', borderRadius: '10px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #ffb74d', fontWeight: '600', fontSize: '14px' }}>
            ⚠️ {lowStock.length} product{lowStock.length > 1 ? 's are' : ' is'} running low on stock!
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="🔍 Search products..." style={{ ...inputStyle, flex: '1', minWidth: '200px' }} />
          <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, minWidth: '180px' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: cardBg, borderRadius: '14px', boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.06)', border: isDark ? `1px solid ${borderColor}` : 'none', overflow: 'hidden' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '60px', color: '#bbb' }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px', color: '#bbb' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <p style={{ fontWeight: '600', fontSize: '16px' }}>No products found</p>
              <p style={{ fontSize: '14px' }}>Try adjusting your search or add a new product</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: isDark ? '#1a2a1a' : '#f9fbf4' }}>
                    {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Expiry', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontWeight: '700', color: textColor, fontSize: '13px', borderBottom: `2px solid ${borderColor}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(p => {
                    const expiring = isExpiringSoon(p.expiry_date);
                    const expired = isExpired(p.expiry_date);
                    const lowSt = p.is_low_stock || (p.stock <= (p.stock_alert_threshold || 5));
                    return (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${borderColor}`, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#1a2a1a' : '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {p.image ? <img src={p.image} alt={p.name} style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '8px' }} /> : <div style={{ width: '38px', height: '38px', backgroundColor: isDark ? '#2a3a2a' : '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📦</div>}


                            <span style={{ fontWeight: '600', color: textColor, fontSize: '14px' }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: '13px', color: mutedText }}>{p.category_name}</td>
                        <td style={{ padding: '13px 16px', fontWeight: '700', color: textColor, fontSize: '14px' }}>Rs. {p.price}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontWeight: '700', color: lowSt ? '#e53935' : textColor, fontSize: '14px' }}>{p.stock}</span>
                          {lowSt && <span style={{ marginLeft: '6px', fontSize: '10px', backgroundColor: '#ffebee', color: '#e53935', padding: '2px 6px', borderRadius: '10px', fontWeight: '700' }}>LOW</span>}
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: '13px', color: mutedText }}>
                          ⭐ {p.avg_rating || 0}
                          <span style={{fontSize:'11px', color:'#aaa', marginLeft:'4px'}}>
                            ({p.review_count || 0})
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          {p.expiry_date ? (
                            <span style={{ fontWeight: '600', fontSize: '12px', color: expired ? '#e53935' : expiring ? '#ff8f00' : textColor, backgroundColor: expired ? '#ffebee' : expiring ? '#fff3e0' : 'transparent', padding: (expired || expiring) ? '3px 8px' : '0', borderRadius: '10px' }}>
                              {expired ? '❌ Expired' : expiring ? `⚠️ ${p.expiry_date}` : p.expiry_date}
                            </span>
                          ) : <span style={{ color: isDark ? '#3a4a3a' : '#ccc', fontSize: '12px' }}>—</span>}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setModal(p)} style={{ padding: '6px 14px', border: `1px solid #1976d2`, borderRadius: '6px', background: 'transparent', color: '#1976d2', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Edit</button>
                            <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 14px', border: `1px solid #e53935`, borderRadius: '6px', background: 'transparent', color: '#e53935', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '16px', borderTop: '1px solid #eee' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '7px 16px', border: '1px solid #ddd', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: '#fff', color: '#555', fontWeight: '600', opacity: page === 1 ? 0.5 : 1 }}>←</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)} style={{ padding: '7px 14px', border: `1px solid ${n === page ? G : '#ddd'}`, borderRadius: '6px', cursor: 'pointer', background: n === page ? G : '#fff', color: n === page ? '#fff' : '#555', fontWeight: '700', minWidth: '36px' }}>{n}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '7px 16px', border: '1px solid #ddd', borderRadius: '6px', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: '#fff', color: '#555', fontWeight: '600', opacity: page === totalPages ? 0.5 : 1 }}>→</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {modal && (
          <Modal title={modal === 'add' ? '+ Add Product' : `✏️ Edit: ${modal.name}`} onClose={() => setModal(null)} isDark={isDark} cardBg={cardBg} textColor={textColor} borderColor={borderColor}>
            <ProductForm initial={modal === 'add' ? null : modal} onSave={() => { setModal(null); load(); }} onClose={() => setModal(null)} isDark={isDark} textColor={textColor} mutedText={mutedText} borderColor={borderColor} inputStyle={inputStyle} />
          </Modal>
        )}
        {showBulk && <BulkImportModal onClose={() => setShowBulk(false)} onSuccess={load} isDark={isDark} cardBg={cardBg} textColor={textColor} mutedText={mutedText} borderColor={borderColor} />}
      </div>
    );
  }
