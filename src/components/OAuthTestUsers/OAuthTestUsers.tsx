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
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Person as PersonIcon
} from '@mui/icons-material';

interface OAuthTestUsersProps {
  open: boolean;
  onClose: () => void;
}

const OAuthTestUsers: React.FC<OAuthTestUsersProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InfoIcon color="primary" />
          Sửa Lỗi "Chưa hoàn tất quy trình xác minh"
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              ⚠️ Lỗi 403: access_denied
            </Typography>
            <Typography variant="body2">
              Ứng dụng OAuth 2.0 chưa được Google xác minh và đang ở chế độ testing.
            </Typography>
          </Alert>

          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fff3e0' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#e65100' }}>
              🔧 Giải Pháp: Thêm Test Users
            </Typography>
            <Typography variant="body2">
              Bạn cần thêm email của mình vào danh sách test users trong Google Cloud Console.
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          📋 Các Bước Thêm Test Users
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
              primary="2. Tìm OAuth 2.0 Client ID"
              secondary="Click vào OAuth 2.0 Client ID của ứng dụng"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="3. Vào tab 'OAuth consent screen'"
              secondary="Hoặc tìm link 'OAuth consent screen' trong menu"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="4. Thêm Test Users"
              secondary="Trong phần 'Test users', click 'Add Users'"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <PersonIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="5. Nhập email của bạn"
              secondary="Thêm email: ncq.hct1109@gmail.com"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="6. Lưu và đợi"
              secondary="Click 'Save' và đợi vài phút"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Lưu ý:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            • Chỉ những email được thêm vào test users mới có thể sử dụng<br/>
            • Có thể thêm tối đa 100 test users<br/>
            • Thay đổi có hiệu lực sau vài phút<br/>
            • Để sử dụng cho tất cả người dùng, cần xác minh app với Google
          </Typography>
        </Alert>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sau khi thêm email vào test users, hãy thử đăng nhập lại. 
            Nếu vẫn gặp lỗi, hãy đợi thêm vài phút.
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

export default OAuthTestUsers; 