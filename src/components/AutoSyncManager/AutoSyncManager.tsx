import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Alert,
  Button
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAutoSync } from '../../contexts/AutoSyncContext';
import { 
  thietBiService, 
  coSoVatChatService, 
  lichSuSuDungService, 
  baoTriService, 
  thongBaoService, 
  nguoiDungService 
} from '../../services/localStorage';

interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSpeed: number; // milliseconds
  lastSyncTime: number;
  lastSyncDuration: number;
  dataSize: number; // bytes
}

const AutoSyncManager: React.FC = () => {
  const { config, status, updateConfig, stopAutoSync, performManualSync, resetStats } = useAutoSync();
  
  const [stats, setStats] = useState<SyncStats>({
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    averageSpeed: 0,
    lastSyncTime: 0,
    lastSyncDuration: 0,
    dataSize: 0
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load config và stats từ localStorage
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('autoSyncConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        // Cập nhật config thông qua context
        updateConfig(parsedConfig);
      } catch (error) {
        console.error('Lỗi khi parse auto sync config:', error);
      }
    }

    const savedStats = localStorage.getItem('autoSyncStats');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        setStats(parsedStats);
      } catch (error) {
        console.error('Lỗi khi parse auto sync stats:', error);
      }
    }
  }, [updateConfig]);

  // Save stats vào localStorage
  React.useEffect(() => {
    localStorage.setItem('autoSyncStats', JSON.stringify(stats));
  }, [stats]);

  const handleManualSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    setError(null);
    
    try {
      const startTime = Date.now();
      setSyncProgress(20);
      
      // Sử dụng performManualSync từ context
      await performManualSync();
      
      setSyncProgress(80);
      
      // Cập nhật thống kê
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      setStats((prev: SyncStats) => ({
        ...prev,
        totalSyncs: prev.totalSyncs + 1,
        successfulSyncs: prev.successfulSyncs + 1,
        averageSpeed: (prev.averageSpeed * prev.totalSyncs + duration) / (prev.totalSyncs + 1),
        lastSyncTime: endTime,
        lastSyncDuration: duration,
        dataSize: JSON.stringify({
          thietBi: thietBiService.getAll(),
          coSoVatChat: coSoVatChatService.getAll(),
          lichSuSuDung: lichSuSuDungService.getAll(),
          baoTri: baoTriService.getAll(),
          thongBao: thongBaoService.getAll(),
          nguoiDung: nguoiDungService.getAll()
        }).length
      }));
      
      setSyncProgress(100);
      console.log(`✅ Đồng bộ thủ công thành công trong ${duration}ms`);
      
    } catch (error) {
      console.error('❌ Lỗi khi đồng bộ thủ công:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
      
      setStats((prev: SyncStats) => ({
        ...prev,
        totalSyncs: prev.totalSyncs + 1,
        failedSyncs: prev.failedSyncs + 1
      }));
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleResetStats = () => {
    setStats({
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSpeed: 0,
      lastSyncTime: 0,
      lastSyncDuration: 0,
      dataSize: 0
    });
    resetStats();
  };

  // Cleanup khi component unmount
  React.useEffect(() => {
    return () => stopAutoSync();
  }, [stopAutoSync]);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDataSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getSuccessRate = (): number => {
    if (stats.totalSyncs === 0) return 0;
    return Math.round((stats.successfulSyncs / stats.totalSyncs) * 100);
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2, width: '100%' }}>
      <CardContent>
        {/* Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              🔄 Cài Đặt Đồng Bộ
            </Typography>
            <Box display="flex" gap={1}>
              <Button 
                onClick={handleManualSync} 
                disabled={isSyncing}
                variant="contained"
                startIcon={<RefreshIcon />}
              >
                Đồng bộ thủ công
              </Button>
              <Button onClick={handleResetStats} variant="outlined" startIcon={<TrendingUpIcon />}>
                Reset thống kê
              </Button>
            </Box>
          </Box>

          {/* Cảnh báo về rate limiting */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>💡 Lưu ý:</strong> Để tránh lỗi rate limiting (429), khuyến nghị đồng bộ tối thiểu 15 giây.
              Google Sheets API có giới hạn 100 requests/phút cho mỗi project.
            </Typography>
          </Alert>

        {/* Auto Sync Toggle */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {config.isEnabled && status.isConnected 
                  ? '🟢 Đồng bộ tự động đang hoạt động' 
                  : config.isEnabled 
                    ? '🟡 Đồng bộ tự động đang khởi động...' 
                    : '🔴 Đồng bộ tự động đã tắt'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {config.isEnabled 
                  ? `Tự động đồng bộ mỗi ${config.interval < 1 ? Math.round(config.interval * 60) + ' giây' : config.interval + ' phút'}` 
                  : 'Bật để kích hoạt đồng bộ tự động'
                }
              </Typography>
              {config.isEnabled && status.isConnected && (
                <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                  ✅ Đã kết nối và sẵn sàng đồng bộ
                </Typography>
              )}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={config.isEnabled}
                  onChange={(e) => updateConfig({ isEnabled: e.target.checked })}
                  color="primary"
                />
              }
              label=""
            />
          </Box>

        {/* Progress Bar */}
        {isSyncing && (
          <Box mb={3}>
            <Box display="flex" alignItems="center" mb={1}>
              {/* SyncIcon */}
              <Typography variant="body2">Đang đồng bộ... {syncProgress}%</Typography>
            </Box>
            {/* LinearProgress */}
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

                {/* Sync Frequency - Full Width */}
        <Box sx={{ mb: 3 }}>
          {/* Paper */}
          <Box sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              {/* TimerIcon */}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Tần Suất Đồng Bộ
              </Typography>
            </Box>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                {config.interval < 1 ? `${Math.round(config.interval * 60)}s` : `${config.interval} phút`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kéo thanh trượt để điều chỉnh tần suất đồng bộ
              </Typography>
            </Box>
            <Box sx={{ px: 4, py: 3 }}>
                              <Slider
                  value={config.interval}
                  onChange={(_, value) => updateConfig({ interval: value as number })}
                  min={0.25}
                  max={60}
                  step={null}
                  marks={[
                    { value: 0.25, label: '15s' },
                    { value: 1, label: '1m' },
                    { value: 5, label: '5m' },
                    { value: 15, label: '15m' },
                    { value: 30, label: '30m' },
                    { value: 60, label: '1h' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => 
                    value < 1 ? `${Math.round(value * 60)}s` : `${value}m`
                  }
                  disabled={!config.isEnabled}
                                  sx={{
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: 'text.secondary',
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'center',
                      marginTop: '12px',
                      marginLeft: '4px',
                      whiteSpace: 'nowrap'
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: 'primary.main',
                      height: 8,
                      width: 2
                    },
                    '& .MuiSlider-thumb': {
                      height: 28,
                      width: 28,
                      backgroundColor: 'primary.main',
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.5)'
                      }
                    },
                    '& .MuiSlider-track': {
                      height: 8,
                      borderRadius: 4
                    },
                    '& .MuiSlider-rail': {
                      height: 8,
                      borderRadius: 4
                    },
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: 'primary.main',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }
                  }}
              />
            </Box>
          </Box>
        </Box>

        {/* Sync Mode & Storage Mode - Side by Side */}
        {/* Grid */}
        <Box sx={{ mb: 3 }}>
          {/* Sync Mode */}
          {/* Paper */}
          <Box sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={3}>
              {/* SyncIcon */}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Phương Thức Đồng Bộ
              </Typography>
            </Box>
            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
              {[
                { value: 'upload', label: 'Chỉ ghi lên', color: 'success' },
                { value: 'download', label: 'Chỉ đọc về', color: 'info' },
                { value: 'bidirectional', label: 'Hai chiều', color: 'secondary' }
              ].map((mode) => (
                <Chip
                  key={mode.value}
                  label={mode.label}
                  color={config.mode === mode.value ? mode.color as any : 'default'}
                  variant={config.mode === mode.value ? 'filled' : 'outlined'}
                  onClick={() => updateConfig({ mode: mode.value as any })}
                  disabled={!config.isEnabled}
                  size="medium"
                  sx={{ 
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    minWidth: '100px'
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Storage Mode */}
          {/* Paper */}
          <Box sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={3}>
              {/* StorageIcon */}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Chế Độ Lưu Trữ
              </Typography>
            </Box>
            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
              {[
                { value: 'local', label: 'Cục bộ', color: 'warning' },
                { value: 'cloud', label: 'Đám mây', color: 'info' },
                { value: 'hybrid', label: 'Kết hợp', color: 'primary' }
              ].map((mode) => (
                <Chip
                  key={mode.value}
                  label={mode.label}
                  color={config.storageMode === mode.value ? mode.color as any : 'default'}
                  variant={config.storageMode === mode.value ? 'filled' : 'outlined'}
                  onClick={() => updateConfig({ storageMode: mode.value as any })}
                  disabled={!config.isEnabled}
                  size="medium"
                  sx={{ 
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    minWidth: '100px'
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Statistics */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            📈 Chỉ Số Hiệu Suất
          </Typography>
          {/* Grid */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="primary">
                {stats.totalSyncs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng lần đồng bộ
              </Typography>
            </Box>
            <Box sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="success.main">
                {getSuccessRate()}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tỷ lệ thành công
              </Typography>
            </Box>
            <Box sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="info.main">
                {formatDuration(stats.averageSpeed)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tốc độ trung bình
              </Typography>
            </Box>
            <Box sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="warning.main">
                {formatDataSize(stats.dataSize)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kích thước dữ liệu
              </Typography>
            </Box>
            <Box sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="error.main">
                {stats.failedSyncs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lần thất bại
              </Typography>
            </Box>
            <Box sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="secondary.main">
                {stats.successfulSyncs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lần thành công
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Last Sync Info */}
        {stats.lastSyncTime > 0 && (
          <Box mt={3}>
            <Typography variant="body2" color="text.secondary">
              🕒 Lần đồng bộ cuối: {new Date(stats.lastSyncTime).toLocaleString('vi-VN')} 
              ({formatDuration(stats.lastSyncDuration)})
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoSyncManager; 