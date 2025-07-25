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
  Link
} from '@mui/material';

interface APIKeyInputProps {
  open: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const APIKeyInput: React.FC<APIKeyInputProps> = ({ open, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API key');
      return;
    }
    
    if (apiKey === 'YOUR_API_KEY_HERE') {
      setError('Vui lòng thay thế bằng API key thật');
      return;
    }

    setError('');
    onSave(apiKey);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cấu Hình Google Sheets API</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Để sử dụng tính năng đồng bộ Google Sheets, bạn cần:
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              1. Tạo Google Cloud Project và bật Google Sheets API<br/>
              2. Tạo API Key từ Google Cloud Console<br/>
              3. Chia sẻ Google Sheets với quyền truy cập công khai
            </Typography>
          </Alert>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank"
              rel="noopener noreferrer"
            >
              🔗 Tạo API Key tại đây
            </Link>
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Google Sheets API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Nhập API key của bạn..."
          error={!!error}
          helperText={error || 'API key sẽ được lưu trong localStorage'}
          type="password"
          sx={{ mb: 2 }}
        />

        <Alert severity="warning">
          <Typography variant="body2">
            ⚠️ <strong>Lưu ý bảo mật:</strong> API key sẽ được lưu trong trình duyệt. 
            Chỉ sử dụng cho mục đích phát triển và test.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} variant="contained">
          Lưu API Key
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default APIKeyInput; 