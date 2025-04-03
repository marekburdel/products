import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Product Pages
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailsPage from './pages/products/ProductDetailsPage';
import CreateProductPage from './pages/products/CreateProductPage';
import EditProductPage from './pages/products/EditProductPage';

// Order Pages
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailsPage from './pages/orders/OrderDetailsPage';
import CreateOrderPage from './pages/orders/CreateOrderPage';
import EditOrderPage from './pages/orders/EditOrderPage';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Default route */}
            <Route path="/" element={<Navigate to="/products" replace />} />

            {/* Products routes - Viewing is public but editing requires admin */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />

            {/* Admin-only product management routes */}
            <Route
                path="/products/create"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <CreateProductPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/products/:id/edit"
                element={
                    <ProtectedRoute requireAdmin={true}>
                        <EditProductPage />
                    </ProtectedRoute>
                }
            />

            {/* Product routes */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/create" element={<CreateProductPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/products/:id/edit" element={<EditProductPage />} />

            {/* Order routes */}
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/create" element={<CreateOrderPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/orders/:id/edit" element={<EditOrderPage />} />

            {/* Fallback for unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;