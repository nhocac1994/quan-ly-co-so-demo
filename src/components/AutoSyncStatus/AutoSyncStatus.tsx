import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Slide
} from '@mui/material';
import {
  CloudSync as CloudSyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAutoSync } from '../../contexts/AutoSyncContext';

// Component nhỏ gọn cho header
export const AutoSyncStatusIcon: React.FC = () => {
  const theme = useTheme();
  const { status, refreshData } = useAutoSync();

  const getStatusColor = () => {
    if (status.error) return 'error';
    if (status.isConnected && status.isRunning) return 'success';
    if (status.isConnected) return 'warning';
    return 'error';
  };

  const getStatusIcon = () => {
    if (status.error) return <ErrorIcon sx={{ fontSize: 18 }} />;
    if (status.isConnected && status.isRunning) return <CloudSyncIcon sx={{ fontSize: 18 }} />;
    if (status.isConnected) return <CheckCircleIcon sx={{ fontSize: 18 }} />;
    return <ErrorIcon sx={{ fontSize: 18 }} />;
  };

  const getTooltipText = () => {
    if (status.error) return `Lỗi: ${status.error}`;
    if (status.isConnected && status.isRunning) return 'Đang đồng bộ...';
    if (status.isConnected) return 'Kết nối thành công';
    return 'Không kết nối';
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Lỗi khi refresh:', error);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {status.isProcessing && (
        <Box sx={{ width: 16, height: 16 }}>
          <LinearProgress 
            sx={{ 
              height: 2, 
              borderRadius: 1,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
              }
            }} 
          />
        </Box>
      )}
      
      <Tooltip title={getTooltipText()}>
        <span>
          <IconButton 
            size="small" 
            onClick={handleRefresh}
            disabled={status.isProcessing}
            sx={{ 
              color: getStatusColor() === 'success' ? theme.palette.success.main : 
                     getStatusColor() === 'error' ? theme.palette.error.main : 
                     theme.palette.warning.main,
              '&:hover': { backgroundColor: `rgba(${getStatusColor() === 'success' ? '76, 175, 80' : getStatusColor() === 'error' ? '244, 67, 54' : '255, 152, 0'}, 0.1)` },
              width: 24,
              height: 24,
              p: 0
            }}
          >
            {getStatusIcon()}
          </IconButton>
        </span>
      </Tooltip>
      
      {status.queueLength > 0 && (
        <Chip
          label={status.queueLength}
          size="small"
          color="warning"
          sx={{ 
            fontSize: '0.6rem',
            height: 16,
            minWidth: 16,
            '& .MuiChip-label': {
              fontSize: '0.6rem',
              px: 0.5
            }
          }}
        />
      )}
    </Box>
  );
};

// Component đầy đủ cho trang Quản lý đồng bộ
const AutoSyncStatus: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { status, config, refreshData, showUpdateNotification } = useAutoSync();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (status.error) return 'error';
    if (status.isConnected && status.isRunning) return 'success';
    if (status.isConnected) return 'warning';
    return 'error';
  };

  const getStatusText = () => {
    if (status.error) return 'Lỗi kết nối';
    if (status.isConnected && status.isRunning) return 'Đang đồng bộ';
    if (status.isConnected) return 'Sẵn sàng';
    return 'Không kết nối';
  };

  const getStatusIcon = () => {
    if (status.error) return <ErrorIcon />;
    if (status.isConnected && status.isRunning) return <CloudSyncIcon />;
    if (status.isConnected) return <CheckCircleIcon />;
    return <ErrorIcon />;
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Lỗi khi refresh:', error);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : '1.1rem' }}>
            📊 Trạng Thái Đồng Bộ
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh dữ liệu">
              <span>
                <IconButton 
                  size="small" 
                  onClick={handleRefresh}
                  disabled={status.isProcessing}
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                    width: 28,
                    height: 28
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Chip
              icon={getStatusIcon()}
              label={getStatusText()}
              color={getStatusColor() as any}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: '0.7rem',
                height: 24,
                '& .MuiChip-label': {
                  fontSize: '0.7rem',
                  px: 1
                }
              }}
            />
          </Box>
        </Box>

        {/* Progress Bar */}
        {status.isProcessing && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                }
              }} 
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Đang xử lý...
            </Typography>
          </Box>
        )}

        {/* Status Grid */}
        <Grid container spacing={isMobile ? 1 : 2}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant={isMobile ? "h6" : "h6"} color="primary" sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                {status.syncCount}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Lần đồng bộ
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant={isMobile ? "h6" : "h6"} color="success.main" sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                {status.dataVersion}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Phiên bản dữ liệu
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant={isMobile ? "h6" : "h6"} color="info.main" sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                {status.queueLength}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Hàng chờ
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant={isMobile ? "h6" : "h6"} color="warning.main" sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : '1.1rem' }}>
                {config.interval}s
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Chu kỳ đồng bộ
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Timestamps */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
            {status.lastSync && (
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon color="action" sx={{ fontSize: 14 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Đồng bộ cuối
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                      {status.lastSync}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            {status.lastDataUpdate && (
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <InfoIcon color="action" sx={{ fontSize: 14 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Cập nhật dữ liệu cuối
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                      {status.lastDataUpdate}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Error Display */}
        {status.error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 1, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              <strong>Lỗi:</strong> {status.error}
            </Typography>
          </Alert>
        )}

        {/* Connection Status */}
        <Box sx={{ mt: 2 }}>
          <Alert 
            severity={status.isConnected ? "success" : "error"} 
            icon={status.isConnected ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ErrorIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: 1, py: 0.5 }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {status.isConnected 
                ? "Kết nối Google Sheets thành công" 
                : "Không thể kết nối Google Sheets"
              }
            </Typography>
          </Alert>
        </Box>

        {/* Auto Sync Status */}
        <Box sx={{ mt: 2 }}>
          <Alert 
            severity={config.isEnabled ? "info" : "warning"} 
            icon={config.isEnabled ? <CloudSyncIcon sx={{ fontSize: 16 }} /> : <WarningIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: 1, py: 0.5 }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {config.isEnabled 
                ? `Đồng bộ tự động đang chạy (${config.interval}s/lần)` 
                : "Đồng bộ tự động đã tắt"
              }
            </Typography>
          </Alert>
        </Box>
      </Box>
      
      {/* Thông báo cập nhật dữ liệu */}
      <DataUpdateNotification show={showUpdateNotification} />
    </Box>
  );
};

// Thông báo cập nhật dữ liệu
const DataUpdateNotification: React.FC<{ show: boolean }> = ({ show }) => {
  return (
    <Slide direction="down" in={show} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          maxWidth: 400
        }}
      >
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ✅ Dữ liệu đã được cập nhật từ Google Sheets
          </Typography>
        </Alert>
      </Box>
    </Slide>
  );
};

export default AutoSyncStatus; 