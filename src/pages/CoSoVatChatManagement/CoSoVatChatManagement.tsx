import React, { useState, useEffect } from 'react';
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
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { coSoVatChatService } from '../../services/localStorage';
import { CoSoVatChat } from '../../types';

const CoSoVatChatManagement: React.FC = () => {
  const [coSoVatChatList, setCoSoVatChatList] = useState<CoSoVatChat[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCoSoVatChat, setEditingCoSoVatChat] = useState<CoSoVatChat | null>(null);
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
  };

  const handleOpenDialog = (coSoVatChat?: CoSoVatChat) => {
    if (coSoVatChat) {
      setEditingCoSoVatChat(coSoVatChat);
      setFormData({
        ten: coSoVatChat.ten,
        loai: coSoVatChat.loai,
        sucChua: coSoVatChat.sucChua || 0,
        tinhTrang: coSoVatChat.tinhTrang,
        moTa: coSoVatChat.moTa || '',
        viTri: coSoVatChat.viTri,
        thietBiIds: coSoVatChat.thietBiIds
      });
    } else {
      setEditingCoSoVatChat(null);
      setFormData({
        ten: '',
        loai: 'phongHoc',
        sucChua: 0,
        tinhTrang: 'hoatDong',
        moTa: '',
        viTri: '',
        thietBiIds: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCoSoVatChat(null);
  };

  const handleSubmit = () => {
    if (editingCoSoVatChat) {
      coSoVatChatService.update(editingCoSoVatChat.id, formData);
    } else {
      coSoVatChatService.add(formData);
    }
    loadCoSoVatChatList();
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cơ sở vật chất này?')) {
      coSoVatChatService.delete(id);
      loadCoSoVatChatList();
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
    const statusMap: Record<string, string> = {
      hoatDong: 'Hoạt động',
      baoTri: 'Bảo trì',
      ngungSuDung: 'Ngừng sử dụng'
    };
    return statusMap[status] || status;
  };

  const getLoaiText = (loai: string) => {
    const loaiMap: Record<string, string> = {
      phongHoc: 'Phòng học',
      phongThiNghiem: 'Phòng thí nghiệm',
      sanBai: 'Sân bãi',
      thuVien: 'Thư viện',
      vanPhong: 'Văn phòng',
      khac: 'Khác'
    };
    return loaiMap[loai] || loai;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quản Lý Cơ Sở Vật Chất</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm Cơ Sở Vật Chất
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên cơ sở</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Sức chứa</TableCell>
              <TableCell>Tình trạng</TableCell>
              <TableCell>Vị trí</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coSoVatChatList.map((coSoVatChat) => (
              <TableRow key={coSoVatChat.id}>
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
                  <IconButton onClick={() => handleOpenDialog(coSoVatChat)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(coSoVatChat.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCoSoVatChat ? 'Chỉnh Sửa Cơ Sở Vật Chất' : 'Thêm Cơ Sở Vật Chất Mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Tên cơ sở vật chất"
              value={formData.ten}
              onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Loại</InputLabel>
              <Select
                value={formData.loai}
                onChange={(e) => setFormData({ ...formData, loai: e.target.value as 'phongHoc' | 'phongThiNghiem' | 'sanBai' | 'thuVien' | 'vanPhong' | 'khac' })}
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
            <TextField
              fullWidth
              label="Sức chứa"
              type="number"
              value={formData.sucChua}
              onChange={(e) => setFormData({ ...formData, sucChua: parseInt(e.target.value) || 0 })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tình trạng</InputLabel>
              <Select
                value={formData.tinhTrang}
                onChange={(e) => setFormData({ ...formData, tinhTrang: e.target.value as 'hoatDong' | 'baoTri' | 'ngungSuDung' })}
                label="Tình trạng"
              >
                <MenuItem value="hoatDong">Hoạt động</MenuItem>
                <MenuItem value="baoTri">Bảo trì</MenuItem>
                <MenuItem value="ngungSuDung">Ngừng sử dụng</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Vị trí"
              value={formData.viTri}
              onChange={(e) => setFormData({ ...formData, viTri: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={formData.moTa}
              onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCoSoVatChat ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoSoVatChatManagement; 