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
  Chip,
  useTheme,
  useMediaQuery,
  Portal
} from '@mui/material';
import {
  thietBiService,
  coSoVatChatService,
  lichSuSuDungService,
  baoTriService
} from '../../services/localStorage';
import { ThietBi, CoSoVatChat, LichSuSuDung, BaoTri } from '../../types';

const BaoCao: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
    <Box sx={{ p: { xs: 0, md: 3 }, pb: { xs: '100px', md: 3 } }}>
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
              pt: 2,
              pb: 2,
              px: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Báo Cáo Tổng Hợp
            </Typography>
          </Box>
        </Portal>
      )}

      {/* Spacer for mobile header */}
      {isMobile && <Box sx={{ height: '60px' }} />}

      {/* Desktop Header */}
      {!isMobile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Báo Cáo Tổng Hợp
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thống kê và báo cáo tổng quan về hệ thống quản lý
          </Typography>
        </Box>
      )}

      {/* Thống kê tổng quan */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography variant={isMobile ? "h6" : "h6"} gutterBottom sx={{ fontWeight: 600 }}>
                Thống Kê Thiết Bị
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h4" : "h3"} color="primary" sx={{ fontWeight: 700 }}>
                      {thietBiStats.total}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                      Tổng số
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h4" : "h3"} color="success.main" sx={{ fontWeight: 700 }}>
                      {thietBiStats.suDung}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                      Đang sử dụng
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="warning.main" sx={{ fontWeight: 600 }}>
                      {thietBiStats.baoTri}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bảo trì
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="error.main" sx={{ fontWeight: 600 }}>
                      {thietBiStats.hongHoc}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hỏng hóc
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary" sx={{ fontWeight: 600 }}>
                      {thietBiStats.ngungSuDung}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ngừng sử dụng
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography variant={isMobile ? "h6" : "h6"} gutterBottom sx={{ fontWeight: 600 }}>
                Thống Kê Cơ Sở Vật Chất
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h4" : "h3"} color="primary" sx={{ fontWeight: 700 }}>
                      {coSoVatChatStats.total}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                      Tổng số
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h4" : "h3"} color="success.main" sx={{ fontWeight: 700 }}>
                      {coSoVatChatStats.hoatDong}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                      Hoạt động
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="warning.main" sx={{ fontWeight: 600 }}>
                      {coSoVatChatStats.baoTri}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bảo trì
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary" sx={{ fontWeight: 600 }}>
                      {coSoVatChatStats.ngungSuDung}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ngừng sử dụng
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography variant={isMobile ? "h6" : "h6"} gutterBottom sx={{ fontWeight: 600 }}>
                Thống Kê Lịch Sử Sử Dụng
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h4" : "h3"} color="primary" sx={{ fontWeight: 700 }}>
                      {lichSuStats.total}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                      Tổng số
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h4" : "h3"} color="info.main" sx={{ fontWeight: 700 }}>
                      {lichSuStats.dangMuon}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                      Đang mượn
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="success.main" sx={{ fontWeight: 600 }}>
                      {lichSuStats.daTra}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đã trả
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="error.main" sx={{ fontWeight: 600 }}>
                      {lichSuStats.quaHan}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Quá hạn
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography variant={isMobile ? "h6" : "h6"} gutterBottom sx={{ fontWeight: 600 }}>
                Thống Kê Bảo Trì
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h4" : "h3"} color="primary" sx={{ fontWeight: 700 }}>
                      {baoTriStats.total}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                      Tổng số
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h4" : "h3"} color="success.main" sx={{ fontWeight: 700 }}>
                      {baoTriStats.hoanThanh}
                    </Typography>
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                      Hoàn thành
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="warning.main" sx={{ fontWeight: 600 }}>
                      {baoTriStats.chuaBatDau}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Chưa bắt đầu
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="info.main" sx={{ fontWeight: 600 }}>
                      {baoTriStats.dangThucHien}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đang thực hiện
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <Typography variant={isMobile ? "h6" : "h5"} color="error.main" sx={{ fontWeight: 600 }}>
                      {baoTriStats.biHuy}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bị hủy
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bảng chi tiết - Chỉ hiển thị trên desktop */}
      {!isMobile && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Chi Tiết Thiết Bị
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Tình trạng</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Số lượng</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Tỷ lệ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Chip label="Đang sử dụng" color="success" size="small" />
                      </TableCell>
                      <TableCell>{thietBiStats.suDung}</TableCell>
                      <TableCell>{thietBiStats.total > 0 ? ((thietBiStats.suDung / thietBiStats.total) * 100).toFixed(1) : 0}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Bảo trì" color="warning" size="small" />
                      </TableCell>
                      <TableCell>{thietBiStats.baoTri}</TableCell>
                      <TableCell>{thietBiStats.total > 0 ? ((thietBiStats.baoTri / thietBiStats.total) * 100).toFixed(1) : 0}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Hỏng hóc" color="error" size="small" />
                      </TableCell>
                      <TableCell>{thietBiStats.hongHoc}</TableCell>
                      <TableCell>{thietBiStats.total > 0 ? ((thietBiStats.hongHoc / thietBiStats.total) * 100).toFixed(1) : 0}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Ngừng sử dụng" color="default" size="small" />
                      </TableCell>
                      <TableCell>{thietBiStats.ngungSuDung}</TableCell>
                      <TableCell>{thietBiStats.total > 0 ? ((thietBiStats.ngungSuDung / thietBiStats.total) * 100).toFixed(1) : 0}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50] }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Chi Tiết Cơ Sở Vật Chất
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Tình trạng</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Số lượng</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Tỷ lệ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Chip label="Hoạt động" color="success" size="small" />
                      </TableCell>
                      <TableCell>{coSoVatChatStats.hoatDong}</TableCell>
                      <TableCell>{coSoVatChatStats.total > 0 ? ((coSoVatChatStats.hoatDong / coSoVatChatStats.total) * 100).toFixed(1) : 0}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Bảo trì" color="warning" size="small" />
                      </TableCell>
                      <TableCell>{coSoVatChatStats.baoTri}</TableCell>
                      <TableCell>{coSoVatChatStats.total > 0 ? ((coSoVatChatStats.baoTri / coSoVatChatStats.total) * 100).toFixed(1) : 0}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Chip label="Ngừng sử dụng" color="default" size="small" />
                      </TableCell>
                      <TableCell>{coSoVatChatStats.ngungSuDung}</TableCell>
                      <TableCell>{coSoVatChatStats.total > 0 ? ((coSoVatChatStats.ngungSuDung / coSoVatChatStats.total) * 100).toFixed(1) : 0}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BaoCao; 