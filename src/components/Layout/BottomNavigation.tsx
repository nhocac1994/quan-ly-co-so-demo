import React, { useState, useEffect } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Devices as DevicesIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Sync as SyncIcon,
  MoreVert as MoreVertIcon,
  Logout as LogoutIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { thongBaoService } from '../../services/localStorage';

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
  const [moreDialogOpen, setMoreDialogOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const unread = await thongBaoService.getUnreadCount();
      setUnreadNotifications(unread);
    };
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, []);

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

  const handleMoreDialogOpen = () => {
    setMoreDialogOpen(true);
  };

  const handleMoreDialogClose = () => {
    setMoreDialogOpen(false);
  };

  const handleMoreMenuItemClick = (path: string) => {
    if (path === '/dang-xuat') {
      // Xử lý đăng xuất
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      navigate('/login');
    } else {
      navigate(path);
    }
    handleMoreDialogClose();
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
              handleMoreDialogOpen();
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
              icon={
                item.path === '/thong-bao' ? (
                  <Badge 
                    badgeContent={unreadNotifications > 0 ? unreadNotifications : null} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: '8px',
                      }
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )
              }
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

      {/* Dialog cho "Xem thêm" */}
      <Dialog
        open={moreDialogOpen}
        onClose={handleMoreDialogClose}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        TransitionProps={{
          enter: true,
          exit: true,
          timeout: 300,
        }}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : '100%',
            maxWidth: isMobile ? '100%' : 500,
            height: isMobile ? '100%' : 'auto',
            borderRadius: isMobile ? 0 : 3,
            boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            transform: moreDialogOpen ? 'translateY(0)' : 'translateY(20px)',
            opacity: moreDialogOpen ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: isMobile ? 3 : 2.5,
          py: isMobile ? 2 : 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: theme.palette.background.paper,
        }}>
          <Typography variant={isMobile ? "h5" : "h6"} component="div" fontWeight={600}>
            Menu
          </Typography>
          <IconButton onClick={handleMoreDialogClose} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          px: isMobile ? 3 : 2.5, 
          py: isMobile ? 2 : 1.5,
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? '100%' : 'auto',
        }}>
          {/* Menu items */}
          <Box sx={{ flex: 1 }}>
            {moreMenuItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => handleMoreMenuItemClick(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  py: isMobile ? 2.5 : 2,
                  px: isMobile ? 3 : 2.5,
                  mx: isMobile ? 0 : 1,
                  my: isMobile ? 1 : 0.5,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: isMobile ? 48 : 44 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: isMobile ? '1rem' : '0.95rem',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                  }}
                />
              </MenuItem>
            ))}
          </Box>
          
          {/* Logout section - ở cuối */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <MenuItem
              onClick={() => handleMoreMenuItemClick('/dang-xuat')}
              sx={{
                py: isMobile ? 2.5 : 2,
                px: isMobile ? 3 : 2.5,
                mx: isMobile ? 0 : 1,
                borderRadius: 2,
                color: theme.palette.error.main,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.error.light,
                  color: theme.palette.error.dark,
                },
                '&:active': {
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.error.contrastText,
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: isMobile ? 48 : 44 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Đăng xuất"
                primaryTypographyProps={{
                  fontSize: isMobile ? '1rem' : '0.95rem',
                  fontWeight: 500,
                }}
              />
            </MenuItem>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileBottomNavigation; 