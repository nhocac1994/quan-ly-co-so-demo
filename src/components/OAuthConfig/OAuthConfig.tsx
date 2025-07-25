import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Divider
} from '@mui/material';

interface OAuthConfigProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: { clientId: string; clientSecret: string; redirectUri: string }) => void;
}

const OAuthConfig: React.FC<OAuthConfigProps> = ({ open, onClose, onSave }) => {
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: window.location.origin + '/oauth-callback'
  });
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!config.clientId.trim() || !config.clientSecret.trim()) {
      setError('Vui lòng nhập đầy đủ Client ID và Client Secret');
      return;
    }

    setError('');
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Cấu Hình OAuth 2.0</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Để sử dụng OAuth 2.0 với Google Sheets, bạn cần:
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              1. Tạo OAuth 2.0 Client ID từ Google Cloud Console<br/>
              2. Cấu hình Authorized redirect URIs<br/>
              3. Bật Google Sheets API
            </Typography>
          </Alert>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank"
              rel="noopener noreferrer"
            >
              🔗 Tạo OAuth 2.0 Client ID tại đây
            </Link>
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="OAuth 2.0 Client ID"
            value={config.clientId}
            onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
            placeholder="Nhập Client ID..."
            error={!!error && !config.clientId}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="OAuth 2.0 Client Secret"
            value={config.clientSecret}
            onChange={(e) => setConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
            placeholder="Nhập Client Secret..."
            type="password"
            error={!!error && !config.clientSecret}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Redirect URI"
            value={config.redirectUri}
            onChange={(e) => setConfig(prev => ({ ...prev, redirectUri: e.target.value }))}
            helperText="URI này phải được cấu hình trong Google Cloud Console"
            sx={{ mb: 2 }}
          />
        </Box>

        <Alert severity="warning">
          <Typography variant="body2">
            ⚠️ <strong>Lưu ý bảo mật:</strong> Client Secret sẽ được lưu trong trình duyệt. 
            Chỉ sử dụng cho mục đích phát triển và test.
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} variant="contained">
          Lưu Cấu Hình
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OAuthConfig; 