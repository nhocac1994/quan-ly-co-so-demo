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
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  QrCode as QrCodeIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { thietBiService } from '../../services/localStorage';
import { ThietBi } from '../../types';
import QRCodeModal from '../../components/QRCodeModal/QRCodeModal';
import MobileCardView from '../../components/MobileCardView/MobileCardView';
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
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Khởi tạo dữ liệu mẫu nếu chưa có
    initializeSampleEquipment();
    loadThietBiList();
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

  const handleView = (thietBi: ThietBi) => {
    navigate(`/thiet-bi/${thietBi.id}/view`);
  };

  const handleQRCode = (thietBi: ThietBi) => {
    setSelectedThietBi(thietBi);
    setQrModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setQrModalOpen(false);
    setSelectedThietBi(null);
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
    return ['all', ...Array.from(new Set(types))];
  };

  const getUniqueLocations = () => {
    const locations = thietBiList.map(item => item.viTri);
    return ['all', ...Array.from(new Set(locations))];
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

  return (
    <Box>
      {/* Filter Bar */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="text.secondary">
            💡 Click vào dòng để xem chi tiết thiết bị
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                forceInitializeSampleEquipment();
                loadThietBiList();
              }}
            >
              🔄 Khởi tạo dữ liệu mẫu
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
            >
              Thêm Thiết Bị
            </Button>
          </Box>
        </Box>
        
        {/* Filter Controls */}
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" sx={{ 
          '& > *': { 
            flex: { xs: '1 1 100%', sm: '0 0 auto' },
            minWidth: { xs: '100%', sm: 'auto' }
          }
        }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Tìm kiếm thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tình trạng</InputLabel>
            <Select
              value={statusFilter}
              label="Tình trạng"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="suDung">Đang sử dụng</MenuItem>
              <MenuItem value="hongHoc">Hỏng hóc</MenuItem>
              <MenuItem value="baoTri">Bảo trì</MenuItem>
              <MenuItem value="ngungSuDung">Ngừng sử dụng</MenuItem>
            </Select>
          </FormControl>

          {/* Type Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Loại thiết bị</InputLabel>
            <Select
              value={typeFilter}
              label="Loại thiết bị"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {getUniqueTypes().map((type) => (
                <MenuItem key={type} value={type}>
                  {type === 'all' ? 'Tất cả' : type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Location Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Vị trí</InputLabel>
            <Select
              value={locationFilter}
              label="Vị trí"
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              {getUniqueLocations().map((location) => (
                <MenuItem key={location} value={location}>
                  {location === 'all' ? 'Tất cả' : location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || locationFilter !== 'all') && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              variant="outlined"
            >
              Xóa bộ lọc
            </Button>
          )}
        </Box>

        {/* Results count */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {filteredList.length} / {thietBiList.length} thiết bị
            {filteredList.length !== thietBiList.length && (
              <Chip 
                label={`Đã lọc ${thietBiList.length - filteredList.length} thiết bị`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
      </Box>

      {isMobile ? (
        <MobileCardView
          data={filteredList}
          type="thietBi"
          onView={handleView}
          onQrCode={handleQRCode}
        />
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tên thiết bị</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loại</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Số lượng</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tình trạng</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vị trí</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nhà cung cấp</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Giá trị</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mã QR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredList.map((thietBi) => (
                <TableRow 
                  key={thietBi.id}
                  onClick={() => handleView(thietBi)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      transition: 'background-color 0.2s',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <TableCell>{thietBi.ten}</TableCell>
                  <TableCell>{thietBi.loai}</TableCell>
                  <TableCell>{thietBi.soLuong}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(thietBi.tinhTrang)}
                      color={getStatusColor(thietBi.tinhTrang) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{thietBi.viTri}</TableCell>
                  <TableCell>{thietBi.nhaCungCap || '-'}</TableCell>
                  <TableCell>{thietBi.giaTri ? `${thietBi.giaTri.toLocaleString()} VNĐ` : '-'}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Xem mã QR thiết bị" arrow>
                      <IconButton onClick={() => handleQRCode(thietBi)} color="primary">
                        <QrCodeIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* QR Code Modal */}
      <QRCodeModal
        open={qrModalOpen}
        onClose={handleCloseQRModal}
        thietBi={selectedThietBi}
      />
    </Box>
  );
};

export default ThietBiManagement; 