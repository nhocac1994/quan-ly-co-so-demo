import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NguoiDung, VaiTroNguoiDung } from '../types';

interface AuthContextType {
  user: NguoiDung | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: VaiTroNguoiDung) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Định nghĩa permissions cho từng vai trò
const ROLE_PERMISSIONS = {
  [VaiTroNguoiDung.QUAN_TRI_VIEN]: [
    'dashboard.view',
    'thietbi.view',      // Thêm quyền view
    'thietbi.manage',
    'cosovatchat.view',  // Thêm quyền view
    'cosovatchat.manage',
    'lichsusu.view',     // Thêm quyền view
    'lichsusu.manage',
    'baotri.view',       // Thêm quyền view
    'baotri.manage',
    'thongbao.view',     // Thêm quyền view
    'thongbao.manage',
    'nguoidung.manage',
    'phanquyen.manage',
    'dongbo.manage',
    'baocao.view',
    'thietbi.borrow',
    'cosovatchat.borrow'
  ],
  [VaiTroNguoiDung.GIAO_VIEN]: [
    'dashboard.view',
    'thietbi.view',
    'thietbi.borrow',
    'cosovatchat.view',
    'cosovatchat.borrow',
    'lichsusu.view',
    'lichsusu.create',
    'baotri.view',
    'thongbao.view',
    'baocao.view'
  ],
  [VaiTroNguoiDung.HOC_SINH]: [
    'dashboard.view',
    'thietbi.view',
    'thietbi.borrow',
    'cosovatchat.view',
    'cosovatchat.borrow',
    'lichsusu.view',
    'lichsusu.create',
    'thongbao.view'
  ]
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<NguoiDung | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Lỗi khi parse user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Lấy danh sách người dùng từ localStorage
      const usersData = localStorage.getItem('nguoiDung');
      console.log('Users data from localStorage:', usersData);
      
      if (!usersData) {
        throw new Error('Không tìm thấy dữ liệu người dùng. Vui lòng refresh trang và thử lại.');
      }

      const users: NguoiDung[] = JSON.parse(usersData);
      console.log('Parsed users:', users);
      
      // Tìm người dùng theo email
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.trangThai === 'hoatDong'
      );

      console.log('Found user:', foundUser);
      console.log('Searching for email:', email.toLowerCase());

      if (!foundUser) {
        throw new Error('Email không tồn tại hoặc tài khoản đã bị khóa');
      }

      // Trong thực tế, bạn sẽ kiểm tra password hash
      // Ở đây tôi giả định password là email để demo
      if (password !== foundUser.email) {
        throw new Error('Mật khẩu không đúng');
      }

      // Lưu thông tin đăng nhập
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));

      return true;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) {
      console.log('❌ Không có user, trả về false');
      return false;
    }
    
    const userPermissions = ROLE_PERMISSIONS[user.vaiTro] || [];
    const hasPermission = userPermissions.includes(permission);
    
    console.log('🔍 Kiểm tra quyền:', {
      user: user.hoTen,
      vaiTro: user.vaiTro,
      permission: permission,
      userPermissions: userPermissions,
      hasPermission: hasPermission
    });
    
    return hasPermission;
  };

  const hasRole = (role: VaiTroNguoiDung): boolean => {
    return user?.vaiTro === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 