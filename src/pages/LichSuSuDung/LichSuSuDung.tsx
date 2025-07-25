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
import { Add as AddIcon, Edit as EditIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { lichSuSuDungService, thietBiService, coSoVatChatService } from '../../services/localStorage';
import { LichSuSuDung, ThietBi, CoSoVatChat } from '../../types';

const LichSuSuDungPage: React.FC = () => {
  const [lichSuList, setLichSuList] = useState<LichSuSuDung[]>([]);
  const [thietBiList, setThietBiList] = useState<ThietBi[]>([]);
  const [coSoVatChatList, setCoSoVatChatList] = useState<CoSoVatChat[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLichSu, setEditingLichSu] = useState<LichSuSuDung | null>(null);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const lichSuData = lichSuSuDungService.getAll();
    const thietBiData = thietBiService.getAll();
    const coSoVatChatData = coSoVatChatService.getAll();
    
    setLichSuList(lichSuData);
    setThietBiList(thietBiData);
    setCoSoVatChatList(coSoVatChatData);
  };

  const handleOpenDialog = (lichSu?: LichSuSuDung) => {
    if (lichSu) {
      setEditingLichSu(lichSu);
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
    } else {
      setEditingLichSu(null);
      setFormData({
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
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLichSu(null);
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      ngayMuon: new Date(formData.ngayMuon).toISOString(),
      ngayTra: formData.ngayTra ? new Date(formData.ngayTra).toISOString() : undefined
    };

    if (editingLichSu) {
      lichSuSuDungService.update(editingLichSu.id, submitData);
    } else {
      lichSuSuDungService.add(submitData);
    }
    loadData();
    handleCloseDialog();
  };

  const handleTraThietBi = (lichSu: LichSuSuDung) => {
    const updatedData = {
      ...lichSu,
      ngayTra: new Date().toISOString(),
      trangThai: 'daTra' as const
    };
    lichSuSuDungService.update(lichSu.id, updatedData);
    loadData();
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
    const statusMap: Record<string, string> = {
      dangMuon: 'Đang mượn',
      daTra: 'Đã trả',
      quaHan: 'Quá hạn'
    };
    return statusMap[status] || status;
  };

  const getVaiTroText = (vaiTro: string) => {
    const vaiTroMap: Record<string, string> = {
      hocSinh: 'Học sinh',
      giaoVien: 'Giáo viên',
      nhanVien: 'Nhân viên'
    };
    return vaiTroMap[vaiTro] || vaiTro;
  };

  const getThietBiName = (id: string) => {
    const thietBi = thietBiList.find(tb => tb.id === id);
    return thietBi ? thietBi.ten : 'Không xác định';
  };

  const getCoSoVatChatName = (id: string) => {
    const coSoVatChat = coSoVatChatList.find(csvc => csvc.id === id);
    return coSoVatChat ? coSoVatChat.ten : 'Không xác định';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lịch Sử Sử Dụng</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm Lịch Sử
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người mượn</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Thiết bị/Cơ sở</TableCell>
              <TableCell>Ngày mượn</TableCell>
              <TableCell>Ngày trả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Lý do</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lichSuList.map((lichSu) => (
              <TableRow key={lichSu.id}>
                <TableCell>{lichSu.nguoiMuon}</TableCell>
                <TableCell>{getVaiTroText(lichSu.vaiTro)}</TableCell>
                <TableCell>
                  {lichSu.thietBiId ? getThietBiName(lichSu.thietBiId) : getCoSoVatChatName(lichSu.coSoVatChatId || '')}
                </TableCell>
                <TableCell>{new Date(lichSu.ngayMuon).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>
                  {lichSu.ngayTra ? new Date(lichSu.ngayTra).toLocaleDateString('vi-VN') : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(lichSu.trangThai)}
                    color={getStatusColor(lichSu.trangThai) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{lichSu.lyDo}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(lichSu)}>
                    <EditIcon />
                  </IconButton>
                  {lichSu.trangThai === 'dangMuon' && (
                    <IconButton 
                      onClick={() => handleTraThietBi(lichSu)}
                      color="success"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLichSu ? 'Chỉnh Sửa Lịch Sử' : 'Thêm Lịch Sử Mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Người mượn"
              value={formData.nguoiMuon}
              onChange={(e) => setFormData({ ...formData, nguoiMuon: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={formData.vaiTro}
                onChange={(e) => setFormData({ ...formData, vaiTro: e.target.value as 'hocSinh' | 'giaoVien' | 'nhanVien' })}
                label="Vai trò"
              >
                <MenuItem value="hocSinh">Học sinh</MenuItem>
                <MenuItem value="giaoVien">Giáo viên</MenuItem>
                <MenuItem value="nhanVien">Nhân viên</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
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
            <FormControl fullWidth margin="normal">
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
            <TextField
              fullWidth
              label="Ngày mượn"
              type="date"
              value={formData.ngayMuon}
              onChange={(e) => setFormData({ ...formData, ngayMuon: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Ngày trả"
              type="date"
              value={formData.ngayTra}
              onChange={(e) => setFormData({ ...formData, ngayTra: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.trangThai}
                onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as 'dangMuon' | 'daTra' | 'quaHan' })}
                label="Trạng thái"
              >
                <MenuItem value="dangMuon">Đang mượn</MenuItem>
                <MenuItem value="daTra">Đã trả</MenuItem>
                <MenuItem value="quaHan">Quá hạn</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Lý do"
              value={formData.lyDo}
              onChange={(e) => setFormData({ ...formData, lyDo: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Ghi chú"
              multiline
              rows={3}
              value={formData.ghiChu}
              onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingLichSu ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LichSuSuDungPage; 