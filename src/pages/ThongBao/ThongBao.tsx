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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Avatar
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
  Close as CloseIcon
} from '@mui/icons-material';
import { thongBaoService } from '../../services/localStorage';
import { ThongBao } from '../../types';
import MobileCardView from '../../components/MobileCardView/MobileCardView';

const ThongBaoPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [thongBaoList, setThongBaoList] = useState<ThongBao[]>([]);
  const [filteredList, setFilteredList] = useState<ThongBao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingThongBao, setEditingThongBao] = useState<ThongBao | null>(null);
  const [formData, setFormData] = useState<{
    tieuDe: string;
    noiDung: string;
    loai: 'baoTri' | 'thayThe' | 'caiTien' | 'thongBaoChung';
    doUuTien: 'thap' | 'trungBinh' | 'cao' | 'khẩnCấp';
    ngayHetHan: string;
    nguoiNhan: string[];
    trangThai: 'chuaDoc' | 'daDoc' | 'daXuLy';
  }>({
    tieuDe: '',
    noiDung: '',
    loai: 'thongBaoChung',
    doUuTien: 'trungBinh',
    ngayHetHan: '',
    nguoiNhan: [],
    trangThai: 'chuaDoc'
  });

  useEffect(() => {
    loadThongBaoList();
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
    setEditingThongBao(null);
    setFormData({
      tieuDe: '',
      noiDung: '',
      loai: 'thongBaoChung',
      doUuTien: 'trungBinh',
      ngayHetHan: '',
      nguoiNhan: [],
      trangThai: 'chuaDoc'
    });
    setOpenDialog(true);
  };

  const handleViewDetail = (thongBao: ThongBao) => {
    // Có thể implement view detail sau
    console.log('View detail:', thongBao);
  };

  const handleEdit = (thongBao: ThongBao) => {
    setEditingThongBao(thongBao);
    setFormData({
      tieuDe: thongBao.tieuDe,
      noiDung: thongBao.noiDung,
      loai: thongBao.loai,
      doUuTien: thongBao.doUuTien,
      ngayHetHan: thongBao.ngayHetHan ? thongBao.ngayHetHan.split('T')[0] : '',
      nguoiNhan: thongBao.nguoiNhan || [],
      trangThai: thongBao.trangThai
    });
    setOpenDialog(true);
  };

  const handleDelete = (thongBao: ThongBao) => {
    if (window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      thongBaoService.delete(thongBao.id);
      loadThongBaoList();
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingThongBao(null);
  };

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const submitData = {
      ...formData,
      ngayTao: now,
      ngayHetHan: formData.ngayHetHan ? new Date(formData.ngayHetHan).toISOString() : undefined
    };

    if (editingThongBao) {
      thongBaoService.update(editingThongBao.id, submitData);
    } else {
      thongBaoService.add(submitData);
    }

    handleCloseDialog();
    loadThongBaoList();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
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
    <Box sx={{ p: { xs: 0, md: 3 }, pb: { xs: '100px', md: 3 } }}>
      {/* Mobile Header */}
      {isMobile && (
        <Portal>
          <Box
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
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Quản Lý Thông Báo
              </Typography>
            </Box>
            
            {/* Filter Buttons */}
            <Box display="flex" gap={1.5} mt={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setTypeFilter(typeFilter === 'all' ? 'thongBaoChung' : 'all')}
                sx={{ 
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  py: 0.75,
                  px: 2,
                  minWidth: 'auto',
                  backgroundColor: typeFilter !== 'all' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                }}
              >
                Loại
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setPriorityFilter(priorityFilter === 'all' ? 'trungBinh' : 'all')}
                sx={{ 
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  py: 0.75,
                  px: 2,
                  minWidth: 'auto',
                  backgroundColor: priorityFilter !== 'all' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                }}
              >
                Ưu tiên
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setStatusFilter(statusFilter === 'all' ? 'chuaDoc' : 'all')}
                sx={{ 
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  py: 0.75,
                  px: 2,
                  minWidth: 'auto',
                  backgroundColor: statusFilter !== 'all' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                }}
              >
                Trạng thái
              </Button>
            </Box>
          </Box>
        </Portal>
      )}

      {/* Spacer for mobile header */}
      {isMobile && <Box sx={{ height: '80px' }} />}

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
              filteredList.map((thongBao) => (
                <ListItem
                  key={thongBao.id}
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

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingThongBao ? 'Chỉnh Sửa Thông Báo' : 'Thêm Thông Báo Mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tiêu đề"
              value={formData.tieuDe}
              onChange={(e) => setFormData({ ...formData, tieuDe: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Nội dung"
              multiline
              rows={4}
              value={formData.noiDung}
              onChange={(e) => setFormData({ ...formData, noiDung: e.target.value })}
              margin="normal"
              required
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Loại thông báo</InputLabel>
                  <Select
                    value={formData.loai}
                    onChange={(e) => setFormData({ ...formData, loai: e.target.value as any })}
                    label="Loại thông báo"
                  >
                    <MenuItem value="thongBaoChung">Thông báo chung</MenuItem>
                    <MenuItem value="baoTri">Bảo trì</MenuItem>
                    <MenuItem value="thayThe">Thay thế</MenuItem>
                    <MenuItem value="caiTien">Cải tiến</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Độ ưu tiên</InputLabel>
                  <Select
                    value={formData.doUuTien}
                    onChange={(e) => setFormData({ ...formData, doUuTien: e.target.value as any })}
                    label="Độ ưu tiên"
                  >
                    <MenuItem value="thap">Thấp</MenuItem>
                    <MenuItem value="trungBinh">Trung bình</MenuItem>
                    <MenuItem value="cao">Cao</MenuItem>
                    <MenuItem value="khẩnCấp">Khẩn cấp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày hết hạn"
                  type="date"
                  value={formData.ngayHetHan}
                  onChange={(e) => setFormData({ ...formData, ngayHetHan: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={formData.trangThai}
                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as any })}
                    label="Trạng thái"
                  >
                    <MenuItem value="chuaDoc">Chưa đọc</MenuItem>
                    <MenuItem value="daDoc">Đã đọc</MenuItem>
                    <MenuItem value="daXuLy">Đã xử lý</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingThongBao ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThongBaoPage; 