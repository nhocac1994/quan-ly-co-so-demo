import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { initializeGoogleSheets } from '../../services/googleSheetsService';

interface DebugInfo {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  privateKeyLength: number;
  privateKeyFormat: string;
  privateKeyStart: string;
  privateKeyEnd: string;
  connectionStatus: 'idle' | 'testing' | 'success' | 'error';
  errorMessage: string;
}

const GoogleSheetsDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    spreadsheetId: '',
    clientEmail: '',
    privateKey: '',
    privateKeyLength: 0,
    privateKeyFormat: 'N/A',
    privateKeyStart: 'N/A',
    privateKeyEnd: 'N/A',
    connectionStatus: 'idle',
    errorMessage: ''
  });

  // Phân tích format của private key
  const analyzePrivateKeyFormat = (privateKey: string): string => {
    if (!privateKey) return 'Empty';
    
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      return 'PKCS#8 PEM';
    }
    if (privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      return 'RSA PEM';
    }
    if (privateKey.includes('-') || privateKey.includes('_')) {
      return 'URL-safe Base64';
    }
    return 'Raw Base64';
  };

  // Test kết nối
  const testConnection = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, connectionStatus: 'testing', errorMessage: '' }));

      const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
      const clientEmail = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;

      const newDebugInfo: DebugInfo = {
        spreadsheetId: spreadsheetId || 'Not configured',
        clientEmail: clientEmail || 'Not configured',
        privateKey: privateKey || 'Not configured',
        privateKeyLength: privateKey ? privateKey.length : 0,
        privateKeyFormat: privateKey ? analyzePrivateKeyFormat(privateKey) : 'N/A',
        privateKeyStart: privateKey ? privateKey.substring(0, 50) + '...' : 'N/A',
        privateKeyEnd: privateKey ? '...' + privateKey.substring(privateKey.length - 50) : 'N/A',
        connectionStatus: 'idle',
        errorMessage: ''
      };

      setDebugInfo(newDebugInfo);

      if (!spreadsheetId || !clientEmail || !privateKey) {
        throw new Error('Thiếu environment variables. Vui lòng kiểm tra cấu hình trên Vercel.');
      }

      const success = await initializeGoogleSheets(spreadsheetId, clientEmail, privateKey);

      if (success) {
        setDebugInfo(prev => ({ ...prev, connectionStatus: 'success' }));
      } else {
        setDebugInfo(prev => ({ 
          ...prev, 
          connectionStatus: 'error',
          errorMessage: 'Không thể kết nối với Google Sheets'
        }));
      }
    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Lỗi không xác định'
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
            🐛 Debug Google Sheets Connection
          </Typography>
          <Tooltip title="Kiểm tra kết nối">
            <IconButton onClick={testConnection} disabled={debugInfo.connectionStatus === 'testing'}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Trạng thái kết nối */}
        <Box display="flex" alignItems="center" mb={2}>
          <Chip
            icon={debugInfo.connectionStatus === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
            label={
              debugInfo.connectionStatus === 'testing' ? 'Đang test...' :
              debugInfo.connectionStatus === 'success' ? 'Kết nối thành công' :
              debugInfo.connectionStatus === 'error' ? 'Lỗi kết nối' : 'Chưa test'
            }
            color={
              debugInfo.connectionStatus === 'success' ? 'success' :
              debugInfo.connectionStatus === 'error' ? 'error' : 'default'
            }
            variant="outlined"
            sx={{ mr: 2 }}
          />
          {debugInfo.connectionStatus === 'testing' && <CircularProgress size={20} />}
        </Box>

        {/* Thông báo lỗi */}
        {debugInfo.errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {debugInfo.errorMessage}
          </Alert>
        )}

        {/* Thông tin cấu hình */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              📋 Thông Tin Cấu Hình Environment Variables
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Spreadsheet ID" 
                  secondary={debugInfo.spreadsheetId} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Service Account Email" 
                  secondary={debugInfo.clientEmail} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <KeyIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Private Key Length" 
                  secondary={debugInfo.privateKeyLength} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Private Key Format" 
                  secondary={debugInfo.privateKeyFormat} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Private Key Start" 
                  secondary={debugInfo.privateKeyStart} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Private Key End" 
                  secondary={debugInfo.privateKeyEnd} 
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Hướng dẫn */}
        <Box mt={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            📖 Hướng Dẫn Khắc Phục
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>🔧 Nếu lỗi "InvalidCharacterError":</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              • Copy lại private key từ Google Cloud Console
            </Typography>
            <Typography variant="body2">
              • Đảm bảo không có space thừa
            </Typography>
            <Typography variant="body2">
              • Kiểm tra format PKCS#8
            </Typography>
          </Alert>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>⚠️ Lưu ý:</strong> Mở Developer Console (F12) để xem debug logs chi tiết
            </Typography>
          </Alert>
        </Box>

        {/* Nút test */}
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={debugInfo.connectionStatus === 'testing' ? <CircularProgress size={20} /> : <BugReportIcon />}
            onClick={testConnection}
            disabled={debugInfo.connectionStatus === 'testing'}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            {debugInfo.connectionStatus === 'testing' ? 'Đang test...' : 'Test Kết Nối'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsDebug; 