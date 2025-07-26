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
  Chip,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  Portal,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { coSoVatChatService } from '../../services/localStorage';
import { CoSoVatChat } from '../../types';

const CoSoVatChatDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isViewMode = window.location.pathname.includes('/view');
  const isEditMode = window.location.pathname.includes('/edit');
  const isNewMode = window.location.pathname.includes('/new');

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id && !isNewMode) {
      loadCoSoVatChatData();
    }
  }, [id, isNewMode]);

  const loadCoSoVatChatData = () => {
    if (id) {
      const coSoVatChat = coSoVatChatService.getById(id);
      if (coSoVatChat) {
        setFormData({
          ten: coSoVatChat.ten,
          loai: coSoVatChat.loai,
          sucChua: coSoVatChat.sucChua || 0,
          tinhTrang: coSoVatChat.tinhTrang,
          moTa: coSoVatChat.moTa || '',
          viTri: coSoVatChat.viTri,
          thietBiIds: coSoVatChat.thietBiIds || []
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.ten.trim()) {
      newErrors.ten = 'Tên cơ sở vật chất là bắt buộc';
    }

    if (!formData.viTri.trim()) {
      newErrors.viTri = 'Vị trí là bắt buộc';
    }

    if (formData.sucChua < 0) {
      newErrors.sucChua = 'Sức chứa không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const now = new Date().toISOString();
      
      if (isNewMode) {
        const newData = {
          ...formData,
          ngayTao: now,
          ngayCapNhat: now
        };
        await coSoVatChatService.add(newData);
      } else if (id) {
        const updateData = {
          ...formData,
          ngayCapNhat: now
        };
        await coSoVatChatService.update(id, updateData);
      }

      setTimeout(() => {
        navigate('/co-so-vat-chat');
      }, 1500);
    } catch (error) {
      console.error('Lỗi khi lưu cơ sở vật chất:', error);
    }
  };

  const handleDelete = () => {
    if (id && window.confirm('Bạn có chắc muốn xóa cơ sở vật chất này?')) {
      coSoVatChatService.delete(id);
      navigate('/co-so-vat-chat');
    }
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

  const handleBack = () => {
    navigate('/co-so-vat-chat');
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/co-so-vat-chat/${id}/edit`);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: '120px', md: 3 } }}>
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
              pt: 0.5,
              pb: 0.5,
              px: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <IconButton
                  size="small"
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  {isNewMode ? 'Thêm Cơ Sở Vật Chất' : 
                   isEditMode ? 'Chỉnh Sửa Cơ Sở Vật Chất' : 
                   'Chi Tiết Cơ Sở Vật Chất'}
                </Typography>
              </Box>
              {!isNewMode && !isEditMode && (
                <Box display="flex" gap={0.5}>
                  <IconButton
                    size="small"
                    onClick={handleEdit}
                    sx={{
                      color: theme.palette.primary.main,
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{
                      color: theme.palette.error.main,
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.2)' }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </Portal>
      )}

      {/* Spacer for mobile header */}
      {isMobile && <Box sx={{ height: '60px' }} />}

      {/* Desktop Header */}
      {!isMobile && (
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {isNewMode ? 'Thêm Cơ Sở Vật Chất Mới' : 
                 isEditMode ? 'Chỉnh Sửa Cơ Sở Vật Chất' : 
                 'Chi Tiết Cơ Sở Vật Chất'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isNewMode ? 'Thêm cơ sở vật chất mới vào hệ thống' :
                 isEditMode ? 'Cập nhật thông tin cơ sở vật chất' :
                 'Xem chi tiết thông tin cơ sở vật chất'}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
              >
                Quay lại
              </Button>
              {!isNewMode && !isEditMode && (
                <>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                  >
                    Xóa
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Form or View Content */}
      {!isViewMode ? (
        /* Form Mode */
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên cơ sở vật chất"
                value={formData.ten}
                onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                error={!!errors.ten}
                helperText={errors.ten}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Loại</InputLabel>
                <Select
                  value={formData.loai}
                  onChange={(e) => setFormData({ ...formData, loai: e.target.value as any })}
                  label="Loại"
                >
                  <MenuItem value="phongHoc">Phòng học</MenuItem>
                  <MenuItem value="phongThiNghiem">Phòng thí nghiệm</MenuItem>
                  <MenuItem value="sanBai">Sân bãi</MenuItem>
                  <MenuItem value="thuVien">Thư viện</MenuItem>
                  <MenuItem value="vanPhong">Văn phòng</MenuItem>
                  <MenuItem value="khac">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sức chứa"
                type="number"
                value={formData.sucChua}
                onChange={(e) => setFormData({ ...formData, sucChua: parseInt(e.target.value) || 0 })}
                error={!!errors.sucChua}
                helperText={errors.sucChua}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tình trạng</InputLabel>
                <Select
                  value={formData.tinhTrang}
                  onChange={(e) => setFormData({ ...formData, tinhTrang: e.target.value as any })}
                  label="Tình trạng"
                >
                  <MenuItem value="hoatDong">Hoạt động</MenuItem>
                  <MenuItem value="baoTri">Bảo trì</MenuItem>
                  <MenuItem value="ngungSuDung">Ngừng sử dụng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vị trí"
                value={formData.viTri}
                onChange={(e) => setFormData({ ...formData, viTri: e.target.value })}
                error={!!errors.viTri}
                helperText={errors.viTri}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={4}
                value={formData.moTa}
                onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleBack}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
            >
              {isNewMode ? 'Thêm' : 'Cập nhật'}
            </Button>
          </Box>
        </Box>
      ) : (
        /* View Mode */
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông Tin Cơ Bản
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Tên:</Typography>
                  <Typography variant="body1" fontWeight={500}>{formData.ten}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Loại:</Typography>
                  <Typography variant="body1">{getLoaiText(formData.loai)}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Sức chứa:</Typography>
                  <Typography variant="body1">{formData.sucChua || 'Không xác định'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Tình trạng:</Typography>
                  <Chip
                    label={getStatusText(formData.tinhTrang)}
                    color={getStatusColor(formData.tinhTrang) as any}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông Tin Bổ Sung
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Vị trí:</Typography>
                  <Typography variant="body1">{formData.viTri}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Mô tả:</Typography>
                  <Typography variant="body1">{formData.moTa || 'Không có mô tả'}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CoSoVatChatDetail; 