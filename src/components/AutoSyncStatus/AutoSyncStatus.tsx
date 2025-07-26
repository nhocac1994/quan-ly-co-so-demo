import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  CloudSync as CloudSyncIcon,
  Timer as TimerIcon,
  Queue as QueueIcon
} from '@mui/icons-material';
import { useAutoSync } from '../../contexts/AutoSyncContext';

const AutoSyncStatus: React.FC = () => {
  const { config, status, performManualSync } = useAutoSync();

  const getStatusColor = () => {
    if (status.error) return 'error';
    if (status.isProcessing || status.isRunning) return 'warning';
    if (status.isConnected) return 'success';
    if (!config.isEnabled) return 'default';
    return 'default';
  };

  const getStatusIcon = () => {
    if (status.isProcessing || status.isRunning) return <CircularProgress size={16} />;
    if (status.error) return <ErrorIcon fontSize="small" />;
    if (status.isConnected) return <CheckCircleIcon fontSize="small" />;
    return <CloudSyncIcon fontSize="small" />;
  };

  const getStatusText = () => {
    if (status.isProcessing) return 'Đang đồng bộ...';
    if (status.isRunning) return 'Auto sync';
    if (status.error) return 'Lỗi kết nối';
    if (status.isConnected) return 'Đã kết nối';
    if (!config.isEnabled) return 'Tắt auto sync';
    return 'Chưa kết nối';
  };

  const handleManualSync = async () => {
    if (!status.isProcessing && !status.isRunning) {
      await performManualSync();
    }
  };

  if (!config.isEnabled) {
    return null; // Không hiển thị nếu auto-sync bị tắt
  }

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {/* Trạng thái kết nối */}
      <Tooltip title={status.error || getStatusText()}>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          size="small"
          variant="outlined"
        />
      </Tooltip>

                  {/* Queue length (chỉ hiển thị khi có pending changes) */}
                  {status.queueLength > 0 && (
                    <Tooltip title={`${status.queueLength} thay đổi đang chờ đồng bộ`}>
                      <Chip
                        icon={<QueueIcon fontSize="small" />}
                        label={status.queueLength}
                        size="small"
                        variant="outlined"
                        color="warning"
                        sx={{ fontSize: '0.75rem', minWidth: 'auto' }}
                      />
                    </Tooltip>
                  )}

                  {/* Thời gian đồng bộ cuối */}
                  {status.lastSync && (
                    <Tooltip title={`Lần đồng bộ cuối: ${status.lastSync}`}>
                      <Chip
                        icon={<TimerIcon fontSize="small" />}
                        label={status.lastSync.split(' ')[1]}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Tooltip>
                  )}

                  {/* Số lần đồng bộ */}
                  {status.syncCount > 0 && (
                    <Tooltip title={`Đã đồng bộ ${status.syncCount} lần`}>
                      <Chip
                        label={`${status.syncCount}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', minWidth: 'auto' }}
                      />
                    </Tooltip>
                  )}

                  {/* Nút đồng bộ thủ công */}
                  <Tooltip title="Đồng bộ thủ công">
                    <span>
                      <IconButton
                        size="small"
                        onClick={handleManualSync}
                        disabled={status.isProcessing || status.isRunning}
                        sx={{ 
                          color: status.isConnected ? 'success.main' : 'error.main',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                        }}
                      >
                        <SyncIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
    </Box>
  );
};

export default AutoSyncStatus; 