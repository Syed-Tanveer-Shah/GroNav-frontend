import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  fetchSellerCategories,
  createSellerCategory,
  updateSellerCategory,
  deleteSellerCategory,
} from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const G = '#6aaa00';

/* ── helpers ── */
function initials(name) {
  return (name || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');
}

/* ── Category Card ── */
function CategoryCard({ cat, onEdit, onDelete, isDark, cardBg, textColor, mutedText, borderColor }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: cardBg,
        borderRadius: '16px',
        padding: '24px 16px',
        boxShadow: hovered ? (isDark ? '0 8px 32px rgba(106,170,0,0.2)' : '0 8px 32px rgba(106,170,0,0.18)') : (isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.07)'),
        border: hovered ? `1px solid ${G}` : `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        position: 'relative',
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Action buttons */}
      {hovered && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onEdit(cat)}
            title="Edit"
            style={{
              width: '30px', height: '30px', border: 'none', borderRadius: '8px',
              background: isDark ? '#0d47a1' : '#e3f2fd', color: isDark ? '#e3f2fd' : '#1976d2', cursor: 'pointer',
              fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✏️</button>
          <button
            onClick={() => onDelete(cat)}
            title="Delete"
            style={{
              width: '30px', height: '30px', border: 'none', borderRadius: '8px',
              background: '#ffebee', color: '#e53935', cursor: 'pointer',
              fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >🗑️</button>
        </div>
      )}

      {/* Circle image */}
      {cat.image_url
        ? <img src={cat.image_url} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${G}` }} />


        : (
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${G}, #4d8a00)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '800', fontSize: '22px',
            border: `3px solid ${G}`,
          }}>
            {initials(cat.name)}
          </div>
        )
      }

      {/* Name */}
      <div style={{ fontWeight: '700', fontSize: '14px', color: textColor, textAlign: 'center' }}>{cat.name}</div>

      {/* Product count badge */}
      <span style={{
        backgroundColor: 'rgba(106,170,0,0.12)', color: G,
        padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
      }}>
        {cat.product_count} product{cat.product_count !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

/* ── Modal ── */
function CategoryModal({ mode, initial, onClose, onSaved, isDark, cardBg, textColor, mutedText, borderColor }) {
  const [name, setName] = useState(initial?.name || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.image_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleImage = e => {
    const f = e.target.files[0];
    if (f) {
      setImageFile(f);
      setImagePreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Category name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      if (imageFile) fd.append('image', imageFile);
      if (mode === 'edit') {
        await updateSellerCategory(initial.id, fd);
        toast.success('Category updated!');
      } else {
        await createSellerCategory(fd);
        toast.success('Category created!');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Save failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: cardBg, borderRadius: '18px', width: '95%', maxWidth: '440px', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', overflow: 'hidden', border: isDark ? `1px solid ${borderColor}` : 'none' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${borderColor}` }}>
          <h3 style={{ margin: 0, fontWeight: '800', color: textColor }}>{mode === 'edit' ? '✏️ Edit Category' : '+ New Category'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: mutedText }}>×</button>
        </div>

        <div style={{ padding: '28px 24px' }}>
          {/* Circular image picker */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', gap: '10px' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100px', height: '100px', borderRadius: '50%', cursor: 'pointer',
                background: imagePreview ? 'transparent' : `linear-gradient(135deg, ${G}, #4d8a00)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `3px solid ${G}`, overflow: 'hidden', position: 'relative',
              }}
            >
              {imagePreview
                ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />


                : <span style={{ color: '#fff', fontSize: '28px', fontWeight: '800' }}>{initials(name) || '📷'}</span>
              }
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ color: '#fff', fontSize: '20px' }}>📷</span>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#888' }}>Click to change photo</span>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          </div>

          {/* Name input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: mutedText }}>Category Name *</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Dairy & Eggs"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${error ? '#e53935' : borderColor}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: isDark ? '#1a2a1a' : '#fff', color: textColor }}
            />
            {error && <span style={{ color: '#e53935', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '11px 22px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#555' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '11px 28px', border: 'none', borderRadius: '8px', background: G, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '700', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ── */
function DeleteModal({ cat, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSellerCategory(cat.id);
      toast.success('Category deleted');
      onDeleted();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: '18px', width: '95%', maxWidth: '400px', padding: '32px 28px', boxShadow: '0 30px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: '36px', textAlign: 'center', marginBottom: '12px' }}>🗑️</div>
        <h3 style={{ margin: '0 0 10px', textAlign: 'center', fontWeight: '800', color: '#222' }}>Delete "{cat.name}"?</h3>
        {cat.product_count > 0 && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fff3e0', color: '#e65100', borderRadius: '10px', marginBottom: '16px', border: '1px solid #ffb74d', fontSize: '13px', textAlign: 'center' }}>
            ⚠️ This category has <strong>{cat.product_count}</strong> product{cat.product_count !== 1 ? 's' : ''}. Deleting it will uncategorize them.
          </div>
        )}
        <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onClose} style={{ padding: '11px 26px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#555' }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: '11px 26px', border: 'none', borderRadius: '8px', background: '#e53935', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: '700', opacity: deleting ? 0.7 : 1 }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SellerCategories() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);   // null | 'add' | { mode:'edit', cat }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const isDark = theme === 'dark-pro';
  const cardBg = isDark ? '#1e2e1e' : '#fff';
  const textColor = isDark ? '#e0ffe0' : '#222';
  const mutedText = isDark ? '#8fa88f' : '#888';
  const borderColor = isDark ? '#2a3a2a' : '#eee';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchSellerCategories();
      setCategories(r.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = () => { setModal(null); load(); };
  const handleDeleted = () => { setDeleteTarget(null); load(); };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: '800', fontSize: '22px', color: textColor }}>🏷️ My Categories</h2>
          <p style={{ margin: '4px 0 0', color: mutedText, fontSize: '14px' }}>{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button
          onClick={() => setModal('add')}
          style={{ padding: '11px 22px', border: 'none', background: G, color: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(106,170,0,0.35)' }}
        >
          + Add Category
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '22px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search categories..."
          style={{ padding: '10px 16px', border: `1px solid ${borderColor}`, background: isDark ? '#1a2a1a' : '#fff', color: textColor, borderRadius: '10px', fontSize: '14px', width: '100%', maxWidth: '360px', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '70px', color: '#bbb' }}>
          <div style={{ fontSize: '40px', marginBottom: '14px' }}>⏳</div>
          <p style={{ fontWeight: '600' }}>Loading categories...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px', color: '#bbb' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🏷️</div>
          <p style={{ fontWeight: '700', fontSize: '16px', color: '#555' }}>
            {search ? 'No categories match your search' : 'No categories yet'}
          </p>
          {!search && (
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>Create your first category to organize your products</p>
          )}
          {!search && (
            <button
              onClick={() => setModal('add')}
              style={{ padding: '12px 28px', border: 'none', background: G, color: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
            >
              + Create Category
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '20px' }}>
          {filtered.map(cat => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              onEdit={c => setModal({ mode: 'edit', cat: c })}
              onDelete={c => setDeleteTarget(c)}
              isDark={isDark}
              cardBg={cardBg}
              textColor={textColor}
              mutedText={mutedText}
              borderColor={borderColor}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === 'add' && (
        <CategoryModal mode="add" initial={null} onClose={() => setModal(null)} onSaved={handleSaved} isDark={isDark} cardBg={cardBg} textColor={textColor} mutedText={mutedText} borderColor={borderColor} />
      )}
      {modal && modal !== 'add' && (
        <CategoryModal mode="edit" initial={modal.cat} onClose={() => setModal(null)} onSaved={handleSaved} isDark={isDark} cardBg={cardBg} textColor={textColor} mutedText={mutedText} borderColor={borderColor} />
      )}
      {deleteTarget && (
        <DeleteModal cat={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
