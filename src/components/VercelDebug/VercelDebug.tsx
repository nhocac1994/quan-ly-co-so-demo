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
  TextField
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
import { 
  initializeGoogleServiceAccountVercel
} from '../../services/googleServiceAccountVercel';

interface DebugStep {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

interface DebugStatus {
  steps: DebugStep[];
  isRunning: boolean;
  showPrivateKey: boolean;
  customConfig: {
    spreadsheetId: string;
    clientEmail: string;
    privateKey: string;
  };
}

const VercelDebug: React.FC = () => {
  const [status, setStatus] = useState<DebugStatus>({
    steps: [],
    isRunning: false,
    showPrivateKey: false,
    customConfig: {
      spreadsheetId: '',
      clientEmail: '',
      privateKey: ''
    }
  });

  // Khởi tạo debug steps
  const initializeSteps = (): DebugStep[] => [
    {
      name: 'Kiểm tra Environment Variables',
      status: 'pending',
      message: 'Đang kiểm tra...'
    },
    {
      name: 'Kiểm tra Spreadsheet ID',
      status: 'pending',
      message: 'Đang kiểm tra...'
    },
    {
      name: 'Kiểm tra Service Account Email',
      status: 'pending',
      message: 'Đang kiểm tra...'
    },
    {
      name: 'Kiểm tra Private Key Format',
      status: 'pending',
      message: 'Đang kiểm tra...'
    },
    {
      name: 'Tạo JWT Token',
      status: 'pending',
      message: 'Đang kiểm tra...'
    },
    {
      name: 'Lấy Access Token',
      status: 'pending',
      message: 'Đang kiểm tra...'
    },
    {
      name: 'Test Kết Nối Google Sheets',
      status: 'pending',
      message: 'Đang kiểm tra...'
    }
  ];

  // Cập nhật step
  const updateStep = (stepIndex: number, updates: Partial<DebugStep>) => {
    setStatus(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, ...updates } : step
      )
    }));
  };

  // Kiểm tra environment variables
  const checkEnvironmentVariables = (): DebugStep => {
    const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
    const clientEmail = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return {
        name: 'Kiểm tra Environment Variables',
        status: 'error',
        message: `Thiếu environment variables: ${!spreadsheetId ? 'SPREADSHEET_ID ' : ''}${!clientEmail ? 'SERVICE_ACCOUNT_EMAIL ' : ''}${!privateKey ? 'PRIVATE_KEY' : ''}`,
        details: {
          spreadsheetId: !!spreadsheetId,
          clientEmail: !!clientEmail,
          privateKey: !!privateKey
        }
      };
    }

    return {
      name: 'Kiểm tra Environment Variables',
      status: 'success',
      message: 'Tất cả environment variables đã được cấu hình',
      details: {
        spreadsheetId: spreadsheetId.substring(0, 20) + '...',
        clientEmail: clientEmail,
        privateKeyLength: privateKey.length
      }
    };
  };

  // Kiểm tra Spreadsheet ID
  const checkSpreadsheetId = (): DebugStep => {
    const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      return {
        name: 'Kiểm tra Spreadsheet ID',
        status: 'error',
        message: 'Spreadsheet ID không tồn tại'
      };
    }

    if (spreadsheetId.length < 20) {
      return {
        name: 'Kiểm tra Spreadsheet ID',
        status: 'error',
        message: 'Spreadsheet ID quá ngắn, có thể không đúng'
      };
    }

    return {
      name: 'Kiểm tra Spreadsheet ID',
      status: 'success',
      message: `Spreadsheet ID hợp lệ: ${spreadsheetId.substring(0, 20)}...`,
      details: { spreadsheetId }
    };
  };

  // Kiểm tra Service Account Email
  const checkServiceAccountEmail = (): DebugStep => {
    const clientEmail = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL;
    
    if (!clientEmail) {
      return {
        name: 'Kiểm tra Service Account Email',
        status: 'error',
        message: 'Service Account Email không tồn tại'
      };
    }

    if (!clientEmail.includes('@') || !clientEmail.includes('.iam.gserviceaccount.com')) {
      return {
        name: 'Kiểm tra Service Account Email',
        status: 'error',
        message: 'Service Account Email không đúng format'
      };
    }

    return {
      name: 'Kiểm tra Service Account Email',
      status: 'success',
      message: `Service Account Email hợp lệ: ${clientEmail}`,
      details: { clientEmail }
    };
  };

  // Kiểm tra Private Key Format
  const checkPrivateKeyFormat = (): DebugStep => {
    const privateKey = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;
    
    if (!privateKey) {
      return {
        name: 'Kiểm tra Private Key Format',
        status: 'error',
        message: 'Private Key không tồn tại'
      };
    }

    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      return {
        name: 'Kiểm tra Private Key Format',
        status: 'error',
        message: 'Private Key không có BEGIN header'
      };
    }

    if (!privateKey.includes('-----END PRIVATE KEY-----')) {
      return {
        name: 'Kiểm tra Private Key Format',
        status: 'error',
        message: 'Private Key không có END footer'
      };
    }

    return {
      name: 'Kiểm tra Private Key Format',
      status: 'success',
      message: 'Private Key có format đúng',
      details: { 
        hasBegin: true,
        hasEnd: true,
        length: privateKey.length
      }
    };
  };

  // Test kết nối chi tiết
  const runDetailedTest = async () => {
    setStatus(prev => ({ ...prev, isRunning: true, steps: initializeSteps() }));

    try {
      // Step 1: Kiểm tra Environment Variables
      const envStep = checkEnvironmentVariables();
      updateStep(0, envStep);
      if (envStep.status === 'error') return;

      // Step 2: Kiểm tra Spreadsheet ID
      const spreadsheetStep = checkSpreadsheetId();
      updateStep(1, spreadsheetStep);
      if (spreadsheetStep.status === 'error') return;

      // Step 3: Kiểm tra Service Account Email
      const emailStep = checkServiceAccountEmail();
      updateStep(2, emailStep);
      if (emailStep.status === 'error') return;

      // Step 4: Kiểm tra Private Key Format
      const keyStep = checkPrivateKeyFormat();
      updateStep(3, keyStep);
      if (keyStep.status === 'error') return;

      // Step 5: Test JWT Creation
      updateStep(4, { status: 'pending', message: 'Đang tạo JWT token...' });
      try {
        const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID!;
        const clientEmail = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL!;
        const privateKey = process.env.REACT_APP_GOOGLE_PRIVATE_KEY!;

        // Test JWT creation
        const isConnected = await initializeGoogleServiceAccountVercel(
          spreadsheetId,
          clientEmail,
          privateKey
        );

        if (isConnected) {
          updateStep(4, { status: 'success', message: 'JWT token được tạo thành công' });
          updateStep(5, { status: 'success', message: 'Access token được lấy thành công' });
          updateStep(6, { status: 'success', message: 'Kết nối Google Sheets thành công' });
        } else {
          updateStep(4, { status: 'error', message: 'Không thể tạo JWT token' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        updateStep(4, { status: 'error', message: `Lỗi JWT: ${errorMessage}` });
      }

    } catch (error) {
      console.error('Lỗi debug:', error);
    } finally {
      setStatus(prev => ({ ...prev, isRunning: false }));
    }
  };

  // Test với config tùy chỉnh
  const testWithCustomConfig = async () => {
    if (!status.customConfig.spreadsheetId || !status.customConfig.clientEmail || !status.customConfig.privateKey) {
      alert('Vui lòng điền đầy đủ thông tin cấu hình');
      return;
    }

    setStatus(prev => ({ ...prev, isRunning: true }));

    try {
      const isConnected = await initializeGoogleServiceAccountVercel(
        status.customConfig.spreadsheetId,
        status.customConfig.clientEmail,
        status.customConfig.privateKey
      );

      if (isConnected) {
        alert('✅ Kết nối thành công với config tùy chỉnh!');
      } else {
        alert('❌ Kết nối thất bại với config tùy chỉnh');
      }
    } catch (error) {
      alert(`❌ Lỗi: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setStatus(prev => ({ ...prev, isRunning: false }));
    }
  };

  // Copy environment variables
  const copyEnvVars = () => {
    const envVars = {
      REACT_APP_GOOGLE_SPREADSHEET_ID: process.env.REACT_APP_GOOGLE_SPREADSHEET_ID,
      REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
      REACT_APP_GOOGLE_PRIVATE_KEY: process.env.REACT_APP_GOOGLE_PRIVATE_KEY
    };

    navigator.clipboard.writeText(JSON.stringify(envVars, null, 2));
    alert('Đã copy environment variables vào clipboard');
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            🐛 Debug Chi Tiết Vercel - Google Sheets
          </Typography>
          <Chip
            icon={<BugReportIcon />}
            label="Debug Mode"
            color="warning"
            variant="outlined"
          />
        </Box>

        {/* Environment Variables Info */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            📋 Thông Tin Environment Variables
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <div>REACT_APP_GOOGLE_SPREADSHEET_ID: {process.env.REACT_APP_GOOGLE_SPREADSHEET_ID ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}</div>
            <div>REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL: {process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}</div>
            <div>REACT_APP_GOOGLE_PRIVATE_KEY: {process.env.REACT_APP_GOOGLE_PRIVATE_KEY ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}</div>
          </Box>
          <Button
            size="small"
            startIcon={<CopyIcon />}
            onClick={copyEnvVars}
            sx={{ mt: 1 }}
          >
            Copy Env Vars
          </Button>
        </Paper>

        {/* Debug Steps */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              🔍 Chi Tiết Debug Steps
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {status.steps.map((step, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {step.status === 'pending' && <CircularProgress size={20} />}
                    {step.status === 'success' && <CheckCircleIcon color="success" />}
                    {step.status === 'error' && <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={step.name}
                    secondary={step.message}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Custom Config Test */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              ⚙️ Test Với Config Tùy Chỉnh
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Spreadsheet ID"
                value={status.customConfig.spreadsheetId}
                onChange={(e) => setStatus(prev => ({
                  ...prev,
                  customConfig: { ...prev.customConfig, spreadsheetId: e.target.value }
                }))}
                placeholder="1FjhaEQdhER3mXQFm3lLtG08IsaUak1aL-gRDSOdI3No"
              />
              <TextField
                label="Service Account Email"
                value={status.customConfig.clientEmail}
                onChange={(e) => setStatus(prev => ({
                  ...prev,
                  customConfig: { ...prev.customConfig, clientEmail: e.target.value }
                }))}
                placeholder="your-service-account@your-project.iam.gserviceaccount.com"
              />
              <TextField
                label="Private Key"
                type={status.showPrivateKey ? 'text' : 'password'}
                value={status.customConfig.privateKey}
                onChange={(e) => setStatus(prev => ({
                  ...prev,
                  customConfig: { ...prev.customConfig, privateKey: e.target.value }
                }))}
                multiline
                rows={4}
                placeholder="-----BEGIN PRIVATE KEY-----..."
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setStatus(prev => ({ ...prev, showPrivateKey: !prev.showPrivateKey }))}
                    >
                      {status.showPrivateKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </Button>
                  )
                }}
              />
              <Button
                variant="contained"
                onClick={testWithCustomConfig}
                disabled={status.isRunning}
                startIcon={status.isRunning ? <CircularProgress size={20} /> : <RefreshIcon />}
              >
                Test Với Config Tùy Chỉnh
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Action Buttons */}
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="contained"
            onClick={runDetailedTest}
            disabled={status.isRunning}
            startIcon={status.isRunning ? <CircularProgress size={20} /> : <BugReportIcon />}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            {status.isRunning ? 'Đang Debug...' : 'Chạy Debug Chi Tiết'}
          </Button>
        </Box>

        {/* Troubleshooting Tips */}
        <Paper sx={{ p: 2, mt: 2, backgroundColor: '#fff3e0' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            💡 Troubleshooting Tips
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Kiểm tra Private Key có đầy đủ BEGIN/END headers không
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Đảm bảo Service Account có quyền truy cập Google Sheets
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Kiểm tra Spreadsheet ID có đúng không (từ URL)
          </Typography>
          <Typography variant="body2">
            • Redeploy Vercel sau khi thêm environment variables
          </Typography>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default VercelDebug; 