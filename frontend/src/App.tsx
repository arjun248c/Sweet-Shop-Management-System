import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import SweetsList from './pages/SweetsList';
import SweetForm from './pages/SweetForm';

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/sweets"
          element={
            <ProtectedRoute>
              <SweetsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sweets/new"
          element={
            <ProtectedRoute>
              <SweetForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sweets/:id/edit"
          element={
            <ProtectedRoute>
              <SweetForm />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/sweets" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
