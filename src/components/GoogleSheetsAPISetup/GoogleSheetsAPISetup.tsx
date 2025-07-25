import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudSync as CloudSyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { initializeGoogleSheetsWithAPIKey } from '../../services/googleSheetsSimple';

interface SetupStatus {
  isConnected: boolean;
  isTesting: boolean;
  error: string | null;
  lastTest: string | null;
}

const GoogleSheetsAPISetup: React.FC = () => {
  const [status, setStatus] = useState<SetupStatus>({
    isConnected: false,
    isTesting: false,
    error: null,
    lastTest: null
  });

  const [spreadsheetId, setSpreadsheetId] = useState(
    process.env.REACT_APP_GOOGLE_SPREADSHEET_ID || ''
  );
  const [apiKey, setApiKey] = useState(
    process.env.REACT_APP_GOOGLE_API_KEY || ''
  );

  // Test kết nối
  const testConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, isTesting: true, error: null }));

      if (!apiKey) {
        throw new Error('Vui lòng nhập Google API Key');
      }

      const isConnected = await initializeGoogleSheetsWithAPIKey(apiKey);

      if (isConnected) {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: true, 
          isTesting: false,
          lastTest: new Date().toLocaleString('vi-VN'),
          error: null 
        }));
      } else {
        throw new Error('Không thể kết nối với Google Sheets');
      }
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isTesting: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      }));
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            🔧 Cấu Hình Google Sheets API
          </Typography>
          <Tooltip title="Kiểm tra kết nối">
            <IconButton onClick={testConnection} disabled={status.isTesting}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Trạng thái kết nối */}
        <Box display="flex" alignItems="center" mb={2}>
          <Chip
            icon={status.isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
            label={status.isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
            color={status.isConnected ? 'success' : 'error'}
            variant="outlined"
            sx={{ mr: 2 }}
          />
          {status.lastTest && (
            <Typography variant="body2" color="text.secondary">
              Lần test cuối: {status.lastTest}
            </Typography>
          )}
        </Box>

        {/* Thông báo lỗi */}
        {status.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {status.error}
          </Alert>
        )}

        {/* Form cấu hình */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            📋 Thông Tin Cấu Hình
          </Typography>
          
          <TextField
            fullWidth
            label="Spreadsheet ID"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            placeholder="1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <Button
                  size="small"
                  onClick={() => copyToClipboard(spreadsheetId)}
                >
                  <CopyIcon fontSize="small" />
                </Button>
              )
            }}
          />

          <TextField
            fullWidth
            label="Google API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSyB..."
            type="password"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <Button
                  size="small"
                  onClick={() => copyToClipboard(apiKey)}
                >
                  <CopyIcon fontSize="small" />
                </Button>
              )
            }}
          />
        </Box>

        {/* Hướng dẫn */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            📖 Hướng Dẫn Cấu Hình
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Bước 1:</strong> Tạo Google API Key tại{' '}
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
                Google Cloud Console
              </a>
            </Typography>
          </Alert>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Bước 2:</strong> Bật Google Sheets API trong Google Cloud Console
            </Typography>
          </Alert>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Bước 3:</strong> Tạo Google Apps Script và deploy để ghi dữ liệu
            </Typography>
          </Alert>
        </Box>

        {/* Nút test */}
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={status.isTesting ? <CircularProgress size={20} /> : <CloudSyncIcon />}
            onClick={testConnection}
            disabled={status.isTesting || !spreadsheetId || !apiKey}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#45a049' }
            }}
          >
            {status.isTesting ? 'Đang test...' : 'Test Kết Nối'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsAPISetup; 