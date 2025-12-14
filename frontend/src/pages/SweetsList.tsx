import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SweetCard from '../components/SweetCard';
import './Dashboard.css';

interface Sweet {
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
}

const SweetsList = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [sweets, setSweets] = useState<Sweet[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSweets = async (query = '') => {
        try {
            setLoading(true);
            const endpoint = query
                ? `/api/sweets/search?q=${encodeURIComponent(query)}`
                : '/api/sweets';

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch sweets');

            const data = await response.json();
            setSweets(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSweets();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        const timeoutId = setTimeout(() => {
            fetchSweets(query);
        }, 300);
        return () => clearTimeout(timeoutId);
    };

    const handleRestock = async (id: number, quantity: number) => {
        try {
            const response = await fetch(`/api/sweets/${id}/restock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity })
            });

            if (!response.ok) {
                throw new Error('Restock failed');
            }

            await fetchSweets(searchQuery);
            alert('Restock successful!');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Our Sweets</h1>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search for sweets..."
                        className="search-bar"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    {// @ts-ignore
                        user?.role === 'admin' && (
                            <button
                                className="btn-buy"
                                style={{ margin: 0, padding: '0.8rem 1.5rem', background: '#333' }}
                                onClick={() => navigate('/sweets/new')}
                            >
                                + Add Sweet
                            </button>
                        )}
                </div>
            </header>

            {error && <div className="auth-error">{error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading delicious sweets...</div>
            ) : (
                <div className="sweets-grid">
                    {sweets.map(sweet => (
                        <SweetCard
                            key={sweet.id}
                            sweet={sweet}
                            onRestock={handleRestock}
                        />
                    ))}
                    {sweets.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666' }}>
                            No sweets found matching your taste!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SweetsList;
