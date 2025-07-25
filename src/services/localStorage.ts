import { ThietBi, CoSoVatChat, LichSuSuDung, BaoTri, ThongBao, NguoiDung } from '../types';

// Keys cho localStorage
const STORAGE_KEYS = {
  THIET_BI: 'thietBi',
  CO_SO_VAT_CHAT: 'coSoVatChat',
  LICH_SU_SU_DUNG: 'lichSuSuDung',
  BAO_TRI: 'baoTri',
  THONG_BAO: 'thongBao',
  NGUOI_DUNG: 'nguoiDung',
  NGUOI_DUNG_HIEN_TAI: 'nguoiDungHienTai'
};

// Helper functions
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Lỗi khi đọc dữ liệu từ localStorage (${key}):`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Lỗi khi lưu dữ liệu vào localStorage (${key}):`, error);
  }
};

// Thiết bị
export const thietBiService = {
  getAll: (): ThietBi[] => getFromStorage<ThietBi>(STORAGE_KEYS.THIET_BI),
  
  getById: (id: string): ThietBi | undefined => {
    const thietBi = getFromStorage<ThietBi>(STORAGE_KEYS.THIET_BI);
    return thietBi.find(tb => tb.id === id);
  },
  
  add: (thietBi: Omit<ThietBi, 'id' | 'ngayNhap' | 'ngayCapNhat'>): ThietBi => {
    const thietBiList = getFromStorage<ThietBi>(STORAGE_KEYS.THIET_BI);
    const newThietBi: ThietBi = {
      ...thietBi,
      id: Date.now().toString(),
      ngayNhap: new Date().toISOString(),
      ngayCapNhat: new Date().toISOString()
    };
    thietBiList.push(newThietBi);
    saveToStorage(STORAGE_KEYS.THIET_BI, thietBiList);
    return newThietBi;
  },
  
  update: (id: string, updates: Partial<ThietBi>): ThietBi | null => {
    const thietBiList = getFromStorage<ThietBi>(STORAGE_KEYS.THIET_BI);
    const index = thietBiList.findIndex(tb => tb.id === id);
    if (index !== -1) {
      thietBiList[index] = {
        ...thietBiList[index],
        ...updates,
        ngayCapNhat: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.THIET_BI, thietBiList);
      return thietBiList[index];
    }
    return null;
  },
  
  delete: (id: string): boolean => {
    const thietBiList = getFromStorage<ThietBi>(STORAGE_KEYS.THIET_BI);
    const filteredList = thietBiList.filter(tb => tb.id !== id);
    if (filteredList.length !== thietBiList.length) {
      saveToStorage(STORAGE_KEYS.THIET_BI, filteredList);
      return true;
    }
    return false;
  }
};

// Cơ sở vật chất
export const coSoVatChatService = {
  getAll: (): CoSoVatChat[] => getFromStorage<CoSoVatChat>(STORAGE_KEYS.CO_SO_VAT_CHAT),
  
  getById: (id: string): CoSoVatChat | undefined => {
    const coSoVatChat = getFromStorage<CoSoVatChat>(STORAGE_KEYS.CO_SO_VAT_CHAT);
    return coSoVatChat.find(csvc => csvc.id === id);
  },
  
  add: (coSoVatChat: Omit<CoSoVatChat, 'id' | 'ngayTao' | 'ngayCapNhat'>): CoSoVatChat => {
    const coSoVatChatList = getFromStorage<CoSoVatChat>(STORAGE_KEYS.CO_SO_VAT_CHAT);
    const newCoSoVatChat: CoSoVatChat = {
      ...coSoVatChat,
      id: Date.now().toString(),
      ngayTao: new Date().toISOString(),
      ngayCapNhat: new Date().toISOString()
    };
    coSoVatChatList.push(newCoSoVatChat);
    saveToStorage(STORAGE_KEYS.CO_SO_VAT_CHAT, coSoVatChatList);
    return newCoSoVatChat;
  },
  
  update: (id: string, updates: Partial<CoSoVatChat>): CoSoVatChat | null => {
    const coSoVatChatList = getFromStorage<CoSoVatChat>(STORAGE_KEYS.CO_SO_VAT_CHAT);
    const index = coSoVatChatList.findIndex(csvc => csvc.id === id);
    if (index !== -1) {
      coSoVatChatList[index] = {
        ...coSoVatChatList[index],
        ...updates,
        ngayCapNhat: new Date().toISOString()
      };
      saveToStorage(STORAGE_KEYS.CO_SO_VAT_CHAT, coSoVatChatList);
      return coSoVatChatList[index];
    }
    return null;
  },
  
  delete: (id: string): boolean => {
    const coSoVatChatList = getFromStorage<CoSoVatChat>(STORAGE_KEYS.CO_SO_VAT_CHAT);
    const filteredList = coSoVatChatList.filter(csvc => csvc.id !== id);
    if (filteredList.length !== coSoVatChatList.length) {
      saveToStorage(STORAGE_KEYS.CO_SO_VAT_CHAT, filteredList);
      return true;
    }
    return false;
  }
};

