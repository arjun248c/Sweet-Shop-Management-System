import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
        <Route path="/register" element={<div>Register Page (Coming Soon)</div>} />
        <Route
          path="/sweets"
          element={
            <ProtectedRoute>
              <div>Sweets Inventory (Coming Soon)</div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/sweets" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
