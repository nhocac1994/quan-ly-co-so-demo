import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
  Portal,
  Card,
  CardContent,
  Grid,
  Avatar,
  Menu,
  ListItemButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { thongBaoService } from '../../services/localStorage';
import { ThongBao } from '../../types';
import MobileCardView from '../../components/MobileCardView/MobileCardView';

const ThongBaoPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [thongBaoList, setThongBaoList] = useState<ThongBao[]>([]);
  const [filteredList, setFilteredList] = useState<ThongBao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Menu states
  const [typeMenuAnchor, setTypeMenuAnchor] = useState<null | HTMLElement>(null);
  const [priorityMenuAnchor, setPriorityMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadThongBaoList();
  }, []);

  // Lắng nghe sự kiện refresh data từ AutoSync
  useEffect(() => {
    const handleDataRefreshed = () => {
      console.log('🔄 ThongBao: Nhận sự kiện dataRefreshed, cập nhật dữ liệu...');
      loadThongBaoList();
    };

    window.addEventListener('dataRefreshed', handleDataRefreshed);
    
    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefreshed);
    };
  }, []);

  useEffect(() => {
    filterThongBaoList();
  }, [thongBaoList, searchTerm, typeFilter, priorityFilter, statusFilter]);

  const loadThongBaoList = () => {
    const data = thongBaoService.getAll();
    setThongBaoList(data);
  };

  const filterThongBaoList = () => {
    let filtered = thongBaoList;

    if (searchTerm) {
      filtered = filtered.filter(thongBao =>
        thongBao.tieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thongBao.noiDung.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(thongBao => thongBao.loai === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(thongBao => thongBao.doUuTien === priorityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(thongBao => thongBao.trangThai === statusFilter);
    }

    setFilteredList(filtered);
  };

  const handleAddNew = () => {
    navigate('/thong-bao/new');
  };

  const handleViewDetail = (thongBao: ThongBao) => {
    // Có thể implement view detail sau
    console.log('View detail:', thongBao);
  };

  const handleEdit = (thongBao: ThongBao) => {
    navigate(`/thong-bao/${thongBao.id}/edit`);
  };

  const handleDelete = (thongBao: ThongBao) => {
    if (window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      thongBaoService.delete(thongBao.id);
      loadThongBaoList();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
  };

  // Menu handlers
  const handleTypeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTypeMenuAnchor(event.currentTarget);
  };

  const handleTypeMenuClose = () => {
    setTypeMenuAnchor(null);
  };

  const handlePriorityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPriorityMenuAnchor(event.currentTarget);
  };

  const handlePriorityMenuClose = () => {
    setPriorityMenuAnchor(null);
  };

  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'thap': return 'default';
      case 'trungBinh': return 'primary';
      case 'cao': return 'warning';
      case 'khẩnCấp': return 'error';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'thap': return 'Thấp';
      case 'trungBinh': return 'Trung bình';
      case 'cao': return 'Cao';
      case 'khẩnCấp': return 'Khẩn cấp';
      default: return priority;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'baoTri': return 'Bảo trì';
      case 'thayThe': return 'Thay thế';
      case 'caiTien': return 'Cải tiến';
      case 'thongBaoChung': return 'Thông báo chung';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'baoTri':
        return <WarningIcon color="warning" />;
      case 'thayThe':
        return <ErrorIcon color="error" />;
      case 'caiTien':
        return <InfoIcon color="info" />;
      case 'thongBaoChung':
        return <NotificationsIcon color="primary" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'chuaDoc': return 'warning';
      case 'daDoc': return 'success';
      case 'daXuLy': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'chuaDoc': return 'Chưa đọc';
      case 'daDoc': return 'Đã đọc';
      case 'daXuLy': return 'Đã xử lý';
      default: return status;
    }
  };

  const getUniqueTypes = () => {
    return Array.from(new Set(thongBaoList.map(thongBao => thongBao.loai)));
  };

  const getUniquePriorities = () => {
    return Array.from(new Set(thongBaoList.map(thongBao => thongBao.doUuTien)));
  };

  const getUniqueStatuses = () => {
    return Array.from(new Set(thongBaoList.map(thongBao => thongBao.trangThai)));
  };

  return (
    <Box sx={{ p: { xs: 0, md: 3 }, pb: { xs: '120px', md: 3 }, mt: { xs: 13, md: 0 } }}>
      {/* Mobile Header */}
      {isMobile && (
        <Portal>
          <Box
            data-fixed-header
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              backgroundColor: 'white',
              borderBottom: '1px solid',
              borderColor: 'divider',
              pt: 2,
              pb: 2,
              px: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
              <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
                Quản Lý Thông Báo
              </Typography>
            </Box>
            
            {/* Filter Buttons */}
            <Box display="flex" gap={0.5} mt={1}>
              <Chip
                label={`Loại${typeFilter !== 'all' ? `: ${getTypeText(typeFilter)}` : ''}`}
                size="small"
                variant="outlined"
                onClick={handleTypeMenuOpen}
                onDelete={typeFilter !== 'all' ? () => setTypeFilter('all') : undefined}
                deleteIcon={<KeyboardArrowDownIcon />}
                sx={{ 
                  fontSize: '0.75rem',
                  height: '30px',
                  backgroundColor: typeFilter !== 'all' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  '& .MuiChip-label': {
                    px: 1.5,
                    fontSize: '0.75rem',
                  }
                }}
              />
              <Chip
                label={`Ưu tiên${priorityFilter !== 'all' ? `: ${getPriorityText(priorityFilter)}` : ''}`}
                size="small"
                variant="outlined"
                onClick={handlePriorityMenuOpen}
                onDelete={priorityFilter !== 'all' ? () => setPriorityFilter('all') : undefined}
                deleteIcon={<KeyboardArrowDownIcon />}
                sx={{ 
                  fontSize: '0.75rem',
                  height: '30px',
                  backgroundColor: priorityFilter !== 'all' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  '& .MuiChip-label': {
                    px: 1.5,
                    fontSize: '0.75rem',
                  }
                }}
              />
              <Chip
                label={`Trạng thái${statusFilter !== 'all' ? `: ${getStatusText(statusFilter)}` : ''}`}
                size="small"
                variant="outlined"
                onClick={handleStatusMenuOpen}
                onDelete={statusFilter !== 'all' ? () => setStatusFilter('all') : undefined}
                deleteIcon={<KeyboardArrowDownIcon />}
                sx={{ 
                  fontSize: '0.75rem',
                  height: '30px',
                  backgroundColor: statusFilter !== 'all' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  '& .MuiChip-label': {
                    px: 1.5,
                    fontSize: '0.75rem',
                  }
                }}
              />
            </Box>
          </Box>
        </Portal>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Quản Lý Thông Báo
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Quản lý và theo dõi các thông báo hệ thống
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{
                px: 2.5,
                py: 1,
                height: '40px',
                fontSize: '0.875rem',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Thêm Thông Báo
            </Button>
          </Box>
        </Box>
      )}

      {/* Desktop Filter Bar */}
      {!isMobile && (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
          <TextField
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              minWidth: 250,
              flex: '0 1 auto',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                height: '40px',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon color="action" />
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Loại</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Loại"
              sx={{
                borderRadius: '12px',
                height: '40px',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {getUniqueTypes().map((type) => (
                <MenuItem key={type} value={type}>
                  {getTypeText(type)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Ưu tiên</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              label="Ưu tiên"
              sx={{
                borderRadius: '12px',
                height: '40px',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {getUniquePriorities().map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {getPriorityText(priority)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
              sx={{
                borderRadius: '12px',
                height: '40px',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {getUniqueStatuses().map((status) => (
                <MenuItem key={status} value={status}>
                  {getStatusText(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{
              minWidth: 'auto',
              px: 2,
              height: '40px',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            Xóa lọc
          </Button>
        </Box>
      )}

      {/* Content */}
      {isMobile ? (
        <MobileCardView
          data={filteredList}
          type="thongBao"
          onView={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List>
            {filteredList.length > 0 ? (
              filteredList.map((thongBao, index) => (
                <ListItem
                  key={`${thongBao.id}-${index}`}
                  divider
                  sx={{
                    backgroundColor: thongBao.trangThai === 'chuaDoc' ? 'rgba(255, 193, 7, 0.1)' : 'inherit',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                  onClick={() => handleViewDetail(thongBao)}
                >
                  <ListItemIcon>
                    {getTypeIcon(thongBao.loai)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 500, flex: 1 }}>
                          {thongBao.tieuDe}
                        </span>
                        <Chip
                          label={getPriorityText(thongBao.doUuTien)}
                          color={getPriorityColor(thongBao.doUuTien) as any}
                          size="small"
                        />
                        <Chip
                          label={getStatusText(thongBao.trangThai)}
                          color={getStatusColor(thongBao.trangThai) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <span style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', display: 'block', marginBottom: '4px' }}>
                          {thongBao.noiDung}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)', display: 'block' }}>
                          Loại: {getTypeText(thongBao.loai)} | 
                          Tạo: {new Date(thongBao.ngayTao).toLocaleDateString('vi-VN')}
                          {thongBao.ngayHetHan && ` | Hết hạn: ${new Date(thongBao.ngayHetHan).toLocaleDateString('vi-VN')}`}
                        </span>
                      </React.Fragment>
                    }
                  />
                  <Box>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(thongBao);
                      }}
                      sx={{
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(thongBao);
                      }}
                      sx={{
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <span style={{ fontSize: '1rem', color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center', display: 'block' }}>
                      Chưa có thông báo nào
                    </span>
                  }
                />
              </ListItem>
            )}
          </List>
        </Paper>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Portal>
          <Box
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              zIndex: 9998,
            }}
          >
            <IconButton
              onClick={handleAddNew}
              sx={{
                width: 50,
                height: 50,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'scale(1.1)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& .MuiSvgIcon-root': {
                  fontSize: '2rem',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Portal>
      )}

      {/* Filter Menus for Mobile */}
      <Menu
        anchorEl={typeMenuAnchor}
        open={Boolean(typeMenuAnchor)}
        onClose={handleTypeMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }
        }}
      >
        <MenuItem onClick={() => { setTypeFilter('all'); handleTypeMenuClose(); }}>
          Tất cả
        </MenuItem>
        {getUniqueTypes().map((type) => (
          <MenuItem 
            key={type} 
            onClick={() => { setTypeFilter(type); handleTypeMenuClose(); }}
            selected={typeFilter === type}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {getTypeIcon(type)}
              {getTypeText(type)}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={priorityMenuAnchor}
        open={Boolean(priorityMenuAnchor)}
        onClose={handlePriorityMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }
        }}
      >
        <MenuItem onClick={() => { setPriorityFilter('all'); handlePriorityMenuClose(); }}>
          Tất cả
        </MenuItem>
        {getUniquePriorities().map((priority) => (
          <MenuItem 
            key={priority} 
            onClick={() => { setPriorityFilter(priority); handlePriorityMenuClose(); }}
            selected={priorityFilter === priority}
          >
            <Chip 
              label={getPriorityText(priority)} 
              size="small" 
              color={getPriorityColor(priority) as any}
            />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 150,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }
        }}
      >
        <MenuItem onClick={() => { setStatusFilter('all'); handleStatusMenuClose(); }}>
          Tất cả
        </MenuItem>
        {getUniqueStatuses().map((status) => (
          <MenuItem 
            key={status} 
            onClick={() => { setStatusFilter(status); handleStatusMenuClose(); }}
            selected={statusFilter === status}
          >
            <Chip 
              label={getStatusText(status)} 
              size="small" 
              color={getStatusColor(status) as any}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ThongBaoPage; 