// Lịch sử sử dụng
export const lichSuSuDungService = {
  getAll: (): LichSuSuDung[] => getFromStorage<LichSuSuDung>(STORAGE_KEYS.LICH_SU_SU_DUNG),
  
  getById: (id: string): LichSuSuDung | undefined => {
    const lichSu = getFromStorage<LichSuSuDung>(STORAGE_KEYS.LICH_SU_SU_DUNG);
    return lichSu.find(ls => ls.id === id);
  },
  
  add: (lichSu: Omit<LichSuSuDung, 'id'>): LichSuSuDung => {
    const lichSuList = getFromStorage<LichSuSuDung>(STORAGE_KEYS.LICH_SU_SU_DUNG);
    const newLichSu: LichSuSuDung = {
      ...lichSu,
      id: Date.now().toString()
    };
    lichSuList.push(newLichSu);
    saveToStorage(STORAGE_KEYS.LICH_SU_SU_DUNG, lichSuList);
    return newLichSu;
  },
  
  update: (id: string, updates: Partial<LichSuSuDung>): LichSuSuDung | null => {
    const lichSuList = getFromStorage<LichSuSuDung>(STORAGE_KEYS.LICH_SU_SU_DUNG);
    const index = lichSuList.findIndex(ls => ls.id === id);
    if (index !== -1) {
      lichSuList[index] = { ...lichSuList[index], ...updates };
      saveToStorage(STORAGE_KEYS.LICH_SU_SU_DUNG, lichSuList);
      return lichSuList[index];
    }
    return null;
  },
  
  getByThietBiId: (thietBiId: string): LichSuSuDung[] => {
    const lichSuList = getFromStorage<LichSuSuDung>(STORAGE_KEYS.LICH_SU_SU_DUNG);
    return lichSuList.filter(ls => ls.thietBiId === thietBiId);
  },
  
  getByCoSoVatChatId: (coSoVatChatId: string): LichSuSuDung[] => {
    const lichSuList = getFromStorage<LichSuSuDung>(STORAGE_KEYS.LICH_SU_SU_DUNG);
    return lichSuList.filter(ls => ls.coSoVatChatId === coSoVatChatId);
  }
};

// Bảo trì
export const baoTriService = {
  getAll: (): BaoTri[] => getFromStorage<BaoTri>(STORAGE_KEYS.BAO_TRI),
  
  getById: (id: string): BaoTri | undefined => {
    const baoTri = getFromStorage<BaoTri>(STORAGE_KEYS.BAO_TRI);
    return baoTri.find(bt => bt.id === id);
  },
  
  add: (baoTri: Omit<BaoTri, 'id'>): BaoTri => {
    const baoTriList = getFromStorage<BaoTri>(STORAGE_KEYS.BAO_TRI);
    const newBaoTri: BaoTri = {
      ...baoTri,
      id: Date.now().toString()
    };
    baoTriList.push(newBaoTri);
    saveToStorage(STORAGE_KEYS.BAO_TRI, baoTriList);
    return newBaoTri;
  },
  
  update: (id: string, updates: Partial<BaoTri>): BaoTri | null => {
    const baoTriList = getFromStorage<BaoTri>(STORAGE_KEYS.BAO_TRI);
    const index = baoTriList.findIndex(bt => bt.id === id);
    if (index !== -1) {
      baoTriList[index] = { ...baoTriList[index], ...updates };
      saveToStorage(STORAGE_KEYS.BAO_TRI, baoTriList);
      return baoTriList[index];
    }
    return null;
  }
};

// Thông báo
export const thongBaoService = {
  getAll: (): ThongBao[] => getFromStorage<ThongBao>(STORAGE_KEYS.THONG_BAO),
  
  getById: (id: string): ThongBao | undefined => {
    const thongBao = getFromStorage<ThongBao>(STORAGE_KEYS.THONG_BAO);
    return thongBao.find(tb => tb.id === id);
  },
  
  add: (thongBao: Omit<ThongBao, 'id' | 'ngayTao'>): ThongBao => {
    const thongBaoList = getFromStorage<ThongBao>(STORAGE_KEYS.THONG_BAO);
    const newThongBao: ThongBao = {
      ...thongBao,
      id: Date.now().toString(),
      ngayTao: new Date().toISOString()
    };
    thongBaoList.push(newThongBao);
    saveToStorage(STORAGE_KEYS.THONG_BAO, thongBaoList);
    return newThongBao;
  },
  
  update: (id: string, updates: Partial<ThongBao>): ThongBao | null => {
    const thongBaoList = getFromStorage<ThongBao>(STORAGE_KEYS.THONG_BAO);
    const index = thongBaoList.findIndex(tb => tb.id === id);
    if (index !== -1) {
      thongBaoList[index] = { ...thongBaoList[index], ...updates };
      saveToStorage(STORAGE_KEYS.THONG_BAO, thongBaoList);
      return thongBaoList[index];
    }
    return null;
  },
  
  delete: (id: string): boolean => {
    const thongBaoList = getFromStorage<ThongBao>(STORAGE_KEYS.THONG_BAO);
    const filteredList = thongBaoList.filter(tb => tb.id !== id);
    if (filteredList.length !== thongBaoList.length) {
      saveToStorage(STORAGE_KEYS.THONG_BAO, filteredList);
      return true;
    }
    return false;
  }
};

// Người dùng
export const nguoiDungService = {
  getAll: (): NguoiDung[] => getFromStorage<NguoiDung>(STORAGE_KEYS.NGUOI_DUNG),
  
  getById: (id: string): NguoiDung | undefined => {
    const nguoiDung = getFromStorage<NguoiDung>(STORAGE_KEYS.NGUOI_DUNG);
    return nguoiDung.find(nd => nd.id === id);
  },
  
  getCurrentUser: (): NguoiDung | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NGUOI_DUNG_HIEN_TAI);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },
  
  setCurrentUser: (user: NguoiDung | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.NGUOI_DUNG_HIEN_TAI, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.NGUOI_DUNG_HIEN_TAI);
    }
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