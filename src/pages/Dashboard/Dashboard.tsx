import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  thietBiService, 
  coSoVatChatService, 
  lichSuSuDungService, 
  baoTriService, 
  thongBaoService 
} from '../../services/localStorage';
import { ThietBi, CoSoVatChat, LichSuSuDung, BaoTri } from '../../types';
import { createSampleData } from '../../utils/sampleData';


interface DashboardStats {
  totalThietBi: number;
  totalCoSoVatChat: number;
  thietBiHongHoc: number;
  coSoVatChatBaoTri: number;
  lichSuMuonHienTai: number;
  baoTriDangThucHien: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalThietBi: 0,
    totalCoSoVatChat: 0,
    thietBiHongHoc: 0,
    coSoVatChatBaoTri: 0,
    lichSuMuonHienTai: 0,
    baoTriDangThucHien: 0
  });
  const [recentLichSu, setRecentLichSu] = useState<LichSuSuDung[]>([]);
  const [recentBaoTri, setRecentBaoTri] = useState<BaoTri[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      // Lấy dữ liệu từ localStorage
      const thietBiList = thietBiService.getAll();
      const coSoVatChatList = coSoVatChatService.getAll();
      const lichSuList = lichSuSuDungService.getAll();
      const baoTriList = baoTriService.getAll();

      // Tính toán thống kê
      const newStats: DashboardStats = {
        totalThietBi: thietBiList.length,
        totalCoSoVatChat: coSoVatChatList.length,
        thietBiHongHoc: thietBiList.filter(tb => tb.tinhTrang === 'hongHoc').length,
        coSoVatChatBaoTri: coSoVatChatList.filter(csvc => csvc.tinhTrang === 'baoTri').length,
        lichSuMuonHienTai: lichSuList.filter(ls => ls.trangThai === 'dangMuon').length,
        baoTriDangThucHien: baoTriList.filter(bt => bt.trangThai === 'dangThucHien').length
      };

      setStats(newStats);

      // Lấy lịch sử gần đây
      const recentLichSuData = lichSuList
        .sort((a, b) => new Date(b.ngayMuon).getTime() - new Date(a.ngayMuon).getTime())
        .slice(0, 5);
      setRecentLichSu(recentLichSuData);

      // Lấy bảo trì gần đây
      const recentBaoTriData = baoTriList
        .sort((a, b) => new Date(b.ngayBatDau).getTime() - new Date(a.ngayBatDau).getTime())
        .slice(0, 5);
      setRecentBaoTri(recentBaoTriData);

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'suDung':
      case 'hoatDong':
      case 'daTra':
      case 'hoanThanh':
        return 'success';
      case 'hongHoc':
      case 'ngungSuDung':
      case 'quaHan':
      case 'biHuy':
        return 'error';
      case 'baoTri':
      case 'dangThucHien':
      case 'dangMuon':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      suDung: 'Đang sử dụng',
      hongHoc: 'Hỏng hóc',
      baoTri: 'Bảo trì',
      ngungSuDung: 'Ngừng sử dụng',
      hoatDong: 'Hoạt động',
      dangThucHien: 'Đang thực hiện',
      chuaBatDau: 'Chưa bắt đầu',
      hoanThanh: 'Hoàn thành',
      biHuy: 'Bị hủy',
      dangMuon: 'Đang mượn',
      daTra: 'Đã trả',
      quaHan: 'Quá hạn'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        animation: 'fadeInUp 0.6s ease-out',
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Tổng Quan Hệ Thống
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            createSampleData();
            loadDashboardData();
          }}
          sx={{
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }
          }}
        >
          Tạo Dữ Liệu Mẫu
        </Button>
      </Box>



      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <DevicesIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalThietBi}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng thiết bị
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalCoSoVatChat}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cơ sở vật chất
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <HistoryIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.lichSuMuonHienTai}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đang mượn
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.thietBiHongHoc}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thiết bị hỏng
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <ErrorIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.coSoVatChatBaoTri}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    CSVC bảo trì
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.baoTriDangThucHien}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bảo trì đang thực hiện
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lịch sử gần đây và Bảo trì */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Lịch Sử Mượn Gần Đây
            </Typography>
            <List>
              {recentLichSu.length > 0 ? (
                recentLichSu.map((lichSu) => (
                  <ListItem key={lichSu.id} divider>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={lichSu.nguoiMuon}
                      secondary={`${new Date(lichSu.ngayMuon).toLocaleDateString('vi-VN')} - ${lichSu.lyDo}`}
                    />
                    <Chip
                      label={getStatusText(lichSu.trangThai)}
                      color={getStatusColor(lichSu.trangThai) as any}
                      size="small"
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có lịch sử mượn
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bảo Trì Gần Đây
            </Typography>
            <List>
              {recentBaoTri.length > 0 ? (
                recentBaoTri.map((baoTri) => (
                  <ListItem key={baoTri.id} divider>
                    <ListItemIcon>
                      <WarningIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={baoTri.moTa}
                      secondary={`${new Date(baoTri.ngayBatDau).toLocaleDateString('vi-VN')} - ${baoTri.nguoiThucHien}`}
                    />
                    <Chip
                      label={getStatusText(baoTri.trangThai)}
                      color={getStatusColor(baoTri.trangThai) as any}
                      size="small"
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có hoạt động bảo trì
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 