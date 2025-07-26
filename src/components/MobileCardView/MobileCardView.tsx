import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Devices as DevicesIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

interface MobileCardViewProps {
  data: any[];
  type: 'thietBi' | 'coSoVatChat' | 'lichSuSuDung' | 'baoTri' | 'thongBao' | 'nguoiDung';
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  onQrCode?: (item: any) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'thietBi':
      return <DevicesIcon />;
    case 'coSoVatChat':
      return <BusinessIcon />;
    case 'lichSuSuDung':
      return <HistoryIcon />;
    case 'baoTri':
      return <AssessmentIcon />;
    case 'thongBao':
      return <NotificationsIcon />;
    default:
      return <BusinessIcon />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'thietBi':
      return 'primary';
    case 'coSoVatChat':
      return 'secondary';
    case 'lichSuSuDung':
      return 'info';
    case 'baoTri':
      return 'warning';
    case 'thongBao':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'hoạt động':
    case 'active':
    case 'tốt':
      return 'success';
    case 'bảo trì':
    case 'maintenance':
      return 'warning';
    case 'hỏng':
    case 'broken':
    case 'không hoạt động':
      return 'error';
    default:
      return 'default';
  }
};

const MobileCardView: React.FC<MobileCardViewProps> = ({
  data,
  type,
  onEdit,
  onDelete,
  onView,
  onQrCode
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) {
    return null;
  }

  const renderCardContent = (item: any, index: number) => {
    switch (type) {
      case 'thietBi':
        return (
          <>
            <Box display="flex" alignItems="center" mb={1.5}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 1.5, width: 40, height: 40 }}>
                <DevicesIcon />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" component="div" fontWeight={600} sx={{ fontSize: '1rem', mb: 0.5 }}>
                  {item.tenThietBi || item.ten}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  STT: {index + 1}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={1.5} mb={1.5}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>Loại:</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.loaiThietBi || item.loai}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>Số lượng:</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.soLuong || '1'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>Tình trạng:</Typography>
                <Chip 
                  label={item.tinhTrang === 'suDung' ? 'Đang sử dụng' : 
                         item.tinhTrang === 'hongHoc' ? 'Hỏng hóc' :
                         item.tinhTrang === 'baoTri' ? 'Bảo trì' :
                         item.tinhTrang === 'ngungSuDung' ? 'Ngừng sử dụng' : 
                         item.tinhTrang || 'Không xác định'} 
                  size="small"
                  color={item.tinhTrang === 'suDung' ? 'success' :
                         item.tinhTrang === 'hongHoc' ? 'error' :
                         item.tinhTrang === 'baoTri' ? 'warning' :
                         item.tinhTrang === 'ngungSuDung' ? 'default' : 'default'}
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>Vị trí:</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.viTri || 'Không xác định'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>Nhà cung cấp:</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.nhaCungCap || 'Không xác định'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>Giá trị:</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  {item.giaTri ? `${item.giaTri.toLocaleString()} VNĐ` : 'Không xác định'}
                </Typography>
              </Grid>
            </Grid>
          </>
        );

      case 'coSoVatChat':
        return (
          <>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                <BusinessIcon />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" component="div" fontWeight={600}>
                  {item.ten}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  STT: {index + 1}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Loại:</Typography>
                <Typography variant="body2">
                  {item.loai === 'phongHoc' ? 'Phòng học' :
                   item.loai === 'phongThiNghiem' ? 'Phòng thí nghiệm' :
                   item.loai === 'sanBai' ? 'Sân bãi' :
                   item.loai === 'thuVien' ? 'Thư viện' :
                   item.loai === 'vanPhong' ? 'Văn phòng' :
                   item.loai === 'khac' ? 'Khác' : item.loai}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Sức chứa:</Typography>
                <Typography variant="body2">{item.sucChua || 'Không xác định'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Tình trạng:</Typography>
                <Chip 
                  label={item.tinhTrang === 'hoatDong' ? 'Hoạt động' :
                         item.tinhTrang === 'baoTri' ? 'Bảo trì' :
                         item.tinhTrang === 'ngungSuDung' ? 'Ngừng sử dụng' : 
                         item.tinhTrang || 'Không xác định'} 
                  size="small"
                  color={item.tinhTrang === 'hoatDong' ? 'success' :
                         item.tinhTrang === 'baoTri' ? 'warning' :
                         item.tinhTrang === 'ngungSuDung' ? 'error' : 'default'}
                  sx={{ ml: 0.5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Vị trí:</Typography>
                <Typography variant="body2">{item.viTri || 'Không xác định'}</Typography>
              </Grid>
              {item.moTa && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Mô tả:</Typography>
                  <Typography variant="body2">{item.moTa}</Typography>
                </Grid>
              )}
            </Grid>
          </>
        );

      case 'lichSuSuDung':
        return (
          <>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                <HistoryIcon />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" component="div" fontWeight={600}>
                  {item.tenThietBi || item.ten}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.nguoiSuDung || 'Không xác định'}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Ngày sử dụng:</Typography>
                <Typography variant="body2">{item.ngaySuDung || 'Không xác định'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Thời gian:</Typography>
                <Typography variant="body2">{item.thoiGianSuDung || 'Không xác định'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Mục đích:</Typography>
                <Typography variant="body2">{item.mucDichSuDung || 'Không có mô tả'}</Typography>
              </Grid>
            </Grid>
          </>
        );

      case 'thongBao':
        return (
          <>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: theme.palette.error.main, mr: 2 }}>
                <NotificationsIcon />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" component="div" fontWeight={600}>
                  {item.tieuDe || item.ten}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.ngayTao || 'Không xác định'}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Loại:</Typography>
                <Chip 
                  label={item.loaiThongBao || 'Thông báo'} 
                  size="small"
                  color="primary"
                  sx={{ ml: 0.5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Trạng thái:</Typography>
                <Chip 
                  label={item.trangThai || 'Chưa đọc'} 
                  size="small"
                  color={item.trangThai === 'Đã đọc' ? 'success' : 'warning'}
                  sx={{ ml: 0.5 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Nội dung:</Typography>
                <Typography variant="body2">{item.noiDung || 'Không có nội dung'}</Typography>
              </Grid>
            </Grid>
          </>
        );

      default:
        return (
          <>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: theme.palette.grey[500], mr: 2 }}>
                {getTypeIcon(type)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" component="div" fontWeight={600}>
                  {item.ten || item.tieuDe || 'Không có tên'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.ma || item.id || 'Không có mã'}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {item.moTa || 'Không có mô tả'}
            </Typography>
          </>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {data.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Không có dữ liệu để hiển thị
          </Typography>
        </Card>
      ) : (
        data.map((item, index) => (
          <Card
            key={item.id || index}
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: 'divider',
            }}
            onClick={() => onView && onView(item)}
          >
            <CardContent sx={{ p: 2 }}>
              {renderCardContent(item, index)}
              
              {/* Action Buttons */}
              <Box display="flex" justifyContent="flex-end" gap={1} mt={1.5}>
                {onQrCode && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQrCode(item);
                    }}
                    sx={{
                      color: theme.palette.primary.main,
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.15)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <QrCodeIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                )}
                {onEdit && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    sx={{
                      color: theme.palette.primary.main,
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.15)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <EditIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                    sx={{
                      color: theme.palette.error.main,
                      backgroundColor: 'rgba(211, 47, 47, 0.08)',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.15)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default MobileCardView; 