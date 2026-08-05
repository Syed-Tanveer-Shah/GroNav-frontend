import { useEffect, useMemo, useState } from "react";
import "./admin.css";
import api from "../../Utils/Axios";

const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get("/api/admin/dashboard/");
                if (!isMounted) return;
                setStats(data.stats);
                setRecentActivity(data.recent_activity || []);
            } catch (err) {
                if (!isMounted) return;
                setError("Unable to load dashboard data.");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboardData();
        return () => {
            isMounted = false;
        };
    }, []);

    const statCards = useMemo(() => {
        if (!stats) {
            return [
                { label: "Active Stores", value: 0, trend: "—" },
                { label: "Inventory Items", value: 0, trend: "—" },
                { label: "Low Stock", value: 0, trend: "—" },
                { label: "Total Stores", value: 0, trend: "—" },
            ];
        }

        return [
            {
                label: "Active Stores",
                value: stats.active_stores,
                trend: `${stats.total_stores} total`,
            },
            {
                label: "Inventory Items",
                value: stats.inventory_items,
                trend: "Across all stores",
            },
            {
                label: "Low Stock",
                value: stats.low_stock_items,
                trend: "Need restock",
            },
            {
                label: "Total Stores",
                value: stats.total_stores,
                trend: "Including inactive",
            },
        ];
    }, [stats]);

    return (
        <>
            <section className="panel stats-grid">
                {statCards.map(stat => (
                    <article key={stat.label} className="stat-card">
                        <h3>{stat.label}</h3>
                        <p className="stat-value">{stat.value}</p>
                        <p className="stat-trend">{stat.trend}</p>
                    </article>
                ))}
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <p className="admin-kicker">Workflows</p>
                        <h2>Quick Actions</h2>
                    </div>
                    <button className="primary-btn">Create Task</button>
                </div>
                <div className="quick-actions">
                    <button className="chip">Register New Store</button>
                    <button className="chip">Schedule Stock Count</button>
                    <button className="chip">Approve Transfer</button>
                    <button className="chip">Download Report</button>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <p className="admin-kicker">Updates</p>
                        <h2>Recent Activity</h2>
                    </div>
                    <span className="pill">Live feed</span>
                </div>
                {loading ? (
                    <div className="loading-state">Loading activity…</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : (
                    <table className="list">
                        <thead>
                            <tr>
                                <th>Store</th>
                                <th>Product</th>
                                <th>Stock</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="empty-state">
                                            <p>No recent inventory updates.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                recentActivity.map(activity => (
                                    <tr key={`${activity.id}-${activity.updated_at}`}>
                                        <td>{activity.store}</td>
                                        <td>{activity.product}</td>
                                        <td>{activity.stock}</td>
                                        <td>
                                            <span className={`tag ${activity.status === "Low stock" ? "warning" : "info"}`}>
                                                {activity.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </section>
        </>
    );
};

export default AdminOverview;

