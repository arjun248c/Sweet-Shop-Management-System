import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    sweetId: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (sweetId: number) => void;
    updateQuantity: (sweetId: number, quantity: number) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: CartItem) => {
        setItems(current => {
            const existing = current.find(i => i.sweetId === newItem.sweetId);
            if (existing) {
                return current.map(i =>
                    i.sweetId === newItem.sweetId
                        ? { ...i, quantity: i.quantity + newItem.quantity }
                        : i
                );
            }
            return [...current, newItem];
        });
    };

    const removeFromCart = (sweetId: number) => {
        setItems(current => current.filter(i => i.sweetId !== sweetId));
    };

    const updateQuantity = (sweetId: number, quantity: number) => {
        setItems(current =>
            current.map(i =>
                i.sweetId === sweetId ? { ...i, quantity } : i
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
