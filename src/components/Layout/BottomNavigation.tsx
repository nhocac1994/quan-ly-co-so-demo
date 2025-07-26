import React, { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Devices as DevicesIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Sync as SyncIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const getMenuItems = (userRole?: string) => {
  const allMenuItems = [
    { text: 'Trang Chủ', icon: <DashboardIcon />, path: '/', permission: 'dashboard.view' },
    { text: 'Thiết Bị', icon: <DevicesIcon />, path: '/thiet-bi', permission: 'thietbi.view' },
    { text: 'Cơ Sở', icon: <BusinessIcon />, path: '/co-so-vat-chat', permission: 'cosovatchat.view' },
    { text: 'Lịch Sử', icon: <HistoryIcon />, path: '/lich-su-su-dung', permission: 'lichsusu.view' },
    { text: 'Báo Cáo', icon: <AssessmentIcon />, path: '/bao-cao', permission: 'baocao.view' },
    { text: 'Thông Báo', icon: <NotificationsIcon />, path: '/thong-bao', permission: 'thongbao.view' },
    { text: 'Đồng Bộ', icon: <SyncIcon />, path: '/quan-ly-dong-bo', permission: 'dongbo.manage' },
  ];

  // Nếu không có user hoặc là quản trị viên, hiển thị tất cả
  if (!userRole || userRole === 'quanTriVien') {
    return allMenuItems;
  }

  // Lọc menu theo vai trò
  const rolePermissions = {
    giaoVien: ['dashboard.view', 'thietbi.view', 'cosovatchat.view', 'lichsusu.view', 'baocao.view', 'thongbao.view'],
    hocSinh: ['dashboard.view', 'thietbi.view', 'cosovatchat.view', 'lichsusu.view', 'thongbao.view']
  };

  const userPermissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];
  return allMenuItems.filter(item => userPermissions.includes(item.permission));
};

const MobileBottomNavigation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);

  const allMenuItems = getMenuItems(user?.vaiTro);
  
  // Chỉ hiển thị 3 mục chính trên bottom navigation
  const mainMenuItems = [
    allMenuItems.find(item => item.path === '/') || allMenuItems[0], // Trang Chủ
    allMenuItems.find(item => item.path === '/thong-bao') || allMenuItems[1], // Thông Báo
  ].filter(Boolean);
  
  // Các mục còn lại vào menu "Xem thêm"
  const moreMenuItems = allMenuItems.filter(item => 
    item.path !== '/' && item.path !== '/thong-bao'
  );

  if (!isMobile) {
    return null;
  }

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  const handleMoreMenuItemClick = (path: string) => {
    navigate(path);
    handleMoreMenuClose();
  };

  return (
    <>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'white',
          boxShadow: '0px -2px 8px rgba(0,0,0,0.1)'
        }}
        elevation={3}
      >
        <BottomNavigation
          value={location.pathname}
          onChange={(event, newValue) => {
            if (newValue === 'more') {
              handleMoreMenuOpen(event as any);
            } else {
              navigate(newValue);
            }
          }}
          showLabels
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 8px',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                fontWeight: 400,
                marginTop: '4px',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.5rem',
              },
            },
          }}
        >
          {mainMenuItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.text}
              value={item.path}
              icon={item.icon}
            />
          ))}
          
          {/* Menu "Xem thêm" */}
          <BottomNavigationAction
            label="Xem thêm"
            value="more"
            icon={<MoreVertIcon />}
          />
        </BottomNavigation>
      </Paper>

      {/* Menu dropdown cho "Xem thêm" */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={handleMoreMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mt: -1,
            minWidth: 200,
            boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
            borderRadius: 2,
          }
        }}
      >
        {moreMenuItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => handleMoreMenuItemClick(item.path)}
            selected={location.pathname === item.path}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light,
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default MobileBottomNavigation; 