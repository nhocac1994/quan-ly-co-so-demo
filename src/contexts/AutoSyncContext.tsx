import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  initializeGoogleSheets, 
  syncDataToGoogleSheets,
  testGoogleSheetsConnection,
  syncDataFromGoogleSheets
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
  syncDirection: 'upload' | 'download' | 'bidirectional'; // Thêm hướng đồng bộ
  lastDataHash: string; // Hash để kiểm tra thay đổi
}

interface AutoSyncStatus {
  isRunning: boolean;
  lastSync: string | null;
  error: string | null;
  syncCount: number;
  isConnected: boolean;
  queueLength: number;
  isProcessing: boolean;
  lastDataUpdate: string | null; // Thời gian cập nhật dữ liệu cuối
  dataVersion: number; // Phiên bản dữ liệu
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
  refreshData: () => Promise<void>; // Thêm function refresh data
  forceDownloadFromSheets: () => Promise<boolean>; // Force download từ Google Sheets
  showUpdateNotification: boolean; // Thêm trạng thái cho thông báo cập nhật
  isRateLimited: boolean; // Trạng thái rate limiting
}

const AutoSyncContext = createContext<AutoSyncContextType | undefined>(undefined);

// Tạo hash cho dữ liệu để kiểm tra thay đổi
const createDataHash = (data: any): string => {
  const dataString = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

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
  
  // Default config - ưu tiên download từ Google Sheets
  return {
    isEnabled: true, // Bật auto sync mặc định
    interval: 15, // 15 giây - tăng interval để tránh rate limiting
    storageMode: 'hybrid',
    syncDirection: 'download', // Ưu tiên download từ Google Sheets
    lastDataHash: ''
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
    isProcessing: false,
    lastDataUpdate: null,
    dataVersion: 0
  });

  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

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

  // Đọc dữ liệu từ Google Sheets
  const downloadDataFromSheets = useCallback(async (): Promise<boolean> => {
    try {
      console.log('📥 Đang tải dữ liệu từ Google Sheets...');
      
      const sheetsData = await syncDataFromGoogleSheets();
      
      if (sheetsData) {
        // Cập nhật localStorage với dữ liệu từ Google Sheets
        localStorage.setItem('thietBi', JSON.stringify(sheetsData.thietBi || []));
        localStorage.setItem('coSoVatChat', JSON.stringify(sheetsData.coSoVatChat || []));
        localStorage.setItem('lichSuSuDung', JSON.stringify(sheetsData.lichSuSuDung || []));
        localStorage.setItem('baoTri', JSON.stringify(sheetsData.baoTri || []));
        localStorage.setItem('thongBao', JSON.stringify(sheetsData.thongBao || []));
        localStorage.setItem('nguoiDung', JSON.stringify(sheetsData.nguoiDung || []));

        // Tạo hash mới cho dữ liệu
        const newHash = createDataHash(sheetsData);
        
        setConfig(prev => ({
          ...prev,
          lastDataHash: newHash
        }));

        setStatus(prev => ({
          ...prev,
          lastDataUpdate: new Date().toLocaleString('vi-VN'),
          dataVersion: prev.dataVersion + 1
        }));

        // Trigger event để các component cập nhật dữ liệu
        window.dispatchEvent(new CustomEvent('dataRefreshed'));

        // Hiển thị thông báo cập nhật
        setShowUpdateNotification(true);
        setTimeout(() => setShowUpdateNotification(false), 3000);

        console.log('✅ Tải dữ liệu thành công từ Google Sheets');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Lỗi khi tải dữ liệu từ Google Sheets:', error);
      
      // Xử lý lỗi rate limiting
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        setIsRateLimited(true);
        setStatus(prev => ({
          ...prev,
          error: 'Rate limiting - Tạm dừng đồng bộ 30 giây...'
        }));
        
        // Tạm dừng auto-sync
        stopAutoSync();
        
        // Khôi phục sau 30 giây
        setTimeout(() => {
          setIsRateLimited(false);
          setStatus(prev => ({ ...prev, error: null }));
          if (config.isEnabled) {
            startAutoSync();
          }
        }, 30000); // 30s
      } else {
        setStatus(prev => ({
          ...prev,
          error: `Lỗi đồng bộ: ${errorMessage}`
        }));
      }
      
      return false;
    }
  }, []);

  // Ghi dữ liệu lên Google Sheets
  const uploadDataToSheets = useCallback(async (): Promise<boolean> => {
    try {
      console.log('📤 Đang ghi dữ liệu lên Google Sheets...');
      
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

      console.log('✅ Ghi dữ liệu thành công lên Google Sheets');
      return true;
    } catch (error) {
      console.error('❌ Lỗi khi ghi dữ liệu lên Google Sheets:', error);
      return false;
    }
  }, []);

  // Thực hiện đồng bộ hai chiều
  const performBidirectionalSync = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Bắt đầu đồng bộ hai chiều...');
      
      // 1. Tải dữ liệu từ Google Sheets trước (ưu tiên dữ liệu mới nhất)
      const downloadSuccess = await downloadDataFromSheets();
      
      // 2. Ghi dữ liệu lên Google Sheets (chỉ nếu download thành công)
      let uploadSuccess = true;
      if (downloadSuccess) {
        uploadSuccess = await uploadDataToSheets();
      }
      
      return downloadSuccess && uploadSuccess;
    } catch (error) {
      console.error('❌ Lỗi đồng bộ hai chiều:', error);
      return false;
    }
  }, [downloadDataFromSheets, uploadDataToSheets]);

  // Thực hiện sync với lock
  const performSync = useCallback(async () => {
    // Kiểm tra lock
    if (syncLockRef.current) {
      console.log('🔄 Sync đang chạy, bỏ qua request này');
      return;
    }

    // Set lock
    syncLockRef.current = true;
    setStatus(prev => ({ ...prev, isProcessing: true }));

    try {
      console.log('🔄 Bắt đầu sync...');
      
      let syncSuccess = false;
      
      // Thực hiện sync theo hướng được cấu hình
      switch (config.syncDirection) {
        case 'upload':
          syncSuccess = await uploadDataToSheets();
          break;
        case 'download':
          syncSuccess = await downloadDataFromSheets();
          break;
        case 'bidirectional':
        default:
          syncSuccess = await performBidirectionalSync();
          break;
      }

      // Cập nhật trạng thái
      setStatus(prev => ({
        ...prev,
        isRunning: false,
        lastSync: new Date().toLocaleString('vi-VN'),
        syncCount: prev.syncCount + 1,
        error: syncSuccess ? null : 'Lỗi đồng bộ',
        isProcessing: false
      }));

      if (syncSuccess) {
        console.log('✅ Đồng bộ thành công');
      } else {
        console.log('❌ Đồng bộ thất bại');
      }

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
  }, [config.syncDirection, uploadDataToSheets, downloadDataFromSheets, performBidirectionalSync]);

  // Force download dữ liệu từ Google Sheets (ưu tiên cao nhất)
  const forceDownloadFromSheets = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Force download dữ liệu từ Google Sheets...');
      
      const success = await downloadDataFromSheets();
      
      if (success) {
        console.log('✅ Force download thành công');
        // Hiển thị thông báo thành công
        alert('✅ Dữ liệu đã được cập nhật từ Google Sheets');
      } else {
        console.log('❌ Force download thất bại');
        alert('❌ Không thể cập nhật dữ liệu từ Google Sheets');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Lỗi force download:', error);
      alert('❌ Lỗi khi cập nhật dữ liệu');
      return false;
    }
  }, [downloadDataFromSheets]);

  // Refresh data từ Google Sheets
  const refreshData = useCallback(async () => {
    if (syncLockRef.current) {
      console.log('🔄 Sync đang chạy, bỏ qua refresh');
      return;
    }

    syncLockRef.current = true;
    setStatus(prev => ({ ...prev, isProcessing: true }));

    try {
      console.log('🔄 Đang refresh dữ liệu...');
      const success = await downloadDataFromSheets();
      
      setStatus(prev => ({
        ...prev,
        isProcessing: false,
        error: success ? null : 'Lỗi refresh dữ liệu'
      }));

      if (success) {
        console.log('✅ Refresh dữ liệu thành công');
        // Trigger re-render cho các component
        window.dispatchEvent(new CustomEvent('dataRefreshed'));
        
        // Hiển thị thông báo thành công
        alert('✅ Dữ liệu đã được cập nhật từ Google Sheets');
      }
    } catch (error) {
      console.error('❌ Lỗi refresh dữ liệu:', error);
      setStatus(prev => ({
        ...prev,
        isProcessing: false,
        error: 'Lỗi refresh dữ liệu'
      }));
      
      // Hiển thị thông báo lỗi
      alert('❌ Lỗi khi cập nhật dữ liệu');
    } finally {
      syncLockRef.current = false;
    }
  }, [downloadDataFromSheets]);

  // Bắt đầu auto-sync
  const startAutoSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (config.isEnabled && config.interval > 0 && !isRateLimited) {
      // Thực hiện sync ngay lập tức
      performSync();
      
      // Thiết lập interval cho auto sync
      intervalRef.current = setInterval(performSync, config.interval * 1000);
      setStatus(prev => ({ ...prev, isRunning: true }));
    }
  }, [config.isEnabled, config.interval, performSync, isRateLimited]);

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
      console.log('🔄 Sync đang chạy, bỏ qua force sync');
      return;
    }

    // Thực hiện sync
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
      
      // Luôn tải dữ liệu từ Google Sheets khi khởi động
      downloadDataFromSheets().then((success) => {
        if (success) {
          console.log('✅ Khởi tạo dữ liệu thành công từ Google Sheets');
        } else {
          console.log('⚠️ Không thể tải dữ liệu từ Google Sheets, sử dụng dữ liệu local');
        }
        
        // Bắt đầu auto-sync sau khi tải dữ liệu
        if (config.isEnabled) {
          startAutoSync();
        }
      });

      // Thiết lập interval để cập nhật trạng thái từ event service
      statusUpdateIntervalRef.current = setInterval(updateStatusFromEventService, 5000);
    }
  }, [config.isEnabled, checkConnection, downloadDataFromSheets, startAutoSync, updateStatusFromEventService]);

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
    forceSync,
    refreshData,
    forceDownloadFromSheets,
    showUpdateNotification,
    isRateLimited
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