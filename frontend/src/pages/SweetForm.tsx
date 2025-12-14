import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css'; // Reusing auth styles for form consistency

const SweetForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const isEditMode = !!id;

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if not admin (client-side check)
    useEffect(() => {
        // @ts-ignore
        if (user && user.role !== 'admin') {
            navigate('/sweets');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (isEditMode) {
            fetchSweet();
        }
    }, [id]);

    const fetchSweet = async () => {
        try {
            const response = await fetch(`/api/sweets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch details');
            const data = await response.json();
            setName(data.name);
            setCategory(data.category);
            setPrice(data.price.toString());
            setQuantity(data.quantity.toString());
        } catch (err: any) {
            setError('Could not load sweet details');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            name,
            category,
            price: parseFloat(price),
            quantity: parseInt(quantity)
        };

        try {
            const url = isEditMode ? `/api/sweets/${id}` : '/api/sweets';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Operation failed');
            }

            navigate('/sweets');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <h2 className="auth-title">{isEditMode ? 'Edit Sweet' : 'Add New Sweet'}</h2>
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <input
                            type="text"
                            className="form-input"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-input"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {isEditMode ? 'Quantity (Reset)' : 'Initial Quantity'}
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="form-input"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                required
                            // Note: For edit, this might reset quantity depending on backend implementation.
                            // Our backend `update` replaces fields. So we must provide current quantity or it might be lost/reset.
                            // Ideally, edit shouldn't mess with quantity if we have dedicated restock, but for MVP simpler to just set absolute value.
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="auth-button" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Saving...' : 'Save Sweet'}
                        </button>
                        <button
                            type="button"
                            className="auth-button"
                            style={{ background: '#ccc', flex: 0.5 }}
                            onClick={() => navigate('/sweets')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SweetForm;
