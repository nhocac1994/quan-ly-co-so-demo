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
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
  Portal
} from '@mui/material';
import {
  Devices as DevicesIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { 
  thietBiService, 
  coSoVatChatService, 
  lichSuSuDungService, 
  baoTriService
} from '../../services/localStorage';
import { LichSuSuDung, BaoTri } from '../../types';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
    loadData();
  }, []);

  // Lắng nghe sự kiện refresh data từ AutoSync
  useEffect(() => {
    const handleDataRefreshed = () => {
      console.log('🔄 Dashboard: Nhận sự kiện dataRefreshed, cập nhật dữ liệu...');
      loadData();
    };

    window.addEventListener('dataRefreshed', handleDataRefreshed);
    
    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefreshed);
    };
  }, []);

  const loadData = () => {
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
      case 'dangMuon': return 'warning';
      case 'daTra': return 'success';
      case 'quaHan': return 'error';
      case 'dangThucHien': return 'info';
      case 'hoanThanh': return 'success';
      case 'chuaBatDau': return 'default';
      case 'biHuy': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'dangMuon': return 'Đang mượn';
      case 'daTra': return 'Đã trả';
      case 'quaHan': return 'Quá hạn';
      case 'dangThucHien': return 'Đang thực hiện';
      case 'hoanThanh': return 'Hoàn thành';
      case 'chuaBatDau': return 'Chưa bắt đầu';
      case 'biHuy': return 'Bị hủy';
      default: return status;
    }
  };

  // Thêm hàm lấy tên thiết bị và cơ sở vật chất
  const getThietBiName = (id?: string) => {
    if (!id) return '';
    const thietBiList = thietBiService.getAll();
    const thietBi = thietBiList.find(tb => tb.id === id);
    return thietBi ? thietBi.ten : '';
  };
  const getCoSoVatChatName = (id?: string) => {
    if (!id) return '';
    const coSoVatChatList = coSoVatChatService.getAll();
    const csvc = coSoVatChatList.find(c => c.id === id);
    return csvc ? csvc.ten : '';
  };

  const handleCreateSampleData = () => {
    createSampleData();
    loadData();
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        p: { xs: 3, md: 3 }
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 1, md: 3 }, 
      pb: { xs: 1, md: 3 }, 
      mt: { xs: 0, md: 0 },
      minHeight: { xs: 'auto', md: 'auto' },
      height: { xs: 'auto', md: 'auto' }
    }}>
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
              pt: 1,
              pb: 1,
              px: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
              🏠 Trang Chủ
            </Typography>
          </Box>
        </Portal>
      )}

      {/* Spacer for mobile header */}
      {isMobile && <Box sx={{ height: '50px' }} />}

      {/* Desktop Header */}
      {!isMobile && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            🏠 Trang Chủ - Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tổng quan hệ thống quản lý cơ sở vật chất và thiết bị
          </Typography>
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card className="stagger-item hover-lift" sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
              <Box display="flex" alignItems="center">
                <DevicesIcon color="primary" sx={{ fontSize: isMobile ? 28 : 40, mr: isMobile ? 1 : 2 }} />
                <Box>
                  <Typography variant={isMobile ? "h6" : "h4"} color="primary" sx={{ fontWeight: 700 }}>
                    {stats.totalThietBi}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Thiết bị
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card className="stagger-item hover-lift" sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
              <Box display="flex" alignItems="center">
                <BusinessIcon color="secondary" sx={{ fontSize: isMobile ? 28 : 40, mr: isMobile ? 1 : 2 }} />
                <Box>
                  <Typography variant={isMobile ? "h6" : "h4"} color="secondary" sx={{ fontWeight: 700 }}>
                    {stats.totalCoSoVatChat}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Cơ sở vật chất
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card className="stagger-item hover-lift" sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
              <Box display="flex" alignItems="center">
                <HistoryIcon color="info" sx={{ fontSize: isMobile ? 28 : 40, mr: isMobile ? 1 : 2 }} />
                <Box>
                  <Typography variant={isMobile ? "h6" : "h4"} color="info.main" sx={{ fontWeight: 700 }}>
                    {stats.lichSuMuonHienTai}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Đang mượn
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card className="stagger-item hover-lift" sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ fontSize: isMobile ? 28 : 40, mr: isMobile ? 1 : 2 }} />
                <Box>
                  <Typography variant={isMobile ? "h6" : "h4"} color="success.main" sx={{ fontWeight: 700 }}>
                    {stats.baoTriDangThucHien}
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                    Bảo trì đang thực hiện
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Warning Cards */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 4 }}>
        <Grid item xs={12} sm={6}>
          <Card className="stagger-item hover-lift" sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <ErrorIcon color="error" sx={{ fontSize: isMobile ? 24 : 32, mr: 1 }} />
                <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 600 }}>
                  Thiết bị hỏng hóc
                </Typography>
              </Box>
              <Typography variant={isMobile ? "h4" : "h3"} color="error" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.thietBiHongHoc}
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                Cần kiểm tra và sửa chữa
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card className="stagger-item hover-lift" sx={{ 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon color="warning" sx={{ fontSize: isMobile ? 24 : 32, mr: 1 }} />
                <Typography variant={isMobile ? "h6" : "h6"} sx={{ fontWeight: 600 }}>
                  Cơ sở vật chất bảo trì
                </Typography>
              </Box>
              <Typography variant={isMobile ? "h4" : "h3"} color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.coSoVatChatBaoTri}
              </Typography>
              <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                Đang trong quá trình bảo trì
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities - Chỉ hiển thị trên desktop */}
      {!isMobile && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card className="stagger-item hover-lift" sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  📋 Lịch Sử Mượn Gần Đây
                </Typography>
                {recentLichSu.length > 0 ? (
                  <List>
                                  {recentLichSu.map((lichSu, index) => (
                <ListItem key={`${lichSu.id}-${index}`} divider={index < recentLichSu.length - 1}>
                        <ListItemIcon>
                          <HistoryIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={lichSu.nguoiMuon}
                          secondary={
                            <React.Fragment>
                              <span style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', display: 'block' }}>
                                {lichSu.thietBiId ? `Thiết bị: ${lichSu.thietBiId}` : `Cơ sở: ${lichSu.coSoVatChatId}`}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)', display: 'block' }}>
                                {new Date(lichSu.ngayMuon).toLocaleDateString('vi-VN')}
                              </span>
                            </React.Fragment>
                          }
                        />
                        <Chip
                          label={getStatusText(lichSu.trangThai)}
                          color={getStatusColor(lichSu.trangThai) as any}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Chưa có lịch sử mượn
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className="stagger-item hover-lift" sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  🔧 Bảo Trì Gần Đây
                </Typography>
                {recentBaoTri.length > 0 ? (
                  <List>
                                  {recentBaoTri.map((baoTri, index) => (
                <ListItem key={`${baoTri.id}-${index}`} divider={index < recentBaoTri.length - 1}>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            baoTri.thietBiId
                              ? getThietBiName(baoTri.thietBiId)
                              : baoTri.coSoVatChatId
                                ? getCoSoVatChatName(baoTri.coSoVatChatId)
                                : baoTri.moTa
                          }
                          secondary={
                            <React.Fragment>
                              <span style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', display: 'block' }}>
                                {baoTri.moTa}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)', display: 'block' }}>
                                {new Date(baoTri.ngayBatDau).toLocaleDateString('vi-VN')}
                              </span>
                            </React.Fragment>
                          }
                        />
                        <Chip
                          label={getStatusText(baoTri.trangThai)}
                          color={getStatusColor(baoTri.trangThai) as any}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Chưa có hoạt động bảo trì
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Sample Data Button - Chỉ hiển thị khi không có dữ liệu */}
      {(stats.totalThietBi === 0 && stats.totalCoSoVatChat === 0) && (
        <Box className="stagger-item" sx={{ mt: isMobile ? 2 : 4, textAlign: 'center' }}>
          <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary" sx={{ mb: 2 }}>
            Chưa có dữ liệu. Hãy tạo dữ liệu mẫu để bắt đầu sử dụng hệ thống.
          </Typography>
          <Button
            variant="contained"
            onClick={handleCreateSampleData}
            sx={{
              px: 3,
              py: 1.5,
              fontSize: isMobile ? '0.875rem' : '1rem',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Tạo Dữ Liệu Mẫu
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 