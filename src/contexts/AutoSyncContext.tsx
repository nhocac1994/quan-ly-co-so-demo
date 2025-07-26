import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  initializeGoogleSheets, 
  syncDataToGoogleSheets,
  testGoogleSheetsConnection
} from '../services/googleSheetsService';
import { syncEventService } from '../services/syncEventService';
import { 
  thietBiService, 
  coSoVatChatService, 
  lichSuSuDungService, 
  baoTriService, 
  thongBaoService, 
  nguoiDungService 
} from '../services/localStorage';

interface AutoSyncConfig {
  isEnabled: boolean;
  interval: number; // seconds cho auto sync
  storageMode: 'local' | 'cloud' | 'hybrid';
}

interface AutoSyncStatus {
  isRunning: boolean;
  lastSync: string | null;
  error: string | null;
  syncCount: number;
  isConnected: boolean;
  queueLength: number;
  isProcessing: boolean;
}

interface AutoSyncContextType {
  config: AutoSyncConfig;
  status: AutoSyncStatus;
  updateConfig: (newConfig: Partial<AutoSyncConfig>) => void;
  startAutoSync: () => void;
  stopAutoSync: () => void;
  performManualSync: () => Promise<void>;
  resetStats: () => void;
  forceSync: () => Promise<void>;
}

const AutoSyncContext = createContext<AutoSyncContextType | undefined>(undefined);

// Lưu config vào localStorage
const saveConfigToStorage = (config: AutoSyncConfig) => {
  localStorage.setItem('autoSyncConfig', JSON.stringify(config));
};

// Lấy config từ localStorage
const getConfigFromStorage = (): AutoSyncConfig => {
  const saved = localStorage.getItem('autoSyncConfig');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Lỗi khi parse auto sync config:', error);
    }
  }
  
  // Default config - simplified
  return {
    isEnabled: true, // Bật auto sync mặc định
    interval: 5, // 5 giây
    storageMode: 'hybrid'
  };
};

