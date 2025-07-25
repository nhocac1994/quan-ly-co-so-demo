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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { thongBaoService } from '../../services/localStorage';
import { ThongBao } from '../../types';

const ThongBaoPage: React.FC = () => {
  const [thongBaoList, setThongBaoList] = useState<ThongBao[]>([]);
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

  const loadThongBaoList = () => {
    const data = thongBaoService.getAll();
    setThongBaoList(data);
  };

  const handleOpenDialog = (thongBao?: ThongBao) => {
    if (thongBao) {
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
    } else {
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
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingThongBao(null);
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      ngayHetHan: formData.ngayHetHan ? new Date(formData.ngayHetHan).toISOString() : undefined
    };

    if (editingThongBao) {
      thongBaoService.update(editingThongBao.id, submitData);
    } else {
      thongBaoService.add(submitData);
    }
    loadThongBaoList();
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      thongBaoService.delete(id);
      loadThongBaoList();
    }
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
    const priorityMap: Record<string, string> = {
      thap: 'Thấp',
      trungBinh: 'Trung bình',
      cao: 'Cao',
      khẩnCấp: 'Khẩn cấp'
    };
    return priorityMap[priority] || priority;
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      baoTri: 'Bảo trì',
      thayThe: 'Thay thế',
      caiTien: 'Cải tiến',
      thongBaoChung: 'Thông báo chung'
    };
    return typeMap[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'baoTri':
        return <WarningIcon color="warning" />;
      case 'thayThe':
        return <ErrorIcon color="error" />;
      case 'caiTien':
        return <InfoIcon color="info" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'chuaDoc': return 'warning';
      case 'daDoc': return 'info';
      case 'daXuLy': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      chuaDoc: 'Chưa đọc',
      daDoc: 'Đã đọc',
      daXuLy: 'Đã xử lý'
    };
    return statusMap[status] || status;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quản Lý Thông Báo</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm Thông Báo
        </Button>
      </Box>

      <Paper>
        <List>
          {thongBaoList.length > 0 ? (
            thongBaoList.map((thongBao) => (
              <ListItem
                key={thongBao.id}
                divider
                sx={{
                  backgroundColor: thongBao.trangThai === 'chuaDoc' ? 'rgba(255, 193, 7, 0.1)' : 'inherit'
                }}
              >
                <ListItemIcon>
                  {getTypeIcon(thongBao.loai)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{thongBao.tieuDe}</Typography>
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
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {thongBao.noiDung}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Loại: {getTypeText(thongBao.loai)} | 
                        Tạo: {new Date(thongBao.ngayTao).toLocaleDateString('vi-VN')}
                        {thongBao.ngayHetHan && ` | Hết hạn: ${new Date(thongBao.ngayHetHan).toLocaleDateString('vi-VN')}`}
                      </Typography>
                    </Box>
                  }
                />
                <Box>
                  <IconButton onClick={() => handleOpenDialog(thongBao)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(thongBao.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1" color="text.secondary" align="center">
                    Chưa có thông báo nào
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>

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
            <FormControl fullWidth margin="normal">
              <InputLabel>Loại thông báo</InputLabel>
              <Select
                value={formData.loai}
                onChange={(e) => setFormData({ ...formData, loai: e.target.value as 'baoTri' | 'thayThe' | 'caiTien' | 'thongBaoChung' })}
                label="Loại thông báo"
              >
                <MenuItem value="thongBaoChung">Thông báo chung</MenuItem>
                <MenuItem value="baoTri">Bảo trì</MenuItem>
                <MenuItem value="thayThe">Thay thế</MenuItem>
                <MenuItem value="caiTien">Cải tiến</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Độ ưu tiên</InputLabel>
              <Select
                value={formData.doUuTien}
                onChange={(e) => setFormData({ ...formData, doUuTien: e.target.value as 'thap' | 'trungBinh' | 'cao' | 'khẩnCấp' })}
                label="Độ ưu tiên"
              >
                <MenuItem value="thap">Thấp</MenuItem>
                <MenuItem value="trungBinh">Trung bình</MenuItem>
                <MenuItem value="cao">Cao</MenuItem>
                <MenuItem value="khẩnCấp">Khẩn cấp</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Ngày hết hạn"
              type="date"
              value={formData.ngayHetHan}
              onChange={(e) => setFormData({ ...formData, ngayHetHan: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
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