import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = () => {
    const { isAuthenticated, isAdmin } = useAuth(); 

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Si tienes permiso, te deja pasar a la ruta hija (Outlet)
    return <Outlet />;
};