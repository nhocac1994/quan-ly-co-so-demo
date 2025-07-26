import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  useTheme,
  useMediaQuery,
  Portal,
  Slide
} from '@mui/material';
import {
  Add as AddIcon,
  QrCode as QrCodeIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { thietBiService } from '../../services/localStorage';
import { ThietBi } from '../../types';
import QRCodeModal from '../../components/QRCodeModal/QRCodeModal';
import MobileCardView from '../../components/MobileCardView/MobileCardView';
import MobileFilterDialog from '../../components/MobileFilterDialog/MobileFilterDialog';
import { AutoSyncStatusIcon } from '../../components/AutoSyncStatus/AutoSyncStatus';
import { initializeSampleEquipment, forceInitializeSampleEquipment } from '../../data/sampleEquipment';

const ThietBiManagement: React.FC = () => {
  const [thietBiList, setThietBiList] = useState<ThietBi[]>([]);
  const [filteredList, setFilteredList] = useState<ThietBi[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedThietBi, setSelectedThietBi] = useState<ThietBi | null>(null);
  
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

  useEffect(() => {
    loadThietBiList();
  }, []);

  // Lắng nghe sự kiện refresh data từ AutoSync
  useEffect(() => {
    const handleDataRefreshed = () => {
      console.log('🔄 ThietBiManagement: Nhận sự kiện dataRefreshed, cập nhật dữ liệu...');
      loadThietBiList();
    };

    window.addEventListener('dataRefreshed', handleDataRefreshed);
    
    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefreshed);
    };
  }, []);

  const loadThietBiList = () => {
    const data = thietBiService.getAll();
    console.log('📊 Dữ liệu thiết bị:', data);
    setThietBiList(data);
    setFilteredList(data);
  };

  const handleAddNew = () => {
    navigate('/thiet-bi/new');
  };

  const handleViewDetail = (thietBi: ThietBi) => {
    navigate(`/thiet-bi/${thietBi.id}/view`);
  };

  const handleEdit = (thietBi: ThietBi) => {
    navigate(`/thiet-bi/${thietBi.id}/edit`);
  };

  const handleDelete = (thietBi: ThietBi) => {
    // Implement delete logic here
    console.log('Delete thiết bị:', thietBi);
    // Example: thietBiService.delete(thietBi.id);
    // After successful deletion, reload the list
    loadThietBiList();
  };

  const handleQRCode = (thietBi: ThietBi) => {
    setSelectedThietBi(thietBi);
    setQrModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setQrModalOpen(false);
    setSelectedThietBi(null);
  };

  // Mobile filter handlers
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
  };

  // Search input handlers
  const handleSearchIconClick = () => {
    setSearchInputOpen(true);
    setSearchInputValue(searchTerm);
  };

  const handleSearchInputClose = () => {
    setSearchInputOpen(false);
    setSearchInputValue('');
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInputValue(value);
    setSearchTerm(value);
  };

  const handleSearchInputSubmit = () => {
    setSearchInputOpen(false);
  };

  // Filter logic
  const applyFilters = useCallback(() => {
    let filtered = thietBiList;
    console.log('🔍 Áp dụng bộ lọc:', { searchTerm, statusFilter, typeFilter, locationFilter });

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.loai.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.viTri.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nhaCungCap && item.nhaCungCap.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      console.log('🔍 Sau khi tìm kiếm:', filtered.length);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.tinhTrang === statusFilter);
      console.log('🔍 Sau khi lọc tình trạng:', filtered.length);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.loai === typeFilter);
      console.log('🔍 Sau khi lọc loại:', filtered.length);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(item => item.viTri === locationFilter);
      console.log('🔍 Sau khi lọc vị trí:', filtered.length);
    }

    console.log('✅ Kết quả cuối cùng:', filtered.length);
    setFilteredList(filtered);
  }, [searchTerm, statusFilter, typeFilter, locationFilter, thietBiList]);

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Get unique values for filter options
  const getUniqueTypes = () => {
    const types = thietBiList.map(item => item.loai);
    return Array.from(new Set(types));
  };

  const getUniqueLocations = () => {
    const locations = thietBiList.map(item => item.viTri);
    return Array.from(new Set(locations));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setLocationFilter('all');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'suDung': return 'success';
      case 'hongHoc': return 'error';
      case 'baoTri': return 'warning';
      case 'ngungSuDung': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      suDung: 'Đang sử dụng',
      hongHoc: 'Hỏng hóc',
      baoTri: 'Bảo trì',
      ngungSuDung: 'Ngừng sử dụng'
    };
    return statusMap[status] || status;
  };

  // Helper functions for filter options
  const getStatusOptions = () => [
    { value: 'all', label: 'Tất cả' },
    { value: 'suDung', label: 'Đang sử dụng' },
    { value: 'hongHoc', label: 'Hỏng hóc' },
    { value: 'baoTri', label: 'Bảo trì' },
    { value: 'ngungSuDung', label: 'Ngừng sử dụng' }
  ];

  const getTypeOptions = () => [
    { value: 'all', label: 'Tất cả' },
    ...getUniqueTypes().map(type => ({ value: type, label: type }))
  ];

  const getLocationOptions = () => [
    { value: 'all', label: 'Tất cả' },
    ...getUniqueLocations().map(location => ({ value: location, label: location }))
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
        return 'Loại thiết bị';
      case 'location':
        return 'Vị trí';
      default:
        return 'Lọc';
    }
  };

  return (
    <>
      <Box sx={{ 
        p: { xs: 1, md: 3 }, 
        pb: { xs: 1, md: 3 }, 
        mt: { xs: 0, md: 0 },
        minHeight: { xs: 'auto', md: 'auto' },
        height: { xs: 'auto', md: 'auto' }
      }}>
        {/* Mobile Header với tiêu đề - Fixed với Portal */}
        {isMobile && (
          <Portal>
            {/* Search Input Overlay - Hiển thị phía trên header */}
            <Slide 
              direction="down" 
              in={searchInputOpen} 
              mountOnEnter 
              unmountOnExit
              timeout={400}
              easing={{
                enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
                exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Box 
                sx={{ 
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1001, // Cao hơn header
                  backgroundColor: 'white',
                  pt: 1,
                  pb: 1,
                  px: 0,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm thiết bị..."
                  value={searchInputValue}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchInputSubmit()}
                  autoFocus={searchInputOpen}
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      height: '40px',
                      '& fieldset': {
                        borderColor: 'primary.main',
                        transition: 'border-color 0.3s ease',
                        borderRadius: '16px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.dark',
                        borderRadius: '16px',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: '2px',
                        borderRadius: '16px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      transition: 'all 0.3s ease',
                      padding: '8px 16px',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={handleSearchInputClose}
                          sx={{ 
                            color: 'text.secondary',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              color: 'error.main',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Slide>

            {/* Header Content */}
            <Box
              sx={{
                position: 'fixed',
                top: searchInputOpen ? '80px' : 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: 'white',
                borderBottom: '1px solid',
                borderColor: 'divider',
                pt: 2,
                pb: 2,
                px: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'top 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  Quản Lý Thiết Bị
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <AutoSyncStatusIcon />
                  <IconButton
                    size="small"
                    onClick={handleSearchIconClick}
                    sx={{ 
                      color: 'primary.main',
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      width: 36,
                      height: 36,
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
                    }}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              {/* Filter Buttons */}
              <Box display="flex" gap={0.5} mt={1}>
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
                <Chip
                  label="Vị trí"
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenFilterDialog('location')}
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

        {/* Desktop Filter Bar */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
            <TextField
              placeholder="Tìm kiếm thiết bị..."
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
                  fontWeight: 500,
                }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="suDung">Đang sử dụng</MenuItem>
                <MenuItem value="hongHoc">Hỏng hóc</MenuItem>
                <MenuItem value="baoTri">Bảo trì</MenuItem>
                <MenuItem value="ngungSuDung">Ngừng sử dụng</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Loại thiết bị</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Loại thiết bị"
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
                    {type}
                  </MenuItem>
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
                  fontWeight: 500,
                }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {getUniqueLocations().map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
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
              Thêm Thiết Bị
            </Button>
          </Box>
        )}

        {/* Content */}
        {isMobile ? (
          <MobileCardView
            data={filteredList}
            type="thietBi"
            onView={handleViewDetail}
            onQrCode={handleQRCode}
          />
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Tên thiết bị</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Loại</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Số lượng</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Tình trạng</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Vị trí</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Mã QR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredList.map((thietBi, index) => (
                  <TableRow
                    key={`${thietBi.id}-${index}`}
                    onClick={() => handleViewDetail(thietBi)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {thietBi.ten}
                      </Typography>
                    </TableCell>
                    <TableCell>{thietBi.loai}</TableCell>
                    <TableCell>{thietBi.soLuong}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(thietBi.tinhTrang)}
                        size="small"
                        color={getStatusColor(thietBi.tinhTrang) as any}
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>{thietBi.viTri}</TableCell>
                    <TableCell>
                      <Tooltip title="Xem mã QR">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQRCode(thietBi);
                          }}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            },
                          }}
                        >
                          <QrCodeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Initialize Sample Data Button - Chỉ hiển thị trên desktop */}
        {!isMobile && thietBiList.length === 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Chưa có dữ liệu thiết bị. Hãy thêm thiết bị mới hoặc khởi tạo dữ liệu mẫu.
            </Typography>
            <Button
              variant="outlined"
              onClick={forceInitializeSampleEquipment}
              sx={{ mr: 2 }}
            >
              Khởi Tạo Dữ Liệu Mẫu
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
            >
              Thêm Thiết Bị Mới
            </Button>
          </Box>
        )}

        {/* Click to view detail tip - Chỉ hiển thị trên desktop */}
        {!isMobile && thietBiList.length > 0 && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              💡 Click vào hàng để xem chi tiết thiết bị
            </Typography>
          </Box>
        )}
      </Box>

      {/* Floating Action Button for Mobile - Render ở cấp độ cao nhất */}
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

      {/* Mobile Filter Dialog - Render ở cấp độ cao nhất */}
      <MobileFilterDialog
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
        title={getCurrentFilterTitle()}
        options={getCurrentFilterOptions()}
        selectedValue={getCurrentFilterValue()}
        onSelect={handleFilterSelect}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        open={qrModalOpen}
        onClose={handleCloseQRModal}
        thietBi={selectedThietBi}
      />
    </>
  );
};

export default ThietBiManagement; 