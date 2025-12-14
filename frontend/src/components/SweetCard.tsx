import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './SweetCard.css';

interface Sweet {
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
}

interface SweetCardProps {
    sweet: Sweet;
    onRestock?: (id: number, quantity: number) => Promise<void>;
}

const SweetCard = ({ sweet, onRestock }: SweetCardProps) => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Admin Restock State
    const [isRestocking, setIsRestocking] = useState(false);
    const [restockQuantity, setRestockQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    // Cart State
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        if (quantity <= 0) return;
        addToCart({
            sweetId: sweet.id,
            name: sweet.name,
            price: sweet.price,
            quantity: quantity
        });
        alert(`Added ${quantity} ${sweet.name}(s) to cart!`);
        setQuantity(1);
    };

    const handleRestock = async () => {
        if (!onRestock) return;
        setLoading(true);
        try {
            await onRestock(sweet.id, restockQuantity);
            setIsRestocking(false);
            setRestockQuantity(1);
        } finally {
            setLoading(false);
        }
    };

    const isStockLow = sweet.quantity > 0 && sweet.quantity < 10;
    const isOutOfStock = sweet.quantity === 0;

    return (
        <>
            <div className="sweet-card">
                <div className="sweet-info">
                    <span className="sweet-category">{sweet.category}</span>
                    <h3 className="sweet-name">{sweet.name}</h3>
                </div>

                <div className="sweet-details">
                    <div className="sweet-price">${sweet.price.toFixed(2)}</div>
                    <div className={`sweet-stock ${isOutOfStock ? 'stock-out' : isStockLow ? 'stock-low' : ''}`}>
                        {isOutOfStock ? 'Out of Stock' : `${sweet.quantity} in stock`}
                    </div>
                </div>

                <div className="card-actions">
                    {// @ts-ignore
                        user?.role !== 'admin' && (
                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    min="1"
                                    max={sweet.quantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{ width: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    disabled={isOutOfStock}
                                />
                                <button
                                    className="btn-buy"
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    style={{ flex: 1 }}
                                >
                                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                                </button>
                            </div>
                        )}

                    {// @ts-ignore
                        user?.role === 'admin' && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', width: '100%' }}>
                                <button className="btn-admin" onClick={() => navigate(`/sweets/${sweet.id}/edit`)}>
                                    Edit
                                </button>
                                <button className="btn-admin" onClick={() => setIsRestocking(true)}>
                                    Restock
                                </button>
                            </div>
                        )}
                </div>
            </div>

            {isRestocking && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal">
                        <h3>Restock {sweet.name}</h3>
                        <div className="form-group">
                            <label>Additional Quantity:</label>
                            <input
                                type="number"
                                min="1"
                                value={restockQuantity}
                                onChange={(e) => setRestockQuantity(parseInt(e.target.value))}
                                className="form-input"
                            />
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-buy"
                                onClick={handleRestock}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Confirm Restock'}
                            </button>
                            <button className="btn-admin" onClick={() => setIsRestocking(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SweetCard;