export const AutoSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AutoSyncConfig>(getConfigFromStorage);
  const [status, setStatus] = useState<AutoSyncStatus>({
    isRunning: false,
    lastSync: null,
    error: null,
    syncCount: 0,
    isConnected: false,
    queueLength: 0,
    isProcessing: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const statusUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lock để tránh multiple sync operations đồng thời
  const syncLockRef = useRef(false);

  // Kiểm tra kết nối Google Sheets
  const checkConnection = useCallback(async (): Promise<boolean> => {
    // Nếu đã check rồi thì không check nữa
    if (status.isConnected || status.error) {
      return status.isConnected;
    }

    try {
      const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
      const clientEmail = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;

      if (!spreadsheetId || !clientEmail || !privateKey) {
        setStatus(prev => ({ ...prev, isConnected: false, error: 'Thiếu environment variables' }));
        return false;
      }

      const isConnected = await initializeGoogleSheets(spreadsheetId, clientEmail, privateKey);

      setStatus(prev => ({ 
        ...prev, 
        isConnected,
        error: isConnected ? null : 'Không thể kết nối Google Sheets'
      }));

      return isConnected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: `Lỗi kết nối: ${errorMessage}` 
      }));
      return false;
    }
  }, [status.isConnected, status.error]);

  // Cập nhật trạng thái từ sync event service
  const updateStatusFromEventService = useCallback(() => {
    const queueStatus = syncEventService.getQueueStatus();
    setStatus(prev => ({
      ...prev,
      queueLength: queueStatus.queueLength,
      isProcessing: queueStatus.isProcessing,
      lastSync: queueStatus.lastSyncTime ? new Date(queueStatus.lastSyncTime).toLocaleString('vi-VN') : prev.lastSync
    }));
  }, []);

  // Thực hiện sync với lock
  const performSync = useCallback(async () => {
    // Kiểm tra lock
    if (syncLockRef.current) {
      // console.log('🔄 Sync đang chạy, bỏ qua request này');
      return;
    }

    // Set lock
    syncLockRef.current = true;
    setStatus(prev => ({ ...prev, isProcessing: true }));

    try {
      // console.log('🔄 Bắt đầu sync...');
      
      // Lấy dữ liệu từ localStorage
      const localStorageData = {
        thietBi: thietBiService.getAll(),
        coSoVatChat: coSoVatChatService.getAll(),
        lichSuSuDung: lichSuSuDungService.getAll(),
        baoTri: baoTriService.getAll(),
        thongBao: thongBaoService.getAll(),
        nguoiDung: nguoiDungService.getAll()
      };

      // Sync lên Google Sheets
      await syncDataToGoogleSheets(localStorageData);

      // Cập nhật trạng thái
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        lastSync: new Date().toLocaleString('vi-VN'),
        syncCount: prev.syncCount + 1,
        error: null,
        isProcessing: false
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error('❌ Lỗi đồng bộ:', errorMessage);
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        error: `Lỗi đồng bộ: ${errorMessage}`,
        isProcessing: false
      }));
    } finally {
      // Release lock
      syncLockRef.current = false;
    }
  }, []); // Loại bỏ dependencies để tránh vòng lặp

  // Bắt đầu auto-sync
  const startAutoSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (config.isEnabled && config.interval > 0) {
      // Thực hiện sync ngay lập tức
      performSync();
      
      // Thiết lập interval cho auto sync
      intervalRef.current = setInterval(performSync, config.interval * 1000);
      setStatus(prev => ({ ...prev, isRunning: true }));
    }
  }, [config.isEnabled, config.interval, performSync]);

  // Dừng auto-sync
  const stopAutoSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus(prev => ({ ...prev, isRunning: false }));
  }, []);

  // Force sync ngay lập tức
  const forceSync = useCallback(async () => {
    // Kiểm tra lock
    if (syncLockRef.current) {
      // console.log('🔄 Sync đang chạy, bỏ qua force sync');
      return;
    }

    // Thực hiện sync thay vì gọi syncEventService
    await performSync();
  }, [performSync]);

  // Cập nhật config
  const updateConfig = useCallback((newConfig: Partial<AutoSyncConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    saveConfigToStorage(updatedConfig);
    
    // Restart auto-sync nếu cần
    if (updatedConfig.isEnabled) {
      startAutoSync();
    } else {
      stopAutoSync();
    }
  }, [config, startAutoSync, stopAutoSync]);

  // Sync thủ công
  const performManualSync = useCallback(async () => {
    await performSync();
  }, [performSync]);

  // Reset stats
  const resetStats = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      syncCount: 0,
      lastSync: null,
      error: null
    }));
    syncEventService.clearQueue();
  }, []);

  // Khởi tạo khi component mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      
      // Kiểm tra kết nối ban đầu
      checkConnection();
      
      // Bắt đầu auto-sync nếu được enable
      if (config.isEnabled) {
        startAutoSync();
      }

      // Thiết lập interval để cập nhật trạng thái từ event service
      statusUpdateIntervalRef.current = setInterval(updateStatusFromEventService, 5000);
    }
  }, [config.isEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (statusUpdateIntervalRef.current) {
        clearInterval(statusUpdateIntervalRef.current);
      }
    };
  }, []);

  const value: AutoSyncContextType = {
    config,
    status,
    updateConfig,
    startAutoSync,
    stopAutoSync,
    performManualSync,
    resetStats,
    forceSync
  };

  return (
    <AutoSyncContext.Provider value={value}>
      {children}
    </AutoSyncContext.Provider>
  );
};

export const useAutoSync = (): AutoSyncContextType => {
  const context = useContext(AutoSyncContext);
  if (context === undefined) {
    throw new Error('useAutoSync must be used within an AutoSyncProvider');
  }
  return context;
}; 