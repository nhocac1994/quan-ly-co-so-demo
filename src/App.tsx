import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import ThietBiManagement from './pages/ThietBiManagement/ThietBiManagement';
import ThietBiDetail from './pages/ThietBiDetail/ThietBiDetail';
import ThietBiView from './pages/ThietBiView/ThietBiView';
import CoSoVatChatManagement from './pages/CoSoVatChatManagement/CoSoVatChatManagement';
import LichSuSuDung from './pages/LichSuSuDung/LichSuSuDung';
import BaoCao from './pages/BaoCao/BaoCao';
import ThongBao from './pages/ThongBao/ThongBao';
import QuanLyDongBo from './pages/QuanLyDongBo/QuanLyDongBo';
import Login from './components/Login/Login';
import PageTransition from './components/PageTransition/PageTransition';
import OAuthCallback from './components/OAuthCallback/OAuthCallback';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AutoSyncProvider } from './contexts/AutoSyncContext';
import { initializeSampleUsers } from './data/sampleUsers';

// Tạo theme Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Tạo QueryClient cho React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});



// Component chính
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Khởi tạo dữ liệu mẫu khi component mount (luôn chạy)
  useEffect(() => {
    initializeSampleUsers();
  }, []);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <PageTransition key={location.pathname}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/thiet-bi" element={
            <ProtectedRoute requiredPermission="thietbi.view">
              <ThietBiManagement />
            </ProtectedRoute>
          } />
          <Route path="/thiet-bi/new" element={
            <ProtectedRoute requiredPermission="thietbi.manage">
              <ThietBiDetail />
            </ProtectedRoute>
          } />
          <Route path="/thiet-bi/:id/view" element={
            <ProtectedRoute requiredPermission="thietbi.view">
              <ThietBiView />
            </ProtectedRoute>
          } />
          <Route path="/thiet-bi/:id" element={
            <ProtectedRoute requiredPermission="thietbi.manage">
              <ThietBiDetail />
            </ProtectedRoute>
          } />
          <Route path="/co-so-vat-chat" element={
            <ProtectedRoute requiredPermission="cosovatchat.view">
              <CoSoVatChatManagement />
            </ProtectedRoute>
          } />
          <Route path="/lich-su-su-dung" element={
            <ProtectedRoute requiredPermission="lichsusu.view">
              <LichSuSuDung />
            </ProtectedRoute>
          } />
          <Route path="/bao-cao" element={
            <ProtectedRoute requiredPermission="baocao.view">
              <BaoCao />
            </ProtectedRoute>
          } />
          <Route path="/thong-bao" element={
            <ProtectedRoute requiredPermission="thongbao.view">
              <ThongBao />
            </ProtectedRoute>
          } />
          <Route path="/quan-ly-dong-bo" element={
            <ProtectedRoute requiredPermission="dongbo.manage">
              <QuanLyDongBo />
            </ProtectedRoute>
          } />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </Layout>
  );
};

const App: React.FC = () => {
  // Khởi tạo dữ liệu mẫu ngay khi App mount
  useEffect(() => {
    initializeSampleUsers();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AutoSyncProvider>
            <Router>
              <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <AppContent />
              </Box>
            </Router>
          </AutoSyncProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 