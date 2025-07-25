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
  Paper,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { initializeGoogleServiceAccount, syncDataWithServiceAccount } from '../../services/googleServiceAccount';
import { 
  thietBiService, 
  coSoVatChatService, 
  lichSuSuDungService, 
  baoTriService, 
  thongBaoService, 
  nguoiDungService 
} from '../../services/localStorage';

interface ServiceAccountSetupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceAccountSetup: React.FC<ServiceAccountSetupProps> = ({ open, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any>(null);

  const spreadsheetId = '1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const credentials = JSON.parse(content);
        
        // Kiểm tra cấu trúc credentials
        if (!credentials.client_email || !credentials.private_key) {
          setError('File credentials.json không đúng định dạng. Cần có client_email và private_key.');
          return;
        }

        setCredentials(credentials);
        setError(null);
        setSuccess('Đã tải credentials.json thành công!');
      } catch (error) {
        setError('Không thể đọc file credentials.json. Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsText(file);
  };

  const handleTestConnection = async () => {
    if (!credentials) {
      setError('Vui lòng tải file credentials.json trước.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const isConnected = await initializeGoogleServiceAccount(spreadsheetId, credentials);
      
      if (isConnected) {
        setSuccess('Kết nối thành công với Google Sheets!');
        // Lưu credentials vào localStorage
        localStorage.setItem('serviceAccountCredentials', JSON.stringify(credentials));
        localStorage.setItem('serviceAccountSpreadsheetId', spreadsheetId);
      } else {
        setError('Không thể kết nối với Google Sheets. Vui lòng kiểm tra credentials và quyền truy cập.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    if (!credentials) {
      setError('Vui lòng tải file credentials.json trước.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Lấy dữ liệu từ localStorage
      const localStorageData = {
        thietBi: thietBiService.getAll(),
        coSoVatChat: coSoVatChatService.getAll(),
        lichSuSuDung: lichSuSuDungService.getAll(),
        baoTri: baoTriService.getAll(),
        thongBao: thongBaoService.getAll(),
        nguoiDung: nguoiDungService.getAll()
      };

      // Đồng bộ dữ liệu
      await syncDataWithServiceAccount(localStorageData);
      
      setSuccess('Đồng bộ dữ liệu thành công!');
      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Lỗi khi đồng bộ dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon color="primary" />
          Cấu Hình Service Account
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>🎯 Phương thức được khuyến nghị!</strong> Service Account cho phép truy cập Google Sheets mà không cần OAuth flow. 
              Chỉ cần upload file credentials.json một lần duy nhất.
            </Typography>
          </Alert>

          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#2e7d32' }}>
              ✅ Ưu điểm của Service Account
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Không cần đăng nhập Google"
                  secondary="Truy cập trực tiếp với credentials"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Không cần test users"
                  secondary="Hoạt động với mọi email"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Cấu hình một lần duy nhất"
                  secondary="Không cần setup lại"
                />
              </ListItem>
            </List>
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          📁 Upload Credentials.json
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={isLoading}
            >
              Chọn File Credentials.json
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleFileUpload}
              />
            </Button>
            {credentials && (
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircleIcon color="success" />
                <Typography variant="body2" color="success.main">
                  Đã tải file thành công
                </Typography>
              </Box>
            )}
          </Box>
          
          {credentials && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <strong>Client Email:</strong> {credentials.client_email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Project ID:</strong> {credentials.project_id}
              </Typography>
            </Box>
          )}
        </Paper>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          🔧 Cấu hình và Test
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Button
            variant="contained"
            onClick={handleTestConnection}
            disabled={!credentials || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <InfoIcon />}
          >
            {isLoading ? 'Đang kiểm tra...' : 'Test Kết Nối'}
          </Button>

          <Button
            variant="outlined"
            onClick={handleSyncData}
            disabled={!credentials || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {isLoading ? 'Đang đồng bộ...' : 'Đồng Bộ Dữ Liệu'}
          </Button>
        </Box>

        {/* Thông báo lỗi */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {/* Thông báo thành công */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">{success}</Typography>
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        <Alert severity="warning">
          <Typography variant="body2">
            <strong>⚠️ Lưu ý:</strong> File credentials.json chứa thông tin nhạy cảm. 
            Không chia sẻ file này với người khác và không commit lên Git.
          </Typography>
        </Alert>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>Spreadsheet ID:</strong> {spreadsheetId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Google Sheets:</strong>{' '}
            <a 
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1976d2' }}
            >
              Xem bảng tính
            </a>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        {success && (
          <Button 
            onClick={() => {
              onSuccess();
              onClose();
            }} 
            variant="contained"
          >
            Hoàn Thành
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ServiceAccountSetup; 