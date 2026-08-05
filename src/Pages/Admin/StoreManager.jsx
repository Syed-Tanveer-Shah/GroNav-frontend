import { useEffect, useState } from "react";
import "./admin.css";
import api from "../../Utils/Axios";
import { toast } from "react-toastify";

const defaultForm = {
    name: "",
    phone: "",
    address: "",
    status: "Open"
};

const StoreManager = () => {
    const [stores, setStores] = useState([]);
    const [formData, setFormData] = useState(defaultForm);
    const [editingStore, setEditingStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get("/api/admin/stores/");
            setStores(data);
        } catch (err) {
            setError("Unable to load stores. Please ensure you are signed in.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(defaultForm);
        setEditingStore(null);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        const payload = { ...formData };

        try {
            if (editingStore) {
                await api.put(`/api/admin/stores/${editingStore.id}/`, payload);
                toast.success("Store updated");
            } else {
                await api.post("/api/admin/stores/", payload);
                toast.success("Store created");
            }
            resetForm();
            await fetchStores();
        } catch (err) {
            const message = err.response?.data
                ? Object.values(err.response.data).flat().join(" ")
                : "Unable to save store";
            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (store) => {
        setEditingStore(store);
        setFormData({
            name: store.name || "",
            phone: store.phone || "",
            address: store.address || "",
            status: store.status || "Open",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (storeId) => {
        if (!window.confirm("Delete this branch? This action cannot be undone.")) {
            return;
        }
        try {
            await api.delete(`/api/admin/stores/${storeId}/`);
            toast.success("Store deleted");
            if (editingStore?.id === storeId) {
                resetForm();
            }
            await fetchStores();
        } catch (err) {
            toast.error("Failed to delete store");
        }
    };

    return (
        <div className="admin-grid">
            <section className="panel">
                <div className="panel-header">
                    <div>
                        <p className="admin-kicker">Stores</p>
                        <h2>{editingStore ? "Update Store" : "Register Store / Branch"}</h2>
                    </div>
                    {editingStore && (
                        <button className="secondary-btn" onClick={resetForm}>
                            Cancel edit
                        </button>
                    )}
                </div>
                {error && <div className="error-state">{error}</div>}
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-control">
                        <label htmlFor="name">Store / Branch name</label>
                        <input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. City Center"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label htmlFor="phone">Contact number</label>
                        <input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (000) 000-0000"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label htmlFor="status">Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange}>
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div className="form-control" style={{ gridColumn: "1 / -1" }}>
                        <label htmlFor="address">Address / Coverage area</label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Street, City, Region"
                        />
                    </div>
                    <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
                        <button type="button" className="secondary-btn" onClick={resetForm}>
                            Clear
                        </button>
                        <button type="submit" className="primary-btn" disabled={saving}>
                            {saving ? "Saving..." : editingStore ? "Save changes" : "Add store"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <p className="admin-kicker">All branches</p>
                        <h2>Store Directory</h2>
                    </div>
                    <span className="pill">{stores.length} locations</span>
                </div>

                {loading ? (
                    <div className="loading-state">Loading branches…</div>
                ) : stores.length === 0 ? (
                    <div className="empty-state">
                        <p>No stores registered yet.</p>
                    </div>
                ) : (
                    <table className="list">
                        <thead>
                            <tr>
                                <th>Store</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store.id}>
                                    <td>
                                        <strong>{store.name}</strong>
                                        <p className="subtle-text">{store.address}</p>
                                    </td>
                                    <td>{store.phone || "—"}</td>
                                    <td>
                                        <span className={`tag ${store.status === "Open" ? "success" : "warning"}`}>
                                            {store.status}
                                        </span>
                                    </td>
                                    <td>{store.created_at ? new Date(store.created_at).toLocaleDateString() : "—"}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="table-btn primary" onClick={() => handleEdit(store)}>
                                                Edit
                                            </button>
                                            <button className="table-btn danger" onClick={() => handleDelete(store.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default StoreManager;
