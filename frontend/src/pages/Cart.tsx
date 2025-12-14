import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; // Reusing dashboard styles for consistency

const Cart = () => {
    const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (items.length === 0) return;

        try {
            const payload = {
                items: items.map(item => ({ sweetId: item.sweetId, quantity: item.quantity }))
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Checkout failed');
            }

            clearCart();
            alert('Order placed successfully!');
            navigate('/sweets');
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (items.length === 0) {
        return (
            <div className="dashboard-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2>Your cart is empty</h2>
                <button
                    className="btn-buy"
                    style={{ marginTop: '1rem', width: 'auto' }}
                    onClick={() => navigate('/sweets')}
                >
                    Browse Sweets
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ maxWidth: '800px' }}>
            <h1 className="dashboard-title">Shopping Cart</h1>

            <div className="auth-card" style={{ padding: '0', overflow: 'hidden', color: '#333' }}>
                {items.map(item => (
                    <div key={item.sweetId} style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0 }}>{item.name}</h3>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>${item.price} each</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    className="btn-buy"
                                    style={{ padding: '0.2rem 0.6rem', margin: 0 }}
                                    onClick={() => updateQuantity(item.sweetId, Math.max(1, item.quantity - 1))}
                                >
                                    -
                                </button>
                                <span style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                <button
                                    className="btn-buy"
                                    style={{ padding: '0.2rem 0.6rem', margin: 0 }}
                                    onClick={() => updateQuantity(item.sweetId, item.quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div style={{ fontWeight: 'bold', width: '80px', textAlign: 'right' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button
                                className="auth-button"
                                style={{ background: '#ff4d4d', margin: 0, padding: '0.5rem', width: 'auto' }}
                                onClick={() => removeFromCart(item.sweetId)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}

                <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <button className="auth-button" onClick={handleCheckout}>
                        Confirm Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
