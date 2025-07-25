import { ThietBi, CoSoVatChat, LichSuSuDung, BaoTri, ThongBao, NguoiDung } from '../types';
import { triggerSyncEvent } from './syncEventService';

// Helper functions
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
};

// ThietBi Service
export const thietBiService = {
  getAll: (): ThietBi[] => getFromStorage<ThietBi>('thietBi'),
  
  add: (thietBi: Omit<ThietBi, 'id'>): ThietBi => {
    const thietBiList = getFromStorage<ThietBi>('thietBi');
          const newThietBi: ThietBi = {
        ...thietBi,
        id: Date.now().toString(),
        ngayNhap: new Date().toISOString(),
        ngayCapNhat: new Date().toISOString()
      };
    thietBiList.push(newThietBi);
    saveToStorage('thietBi', thietBiList);
    
    // Trigger sync event
    triggerSyncEvent('CREATE', 'thietBi', newThietBi);
    
    return newThietBi;
  },
  
  update: (id: string, updates: Partial<ThietBi>): ThietBi | null => {
    const thietBiList = getFromStorage<ThietBi>('thietBi');
    const index = thietBiList.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedThietBi = {
        ...thietBiList[index],
        ...updates,
        ngayCapNhat: new Date().toISOString()
      };
      thietBiList[index] = updatedThietBi;
      saveToStorage('thietBi', thietBiList);
      
      // Trigger sync event
      triggerSyncEvent('UPDATE', 'thietBi', updatedThietBi);
      
      return updatedThietBi;
    }
    return null;
  },
  
  delete: (id: string): boolean => {
    const thietBiList = getFromStorage<ThietBi>('thietBi');
    const index = thietBiList.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedThietBi = thietBiList[index];
      thietBiList.splice(index, 1);
      saveToStorage('thietBi', thietBiList);
      
      // Trigger sync event
      triggerSyncEvent('DELETE', 'thietBi', deletedThietBi);
      
      return true;
    }
    return false;
  },
  
  getById: (id: string): ThietBi | null => {
    const thietBiList = getFromStorage<ThietBi>('thietBi');
    return thietBiList.find(item => item.id === id) || null;
  }
};

// CoSoVatChat Service
export const coSoVatChatService = {
  getAll: (): CoSoVatChat[] => getFromStorage<CoSoVatChat>('coSoVatChat'),
  
  add: (coSoVatChat: Omit<CoSoVatChat, 'id'>): CoSoVatChat => {
    const coSoVatChatList = getFromStorage<CoSoVatChat>('coSoVatChat');
    const newCoSoVatChat: CoSoVatChat = {
      ...coSoVatChat,
      id: Date.now().toString(),
      ngayTao: new Date().toISOString()
    };
    coSoVatChatList.push(newCoSoVatChat);
    saveToStorage('coSoVatChat', coSoVatChatList);
    
    // Trigger sync event
    triggerSyncEvent('CREATE', 'coSoVatChat', newCoSoVatChat);
    
    return newCoSoVatChat;
  },
  
  update: (id: string, updates: Partial<CoSoVatChat>): CoSoVatChat | null => {
    const coSoVatChatList = getFromStorage<CoSoVatChat>('coSoVatChat');
    const index = coSoVatChatList.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedCoSoVatChat = {
        ...coSoVatChatList[index],
        ...updates,
        ngayCapNhat: new Date().toISOString()
      };
      coSoVatChatList[index] = updatedCoSoVatChat;
      saveToStorage('coSoVatChat', coSoVatChatList);
      
      // Trigger sync event
      triggerSyncEvent('UPDATE', 'coSoVatChat', updatedCoSoVatChat);
      
      return updatedCoSoVatChat;
    }
    return null;
  },
  
  delete: (id: string): boolean => {
    const coSoVatChatList = getFromStorage<CoSoVatChat>('coSoVatChat');
    const index = coSoVatChatList.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedCoSoVatChat = coSoVatChatList[index];
      coSoVatChatList.splice(index, 1);
      saveToStorage('coSoVatChat', coSoVatChatList);
      
      // Trigger sync event
      triggerSyncEvent('DELETE', 'coSoVatChat', deletedCoSoVatChat);
      
      return true;
    }
    return false;
  },
  
  getById: (id: string): CoSoVatChat | null => {
    const coSoVatChatList = getFromStorage<CoSoVatChat>('coSoVatChat');
    return coSoVatChatList.find(item => item.id === id) || null;
  }
};

