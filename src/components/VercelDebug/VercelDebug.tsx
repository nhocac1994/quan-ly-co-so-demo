import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { initializeGoogleSheets } from '../../services/googleServiceAccountVercel';

const VercelDebug: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      // Lấy environment variables
      const spreadsheetId = process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID;
      const clientEmail = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

      // Debug info
      const debugData = {
        spreadsheetId: spreadsheetId ? '✅ Đã cấu hình' : '❌ Chưa cấu hình',
        clientEmail: clientEmail ? '✅ Đã cấu hình' : '❌ Chưa cấu hình',
        privateKey: privateKey ? '✅ Đã cấu hình' : '❌ Chưa cấu hình',
        privateKeyLength: privateKey ? privateKey.length : 0,
        privateKeyFormat: privateKey ? analyzePrivateKeyFormat(privateKey) : 'N/A'
      };

      setDebugInfo(debugData);

      if (!spreadsheetId || !clientEmail || !privateKey) {
        throw new Error('Thiếu environment variables. Vui lòng kiểm tra cấu hình trên Vercel.');
      }

      const success = await initializeGoogleSheets(
        spreadsheetId,
        clientEmail,
        privateKey
      );

      if (success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setErrorMessage('Không thể kết nối với Google Sheets');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePrivateKeyFormat = (privateKey: string): string => {
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      return 'PKCS#8';
    } else if (privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      return 'RSA Private Key';
    } else if (privateKey.includes('-----BEGIN PRIVATE KEY-----') === false && 
               privateKey.includes('-----BEGIN RSA PRIVATE KEY-----') === false) {
      return 'Raw Base64';
    }
    return 'Unknown';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <BugReportIcon color="primary" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'success':
        return 'Kết nối thành công';
      case 'error':
        return 'Kết nối thất bại';
      default:
        return 'Chưa test';
    }
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            🔧 Debug Vercel Connection
          </Typography>
          <Button
            variant="contained"
            onClick={testConnection}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
          >
            {isLoading ? 'Đang test...' : 'Test Kết Nối'}
          </Button>
        </Box>

        {/* Connection Status */}
        <Box display="flex" alignItems="center" mb={2}>
          <Chip
            icon={getStatusIcon()}
            label={getStatusText()}
            color={connectionStatus === 'success' ? 'success' : connectionStatus === 'error' ? 'error' : 'default'}
            variant="outlined"
            sx={{ mr: 2 }}
          />
          {isLoading && <CircularProgress size={20} />}
        </Box>

        {/* Error Message */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Debug Information */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              📊 Thông Tin Debug
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Spreadsheet ID" 
                  secondary={debugInfo.spreadsheetId || 'Chưa test'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Client Email" 
                  secondary={debugInfo.clientEmail || 'Chưa test'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Private Key Status" 
                  secondary={debugInfo.privateKey || 'Chưa test'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Private Key Length" 
                  secondary={debugInfo.privateKeyLength || 'N/A'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Private Key Format" 
                  secondary={debugInfo.privateKeyFormat || 'N/A'} 
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Environment Variables Debug */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              🔐 Environment Variables (Debug)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Spreadsheet ID:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID || 'Chưa cấu hình'}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Button
                      size="small"
                      onClick={() => copyToClipboard(process.env.REACT_APP_GOOGLE_SHEETS_SPREADSHEET_ID || '')}
                    >
                      <CopyIcon fontSize="small" />
                    </Button>
                  )
                }}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" mb={1}>
                Client Email:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL || 'Chưa cấu hình'}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Button
                      size="small"
                      onClick={() => copyToClipboard(process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL || '')}
                    >
                      <CopyIcon fontSize="small" />
                    </Button>
                  )
                }}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" mb={1}>
                Private Key:
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showPrivateKey ? 'text' : 'password'}
                value={process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || 'Chưa cấu hình'}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Box>
                      <Button
                        size="small"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => copyToClipboard(process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '')}
                      >
                        <CopyIcon fontSize="small" />
                      </Button>
                    </Box>
                  )
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default VercelDebug; 