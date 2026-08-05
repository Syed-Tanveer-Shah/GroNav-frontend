import { useEffect, useMemo, useState } from "react";
import "./admin.css";
import api from "../../Utils/Axios";
import { toast } from "react-toastify";

const defaultForm = {
    name: "",
    category: "",
    price: "",
    stock: "",
    discount_percentage: "",
    discount_active: false,
};

const InventoryManager = () => {
    const [stores, setStores] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedStore, setSelectedStore] = useState("");
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState(defaultForm);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [inventoryError, setInventoryError] = useState(null);
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        const bootstrap = async () => {
            await Promise.all([fetchStores(), fetchCategories()]);
        };
        bootstrap();
    }, []);

    useEffect(() => {
        if (selectedStore) {
            fetchInventory(selectedStore);
        }
    }, [selectedStore]);

    const fetchStores = async () => {
        try {
            const { data } = await api.get("/api/admin/stores/");
            setStores(data);
            if (data.length && !selectedStore) {
                setSelectedStore(String(data[0].id));
            }
        } catch (err) {
            setInventoryError("Unable to load stores.");
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get("/api/categories/");
            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchInventory = async (branchId) => {
        setLoading(true);
        setInventoryError(null);
        try {
            const { data } = await api.get(`/api/admin/inventory/?store=${branchId}`);
            setItems(data);
        } catch (err) {
            setInventoryError("Unable to load inventory.");
        } finally {
            setLoading(false);
        }
    };

    const handleStoreChange = (event) => {
        setSelectedStore(event.target.value);
        setEditingItem(null);
        setFormData(defaultForm);
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedStore) {
            toast.error("Select a store first.");
            return;
        }
        setSaving(true);
        setFormError(null);

        const payload = {
            name: formData.name,
            category: formData.category || null,
            store: Number(selectedStore),
            price: Number(formData.price || 0),
            stock: Number(formData.stock || 0),
            discount_percentage: formData.discount_percentage === "" ? null : Number(formData.discount_percentage),
            discount_active: formData.discount_active,
            featured_product: false,
        };

        try {
            if (editingItem) {
                await api.put(`/api/admin/inventory/${editingItem.id}/`, payload);
                toast.success("Item updated.");
            } else {
                await api.post("/api/admin/inventory/", payload);
                toast.success("Item added.");
            }
            setFormData(defaultForm);
            setEditingItem(null);
            await fetchInventory(selectedStore);
        } catch (err) {
            const message = err.response?.data
                ? Object.values(err.response.data).flat().join(" ")
                : "Unable to save item.";
            setFormError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            category: item.category || "",
            price: item.price,
            stock: item.stock,
            discount_percentage: item.discount_percentage || "",
            discount_active: item.discount_active,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm("Delete this inventory item?")) {
            return;
        }
        try {
            await api.delete(`/api/admin/inventory/${itemId}/`);
            toast.success("Item deleted.");
            if (editingItem?.id === itemId) {
                setEditingItem(null);
                setFormData(defaultForm);
            }
            await fetchInventory(selectedStore);
        } catch (err) {
            toast.error("Unable to delete item.");
        }
    };

    const selectedStoreName = useMemo(() => {
        const store = stores.find(store => String(store.id) === String(selectedStore));
        return store ? store.name : "Select store";
    }, [stores, selectedStore]);

    return (
        <div className="admin-grid">
            <section className="panel">
                <div className="panel-header">
                    <div>
                        <p className="admin-kicker">Inventory</p>
                        <h2>Stock per Store</h2>
                    </div>
                    <select className="admin-search" value={selectedStore} onChange={handleStoreChange}>
                        <option value="" disabled>Select a store</option>
                        {stores.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="loading-state">Loading inventory…</div>
                ) : inventoryError ? (
                    <div className="error-state">{inventoryError}</div>
                ) : (
                    <table className="list">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <p>No items recorded for this store.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <strong>{item.name}</strong>
                                            <p className="subtle-text">{item.store_name}</p>
                                        </td>
                                        <td>{item.category_name || "—"}</td>
                                        <td>${Number(item.price).toFixed(2)}</td>
                                        <td>{item.stock}</td>
                                        <td>
                                            <span className={`tag ${item.stock <= 20 ? "warning" : "success"}`}>
                                                {item.stock <= 20 ? "Low stock" : "Stocked"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="table-btn primary" onClick={() => handleEdit(item)}>
                                                    Edit
                                                </button>
                                                <button className="table-btn danger" onClick={() => handleDelete(item.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <p className="admin-kicker">Add Item</p>
                        <h2>{editingItem ? "Update Inventory Item" : "Create Inventory Item"}</h2>
                    </div>
                    <span className="pill">Store: {selectedStoreName}</span>
                </div>
                {formError && <div className="error-state">{formError}</div>}
                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label htmlFor="name">Product name</label>
                        <input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Product title"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-control">
                        <label htmlFor="price">Price</label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label htmlFor="stock">Quantity</label>
                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            min="0"
                            value={formData.stock}
                            onChange={handleInputChange}
                            placeholder="0"
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label htmlFor="discount_percentage">Discount (%)</label>
                        <input
                            id="discount_percentage"
                            name="discount_percentage"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discount_percentage}
                            onChange={handleInputChange}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-control checkbox-control">
                        <label htmlFor="discount_active">
                            <input
                                type="checkbox"
                                id="discount_active"
                                name="discount_active"
                                checked={formData.discount_active}
                                onChange={handleInputChange}
                            />
                            Discount active
                        </label>
                    </div>
                    <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
                        <button type="button" className="secondary-btn" onClick={() => {
                            setFormData(defaultForm);
                            setEditingItem(null);
                        }}>
                            Clear
                        </button>
                        <button type="submit" className="primary-btn" disabled={saving}>
                            {saving ? "Saving..." : editingItem ? "Save changes" : "Save Item"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default InventoryManager;

