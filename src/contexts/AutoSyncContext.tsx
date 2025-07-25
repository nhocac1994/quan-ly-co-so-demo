import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  initializeGoogleServiceAccountVercel, 
  syncDataWithServiceAccountVercel 
} from '../services/googleServiceAccountVercel';
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
    isEnabled: true,
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

  // Kiểm tra kết nối Google Sheets
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const spreadsheetId = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
      const clientEmail = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;

      if (!spreadsheetId || !clientEmail || !privateKey) {
        setStatus(prev => ({ ...prev, isConnected: false, error: 'Thiếu environment variables' }));
        return false;
      }

      const isConnected = await initializeGoogleServiceAccountVercel(
        spreadsheetId,
        clientEmail,
        privateKey
      );

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
  }, []);

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

  // Thực hiện đồng bộ thủ công
  const performSync = useCallback(async () => {
    if (status.isRunning) return;

    try {
      setStatus(prev => ({ ...prev, isRunning: true, error: null }));

      // Kiểm tra kết nối
      const isConnected = await checkConnection();
      if (!isConnected) {
        setStatus(prev => ({ ...prev, isRunning: false }));
        return;
      }

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
      await syncDataWithServiceAccountVercel(localStorageData);

      // Cập nhật trạng thái
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        lastSync: new Date().toLocaleString('vi-VN'),
        syncCount: prev.syncCount + 1,
        error: null
      }));

      console.log(`✅ Manual sync thành công - ${new Date().toLocaleString('vi-VN')}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        error: `Lỗi đồng bộ: ${errorMessage}`
      }));
      console.error('❌ Manual sync lỗi:', error);
    }
  }, [status.isRunning, checkConnection]);

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
      console.log(`🔄 Auto sync đã bắt đầu (${config.interval}s interval)`);
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
    console.log('⏹️ Auto-sync đã dừng');
  }, []);

  // Force sync ngay lập tức
  const forceSync = useCallback(async () => {
    await syncEventService.forceSync();
    updateStatusFromEventService();
  }, [updateStatusFromEventService]);

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
      statusUpdateIntervalRef.current = setInterval(updateStatusFromEventService, 1000);
    }
  }, [checkConnection, config.isEnabled, startAutoSync, updateStatusFromEventService]);

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

  // Restart auto-sync khi config thay đổi
  useEffect(() => {
    if (isInitializedRef.current) {
      if (config.isEnabled) {
        startAutoSync();
      } else {
        stopAutoSync();
      }
    }
  }, [config.isEnabled, config.interval, startAutoSync, stopAutoSync]);

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