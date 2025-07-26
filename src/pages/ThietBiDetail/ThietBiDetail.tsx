import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  IconButton,
  Chip,
  Card,
  CardContent,
  Portal
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { thietBiService } from '../../services/localStorage';
import { ThietBi } from '../../types';
import QRCodeModal from '../../components/QRCodeModal/QRCodeModal';

const ThietBiDetail: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams<{ id: string }>();
  const pathname = window.location.pathname;
  const isAddMode = pathname === '/thiet-bi/new';
  const isViewMode = pathname.includes('/view');
  const isEditMode = !isAddMode && !isViewMode;
  
  // Debug logging
  console.log('🔍 Debug ThietBiDetail:', {
    id,
    pathname,
    isAddMode,
    isEditMode,
    isViewMode,
    isMobile
  });
  
  const [formData, setFormData] = useState<{
    ten: string;
    loai: string;
    soLuong: number;
    tinhTrang: 'suDung' | 'hongHoc' | 'baoTri' | 'ngungSuDung';
    moTa: string;
    viTri: string;
    nhaCungCap: string;
    giaTri: number;
    ngayNhap: string;
    ngayCapNhat: string;
  }>({
    ten: '',
    loai: '',
    soLuong: 1,
    tinhTrang: 'suDung',
    moTa: '',
    viTri: '',
    nhaCungCap: '',
    giaTri: 0,
    ngayNhap: '',
    ngayCapNhat: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const loadThietBiData = useCallback(() => {
    try {
      const thietBi = thietBiService.getById(id!);
      if (thietBi) {
        setFormData({
          ten: thietBi.ten,
          loai: thietBi.loai,
          soLuong: thietBi.soLuong,
          tinhTrang: thietBi.tinhTrang,
          moTa: thietBi.moTa || '',
          viTri: thietBi.viTri,
          nhaCungCap: thietBi.nhaCungCap || '',
          giaTri: thietBi.giaTri || 0,
          ngayNhap: thietBi.ngayNhap || '',
          ngayCapNhat: thietBi.ngayCapNhat || ''
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thiết bị:', error);
    }
  }, [id]);

  useEffect(() => {
    if ((isEditMode || isViewMode) && id && id !== 'new') {
      loadThietBiData();
    }
  }, [id, isEditMode, isViewMode, pathname, loadThietBiData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.ten.trim()) {
      newErrors.ten = 'Tên thiết bị là bắt buộc';
    }

    if (!formData.loai.trim()) {
      newErrors.loai = 'Loại thiết bị là bắt buộc';
    }

    if (!formData.viTri.trim()) {
      newErrors.viTri = 'Vị trí là bắt buộc';
    }

    if (formData.soLuong < 1) {
      newErrors.soLuong = 'Số lượng phải lớn hơn 0';
    }

    if (formData.giaTri < 0) {
      newErrors.giaTri = 'Giá trị không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isAddMode) {
        await thietBiService.add({
          ...formData,
          ngayNhap: new Date().toISOString(),
          ngayCapNhat: new Date().toISOString()
        } as Omit<ThietBi, 'id'>);
        setSuccessMessage('Thêm thiết bị thành công!');
      } else if (isEditMode && id) {
        await thietBiService.update(id, {
          ...formData,
          ngayCapNhat: new Date().toISOString()
        });
        setSuccessMessage('Cập nhật thiết bị thành công!');
      }

      setTimeout(() => {
        navigate('/thiet-bi');
      }, 1500);
    } catch (error) {
      console.error('Lỗi khi lưu thiết bị:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu thiết bị' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
    switch (status) {
      case 'suDung': return 'Đang sử dụng';
      case 'hongHoc': return 'Hỏng hóc';
      case 'baoTri': return 'Bảo trì';
      case 'ngungSuDung': return 'Ngừng sử dụng';
      default: return status;
    }
  };

  const handleQRCode = () => {
    setQrModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setQrModalOpen(false);
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/thiet-bi/${id}/edit`);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      try {
        if (id) {
          thietBiService.delete(id);
          navigate('/thiet-bi');
        }
      } catch (error) {
        console.error('Lỗi khi xóa thiết bị:', error);
        setErrors({ submit: 'Có lỗi xảy ra khi xóa thiết bị' });
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 0, md: 3 }, mt: { xs: 12, md: 0 } }} key={pathname}>
      
      {/* Mobile Header - Fixed */}
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
              pt: 1,
              pb: 1,
              px: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {/* Back button và Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton
                onClick={() => navigate('/thiet-bi')}
                size="small"
                sx={{ 
                  mr: 1,
                  width: 36,
                  height: 36,
                  fontSize: 'small'
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  flex: 1
                }}
              >
                Chi Tiết Thiết Bị
              </Typography>
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={handleQRCode}
                  size="small"
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '1rem',
                    color: 'primary.main'
                  }}
                >
                  <QrCodeIcon />
                </IconButton>
                <IconButton
                  onClick={handleEdit}
                  size="small"
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '1rem',
                    color: 'primary.main'
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={handleDelete}
                  size="small"
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '1rem',
                    color: 'error.main'
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Breadcrumbs */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.8rem' }}
            >
              Quản Lý Thiết Bị / Chi Tiết Thiết Bị
            </Typography>
          </Box>
        </Portal>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/thiet-bi');
              }}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ArrowBackIcon sx={{ mr: 1 }} />
              Quản Lý Thiết Bị
            </Link>
            <Typography color="text.primary">
              {isViewMode ? 'Xem Chi Tiết Thiết Bị' : (isAddMode ? 'Thêm Thiết Bị Mới' : 'Chỉnh Sửa Thiết Bị')}
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {isViewMode ? 'Xem Chi Tiết Thiết Bị' : (isAddMode ? 'Thêm Thiết Bị Mới' : 'Chỉnh Sửa Thiết Bị')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {isViewMode ? 'Xem thông tin chi tiết thiết bị' : (isAddMode ? 'Thêm thiết bị mới vào hệ thống' : 'Cập nhật thông tin thiết bị hiện có')}
                </Typography>
              </Box>
              
              {/* Action Buttons cho Desktop View Mode */}
              {isViewMode && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                    onClick={handleQRCode}
                    size="small"
                  >
                    Mã QR
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    size="small"
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    size="small"
                  >
                    Xóa
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* Card Layout - Cho cả Mobile và Desktop View Mode */}
      {isViewMode && (
        <Box>
          {/* Device Title và Status */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1.5, fontSize: isMobile ? '1.2rem' : '1.5rem', lineHeight: 1.3 }}>
              {formData.ten}
            </Typography>
            <Chip 
              label={getStatusText(formData.tinhTrang)} 
              color={getStatusColor(formData.tinhTrang)}
              size="small"
              sx={{ 
                fontSize: isMobile ? '0.75rem' : '0.8rem', 
                height: isMobile ? '24px' : '28px',
                fontWeight: 500,
                '& .MuiChip-label': {
                  px: isMobile ? 1.5 : 2
                }
              }}
            />
          </Box>

          {/* Desktop Layout - 2 cột */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {/* Basic Info Card */}
              <Card sx={{ flex: 1, borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: 'primary.main' }}>
                    Thông Tin Cơ Bản
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Loại thiết bị:</Typography>
                      <Typography variant="body2" fontWeight={500}>{formData.loai}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Số lượng:</Typography>
                      <Typography variant="body2" fontWeight={500}>{formData.soLuong}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Vị trí:</Typography>
                      <Typography variant="body2" fontWeight={500}>{formData.viTri}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Nhà cung cấp:</Typography>
                      <Typography variant="body2" fontWeight={500}>{formData.nhaCungCap || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Additional Info Card */}
              <Card sx={{ flex: 1, borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: 'primary.main' }}>
                    Thông Tin Bổ Sung
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Giá trị:</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formData.giaTri ? `${formData.giaTri.toLocaleString('vi-VN')} VNĐ` : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Ngày nhập:</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formData.ngayNhap ? new Date(formData.ngayNhap).toLocaleDateString('vi-VN') : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Ngày cập nhật cuối:</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formData.ngayCapNhat ? new Date(formData.ngayCapNhat).toLocaleDateString('vi-VN') : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Mobile Layout - 1 cột */}
          {isMobile && (
            <>
              {/* Basic Info Card */}
              <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'primary.main', fontSize: '1rem' }}>
                    Thông Tin Cơ Bản
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Loại thiết bị:</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>{formData.loai}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Số lượng:</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>{formData.soLuong}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Vị trí:</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>{formData.viTri}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Nhà cung cấp:</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>{formData.nhaCungCap || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Additional Info Card */}
              <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'primary.main', fontSize: '1rem' }}>
                    Thông Tin Bổ Sung
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Giá trị:</Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.85rem' }}>
                        {formData.giaTri ? `${formData.giaTri.toLocaleString('vi-VN')} VNĐ` : 'N/A'}
                      </Typography>
                    </Box>
                    {formData.moTa && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Mô tả:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{formData.moTa}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </>
          )}

          {/* Description Card - Cho cả Mobile và Desktop */}
          {formData.moTa && (
            <Card sx={{ mb: 1.5, borderRadius: isMobile ? 1.5 : 2 }}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Typography variant={isMobile ? "subtitle2" : "subtitle1"} fontWeight={600} sx={{ mb: 1, color: 'primary.main', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  Mô Tả
                </Typography>
                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                  {formData.moTa}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Bottom Action Buttons - Cho Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/thiet-bi')}
                sx={{ minWidth: 150 }}
              >
                Quay lại danh sách
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ minWidth: 150 }}
              >
                Chỉnh sửa
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errors.submit && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.submit}
        </Alert>
      )}

      {/* Form - Chỉ hiển thị cho Add/Edit Mode */}
      {!isViewMode && (
        <>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Tên thiết bị *"
              value={formData.ten}
              onChange={(e) => handleInputChange('ten', e.target.value)}
              error={!!errors.ten}
              helperText={errors.ten}
              required
              disabled={isViewMode}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Loại thiết bị *"
              value={formData.loai}
              onChange={(e) => handleInputChange('loai', e.target.value)}
              error={!!errors.loai}
              helperText={errors.loai}
              required
              disabled={isViewMode}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Số lượng *"
              type="number"
              value={formData.soLuong}
              onChange={(e) => handleInputChange('soLuong', parseInt(e.target.value) || 0)}
              error={!!errors.soLuong}
              helperText={errors.soLuong}
              required
              inputProps={{ min: 1 }}
              disabled={isViewMode}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Tình trạng</InputLabel>
              <Select
                value={formData.tinhTrang}
                label="Tình trạng"
                onChange={(e) => handleInputChange('tinhTrang', e.target.value)}
                disabled={isViewMode}
              >
                <MenuItem value="suDung">Đang sử dụng</MenuItem>
                <MenuItem value="hongHoc">Hỏng hóc</MenuItem>
                <MenuItem value="baoTri">Bảo trì</MenuItem>
                <MenuItem value="ngungSuDung">Ngừng sử dụng</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Vị trí *"
              value={formData.viTri}
              onChange={(e) => handleInputChange('viTri', e.target.value)}
              error={!!errors.viTri}
              helperText={errors.viTri}
              required
              disabled={isViewMode}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Nhà cung cấp"
              value={formData.nhaCungCap}
              onChange={(e) => handleInputChange('nhaCungCap', e.target.value)}
              disabled={isViewMode}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Giá trị (VNĐ)"
              type="number"
              value={formData.giaTri}
              onChange={(e) => handleInputChange('giaTri', parseInt(e.target.value) || 0)}
              error={!!errors.giaTri}
              helperText={errors.giaTri}
              inputProps={{ min: 0 }}
              disabled={isViewMode}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={4}
              value={formData.moTa}
              onChange={(e) => handleInputChange('moTa', e.target.value)}
              placeholder="Nhập mô tả chi tiết về thiết bị..."
              disabled={isViewMode}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'flex-end',
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/thiet-bi')}
              disabled={isLoading}
              fullWidth={isMobile}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={24} /> : null}
              fullWidth={isMobile}
            >
              {isLoading ? 'Đang lưu...' : (isAddMode ? 'Thêm thiết bị' : 'Cập nhật')}
            </Button>
          </Box>
        </>
      )}

      {/* QR Code Modal */}
      <QRCodeModal 
        open={qrModalOpen} 
        onClose={handleCloseQRModal} 
        thietBi={{
          id: id || '',
          ten: formData.ten,
          loai: formData.loai,
          soLuong: formData.soLuong,
          tinhTrang: formData.tinhTrang,
          viTri: formData.viTri,
          nhaCungCap: formData.nhaCungCap,
          giaTri: formData.giaTri,
          moTa: formData.moTa,
          ngayNhap: new Date().toISOString(),
          ngayCapNhat: new Date().toISOString()
        }}
      />
    </Box>
  );
};

export default ThietBiDetail; 