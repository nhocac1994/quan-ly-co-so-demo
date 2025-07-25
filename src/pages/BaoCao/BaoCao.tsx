import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  thietBiService,
  coSoVatChatService,
  lichSuSuDungService,
  baoTriService
} from '../../services/localStorage';
import { ThietBi, CoSoVatChat, LichSuSuDung, BaoTri } from '../../types';

const BaoCao: React.FC = () => {
  const [thietBiList, setThietBiList] = useState<ThietBi[]>([]);
  const [coSoVatChatList, setCoSoVatChatList] = useState<CoSoVatChat[]>([]);
  const [lichSuList, setLichSuList] = useState<LichSuSuDung[]>([]);
  const [baoTriList, setBaoTriList] = useState<BaoTri[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setThietBiList(thietBiService.getAll());
    setCoSoVatChatList(coSoVatChatService.getAll());
    setLichSuList(lichSuSuDungService.getAll());
    setBaoTriList(baoTriService.getAll());
  };

  // Tính toán thống kê
  const getThietBiStats = () => {
    const total = thietBiList.length;
    const suDung = thietBiList.filter(tb => tb.tinhTrang === 'suDung').length;
    const hongHoc = thietBiList.filter(tb => tb.tinhTrang === 'hongHoc').length;
    const baoTri = thietBiList.filter(tb => tb.tinhTrang === 'baoTri').length;
    const ngungSuDung = thietBiList.filter(tb => tb.tinhTrang === 'ngungSuDung').length;

    return { total, suDung, hongHoc, baoTri, ngungSuDung };
  };

  const getCoSoVatChatStats = () => {
    const total = coSoVatChatList.length;
    const hoatDong = coSoVatChatList.filter(csvc => csvc.tinhTrang === 'hoatDong').length;
    const baoTri = coSoVatChatList.filter(csvc => csvc.tinhTrang === 'baoTri').length;
    const ngungSuDung = coSoVatChatList.filter(csvc => csvc.tinhTrang === 'ngungSuDung').length;

    return { total, hoatDong, baoTri, ngungSuDung };
  };

  const getLichSuStats = () => {
    const total = lichSuList.length;
    const dangMuon = lichSuList.filter(ls => ls.trangThai === 'dangMuon').length;
    const daTra = lichSuList.filter(ls => ls.trangThai === 'daTra').length;
    const quaHan = lichSuList.filter(ls => ls.trangThai === 'quaHan').length;

    return { total, dangMuon, daTra, quaHan };
  };

  const getBaoTriStats = () => {
    const total = baoTriList.length;
    const chuaBatDau = baoTriList.filter(bt => bt.trangThai === 'chuaBatDau').length;
    const dangThucHien = baoTriList.filter(bt => bt.trangThai === 'dangThucHien').length;
    const hoanThanh = baoTriList.filter(bt => bt.trangThai === 'hoanThanh').length;
    const biHuy = baoTriList.filter(bt => bt.trangThai === 'biHuy').length;

    return { total, chuaBatDau, dangThucHien, hoanThanh, biHuy };
  };

  const thietBiStats = getThietBiStats();
  const coSoVatChatStats = getCoSoVatChatStats();
  const lichSuStats = getLichSuStats();
  const baoTriStats = getBaoTriStats();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Báo Cáo Tổng Hợp
      </Typography>

      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống Kê Thiết Bị
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary">
                    {thietBiStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng thiết bị
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="success.main">
                    {thietBiStats.suDung}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang sử dụng
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="error.main">
                    {thietBiStats.hongHoc}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hỏng hóc
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="warning.main">
                    {thietBiStats.baoTri}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bảo trì
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống Kê Cơ Sở Vật Chất
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary">
                    {coSoVatChatStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng cơ sở
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="success.main">
                    {coSoVatChatStats.hoatDong}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hoạt động
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="warning.main">
                    {coSoVatChatStats.baoTri}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bảo trì
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="error.main">
                    {coSoVatChatStats.ngungSuDung}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ngừng sử dụng
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống Kê Lịch Sử Sử Dụng
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary">
                    {lichSuStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng lượt mượn
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="warning.main">
                    {lichSuStats.dangMuon}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang mượn
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="success.main">
                    {lichSuStats.daTra}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã trả
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="error.main">
                    {lichSuStats.quaHan}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quá hạn
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống Kê Bảo Trì
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary">
                    {baoTriStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng hoạt động
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="warning.main">
                    {baoTriStats.dangThucHien}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang thực hiện
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="success.main">
                    {baoTriStats.hoanThanh}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hoàn thành
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="error.main">
                    {baoTriStats.biHuy}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bị hủy
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bảng chi tiết thiết bị */}
      <Paper sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Chi Tiết Thiết Bị
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên thiết bị</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Tình trạng</TableCell>
                <TableCell>Vị trí</TableCell>
                <TableCell>Giá trị</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {thietBiList.map((thietBi) => (
                <TableRow key={thietBi.id}>
                  <TableCell>{thietBi.ten}</TableCell>
                  <TableCell>{thietBi.loai}</TableCell>
                  <TableCell>{thietBi.soLuong}</TableCell>
                  <TableCell>
                    <Chip
                      label={thietBi.tinhTrang === 'suDung' ? 'Đang sử dụng' : 
                             thietBi.tinhTrang === 'hongHoc' ? 'Hỏng hóc' :
                             thietBi.tinhTrang === 'baoTri' ? 'Bảo trì' : 'Ngừng sử dụng'}
                      color={thietBi.tinhTrang === 'suDung' ? 'success' :
                             thietBi.tinhTrang === 'hongHoc' ? 'error' :
                             thietBi.tinhTrang === 'baoTri' ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{thietBi.viTri}</TableCell>
                  <TableCell>
                    {thietBi.giaTri ? `${thietBi.giaTri.toLocaleString()} VNĐ` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Bảng chi tiết cơ sở vật chất */}
      <Paper>
        <Typography variant="h6" sx={{ p: 2 }}>
          Chi Tiết Cơ Sở Vật Chất
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên cơ sở</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Sức chứa</TableCell>
                <TableCell>Tình trạng</TableCell>
                <TableCell>Vị trí</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coSoVatChatList.map((coSoVatChat) => (
                <TableRow key={coSoVatChat.id}>
                  <TableCell>{coSoVatChat.ten}</TableCell>
                  <TableCell>{coSoVatChat.loai}</TableCell>
                  <TableCell>{coSoVatChat.sucChua || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={coSoVatChat.tinhTrang === 'hoatDong' ? 'Hoạt động' :
                             coSoVatChat.tinhTrang === 'baoTri' ? 'Bảo trì' : 'Ngừng sử dụng'}
                      color={coSoVatChat.tinhTrang === 'hoatDong' ? 'success' :
                             coSoVatChat.tinhTrang === 'baoTri' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{coSoVatChat.viTri}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default BaoCao; 