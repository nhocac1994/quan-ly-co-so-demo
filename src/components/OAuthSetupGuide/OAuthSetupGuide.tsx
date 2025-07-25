import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface OAuthSetupGuideProps {
  open: boolean;
  onClose: () => void;
}

const OAuthSetupGuide: React.FC<OAuthSetupGuideProps> = ({ open, onClose }) => {
  const currentOrigin = window.location.origin;
  const redirectUri = `${currentOrigin}/oauth-callback`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InfoIcon color="primary" />
          Hướng Dẫn Cấu Hình OAuth 2.0
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              ⚠️ Lỗi redirect_uri_mismatch
            </Typography>
            <Typography variant="body2">
              Lỗi này xảy ra khi Redirect URI không khớp với cấu hình trong Google Cloud Console.
            </Typography>
          </Alert>

          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              📋 Thông Tin Cấu Hình Cần Thiết
            </Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
              <div><strong>Authorized JavaScript origins:</strong></div>
              <div style={{ color: '#1976d2', marginLeft: '10px' }}>{currentOrigin}</div>
              <div style={{ marginTop: '10px' }}><strong>Authorized redirect URIs:</strong></div>
              <div style={{ color: '#1976d2', marginLeft: '10px' }}>{redirectUri}</div>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          🔧 Các Bước Cấu Hình
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="1. Truy cập Google Cloud Console"
              secondary={
                <Link 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#1976d2' }}
                >
                  https://console.cloud.google.com/apis/credentials
                </Link>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="2. Tạo OAuth 2.0 Client ID"
              secondary="Chọn 'Web application' và điền thông tin"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="3. Cấu hình Authorized JavaScript origins"
              secondary={`Thêm: ${currentOrigin}`}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="4. Cấu hình Authorized redirect URIs"
              secondary={`Thêm: ${redirectUri}`}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="5. Bật Google Sheets API"
              secondary="Vào 'APIs & Services' > 'Library' > Tìm 'Google Sheets API'"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Lưu ý quan trọng:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • Redirect URI phải chính xác từng ký tự<br/>
            • Không có dấu cách thừa ở đầu hoặc cuối<br/>
            • Protocol (http/https) phải khớp<br/>
            • Port number phải khớp (nếu có)
          </Typography>
        </Alert>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sau khi cấu hình xong, hãy thử đăng nhập lại. Nếu vẫn gặp lỗi, 
            hãy kiểm tra lại thông tin cấu hình trong Google Cloud Console.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đã Hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OAuthSetupGuide; 