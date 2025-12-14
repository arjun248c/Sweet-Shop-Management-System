import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
    onPurchase: (id: number, quantity: number) => Promise<void>;
    onRestock?: (id: number, quantity: number) => Promise<void>;
}

const SweetCard = ({ sweet, onPurchase, onRestock }: SweetCardProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isBuying, setIsBuying] = useState(false);
    const [isRestocking, setIsRestocking] = useState(false);
    const [quantityInput, setQuantityInput] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleActionClick = (action: 'buy' | 'restock') => {
        setQuantityInput(1);
        if (action === 'buy') setIsBuying(true);
        else setIsRestocking(true);
    };

    const confirmAction = async () => {
        if (quantityInput <= 0) return;
        setLoading(true);
        try {
            if (isBuying) {
                await onPurchase(sweet.id, quantityInput);
            } else if (isRestocking && onRestock) {
                await onRestock(sweet.id, quantityInput);
            }
        } finally {
            setLoading(false);
            setIsBuying(false);
            setIsRestocking(false);
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
                    <button
                        className="btn-buy"
                        onClick={() => handleActionClick('buy')}
                        disabled={isOutOfStock || loading}
                    >
                        {isOutOfStock ? 'Sold Out' : 'Buy'}
                    </button>

                    {// @ts-ignore
                        user?.role === 'admin' && (
                            <>
                                <button className="btn-admin" onClick={() => navigate(`/sweets/${sweet.id}/edit`)}>
                                    Edit
                                </button>
                                <button className="btn-admin" onClick={() => handleActionClick('restock')}>
                                    Restock
                                </button>
                            </>
                        )}
                </div>
            </div>

            {(isBuying || isRestocking) && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal">
                        <h3>{isBuying ? `Purchase ${sweet.name}` : `Restock ${sweet.name}`}</h3>
                        <div className="form-group">
                            <label>Quantity:</label>
                            <input
                                type="number"
                                min="1"
                                max={isBuying ? sweet.quantity : undefined}
                                value={quantityInput}
                                onChange={(e) => setQuantityInput(parseInt(e.target.value))}
                                className="form-input"
                            />
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn-buy"
                                onClick={confirmAction}
                                disabled={loading || (isBuying && (quantityInput > sweet.quantity || quantityInput < 1))}
                            >
                                {loading ? 'Processing...' : 'Confirm'}
                            </button>
                            <button className="btn-admin" onClick={() => { setIsBuying(false); setIsRestocking(false); }}>
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