// LichSuSuDung Service
export const lichSuSuDungService = {
  getAll: (): LichSuSuDung[] => getFromStorage<LichSuSuDung>('lichSuSuDung'),
  
  add: (lichSuSuDung: Omit<LichSuSuDung, 'id'>): LichSuSuDung => {
    const lichSuSuDungList = getFromStorage<LichSuSuDung>('lichSuSuDung');
          const newLichSuSuDung: LichSuSuDung = {
        ...lichSuSuDung,
        id: Date.now().toString()
      };
    lichSuSuDungList.push(newLichSuSuDung);
    saveToStorage('lichSuSuDung', lichSuSuDungList);
    
    // Trigger sync event
    triggerSyncEvent('CREATE', 'lichSuSuDung', newLichSuSuDung);
    
    return newLichSuSuDung;
  },
  
  update: (id: string, updates: Partial<LichSuSuDung>): LichSuSuDung | null => {
    const lichSuSuDungList = getFromStorage<LichSuSuDung>('lichSuSuDung');
    const index = lichSuSuDungList.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedLichSuSuDung = {
        ...lichSuSuDungList[index],
        ...updates,
        ngayCapNhat: new Date().toISOString()
      };
      lichSuSuDungList[index] = updatedLichSuSuDung;
      saveToStorage('lichSuSuDung', lichSuSuDungList);
      
      // Trigger sync event
      triggerSyncEvent('UPDATE', 'lichSuSuDung', updatedLichSuSuDung);
      
      return updatedLichSuSuDung;
    }
    return null;
  },
  
  delete: (id: string): boolean => {
    const lichSuSuDungList = getFromStorage<LichSuSuDung>('lichSuSuDung');
    const index = lichSuSuDungList.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedLichSuSuDung = lichSuSuDungList[index];
      lichSuSuDungList.splice(index, 1);
      saveToStorage('lichSuSuDung', lichSuSuDungList);
      
      // Trigger sync event
      triggerSyncEvent('DELETE', 'lichSuSuDung', deletedLichSuSuDung);
      
      return true;
    }
    return false;
  },
  
  getById: (id: string): LichSuSuDung | null => {
    const lichSuSuDungList = getFromStorage<LichSuSuDung>('lichSuSuDung');
    return lichSuSuDungList.find(item => item.id === id) || null;
  }
};

// BaoTri Service
export const baoTriService = {
  getAll: (): BaoTri[] => getFromStorage<BaoTri>('baoTri'),
  
  add: (baoTri: Omit<BaoTri, 'id'>): BaoTri => {
    const baoTriList = getFromStorage<BaoTri>('baoTri');
          const newBaoTri: BaoTri = {
        ...baoTri,
        id: Date.now().toString()
      };
    baoTriList.push(newBaoTri);
    saveToStorage('baoTri', baoTriList);
    
    // Trigger sync event
    triggerSyncEvent('CREATE', 'baoTri', newBaoTri);
    
    return newBaoTri;
  },
  
  update: (id: string, updates: Partial<BaoTri>): BaoTri | null => {
    const baoTriList = getFromStorage<BaoTri>('baoTri');
    const index = baoTriList.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedBaoTri = {
        ...baoTriList[index],
        ...updates,
        ngayCapNhat: new Date().toISOString()
      };
      baoTriList[index] = updatedBaoTri;
      saveToStorage('baoTri', baoTriList);
      
      // Trigger sync event
      triggerSyncEvent('UPDATE', 'baoTri', updatedBaoTri);
      
      return updatedBaoTri;
    }
    return null;
  },
  
  delete: (id: string): boolean => {
    const baoTriList = getFromStorage<BaoTri>('baoTri');
    const index = baoTriList.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedBaoTri = baoTriList[index];
      baoTriList.splice(index, 1);
      saveToStorage('baoTri', baoTriList);
      
      // Trigger sync event
      triggerSyncEvent('DELETE', 'baoTri', deletedBaoTri);
      
      return true;
    }
    return false;
  },
  
  getById: (id: string): BaoTri | null => {
    const baoTriList = getFromStorage<BaoTri>('baoTri');
    return baoTriList.find(item => item.id === id) || null;
  }
};

