import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Devices as DevicesIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Sync as SyncIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AutoSyncStatus from '../AutoSyncStatus/AutoSyncStatus';
import MobileBottomNavigation from './BottomNavigation';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

interface LayoutProps {
  children: React.ReactNode;
}

const getMenuItems = (userRole?: string) => {
  const allMenuItems = [
    { text: 'Trang Chủ', icon: <DashboardIcon />, path: '/', permission: 'dashboard.view' },
    { text: 'Quản Lý Thiết Bị', icon: <DevicesIcon />, path: '/thiet-bi', permission: 'thietbi.view' },
    { text: 'Cơ Sở Vật Chất', icon: <BusinessIcon />, path: '/co-so-vat-chat', permission: 'cosovatchat.view' },
    { text: 'Lịch Sử Sử Dụng', icon: <HistoryIcon />, path: '/lich-su-su-dung', permission: 'lichsusu.view' },
    { text: 'Báo Cáo', icon: <AssessmentIcon />, path: '/bao-cao', permission: 'baocao.view' },
    { text: 'Thông Báo', icon: <NotificationsIcon />, path: '/thong-bao', permission: 'thongbao.view' },
    { text: 'Quản Lý Đồng Bộ', icon: <SyncIcon />, path: '/quan-ly-dong-bo', permission: 'dongbo.manage' },
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

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentDrawerWidth = sidebarCollapsed ? collapsedDrawerWidth : drawerWidth;
  const menuItems = getMenuItems(user?.vaiTro);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        minHeight: '64px !important',
        px: sidebarCollapsed ? 1 : 2
      }}>
        {!sidebarCollapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Quản Lý CSVC
          </Typography>
        )}
        <IconButton 
          onClick={handleSidebarToggle} 
          sx={{ 
            ml: sidebarCollapsed ? 0 : 'auto',
            color: 'primary.main',
            backgroundColor: sidebarCollapsed ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            borderRadius: sidebarCollapsed ? '50%' : 1,
            width: sidebarCollapsed ? 40 : 'auto',
            height: sidebarCollapsed ? 40 : 'auto',
            '&:hover': {
              backgroundColor: sidebarCollapsed 
                ? 'rgba(25, 118, 210, 0.15)' 
                : 'rgba(25, 118, 210, 0.08)',
              transform: sidebarCollapsed ? 'scale(1.1)' : 'rotate(180deg)',
            },
            transition: theme.transitions.create(['all', 'transform'], {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ 
        flexGrow: 1, 
        px: sidebarCollapsed ? 0 : 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: sidebarCollapsed ? 'center' : 'stretch'
      }}>
        {menuItems.map((item, index) => (
          <ListItem
            key={item.path}
            button
            onClick={() => navigate(item.path)}
            className="hover-lift"
            sx={{
              mb: 1,
              mx: 1,
              borderRadius: 2,
              backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
              color: location.pathname === item.path ? 'white' : 'inherit',
              border: location.pathname === item.path ? 'none' : '1px solid transparent',
              '&:hover': {
                backgroundColor: location.pathname === item.path ? 'primary.dark' : 'rgba(25, 118, 210, 0.08)',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                borderColor: location.pathname === item.path ? 'transparent' : 'primary.main',
                mx: 1,
                borderRadius: 3,
              },
              transition: 'all 0.2s ease-out',
              animation: `slideInFromLeft 0.3s ease-out ${index * 0.1}s both`
            }}
          >
            <Tooltip
              title={sidebarCollapsed ? item.text : ''}
              placement="right"
              disableHoverListener={!sidebarCollapsed}
              arrow
              sx={{
                '& .MuiTooltip-tooltip': {
                  backgroundColor: 'rgba(0, 0, 0, 0.87)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }
              }}
            >
              <ListItemIcon 
                className="hover-rotate"
                sx={{ 
                  color: location.pathname === item.path ? 'white' : 'inherit',
                  minWidth: sidebarCollapsed ? 0 : 40,
                  mr: sidebarCollapsed ? 0 : 0,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            {!sidebarCollapsed && (
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: location.pathname === item.path ? 'white' : 'inherit',
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          backgroundColor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transform: 'translateX(0)',
          display: { xs: 'none', md: 'block' }, // Ẩn header trên mobile
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Quản Lý Cơ Sở Vật Chất
          </Typography>

          {/* Auto Sync Status */}
          <Box sx={{ mr: 2 }}>
            <AutoSyncStatus />
          </Box>

          {/* User Menu */}
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={user?.vaiTro || 'User'}
              size="small"
              color="primary"
              variant="outlined"
            />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentDrawerWidth,
              transition: theme.transitions.create(['width', 'box-shadow'], {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
              overflowX: 'hidden',
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white',
              boxShadow: sidebarCollapsed ? 'none' : '0px 2px 4px -1px rgba(0,0,0,0.1)',
              transform: 'translateX(0)',
              '&:hover': {
                boxShadow: sidebarCollapsed ? 'none' : '0px 4px 8px -1px rgba(0,0,0,0.15)',
              }
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 1, md: 2 }, // Giảm padding trái phải
          py: { xs: 1, md: 3 }, // Giữ padding trên dưới
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          mt: { xs: 0, md: '64px' }, // Không có margin top trên mobile
          pb: { xs: '120px', md: 3 }, // Tăng padding bottom cho mobile để tránh FAB
          backgroundColor: '#f5f5f5',
          minHeight: { xs: '100vh', md: 'calc(100vh - 64px)' }, // Sửa minHeight cho mobile
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
          transform: 'translateX(0)',
          position: 'relative', // Thêm position relative
          overflow: 'visible', // Cho phép overflow để FAB hiển thị
        }}
      >
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {user && (
          <>
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user.hoTen}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                {user.vaiTro === 'quanTriVien' ? 'Quản Trị Viên' : 
                 user.vaiTro === 'giaoVien' ? 'Giáo Viên' : 'Học Sinh'}
                {user.lop && ` • Lớp ${user.lop}`}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                ID: {user.id}
              </Typography>
              </Box>
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={() => {
          console.log('👤 Thông tin user hiện tại:', user);
          console.log('🔑 User vai trò:', user?.vaiTro);
        }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Debug Info
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      {isMobile && <MobileBottomNavigation />}
    </Box>
  );
};

export default Layout; 