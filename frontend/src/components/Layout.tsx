import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Layout.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const { items } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="nav-brand">Sweet Shop</div>
                <div className="nav-links">
                    {user ? (
                        <>
                            <Link to="/sweets">Sweets</Link>
                            {// @ts-ignore
                                user.role !== 'admin' && (
                                    <Link to="/cart">
                                        Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                    </Link>
                                )}
                            <Link to="/orders">Orders</Link>
                            {// @ts-ignore
                                user.role === 'admin' && <span className="badge">Admin</span>}
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </nav>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