// ThongBao Service
export const thongBaoService = {
  getAll: (): ThongBao[] => getFromStorage<ThongBao>('thongBao'),
  
  add: (thongBao: Omit<ThongBao, 'id'>): ThongBao => {
    const thongBaoList = getFromStorage<ThongBao>('thongBao');
    const newThongBao: ThongBao = {
      ...thongBao,
      id: Date.now().toString(),
      ngayTao: new Date().toISOString()
    };
    thongBaoList.push(newThongBao);
    saveToStorage('thongBao', thongBaoList);
    
    // Trigger sync event
    triggerSyncEvent('CREATE', 'thongBao', newThongBao);
    
    return newThongBao;
  },
  
  update: (id: string, updates: Partial<ThongBao>): ThongBao | null => {
    const thongBaoList = getFromStorage<ThongBao>('thongBao');
    const index = thongBaoList.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedThongBao = {
        ...thongBaoList[index],
        ...updates,
        ngayCapNhat: new Date().toISOString()
      };
      thongBaoList[index] = updatedThongBao;
      saveToStorage('thongBao', thongBaoList);
      
      // Trigger sync event
      triggerSyncEvent('UPDATE', 'thongBao', updatedThongBao);
      
      return updatedThongBao;
    }
    return null;
  },
  
  delete: (id: string): boolean => {
    const thongBaoList = getFromStorage<ThongBao>('thongBao');
    const index = thongBaoList.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedThongBao = thongBaoList[index];
      thongBaoList.splice(index, 1);
      saveToStorage('thongBao', thongBaoList);
      
      // Trigger sync event
      triggerSyncEvent('DELETE', 'thongBao', deletedThongBao);
      
      return true;
    }
    return false;
  },
  
  getById: (id: string): ThongBao | null => {
    const thongBaoList = getFromStorage<ThongBao>('thongBao');
    return thongBaoList.find(item => item.id === id) || null;
  }
};

// NguoiDung Service
export const nguoiDungService = {
  getAll: (): NguoiDung[] => getFromStorage<NguoiDung>('nguoiDung'),
  
  add: (nguoiDung: Omit<NguoiDung, 'id'>): NguoiDung => {
    const nguoiDungList = getFromStorage<NguoiDung>('nguoiDung');
    const newNguoiDung: NguoiDung = {
      ...nguoiDung,
      id: Date.now().toString(),
      ngayTao: new Date().toISOString()
    };
    nguoiDungList.push(newNguoiDung);
    saveToStorage('nguoiDung', nguoiDungList);
    
    // Trigger sync event
    triggerSyncEvent('CREATE', 'nguoiDung', newNguoiDung);
    
    return newNguoiDung;
  },
  
  update: (id: string, updates: Partial<NguoiDung>): NguoiDung | null => {
    const nguoiDungList = getFromStorage<NguoiDung>('nguoiDung');
    const index = nguoiDungList.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedNguoiDung = {
        ...nguoiDungList[index],
        ...updates,
        ngayCapNhat: new Date().toISOString()
      };
      nguoiDungList[index] = updatedNguoiDung;
      saveToStorage('nguoiDung', nguoiDungList);
      
      // Trigger sync event
      triggerSyncEvent('UPDATE', 'nguoiDung', updatedNguoiDung);
      
      return updatedNguoiDung;
    }
    return null;
  },
  
  delete: (id: string): boolean => {
    const nguoiDungList = getFromStorage<NguoiDung>('nguoiDung');
    const index = nguoiDungList.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedNguoiDung = nguoiDungList[index];
      nguoiDungList.splice(index, 1);
      saveToStorage('nguoiDung', nguoiDungList);
      
      // Trigger sync event
      triggerSyncEvent('DELETE', 'nguoiDung', deletedNguoiDung);
      
      return true;
    }
    return false;
  },
  
  getById: (id: string): NguoiDung | null => {
    const nguoiDungList = getFromStorage<NguoiDung>('nguoiDung');
    return nguoiDungList.find(item => item.id === id) || null;
  }
};

// Export tất cả services
export const localStorageService = {
  thietBi: thietBiService,
  coSoVatChat: coSoVatChatService,
  lichSuSuDung: lichSuSuDungService,
  baoTri: baoTriService,
  thongBao: thongBaoService,
  nguoiDung: nguoiDungService
}; 