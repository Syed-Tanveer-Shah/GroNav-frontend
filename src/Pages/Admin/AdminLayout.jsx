import {NavLink, Outlet} from "react-router-dom";
import {useMemo} from "react";
import "./admin.css";

const AdminLayout = () => {
    const navItems = useMemo(() => ([
        {label: "Overview", to: "/admin"},
        {label: "Stores", to: "/admin/stores"},
        {label: "Inventory", to: "/admin/inventory"},
    ]), []);

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-accent">PNL</span>
                    <span className="brand-name">Admin</span>
                </div>
                <div className="sidebar-section">
                    <p className="sidebar-section-title">Management</p>
                    <nav>
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/admin"}
                                className={({isActive}) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <div className="sidebar-footer">
                    <p className="sidebar-hint">Need help?</p>
                    <button className="sidebar-support-btn">Contact Support</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <p className="admin-kicker">Product Navigator & Locator</p>
                        <h1>Admin Dashboard</h1>
                    </div>
                    <div className="admin-topbar-actions">
                        <input
                            type="search"
                            placeholder="Search stores, inventory..."
                            className="admin-search"
                        />
                        <button className="primary-btn ghost">Notifications</button>
                        <div className="admin-avatar">AD</div>
                    </div>
                </header>
                <section className="admin-content">
                    <Outlet/>
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;

