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

  const renderCardContent = (item: any) => {
    switch (type) {
      case 'thietBi':
        return (
          <>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                <DevicesIcon />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" component="div" fontWeight={600}>
                  {item.tenThietBi || item.ten}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.maThietBi || item.ma || `ID: ${item.id}`}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Loại:</Typography>
                <Typography variant="body2">{item.loaiThietBi || item.loai}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Số lượng:</Typography>
                <Typography variant="body2">{item.soLuong || '1'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Tình trạng:</Typography>
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
                  sx={{ ml: 0.5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Vị trí:</Typography>
                <Typography variant="body2">{item.viTri || 'Không xác định'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Nhà cung cấp:</Typography>
                <Typography variant="body2">{item.nhaCungCap || 'Không xác định'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Giá trị:</Typography>
                <Typography variant="body2">
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
                  {item.tenCoSo || item.ten}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.maCoSo || item.ma}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Loại:</Typography>
                <Typography variant="body2">{item.loaiCoSo || item.loai}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Trạng thái:</Typography>
                <Chip 
                  label={item.trangThai || 'Không xác định'} 
                  size="small"
                  color={getStatusColor(item.trangThai)}
                  sx={{ ml: 0.5 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Mô tả:</Typography>
                <Typography variant="body2">{item.moTa || 'Không có mô tả'}</Typography>
              </Grid>
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
    <Box sx={{ mt: 2 }}>
      {data.map((item, index) => (
        <Card 
          key={item.id || index} 
          sx={{ 
            mb: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          <CardContent>
            {renderCardContent(item)}
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="flex-end" gap={1}>
              {onView && (
                <IconButton 
                  size="small" 
                  onClick={() => onView(item)}
                  sx={{ color: theme.palette.info.main }}
                >
                  <ViewIcon />
                </IconButton>
              )}
              
              {onQrCode && type === 'thietBi' && (
                <IconButton 
                  size="small" 
                  onClick={() => onQrCode(item)}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <QrCodeIcon />
                </IconButton>
              )}
              
              {onEdit && (
                <IconButton 
                  size="small" 
                  onClick={() => onEdit(item)}
                  sx={{ color: theme.palette.warning.main }}
                >
                  <EditIcon />
                </IconButton>
              )}
              
              {onDelete && (
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(item)}
                  sx={{ color: theme.palette.error.main }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default MobileCardView; 