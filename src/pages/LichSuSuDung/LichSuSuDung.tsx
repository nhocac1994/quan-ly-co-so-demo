import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Portal,
  Slide
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lichSuSuDungService, thietBiService, coSoVatChatService } from '../../services/localStorage';
import { LichSuSuDung, ThietBi, CoSoVatChat } from '../../types';
import MobileCardView from '../../components/MobileCardView/MobileCardView';
import MobileFilterDialog from '../../components/MobileFilterDialog/MobileFilterDialog';

const LichSuSuDungPage: React.FC = () => {
  const [lichSuList, setLichSuList] = useState<LichSuSuDung[]>([]);
  const [filteredList, setFilteredList] = useState<LichSuSuDung[]>([]);
  const [thietBiList, setThietBiList] = useState<ThietBi[]>([]);
  const [coSoVatChatList, setCoSoVatChatList] = useState<CoSoVatChat[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLichSu, setEditingLichSu] = useState<LichSuSuDung | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Mobile filter dialog states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilterType, setCurrentFilterType] = useState<'status' | 'role' | 'type'>('status');
  
  // Search input states
  const [searchInputOpen, setSearchInputOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState<{
    thietBiId: string;
    coSoVatChatId: string;
    nguoiMuon: string;
    vaiTro: 'hocSinh' | 'giaoVien' | 'nhanVien';
    ngayMuon: string;
    ngayTra: string;
    trangThai: 'dangMuon' | 'daTra' | 'quaHan';
    lyDo: string;
    ghiChu: string;
  }>({
    thietBiId: '',
    coSoVatChatId: '',
    nguoiMuon: '',
    vaiTro: 'hocSinh',
    ngayMuon: new Date().toISOString().split('T')[0],
    ngayTra: '',
    trangThai: 'dangMuon',
    lyDo: '',
    ghiChu: ''
  });

  useEffect(() => {
    loadLichSuSuDungList();
  }, []);

  // Lắng nghe sự kiện refresh data từ AutoSync
  useEffect(() => {
    const handleDataRefreshed = () => {
      console.log('🔄 LichSuSuDung: Nhận sự kiện dataRefreshed, cập nhật dữ liệu...');
      loadLichSuSuDungList();
    };

    window.addEventListener('dataRefreshed', handleDataRefreshed);
    
    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefreshed);
    };
  }, []);

  const loadLichSuSuDungList = () => {
    const lichSuData = lichSuSuDungService.getAll();
    const thietBiData = thietBiService.getAll();
    const coSoVatChatData = coSoVatChatService.getAll();
    
    setLichSuList(lichSuData);
    setFilteredList(lichSuData);
    setThietBiList(thietBiData);
    setCoSoVatChatList(coSoVatChatData);
  };

  const handleAddNew = () => {
    navigate('/lich-su-su-dung/new');
  };

  const handleViewDetail = (lichSu: LichSuSuDung) => {
    navigate(`/lich-su-su-dung/${lichSu.id}/view`);
  };

  const handleEdit = (lichSu: LichSuSuDung) => {
    navigate(`/lich-su-su-dung/${lichSu.id}/edit`);
  };

  const handleTraThietBi = (lichSu: LichSuSuDung) => {
    if (window.confirm(`Xác nhận trả "${getThietBiName(lichSu.thietBiId || '')}" / "${getCoSoVatChatName(lichSu.coSoVatChatId || '')}"?`)) {
      const updatedLichSu = {
        ...lichSu,
        trangThai: 'daTra' as const,
        ngayTra: new Date().toISOString()
      };
      lichSuSuDungService.update(lichSu.id, updatedLichSu);
      loadLichSuSuDungList();
    }
  };

  const handleOpenFilterDialog = (filterType: 'status' | 'role' | 'type') => {
    setCurrentFilterType(filterType);
    setFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  const handleFilterSelect = (value: string) => {
    switch (currentFilterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'role':
        setRoleFilter(value);
        break;
      case 'type':
        setTypeFilter(value);
        break;
    }
    setFilterDialogOpen(false);
  };

  const handleSearchIconClick = () => {
    setSearchInputOpen(true);
  };

  const handleSearchInputClose = () => {
    setSearchInputOpen(false);
    setSearchInputValue('');
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInputValue(value);
  };

  const handleSearchInputSubmit = () => {
    setSearchTerm(searchInputValue);
    setSearchInputOpen(false);
  };

  // Filter logic
  useEffect(() => {
    let filtered = lichSuList;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nguoiMuon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getThietBiName(item.thietBiId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCoSoVatChatName(item.coSoVatChatId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lyDo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.trangThai === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(item => item.vaiTro === roleFilter);
    }

    // Type filter (thietBi vs coSoVatChat)
    if (typeFilter !== 'all') {
      if (typeFilter === 'thietBi') {
        filtered = filtered.filter(item => item.thietBiId);
      } else if (typeFilter === 'coSoVatChat') {
        filtered = filtered.filter(item => item.coSoVatChatId);
      }
    }

    setFilteredList(filtered);
  }, [lichSuList, searchTerm, statusFilter, roleFilter, typeFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setTypeFilter('all');
    setSearchInputValue('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dangMuon': return 'warning';
      case 'daTra': return 'success';
      case 'quaHan': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'dangMuon': return 'Đang mượn';
      case 'daTra': return 'Đã trả';
      case 'quaHan': return 'Quá hạn';
      default: return status;
    }
  };

  const getVaiTroText = (vaiTro: string) => {
    switch (vaiTro) {
      case 'hocSinh': return 'Học sinh';
      case 'giaoVien': return 'Giáo viên';
      case 'nhanVien': return 'Nhân viên';
      default: return vaiTro;
    }
  };

  const getThietBiName = (id: string) => {
    const thietBi = thietBiList.find(tb => tb.id === id);
    return thietBi ? thietBi.ten : 'Không tìm thấy';
  };

  const getCoSoVatChatName = (id: string) => {
    const coSo = coSoVatChatList.find(cs => cs.id === id);
    return coSo ? coSo.ten : 'Không tìm thấy';
  };

  const getStatusOptions = () => [
    { value: 'all', label: 'Tất cả' },
    { value: 'dangMuon', label: 'Đang mượn' },
    { value: 'daTra', label: 'Đã trả' },
    { value: 'quaHan', label: 'Quá hạn' }
  ];

  const getRoleOptions = () => [
    { value: 'all', label: 'Tất cả' },
    { value: 'hocSinh', label: 'Học sinh' },
    { value: 'giaoVien', label: 'Giáo viên' },
    { value: 'nhanVien', label: 'Nhân viên' }
  ];

  const getTypeOptions = () => [
    { value: 'all', label: 'Tất cả' },
    { value: 'thietBi', label: 'Thiết bị' },
    { value: 'coSoVatChat', label: 'Cơ sở vật chất' }
  ];

  const getCurrentFilterOptions = () => {
    switch (currentFilterType) {
      case 'status':
        return getStatusOptions();
      case 'role':
        return getRoleOptions();
      case 'type':
        return getTypeOptions();
      default:
        return [];
    }
  };

  const getCurrentFilterValue = () => {
    switch (currentFilterType) {
      case 'status':
        return statusFilter;
      case 'role':
        return roleFilter;
      case 'type':
        return typeFilter;
      default:
        return 'all';
    }
  };

  const getCurrentFilterTitle = () => {
    switch (currentFilterType) {
      case 'status':
        return 'Tình trạng';
      case 'role':
        return 'Vai trò';
      case 'type':
        return 'Loại';
      default:
        return 'Bộ lọc';
    }
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
              <Box display="flex" alignItems="center">
                <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  Lịch Sử Sử Dụng
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={handleSearchIconClick}
                sx={{ 
                  color: 'primary.main',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {/* Search Input Overlay */}
            {searchInputOpen && (
              <Slide direction="down" in={searchInputOpen} mountOnEnter unmountOnExit>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    p: 1,
                    zIndex: 1001,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Tìm kiếm lịch sử sử dụng..."
                    value={searchInputValue}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchInputSubmit()}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleSearchInputSubmit}>
                            <SearchIcon />
                          </IconButton>
                          <IconButton size="small" onClick={handleSearchInputClose}>
                            <CloseIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '16px' }
                    }}
                    autoFocus
                  />
                </Box>
              </Slide>
            )}
            
            {/* Filter Buttons */}
            <Box display="flex" gap={0.5} mt={0.5}>
              <Chip
                label="Tình trạng"
                size="small"
                variant="outlined"
                onClick={() => handleOpenFilterDialog('status')}
                sx={{ 
                  fontSize: '0.75rem',
                  height: '30px',
                  '& .MuiChip-label': {
                    px: 1.5,
                    fontSize: '0.75rem',
                  }
                }}
              />
              <Chip
                label="Vai trò"
                size="small"
                variant="outlined"
                onClick={() => handleOpenFilterDialog('role')}
                sx={{ 
                  fontSize: '0.75rem',
                  height: '30px',
                  '& .MuiChip-label': {
                    px: 1.5,
                    fontSize: '0.75rem',
                  }
                }}
              />
              <Chip
                label="Loại"
                size="small"
                variant="outlined"
                onClick={() => handleOpenFilterDialog('type')}
                sx={{ 
                  fontSize: '0.75rem',
                  height: '30px',
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

      {/* Spacer for mobile header */}
      {isMobile && <Box sx={{ height: searchInputOpen ? '100px' : '100px' }} />}

      {/* Desktop Header */}
      {!isMobile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Lịch Sử Sử Dụng
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Theo dõi lịch sử mượn trả thiết bị và cơ sở vật chất
          </Typography>
        </Box>
      )}

      {/* Desktop Filter Bar */}
      {!isMobile && (
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 2
        }}>
          <TextField
            placeholder="Tìm kiếm lịch sử sử dụng..."
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
                fontWeight: 500
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Tình trạng</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Tình trạng"
              sx={{
                borderRadius: '12px',
                height: '40px',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="dangMuon">Đang mượn</MenuItem>
              <MenuItem value="daTra">Đã trả</MenuItem>
              <MenuItem value="quaHan">Quá hạn</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="Vai trò"
              sx={{
                borderRadius: '12px',
                height: '40px',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="hocSinh">Học sinh</MenuItem>
              <MenuItem value="giaoVien">Giáo viên</MenuItem>
              <MenuItem value="nhanVien">Nhân viên</MenuItem>
            </Select>
          </FormControl>
          
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
                fontWeight: 500
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="thietBi">Thiết bị</MenuItem>
              <MenuItem value="coSoVatChat">Cơ sở vật chất</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
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
            Thêm Lịch Sử
          </Button>
        </Box>
      )}

      {/* Results Count */}
      <Box sx={{ mb: 2, mt: { xs: 1, md: 2 } }}>
        <Typography variant="body2" color="text.secondary">
          Hiển thị {filteredList.length} / {lichSuList.length} bản ghi
        </Typography>
      </Box>

      {/* Mobile Card View */}
      {isMobile ? (
        <Box sx={{ px: 1 }}>
          <MobileCardView
            type="lichSuSuDung"
            data={filteredList}
            onView={handleViewDetail}
            onEdit={handleEdit}
            onDelete={undefined}
          />
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>STT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Người mượn</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vai trò</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Thiết bị/Cơ sở</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ngày mượn</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ngày trả</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tình trạng</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Lý do</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                              {filteredList.map((lichSu, index) => (
                  <TableRow 
                    key={`${lichSu.id}-${index}`} 
                    hover 
                    onClick={() => handleViewDetail(lichSu)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{lichSu.nguoiMuon}</TableCell>
                  <TableCell>{getVaiTroText(lichSu.vaiTro)}</TableCell>
                  <TableCell>
                    {lichSu.thietBiId ? getThietBiName(lichSu.thietBiId) : 
                     lichSu.coSoVatChatId ? getCoSoVatChatName(lichSu.coSoVatChatId) : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(lichSu.ngayMuon).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {lichSu.ngayTra ? new Date(lichSu.ngayTra).toLocaleDateString('vi-VN') : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(lichSu.trangThai)}
                      color={getStatusColor(lichSu.trangThai) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{lichSu.lyDo}</TableCell>
                  <TableCell>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(lichSu);
                        }}
                        sx={{
                          color: theme.palette.primary.main,
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.2)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {lichSu.trangThai === 'dangMuon' && (
                      <Tooltip title="Trả thiết bị">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTraThietBi(lichSu);
                          }}
                          sx={{
                            color: theme.palette.success.main,
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.2)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile Filter Dialog */}
      <MobileFilterDialog
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
        title={getCurrentFilterTitle()}
        options={getCurrentFilterOptions()}
        selectedValue={getCurrentFilterValue()}
        onSelect={handleFilterSelect}
      />

      {/* Mobile FAB */}
      {isMobile && (
        <Portal>
          <Box
            sx={{
              position: 'fixed',
              bottom: '100px',
              right: '16px',
              zIndex: 1000
            }}
          >
            <Button
              variant="contained"
              sx={{
                borderRadius: '50%',
                width: 56,
                height: 56,
                minWidth: 'auto',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.5)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={handleAddNew}
            >
              <AddIcon />
            </Button>
          </Box>
        </Portal>
      )}
    </Box>
  );
};

export default LichSuSuDungPage; 