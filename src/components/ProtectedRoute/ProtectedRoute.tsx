import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

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
  const { isAuthenticated, hasPermission, hasRole } = useAuth();
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useAuth().user;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Bạn không có quyền truy cập trang này
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Yêu cầu quyền: {requiredPermission}
        </Typography>
      </Box>
    );
  }

  if (requiredRole && !hasRole(requiredRole as any)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Bạn không có quyền truy cập trang này
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Yêu cầu vai trò: {requiredRole}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 