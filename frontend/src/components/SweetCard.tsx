import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
    onPurchase: (id: number, quantity: number) => Promise<void>;
}

const SweetCard = ({ sweet, onPurchase }: SweetCardProps) => {
    const { user } = useAuth();
    const [isBuying, setIsBuying] = useState(false);
    const [buyQuantity, setBuyQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleBuyClick = () => {
        setIsBuying(true);
        setBuyQuantity(1);
    };

    const confirmPurchase = async () => {
        if (buyQuantity <= 0) return;
        setLoading(true);
        await onPurchase(sweet.id, buyQuantity);
        setLoading(false);
        setIsBuying(false);
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
                    <button
                        className="btn-buy"
                        onClick={handleBuyClick}
                        disabled={isOutOfStock || loading}
                    >
                        {isOutOfStock ? 'Sold Out' : 'Buy'}
                    </button>

                    {// @ts-ignore
                        user?.role === 'admin' && (
                            <button className="btn-admin" onClick={() => alert('Edit feature coming soon')}>
                                Edit
                            </button>
                        )}
                </div>
            </div>

            {isBuying && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal">
                        <h3>Purchase {sweet.name}</h3>
                        <div className="form-group">
                            <label>Quantity:</label>
                            <input
                                type="number"
                                min="1"
                                max={sweet.quantity}
                                value={buyQuantity}
                                onChange={(e) => setBuyQuantity(parseInt(e.target.value))}
                                className="form-input"
                            />
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-buy"
                                onClick={confirmPurchase}
                                disabled={loading || buyQuantity > sweet.quantity || buyQuantity < 1}
                            >
                                {loading ? 'Processing...' : `Confirm ($${(buyQuantity * sweet.price).toFixed(2)})`}
                            </button>
                            <button className="btn-admin" onClick={() => setIsBuying(false)}>
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
