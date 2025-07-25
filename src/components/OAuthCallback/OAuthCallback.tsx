import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { googleOAuthService } from '../../services/googleOAuth';

const OAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Lấy code và state từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          setError(`OAuth error: ${error}`);
          setStatus('error');
          return;
        }

        if (!code || !state) {
          setError('Missing code or state parameter');
          setStatus('error');
          return;
        }

        // Xử lý OAuth callback
        const success = await googleOAuthService.handleOAuthCallback(code, state);
        
        if (success) {
          setStatus('success');
          // Chuyển về Dashboard sau 2 giây
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setError('Failed to authenticate with Google');
          setStatus('error');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
    >
      {status === 'loading' && (
        <>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Đang xác thực với Google...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng đợi trong giây lát
          </Typography>
        </>
      )}

      {status === 'success' && (
        <>
          <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
            ✅ Xác thực thành công!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đang chuyển về Dashboard...
          </Typography>
        </>
      )}

      {status === 'error' && (
        <>
          <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              ❌ Lỗi xác thực
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Vui lòng thử lại hoặc liên hệ hỗ trợ
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OAuthCallback; 