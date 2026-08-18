import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireVendor?: boolean;
  requireAmbassador?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireVendor = false,
  requireAmbassador = false 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requireVendor && user?.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }

  if (requireAmbassador && user?.role !== 'ambassador') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
