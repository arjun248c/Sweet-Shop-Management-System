import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; // Reusing dashboard styles

interface OrderItem {
    id: number;
    sweet_id: number;
    sweet_name: string;
    quantity: number;
    price_at_purchase: number;
}

interface Order {
    id: number;
    user_id: number;
    username?: string;
    total_amount: number;
    created_at: string;
    items: OrderItem[];
}

const Orders = () => {
    const { token, user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading orders...</div>;
    if (error) return <div className="auth-error">{error}</div>;

    return (
        <div className="dashboard-container" style={{ maxWidth: '900px' }}>
            <h1 className="dashboard-title">
                {/* @ts-ignore */}
                {user?.role === 'admin' ? 'All Sales' : 'My Orders'}
            </h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#ccc' }}>No orders found.</div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map(order => (
                        <div key={order.id} className="auth-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{order.id}</span>
                                    <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                        {new Date(order.created_at).toLocaleString()}
                                    </div>
                                    {/* @ts-ignore */}
                                    {user?.role === 'admin' && (
                                        <div style={{ fontSize: '0.9rem', color: '#4facfe' }}>User: {order.username}</div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: '#00f260' }}>
                                    ${order.total_amount.toFixed(2)}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {order.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                        <span>
                                            {item.quantity}x {item.sweet_name}
                                            <span style={{ color: '#aaa', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                                (@ ${item.price_at_purchase})
                                            </span>
                                        </span>
                                        <span>${(item.quantity * item.price_at_purchase).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
