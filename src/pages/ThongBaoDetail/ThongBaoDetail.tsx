import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery,
  Portal,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { thongBaoService } from '../../services/localStorage';
import { ThongBao } from '../../types';

const ThongBaoDetail: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
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

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      loadThongBaoData();
    }
  }, [id, isEditMode]);

  const loadThongBaoData = () => {
    if (!id) return;
    
    const thongBao = thongBaoService.getById(id);
    if (thongBao) {
      setFormData({
        tieuDe: thongBao.tieuDe,
        noiDung: thongBao.noiDung,
        loai: thongBao.loai,
        doUuTien: thongBao.doUuTien,
        ngayHetHan: thongBao.ngayHetHan ? thongBao.ngayHetHan.split('T')[0] : '',
        nguoiNhan: thongBao.nguoiNhan || [],
        trangThai: thongBao.trangThai
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.tieuDe.trim()) {
      newErrors.tieuDe = 'Tiêu đề không được để trống';
    }

    if (!formData.noiDung.trim()) {
      newErrors.noiDung = 'Nội dung không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const submitData = {
        ...formData,
        ngayHetHan: formData.ngayHetHan ? new Date(formData.ngayHetHan).toISOString() : undefined
      };

      if (isEditMode && id) {
        thongBaoService.update(id, submitData);
      } else {
        thongBaoService.add({
          ...submitData,
          ngayTao: now
        });
      }

      navigate('/thong-bao');
    } catch (error) {
      console.error('Lỗi khi lưu thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/thong-bao');
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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'baoTri': return 'Bảo trì';
      case 'thayThe': return 'Thay thế';
      case 'caiTien': return 'Cải tiến';
      case 'thongBaoChung': return 'Thông báo chung';
      default: return type;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'chuaDoc': return 'Chưa đọc';
      case 'daDoc': return 'Đã đọc';
      case 'daXuLy': return 'Đã xử lý';
      default: return status;
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 1, md: 3 }, 
      pb: { xs: 1, md: 3 }, 
      mt: { xs: 6, md: 0 },
      minHeight: { xs: 'auto', md: 'auto' },
      height: { xs: 'auto', md: 'auto' }
    }}>
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
              pt: 1,
              pb: 1,
              px: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={handleCancel}
                  sx={{ mr: 1, width: 36, height: 36 }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  {isEditMode ? 'Chỉnh Sửa Thông Báo' : 'Thêm Thông Báo Mới'}
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <IconButton
                  onClick={handleCancel}
                  sx={{ width: 32, height: 32, fontSize: '0.9rem' }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    fontSize: '1rem',
                    color: 'primary.main'
                  }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Portal>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {isEditMode ? 'Chỉnh Sửa Thông Báo' : 'Thêm Thông Báo Mới'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isEditMode ? 'Cập nhật thông tin thông báo' : 'Tạo thông báo mới cho hệ thống'}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {isEditMode ? 'Cập nhật' : 'Lưu'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Form Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontSize: '1.2rem', lineHeight: 1.3, mb: 1.5, fontWeight: 600 }}>
                Thông Tin Cơ Bản
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề thông báo"
                    value={formData.tieuDe}
                    onChange={(e) => setFormData({ ...formData, tieuDe: e.target.value })}
                    error={!!errors.tieuDe}
                    helperText={errors.tieuDe}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nội dung thông báo"
                    multiline
                    rows={6}
                    value={formData.noiDung}
                    onChange={(e) => setFormData({ ...formData, noiDung: e.target.value })}
                    error={!!errors.noiDung}
                    helperText={errors.noiDung}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontSize: '1.2rem', lineHeight: 1.3, mb: 1.5, fontWeight: 600 }}>
                Cài Đặt Thông Báo
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Loại thông báo</InputLabel>
                    <Select
                      value={formData.loai}
                      onChange={(e) => setFormData({ ...formData, loai: e.target.value as any })}
                      label="Loại thông báo"
                      sx={{
                        borderRadius: 1.5,
                      }}
                    >
                      <MenuItem value="thongBaoChung">
                        <Box display="flex" alignItems="center" gap={1}>
                          <NotificationsIcon color="primary" />
                          Thông báo chung
                        </Box>
                      </MenuItem>
                      <MenuItem value="baoTri">
                        <Box display="flex" alignItems="center" gap={1}>
                          <WarningIcon color="warning" />
                          Bảo trì
                        </Box>
                      </MenuItem>
                      <MenuItem value="thayThe">
                        <Box display="flex" alignItems="center" gap={1}>
                          <ErrorIcon color="error" />
                          Thay thế
                        </Box>
                      </MenuItem>
                      <MenuItem value="caiTien">
                        <Box display="flex" alignItems="center" gap={1}>
                          <InfoIcon color="info" />
                          Cải tiến
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Độ ưu tiên</InputLabel>
                    <Select
                      value={formData.doUuTien}
                      onChange={(e) => setFormData({ ...formData, doUuTien: e.target.value as any })}
                      label="Độ ưu tiên"
                      sx={{
                        borderRadius: 1.5,
                      }}
                    >
                      <MenuItem value="thap">
                        <Chip label="Thấp" size="small" color="default" />
                      </MenuItem>
                      <MenuItem value="trungBinh">
                        <Chip label="Trung bình" size="small" color="primary" />
                      </MenuItem>
                      <MenuItem value="cao">
                        <Chip label="Cao" size="small" color="warning" />
                      </MenuItem>
                      <MenuItem value="khẩnCấp">
                        <Chip label="Khẩn cấp" size="small" color="error" />
                      </MenuItem>
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
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={formData.trangThai}
                      onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as any })}
                      label="Trạng thái"
                      sx={{
                        borderRadius: 1.5,
                      }}
                    >
                      <MenuItem value="chuaDoc">
                        <Chip label="Chưa đọc" size="small" color="warning" />
                      </MenuItem>
                      <MenuItem value="daDoc">
                        <Chip label="Đã đọc" size="small" color="success" />
                      </MenuItem>
                      <MenuItem value="daXuLy">
                        <Chip label="Đã xử lý" size="small" color="info" />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontSize: '1.2rem', lineHeight: 1.3, mb: 1.5, fontWeight: 600 }}>
                Thông Tin Hiện Tại
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                  Loại thông báo:
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {getTypeIcon(formData.loai)}
                  <Typography variant="body1" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {getTypeText(formData.loai)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                  Độ ưu tiên:
                </Typography>
                <Chip 
                  label={getPriorityText(formData.doUuTien)} 
                  size="small" 
                  color={formData.doUuTien === 'thap' ? 'default' : 
                         formData.doUuTien === 'trungBinh' ? 'primary' :
                         formData.doUuTien === 'cao' ? 'warning' : 'error'}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                  Trạng thái:
                </Typography>
                <Chip 
                  label={getStatusText(formData.trangThai)} 
                  size="small" 
                  color={formData.trangThai === 'chuaDoc' ? 'warning' : 
                         formData.trangThai === 'daDoc' ? 'success' : 'info'}
                />
              </Box>
              
              {formData.ngayHetHan && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                    Ngày hết hạn:
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {new Date(formData.ngayHetHan).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThongBaoDetail; 