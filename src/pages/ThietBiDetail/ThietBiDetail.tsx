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
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { thietBiService } from '../../services/localStorage';
import { ThietBi } from '../../types';

const ThietBiDetail: React.FC = () => {
  const navigate = useNavigate();
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
    isViewMode
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
  }>({
    ten: '',
    loai: '',
    soLuong: 1,
    tinhTrang: 'suDung',
    moTa: '',
    viTri: '',
    nhaCungCap: '',
    giaTri: 0
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
          giaTri: thietBi.giaTri || 0
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thiết bị:', error);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode && id && id !== 'new') {
      loadThietBiData();
    }
  }, [id, isEditMode, pathname, loadThietBiData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.ten.trim()) {
      newErrors.ten = 'Tên thiết bị là bắt buộc';
    }

    if (!formData.loai.trim()) {
      newErrors.loai = 'Loại thiết bị là bắt buộc';
    }

    if (formData.soLuong <= 0) {
      newErrors.soLuong = 'Số lượng phải lớn hơn 0';
    }

    if (!formData.viTri.trim()) {
      newErrors.viTri = 'Vị trí là bắt buộc';
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
    setSuccessMessage('');

    try {
      const thietBiData: Partial<ThietBi> = {
        ...formData,
        ngayCapNhat: new Date().toISOString()
      };

      if (isAddMode) {
        // Thêm thiết bị mới
        thietBiService.add(thietBiData as Omit<ThietBi, 'id'>);
        setSuccessMessage('Thêm thiết bị mới thành công!');
      } else if (isEditMode && id) {
        // Cập nhật thiết bị
        thietBiService.update(id, thietBiData);
        setSuccessMessage('Cập nhật thiết bị thành công!');
      }

      // Chuyển về trang danh sách sau 2 giây
      setTimeout(() => {
        navigate('/thiet-bi');
      }, 2000);

    } catch (error) {
      console.error('Lỗi khi lưu thiết bị:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu thiết bị' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Box sx={{ p: 3 }} key={pathname}>
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {isViewMode ? 'Xem Chi Tiết Thiết Bị' : (isAddMode ? 'Thêm Thiết Bị Mới' : 'Chỉnh Sửa Thiết Bị')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isViewMode ? 'Xem thông tin chi tiết thiết bị' : (isAddMode ? 'Thêm thiết bị mới vào hệ thống' : 'Cập nhật thông tin thiết bị hiện có')}
        </Typography>
      </Box>

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

      {/* Form */}
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
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/thiet-bi')}
          disabled={isLoading}
        >
          {isViewMode ? 'Quay lại' : 'Hủy'}
        </Button>
        {!isViewMode && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={24} /> : null}
          >
            {isLoading ? 'Đang lưu...' : (isAddMode ? 'Thêm thiết bị' : 'Cập nhật')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ThietBiDetail; 