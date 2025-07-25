import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { initializeGoogleOAuth } from '../../services/googleOAuth';

interface OAuthQuickSetupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OAuthQuickSetup: React.FC<OAuthQuickSetupProps> = ({ open, onClose, onSuccess }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy thông tin OAuth từ environment variables hoặc config
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '[CẦN CẤU HÌNH]';
  const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET || '[CẦN CẤU HÌNH]';
  const redirectUri = window.location.origin + '/oauth-callback';

  const handleQuickSetup = async () => {
    setIsConfiguring(true);
    setError(null);

    try {
      // Lưu config vào localStorage
      const config = {
        clientId,
        clientSecret,
        redirectUri
      };
      localStorage.setItem('oauthConfig', JSON.stringify(config));

      // Khởi tạo OAuth
      initializeGoogleOAuth({
        ...config,
        scope: 'https://www.googleapis.com/auth/spreadsheets'
      });

      // Thông báo thành công
      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Lỗi khi cấu hình');
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SettingsIcon color="primary" />
          Cấu Hình Nhanh OAuth 2.0
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Tự động cấu hình OAuth với thông tin đã được cung cấp.
            </Typography>
          </Alert>

          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#2e7d32' }}>
              ✅ Thông tin OAuth đã sẵn sàng
            </Typography>
            <Typography variant="body2">
              Client ID và Client Secret đã được cung cấp và sẽ được cấu hình tự động.
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          📋 Thông tin cấu hình
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Client ID"
              secondary={clientId}
              secondaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <InfoIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Client Secret"
              secondary={'***' + clientSecret.slice(-4)}
              secondaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <InfoIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Redirect URI"
              secondary={redirectUri}
              secondaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>⚠️ Quan trọng:</strong> Sau khi cấu hình, bạn cần thêm email <strong>nguyenthihue100796@gmail.com</strong> vào test users trong Google Cloud Console.
          </Typography>
        </Alert>

        <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#e65100' }}>
            🔧 Bước tiếp theo
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="1. Click 'Cấu Hình Ngay'"
                secondary="Tự động cấu hình OAuth trong ứng dụng"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="2. Thêm Test User"
                secondary="Vào Google Cloud Console > OAuth consent screen > Test users"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="3. Thêm email: nguyenthihue100796@gmail.com"
                secondary="Đợi vài phút và thử đăng nhập"
              />
            </ListItem>
          </List>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button 
          onClick={handleQuickSetup} 
          variant="contained" 
          disabled={isConfiguring}
          startIcon={<SettingsIcon />}
        >
          {isConfiguring ? 'Đang cấu hình...' : 'Cấu Hình Ngay'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OAuthQuickSetup; 