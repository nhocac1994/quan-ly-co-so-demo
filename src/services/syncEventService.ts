// Service quản lý sync events - đồng bộ ngay lập tức khi có thay đổi
import { 
  syncDataToGoogleSheets 
} from './googleSheetsService';

export interface SyncEvent {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: 'thietBi' | 'coSoVatChat' | 'lichSuSuDung' | 'baoTri' | 'thongBao' | 'nguoiDung';
  data?: any;
  timestamp: number;
}

class SyncEventService {
  private syncQueue: SyncEvent[] = [];
  private isProcessing = false;
  private syncTimeout: NodeJS.Timeout | null = null;
  private lastSyncTime = 0;
  private readonly SYNC_DELAY = 500; // Delay 500ms để batch multiple changes
  private readonly MAX_QUEUE_SIZE = 50;

  // Thêm event vào queue
  addEvent(event: Omit<SyncEvent, 'timestamp'>) {
    const syncEvent: SyncEvent = {
      ...event,
      timestamp: Date.now()
    };

    // Thêm vào queue
    this.syncQueue.push(syncEvent);

    // Giới hạn kích thước queue
    if (this.syncQueue.length > this.MAX_QUEUE_SIZE) {
      this.syncQueue = this.syncQueue.slice(-this.MAX_QUEUE_SIZE);
    }

    // Schedule sync
    this.scheduleSync();
  }

  // Lên lịch sync với delay
  private scheduleSync() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      this.processSyncQueue();
    }, this.SYNC_DELAY);
  }

  // Xử lý queue sync
  private async processSyncQueue() {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    // Rate limiting - đảm bảo không sync quá nhanh
    const now = Date.now();
    if (now - this.lastSyncTime < 2000) { // Tăng lên 2 giây để giảm retry
      this.scheduleSync();
      return;
    }

    this.isProcessing = true;
    const events = [...this.syncQueue];
    this.syncQueue = []; // Clear queue

    try {
      // Lấy dữ liệu hiện tại từ localStorage
      const currentData = this.getCurrentData();
      
      // Sync lên Google Sheets
      await syncDataToGoogleSheets(currentData);
      
      this.lastSyncTime = Date.now();
      
    } catch (error) {
      // Thêm lại events vào queue để retry (chỉ 1 lần)
      if (events.length > 0) {
        this.syncQueue.unshift(...events);
      }
      
      // Retry sau 10 giây (tăng thời gian chờ)
      setTimeout(() => {
        this.isProcessing = false;
        if (this.syncQueue.length > 0) {
          this.scheduleSync();
        }
      }, 10000);
      
      return;
    }

    this.isProcessing = false;
    
    // Nếu có events mới trong khi đang xử lý, schedule sync tiếp
    if (this.syncQueue.length > 0) {
      this.scheduleSync();
    }
  }

  // Lấy dữ liệu hiện tại từ localStorage
  private getCurrentData() {
    return {
      thietBi: JSON.parse(localStorage.getItem('thietBi') || '[]'),
      coSoVatChat: JSON.parse(localStorage.getItem('coSoVatChat') || '[]'),
      lichSuSuDung: JSON.parse(localStorage.getItem('lichSuSuDung') || '[]'),
      baoTri: JSON.parse(localStorage.getItem('baoTri') || '[]'),
      thongBao: JSON.parse(localStorage.getItem('thongBao') || '[]'),
      nguoiDung: JSON.parse(localStorage.getItem('nguoiDung') || '[]')
    };
  }

  // Force sync ngay lập tức
  async forceSync() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    
    await this.processSyncQueue();
  }

  // Lấy trạng thái queue
  getQueueStatus() {
    return {
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing,
      lastSyncTime: this.lastSyncTime
    };
  }

  // Clear queue
  clearQueue() {
    this.syncQueue = [];
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
  }
}

export const syncEventService = new SyncEventService();

// Helper functions để trigger sync events
export const triggerSyncEvent = (
  type: 'CREATE' | 'UPDATE' | 'DELETE',
  table: 'thietBi' | 'coSoVatChat' | 'lichSuSuDung' | 'baoTri' | 'thongBao' | 'nguoiDung',
  data?: any
) => {
  syncEventService.addEvent({ type, table, data });
}; 