import React, { useState, useEffect } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { googleOAuthService } from '../../services/googleOAuth';

interface OAuthDebugProps {
  open: boolean;
  onClose: () => void;
}

interface DebugInfo {
  hasConfig: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  hasAccessToken: boolean;
  accessToken: string | null;
  tokenExpiry: string | null;
  isTokenExpired: boolean;
  lastError: string | null;
  testConnectionResult: boolean | null;
}

const OAuthDebug: React.FC<OAuthDebugProps> = ({ open, onClose }) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    hasConfig: false,
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    hasAccessToken: false,
    accessToken: null,
    tokenExpiry: null,
    isTokenExpired: false,
    lastError: null,
    testConnectionResult: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const runDebug = async () => {
    setIsLoading(true);
    try {
      // Kiểm tra config
      const config = JSON.parse(localStorage.getItem('oauthConfig') || '{}');
      const hasConfig = !!(config.clientId && config.clientSecret);
      
      // Kiểm tra access token
      const accessToken = localStorage.getItem('googleAccessToken');
      const tokenExpiry = localStorage.getItem('googleTokenExpiry');
      const hasAccessToken = !!accessToken;
      const isTokenExpired = tokenExpiry ? new Date(parseInt(tokenExpiry)) < new Date() : true;
      
      // Test connection
      let testConnectionResult = null;
      let lastError = null;
      try {
        testConnectionResult = await googleOAuthService.testConnection();
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Lỗi không xác định';
      }

      setDebugInfo({
        hasConfig,
        clientId: config.clientId || '',
        clientSecret: config.clientSecret ? '***' + config.clientSecret.slice(-4) : '',
        redirectUri: config.redirectUri || '',
        hasAccessToken,
        accessToken: accessToken ? accessToken.substring(0, 20) + '...' : null,
        tokenExpiry: tokenExpiry ? new Date(parseInt(tokenExpiry)).toLocaleString('vi-VN') : null,
        isTokenExpired,
        lastError,
        testConnectionResult
      });
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Lỗi debug'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      runDebug();
    }
  }, [open]);

  const getStatusIcon = (condition: boolean) => {
    return condition ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />;
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? 'success' : 'error';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BugReportIcon color="primary" />
          Debug OAuth Configuration
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Component này giúp kiểm tra chi tiết cấu hình OAuth và xác định nguyên nhân lỗi.
            </Typography>
          </Alert>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Trạng thái OAuth</Typography>
            <Button 
              variant="outlined" 
              onClick={runDebug} 
              disabled={isLoading}
              startIcon={<BugReportIcon />}
            >
              {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Cấu hình OAuth */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🔧 Cấu hình OAuth
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                {getStatusIcon(debugInfo.hasConfig)}
              </ListItemIcon>
              <ListItemText
                primary="OAuth Config"
                secondary={debugInfo.hasConfig ? 'Đã cấu hình' : 'Chưa cấu hình'}
                secondaryTypographyProps={{ color: getStatusColor(debugInfo.hasConfig) }}
              />
            </ListItem>

            {debugInfo.hasConfig && (
              <>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Client ID"
                    secondary={debugInfo.clientId || 'Không có'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Client Secret"
                    secondary={debugInfo.clientSecret || 'Không có'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Redirect URI"
                    secondary={debugInfo.redirectUri || 'Không có'}
                  />
                </ListItem>
              </>
            )}
          </List>
        </Paper>

        {/* Access Token */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🔑 Access Token
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                {getStatusIcon(debugInfo.hasAccessToken)}
              </ListItemIcon>
              <ListItemText
                primary="Access Token"
                secondary={debugInfo.hasAccessToken ? 'Có token' : 'Không có token'}
                secondaryTypographyProps={{ color: getStatusColor(debugInfo.hasAccessToken) }}
              />
            </ListItem>

            {debugInfo.hasAccessToken && (
              <>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Token Preview"
                    secondary={debugInfo.accessToken}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(!debugInfo.isTokenExpired)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Token Expiry"
                    secondary={debugInfo.tokenExpiry || 'Không có thời gian hết hạn'}
                    secondaryTypographyProps={{ color: getStatusColor(!debugInfo.isTokenExpired) }}
                  />
                </ListItem>
              </>
            )}
          </List>
        </Paper>

        {/* Kết nối */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🌐 Kết nối Google Sheets
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                {debugInfo.testConnectionResult !== null ? getStatusIcon(debugInfo.testConnectionResult) : <InfoIcon color="info" />}
              </ListItemIcon>
              <ListItemText
                primary="Test Connection"
                secondary={debugInfo.testConnectionResult === null ? 'Chưa kiểm tra' : (debugInfo.testConnectionResult ? 'Thành công' : 'Thất bại')}
                secondaryTypographyProps={{ 
                  color: debugInfo.testConnectionResult === null ? 'info' : getStatusColor(debugInfo.testConnectionResult) 
                }}
              />
            </ListItem>
          </List>
        </Paper>

        {/* Lỗi */}
        {debugInfo.lastError && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#ffebee' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#c62828' }}>
              ❌ Lỗi cuối cùng
            </Typography>
            
            <Alert severity="error">
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {debugInfo.lastError}
              </Typography>
            </Alert>
          </Paper>
        )}

        {/* Hướng dẫn sửa lỗi */}
        <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1565c0' }}>
            💡 Hướng dẫn sửa lỗi
          </Typography>
          
          <List dense>
            {!debugInfo.hasConfig && (
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Chưa cấu hình OAuth"
                  secondary="Cần cấu hình Client ID và Client Secret"
                />
              </ListItem>
            )}

            {debugInfo.hasConfig && !debugInfo.hasAccessToken && (
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Chưa đăng nhập"
                  secondary="Cần đăng nhập Google để lấy access token"
                />
              </ListItem>
            )}

            {debugInfo.hasAccessToken && debugInfo.isTokenExpired && (
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Token đã hết hạn"
                  secondary="Cần đăng nhập lại để lấy token mới"
                />
              </ListItem>
            )}

            {debugInfo.testConnectionResult === false && (
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Không thể kết nối Google Sheets"
                  secondary="Kiểm tra quyền truy cập và cấu hình"
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OAuthDebug; 