import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission, 
  requiredRole 
}) => {
  const { isAuthenticated, user, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu yêu cầu permission cụ thể
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        p={4}
      >
        <h2>🔒 Không có quyền truy cập</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
        <p>Yêu cầu quyền: {requiredPermission}</p>
      </Box>
    );
  }

  // Nếu yêu cầu role cụ thể
  if (requiredRole && !hasRole(requiredRole as any)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        p={4}
      >
        <h2>🔒 Không có quyền truy cập</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
        <p>Yêu cầu vai trò: {requiredRole}</p>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 