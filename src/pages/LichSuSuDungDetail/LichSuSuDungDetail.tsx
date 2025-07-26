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
import { lichSuSuDungService, thietBiService, coSoVatChatService } from '../../services/localStorage';
import { LichSuSuDung } from '../../types';

const LichSuSuDungDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isViewMode = window.location.pathname.includes('/view');
  const isEditMode = window.location.pathname.includes('/edit');
  const isNewMode = window.location.pathname.includes('/new');

  const [thietBiList, setThietBiList] = useState<any[]>([]);
  const [coSoVatChatList, setCoSoVatChatList] = useState<any[]>([]);

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
    if (id && !isNewMode) {
      loadLichSuData();
    }
  }, [id, isNewMode]);

  const loadData = () => {
    const thietBiData = thietBiService.getAll();
    const coSoVatChatData = coSoVatChatService.getAll();
    setThietBiList(thietBiData);
    setCoSoVatChatList(coSoVatChatData);
  };

  const loadLichSuData = () => {
    if (id) {
      const lichSu = lichSuSuDungService.getById(id);
      if (lichSu) {
        setFormData({
          thietBiId: lichSu.thietBiId || '',
          coSoVatChatId: lichSu.coSoVatChatId || '',
          nguoiMuon: lichSu.nguoiMuon,
          vaiTro: lichSu.vaiTro,
          ngayMuon: lichSu.ngayMuon.split('T')[0],
          ngayTra: lichSu.ngayTra ? lichSu.ngayTra.split('T')[0] : '',
          trangThai: lichSu.trangThai,
          lyDo: lichSu.lyDo,
          ghiChu: lichSu.ghiChu || ''
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nguoiMuon.trim()) {
      newErrors.nguoiMuon = 'Người mượn là bắt buộc';
    }

    if (!formData.lyDo.trim()) {
      newErrors.lyDo = 'Lý do là bắt buộc';
    }

    if (!formData.thietBiId && !formData.coSoVatChatId) {
      newErrors.thietBiId = 'Phải chọn thiết bị hoặc cơ sở vật chất';
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
      const submitData = {
        ...formData,
        ngayMuon: new Date(formData.ngayMuon).toISOString(),
        ngayTra: formData.ngayTra ? new Date(formData.ngayTra).toISOString() : undefined
      };

      if (isNewMode) {
        await lichSuSuDungService.add(submitData);
      } else if (id) {
        await lichSuSuDungService.update(id, submitData);
      }

      setTimeout(() => {
        navigate('/lich-su-su-dung');
      }, 1500);
    } catch (error) {
      console.error('Lỗi khi lưu lịch sử sử dụng:', error);
    }
  };

  const handleDelete = () => {
    if (id && window.confirm('Bạn có chắc muốn xóa lịch sử này?')) {
      lichSuSuDungService.delete(id);
      navigate('/lich-su-su-dung');
    }
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

  const handleBack = () => {
    navigate('/lich-su-su-dung');
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/lich-su-su-dung/${id}/edit`);
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
                  {isNewMode ? 'Thêm Lịch Sử Sử Dụng' : 
                   isEditMode ? 'Chỉnh Sửa Lịch Sử' : 
                   'Chi Tiết Lịch Sử Sử Dụng'}
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
                {isNewMode ? 'Thêm Lịch Sử Sử Dụng Mới' : 
                 isEditMode ? 'Chỉnh Sửa Lịch Sử Sử Dụng' : 
                 'Chi Tiết Lịch Sử Sử Dụng'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isNewMode ? 'Thêm lịch sử mượn trả mới vào hệ thống' :
                 isEditMode ? 'Cập nhật thông tin lịch sử sử dụng' :
                 'Xem chi tiết thông tin lịch sử sử dụng'}
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
                label="Người mượn"
                value={formData.nguoiMuon}
                onChange={(e) => setFormData({ ...formData, nguoiMuon: e.target.value })}
                error={!!errors.nguoiMuon}
                helperText={errors.nguoiMuon}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={formData.vaiTro}
                  onChange={(e) => setFormData({ ...formData, vaiTro: e.target.value as any })}
                  label="Vai trò"
                >
                  <MenuItem value="hocSinh">Học sinh</MenuItem>
                  <MenuItem value="giaoVien">Giáo viên</MenuItem>
                  <MenuItem value="nhanVien">Nhân viên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Thiết bị</InputLabel>
                <Select
                  value={formData.thietBiId}
                  onChange={(e) => setFormData({ ...formData, thietBiId: e.target.value, coSoVatChatId: '' })}
                  label="Thiết bị"
                >
                  <MenuItem value="">Không chọn</MenuItem>
                  {thietBiList.map((thietBi) => (
                    <MenuItem key={thietBi.id} value={thietBi.id}>
                      {thietBi.ten}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cơ sở vật chất</InputLabel>
                <Select
                  value={formData.coSoVatChatId}
                  onChange={(e) => setFormData({ ...formData, coSoVatChatId: e.target.value, thietBiId: '' })}
                  label="Cơ sở vật chất"
                >
                  <MenuItem value="">Không chọn</MenuItem>
                  {coSoVatChatList.map((coSoVatChat) => (
                    <MenuItem key={coSoVatChat.id} value={coSoVatChat.id}>
                      {coSoVatChat.ten}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày mượn"
                type="date"
                value={formData.ngayMuon}
                onChange={(e) => setFormData({ ...formData, ngayMuon: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày trả"
                type="date"
                value={formData.ngayTra}
                onChange={(e) => setFormData({ ...formData, ngayTra: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.trangThai}
                  onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as any })}
                  label="Trạng thái"
                >
                  <MenuItem value="dangMuon">Đang mượn</MenuItem>
                  <MenuItem value="daTra">Đã trả</MenuItem>
                  <MenuItem value="quaHan">Quá hạn</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lý do"
                value={formData.lyDo}
                onChange={(e) => setFormData({ ...formData, lyDo: e.target.value })}
                error={!!errors.lyDo}
                helperText={errors.lyDo}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={4}
                value={formData.ghiChu}
                onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
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
                  Thông Tin Người Mượn
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Người mượn:</Typography>
                  <Typography variant="body1" fontWeight={500}>{formData.nguoiMuon}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Vai trò:</Typography>
                  <Typography variant="body1">{getVaiTroText(formData.vaiTro)}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                  <Chip
                    label={getStatusText(formData.trangThai)}
                    color={getStatusColor(formData.trangThai) as any}
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
                  Thông Tin Mượn Trả
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Thiết bị/Cơ sở:</Typography>
                  <Typography variant="body1">
                    {formData.thietBiId ? getThietBiName(formData.thietBiId) :
                     formData.coSoVatChatId ? getCoSoVatChatName(formData.coSoVatChatId) : '-'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Ngày mượn:</Typography>
                  <Typography variant="body1">{new Date(formData.ngayMuon).toLocaleDateString('vi-VN')}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Ngày trả:</Typography>
                  <Typography variant="body1">
                    {formData.ngayTra ? new Date(formData.ngayTra).toLocaleDateString('vi-VN') : '-'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Lý do:</Typography>
                  <Typography variant="body1">{formData.lyDo}</Typography>
                </Box>
                {formData.ghiChu && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Ghi chú:</Typography>
                    <Typography variant="body1">{formData.ghiChu}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default LichSuSuDungDetail; 