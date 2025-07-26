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
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { coSoVatChatService } from '../../services/localStorage';
import { CoSoVatChat } from '../../types';
import MobileCardView from '../../components/MobileCardView/MobileCardView';
import MobileFilterDialog from '../../components/MobileFilterDialog/MobileFilterDialog';

const CoSoVatChatManagement: React.FC = () => {
  const [coSoVatChatList, setCoSoVatChatList] = useState<CoSoVatChat[]>([]);
  const [filteredList, setFilteredList] = useState<CoSoVatChat[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCoSoVatChat, setEditingCoSoVatChat] = useState<CoSoVatChat | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  
  // Mobile filter dialog states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentFilterType, setCurrentFilterType] = useState<'status' | 'type' | 'location'>('status');
  
  // Search input states
  const [searchInputOpen, setSearchInputOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState<{
    ten: string;
    loai: 'phongHoc' | 'phongThiNghiem' | 'sanBai' | 'thuVien' | 'vanPhong' | 'khac';
    sucChua: number;
    tinhTrang: 'hoatDong' | 'baoTri' | 'ngungSuDung';
    moTa: string;
    viTri: string;
    thietBiIds: string[];
  }>({
    ten: '',
    loai: 'phongHoc',
    sucChua: 0,
    tinhTrang: 'hoatDong',
    moTa: '',
    viTri: '',
    thietBiIds: []
  });

  useEffect(() => {
    loadCoSoVatChatList();
  }, []);

  const loadCoSoVatChatList = () => {
    const data = coSoVatChatService.getAll();
    setCoSoVatChatList(data);
    setFilteredList(data);
  };

  const handleAddNew = () => {
    navigate('/co-so-vat-chat/new');
  };

  const handleViewDetail = (coSoVatChat: CoSoVatChat) => {
    navigate(`/co-so-vat-chat/${coSoVatChat.id}/view`);
  };

  const handleEdit = (coSoVatChat: CoSoVatChat) => {
    navigate(`/co-so-vat-chat/${coSoVatChat.id}/edit`);
  };

  const handleDelete = (coSoVatChat: CoSoVatChat) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${coSoVatChat.ten}"?`)) {
      coSoVatChatService.delete(coSoVatChat.id);
      loadCoSoVatChatList();
    }
  };

  const handleOpenFilterDialog = (filterType: 'status' | 'type' | 'location') => {
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
      case 'type':
        setTypeFilter(value);
        break;
      case 'location':
        setLocationFilter(value);
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
    let filtered = coSoVatChatList;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.viTri.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.moTa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.tinhTrang === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.loai === typeFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(item => item.viTri === locationFilter);
    }

    setFilteredList(filtered);
  }, [coSoVatChatList, searchTerm, statusFilter, typeFilter, locationFilter]);

  const getUniqueTypes = () => {
    const types = coSoVatChatList.map(item => item.loai);
    return Array.from(new Set(types));
  };

  const getUniqueLocations = () => {
    const locations = coSoVatChatList.map(item => item.viTri);
    return Array.from(new Set(locations));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setLocationFilter('all');
    setSearchInputValue('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hoatDong': return 'success';
      case 'baoTri': return 'warning';
      case 'ngungSuDung': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hoatDong': return 'Hoạt động';
      case 'baoTri': return 'Bảo trì';
      case 'ngungSuDung': return 'Ngừng sử dụng';
      default: return status;
    }
  };

  const getLoaiText = (loai: string) => {
    switch (loai) {
      case 'phongHoc': return 'Phòng học';
      case 'phongThiNghiem': return 'Phòng thí nghiệm';
      case 'sanBai': return 'Sân bãi';
      case 'thuVien': return 'Thư viện';
      case 'vanPhong': return 'Văn phòng';
      case 'khac': return 'Khác';
      default: return loai;
    }
  };

  const getStatusOptions = () => [
    { value: 'all', label: 'Tất cả' },
    { value: 'hoatDong', label: 'Hoạt động' },
    { value: 'baoTri', label: 'Bảo trì' },
    { value: 'ngungSuDung', label: 'Ngừng sử dụng' }
  ];

  const getTypeOptions = () => [
    { value: 'all', label: 'Tất cả' },
    ...getUniqueTypes().map(type => ({
      value: type,
      label: getLoaiText(type)
    }))
  ];

  const getLocationOptions = () => [
    { value: 'all', label: 'Tất cả' },
    ...getUniqueLocations().map(location => ({
      value: location,
      label: location
    }))
  ];

  const getCurrentFilterOptions = () => {
    switch (currentFilterType) {
      case 'status':
        return getStatusOptions();
      case 'type':
        return getTypeOptions();
      case 'location':
        return getLocationOptions();
      default:
        return [];
    }
  };

  const getCurrentFilterValue = () => {
    switch (currentFilterType) {
      case 'status':
        return statusFilter;
      case 'type':
        return typeFilter;
      case 'location':
        return locationFilter;
      default:
        return 'all';
    }
  };

  const getCurrentFilterTitle = () => {
    switch (currentFilterType) {
      case 'status':
        return 'Tình trạng';
      case 'type':
        return 'Loại cơ sở';
      case 'location':
        return 'Vị trí';
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
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  Quản Lý Cơ Sở Vật Chất
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
                    p: 2,
                    zIndex: 1001,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Tìm kiếm cơ sở vật chất..."
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
            <Box display="flex" gap={1.5} mt={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleOpenFilterDialog('status')}
                sx={{ 
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  py: 0.75,
                  px: 2,
                  minWidth: 'auto'
                }}
              >
                Tình trạng
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleOpenFilterDialog('type')}
                sx={{ 
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  py: 0.75,
                  px: 2,
                  minWidth: 'auto'
                }}
              >
                Loại
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleOpenFilterDialog('location')}
                sx={{ 
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  py: 0.75,
                  px: 2,
                  minWidth: 'auto'
                }}
              >
                Vị trí
              </Button>
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
            Quản Lý Cơ Sở Vật Chất
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Quản lý và theo dõi các cơ sở vật chất của trường học
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
            placeholder="Tìm kiếm cơ sở vật chất..."
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
              <MenuItem value="hoatDong">Hoạt động</MenuItem>
              <MenuItem value="baoTri">Bảo trì</MenuItem>
              <MenuItem value="ngungSuDung">Ngừng sử dụng</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Loại cơ sở</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Loại cơ sở"
              sx={{
                borderRadius: '12px',
                height: '40px',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {getUniqueTypes().map((type) => (
                <MenuItem key={type} value={type}>{getLoaiText(type)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Vị trí</InputLabel>
            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              label="Vị trí"
              sx={{
                borderRadius: '12px',
                height: '40px',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {getUniqueLocations().map((location) => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
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
            Thêm Cơ Sở Vật Chất
          </Button>
        </Box>
      )}

      {/* Results Count */}
      <Box sx={{ mb: 2, mt: { xs: 1, md: 2 } }}>
        <Typography variant="body2" color="text.secondary">
          Hiển thị {filteredList.length} / {coSoVatChatList.length} cơ sở vật chất
        </Typography>
      </Box>

      {/* Mobile Card View */}
      {isMobile ? (
        <Box sx={{ px: 1 }}>
          <MobileCardView
            type="coSoVatChat"
            data={filteredList}
            onView={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>STT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tên</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Loại</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Sức chứa</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tình trạng</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vị trí</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Mô tả</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredList.map((coSoVatChat, index) => (
                <TableRow 
                  key={coSoVatChat.id} 
                  hover 
                  onClick={() => handleViewDetail(coSoVatChat)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{coSoVatChat.ten}</TableCell>
                  <TableCell>{getLoaiText(coSoVatChat.loai)}</TableCell>
                  <TableCell>{coSoVatChat.sucChua || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(coSoVatChat.tinhTrang)}
                      color={getStatusColor(coSoVatChat.tinhTrang) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{coSoVatChat.viTri}</TableCell>
                  <TableCell>{coSoVatChat.moTa || '-'}</TableCell>
                  <TableCell>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(coSoVatChat);
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
                    <Tooltip title="Xóa">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(coSoVatChat);
                        }}
                        sx={{
                          color: theme.palette.error.main,
                          backgroundColor: 'rgba(211, 47, 47, 0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.2)',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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

export default CoSoVatChatManagement; 