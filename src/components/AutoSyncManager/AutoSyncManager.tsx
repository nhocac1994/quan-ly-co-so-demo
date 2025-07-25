import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  Sync as SyncIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { 
  initializeGoogleServiceAccount, 
  syncDataWithServiceAccount,
  syncFromGoogleSheetsWithServiceAccount,
  syncBidirectionalWithServiceAccount
} from '../../services/googleServiceAccount';
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

interface AutoSyncConfig {
  enabled: boolean;
  interval: number; // minutes
  mode: 'upload' | 'download' | 'bidirectional';
  storageMode: 'local' | 'cloud' | 'hybrid';
}

const AutoSyncManager: React.FC = () => {
  const [config, setConfig] = useState<AutoSyncConfig>({
    enabled: true,
    interval: 1, // 1 phút mặc định để tránh rate limiting
    mode: 'bidirectional',
    storageMode: 'hybrid'
  });
  
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
  const [isAutoSyncActive, setIsAutoSyncActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load config từ localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('autoSyncConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      
      // Nếu config đã được bật trước đó, khởi động lại auto sync
      if (parsedConfig.enabled) {
        // Delay một chút để đảm bảo component đã mount hoàn toàn
        setTimeout(() => {
          startAutoSync();
        }, 100);
      } else {
        setIsAutoSyncActive(false);
      }
    } else {
      // Nếu chưa có config được lưu, sử dụng config mặc định và khởi động auto sync
      setTimeout(() => {
        startAutoSync();
      }, 100);
    }
    
    const savedStats = localStorage.getItem('autoSyncStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Save config vào localStorage và quản lý auto sync
  useEffect(() => {
    localStorage.setItem('autoSyncConfig', JSON.stringify(config));
    
    // Quản lý auto sync dựa trên config
    if (config.enabled) {
      startAutoSync();
    } else {
      stopAutoSync();
    }
  }, [config.enabled, config.interval]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => stopAutoSync();
  }, []);

  const startAutoSync = () => {
    // Clear existing interval trước
    stopAutoSync();
    
    const syncFunction = async () => {
      await performSync();
    };
    
    // Sync immediately nếu đã có dữ liệu
    const hasData = localStorage.getItem('thietBi') || 
                   localStorage.getItem('coSoVatChat') || 
                   localStorage.getItem('lichSuSuDung');
    
    if (hasData) {
      syncFunction();
    }
    
    // Set interval mới
    intervalRef.current = setInterval(syncFunction, config.interval * 60 * 1000);
    setIsAutoSyncActive(true);
    
    const intervalText = config.interval < 1 ? `${Math.round(config.interval * 60)} giây` : `${config.interval} phút`;
    console.log(`Auto sync đã được khởi động với chu kỳ ${intervalText}`);
  };

  const stopAutoSync = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsAutoSyncActive(false);
      console.log('Auto sync đã được dừng');
    }
  };

  const performSync = async () => {
    if (isSyncing) return;
    
    const startTime = Date.now();
    setIsSyncing(true);
    setSyncProgress(0);
    setError(null);
    
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

      setSyncProgress(20);

      // Kiểm tra Service Account
      const serviceAccountCredentials = localStorage.getItem('serviceAccountCredentials');
      const serviceAccountSpreadsheetId = localStorage.getItem('serviceAccountSpreadsheetId');
      
      if (!serviceAccountCredentials || !serviceAccountSpreadsheetId) {
        throw new Error('Chưa cấu hình Service Account');
      }

      setSyncProgress(40);

      let syncResult;
      switch (config.mode) {
        case 'upload':
          await syncDataWithServiceAccount(localStorageData);
          break;
        case 'download':
          await syncFromGoogleSheetsWithServiceAccount();
          break;
        case 'bidirectional':
          await syncBidirectionalWithServiceAccount(localStorageData);
          break;
      }

      setSyncProgress(80);

      // Tính toán thống kê
      const endTime = Date.now();
      const duration = endTime - startTime;
      const dataSize = JSON.stringify(localStorageData).length;
      
      const newStats: SyncStats = {
        totalSyncs: stats.totalSyncs + 1,
        successfulSyncs: stats.successfulSyncs + 1,
        failedSyncs: stats.failedSyncs,
        averageSpeed: stats.averageSpeed === 0 ? duration : (stats.averageSpeed + duration) / 2,
        lastSyncTime: endTime,
        lastSyncDuration: duration,
        dataSize: dataSize
      };
      
      setStats(newStats);
      localStorage.setItem('autoSyncStats', JSON.stringify(newStats));
      
      setSyncProgress(100);
      
      // Reset progress sau 2 giây
      setTimeout(() => setSyncProgress(0), 2000);
      
    } catch (error) {
      const newStats: SyncStats = {
        ...stats,
        totalSyncs: stats.totalSyncs + 1,
        failedSyncs: stats.failedSyncs + 1
      };
      setStats(newStats);
      localStorage.setItem('autoSyncStats', JSON.stringify(newStats));
      
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
      setSyncProgress(0);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    await performSync();
  };

  const resetStats = () => {
    const newStats: SyncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSpeed: 0,
      lastSyncTime: 0,
      lastSyncDuration: 0,
      dataSize: 0
    };
    setStats(newStats);
    localStorage.setItem('autoSyncStats', JSON.stringify(newStats));
  };

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
              <Tooltip title="Đồng bộ thủ công">
                <IconButton 
                  onClick={handleManualSync} 
                  disabled={isSyncing}
                  color="primary"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset thống kê">
                <IconButton onClick={resetStats} color="secondary">
                  <TrendingUpIcon />
                </IconButton>
              </Tooltip>
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
                {config.enabled && isAutoSyncActive 
                  ? '🟢 Đồng bộ tự động đang hoạt động' 
                  : config.enabled 
                    ? '🟡 Đồng bộ tự động đang khởi động...' 
                    : '🔴 Đồng bộ tự động đã tắt'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {config.enabled 
                  ? `Tự động đồng bộ mỗi ${config.interval < 1 ? Math.round(config.interval * 60) + ' giây' : config.interval + ' phút'}` 
                  : 'Bật để kích hoạt đồng bộ tự động'
                }
              </Typography>
              {config.enabled && isAutoSyncActive && (
                <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                  ✅ Đã kết nối và sẵn sàng đồng bộ
                </Typography>
              )}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
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
              <SyncIcon sx={{ mr: 1, animation: 'spin 1s linear infinite' }} />
              <Typography variant="body2">Đang đồng bộ... {syncProgress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={syncProgress} />
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
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <TimerIcon sx={{ mr: 1, fontSize: 28 }} />
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
                onChange={(_, value) => setConfig(prev => ({ ...prev, interval: value as number }))}
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
                disabled={!config.enabled}
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
          </Paper>
        </Box>

        {/* Sync Mode & Storage Mode - Side by Side */}
        <Grid container spacing={3} mb={3}>
          {/* Sync Mode */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box display="flex" alignItems="center" mb={3}>
                <SyncIcon sx={{ mr: 1, fontSize: 28 }} />
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
                    onClick={() => setConfig(prev => ({ ...prev, mode: mode.value as any }))}
                    disabled={!config.enabled}
                    size="medium"
                    sx={{ 
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      minWidth: '100px'
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Storage Mode */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box display="flex" alignItems="center" mb={3}>
                <StorageIcon sx={{ mr: 1, fontSize: 28 }} />
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
                    onClick={() => setConfig(prev => ({ ...prev, storageMode: mode.value as any }))}
                    disabled={!config.enabled}
                    size="medium"
                    sx={{ 
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      minWidth: '100px'
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Statistics */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            📈 Chỉ Số Hiệu Suất
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3} lg={2}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="primary">
                  {stats.totalSyncs}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng lần đồng bộ
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3} lg={2}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="success.main">
                  {getSuccessRate()}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tỷ lệ thành công
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3} lg={2}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="info.main">
                  {formatDuration(stats.averageSpeed)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tốc độ trung bình
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3} lg={2}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="warning.main">
                  {formatDataSize(stats.dataSize)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kích thước dữ liệu
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3} lg={2}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="error.main">
                  {stats.failedSyncs}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lần thất bại
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3} lg={2}>
              <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" color="secondary.main">
                  {stats.successfulSyncs}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lần thành công
                </Typography>
              </Paper>
            </Grid>
          </Grid>
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