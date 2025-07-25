import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Breadcrumbs,
  Link,
  Divider,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { thietBiService } from '../../services/localStorage';
import { ThietBi } from '../../types';
import QRCodeModal from '../../components/QRCodeModal/QRCodeModal';

const ThietBiView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [thietBi, setThietBi] = useState<ThietBi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadThietBiData();
    }
  }, [id]);

  const loadThietBiData = () => {
    try {
      setLoading(true);
      const data = thietBiService.getById(id!);
      if (data) {
        setThietBi(data);
      } else {
        setError('Không tìm thấy thiết bị');
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thiết bị:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      try {
        thietBiService.delete(id!);
        navigate('/thiet-bi');
      } catch (error) {
        console.error('Lỗi khi xóa thiết bị:', error);
        setError('Có lỗi xảy ra khi xóa thiết bị');
      }
    }
  };

  const handleQRCode = () => {
    setQrModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setQrModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: 'success' | 'error' | 'warning' | 'default' } = {
      'suDung': 'success',
      'hongHoc': 'error',
      'baoTri': 'warning',
      'ngungSuDung': 'default'
    };
    return statusMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'suDung': 'Đang sử dụng',
      'hongHoc': 'Hỏng hóc',
      'baoTri': 'Bảo trì',
      'ngungSuDung': 'Ngừng sử dụng'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (error || !thietBi) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Không tìm thấy thiết bị'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/thiet-bi')}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/thiet-bi');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ArrowBackIcon sx={{ mr: 1 }} />
          Quản Lý Thiết Bị
        </Link>
        <Typography color="text.primary">
          Chi Tiết Thiết Bị
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {thietBi.ten}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<QrCodeIcon />}
              onClick={handleQRCode}
            >
              Mã QR
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/thiet-bi/${thietBi.id}`)}
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
          </Box>
        </Box>
        <Chip
          label={getStatusText(thietBi.tinhTrang)}
          color={getStatusColor(thietBi.tinhTrang)}
          sx={{ mb: 1 }}
        />
      </Box>

      {/* Thông tin chi tiết */}
      <Grid container spacing={3}>
        {/* Thông tin cơ bản */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Thông Tin Cơ Bản
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Loại thiết bị
                  </Typography>
                  <Typography variant="body1">
                    {thietBi.loai}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số lượng
                  </Typography>
                  <Typography variant="body1">
                    {thietBi.soLuong}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vị trí
                  </Typography>
                  <Typography variant="body1">
                    {thietBi.viTri}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nhà cung cấp
                  </Typography>
                  <Typography variant="body1">
                    {thietBi.nhaCungCap || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Thông tin bổ sung */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Thông Tin Bổ Sung
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Giá trị
                  </Typography>
                  <Typography variant="body1">
                    {thietBi.giaTri ? `${thietBi.giaTri.toLocaleString()} VNĐ` : 'Chưa cập nhật'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày nhập
                  </Typography>
                  <Typography variant="body1">
                    {thietBi.ngayNhap ? new Date(thietBi.ngayNhap).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày cập nhật cuối
                  </Typography>
                  <Typography variant="body1">
                    {thietBi.ngayCapNhat ? new Date(thietBi.ngayCapNhat).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Mô tả */}
        {thietBi.moTa && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Mô Tả
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {thietBi.moTa}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/thiet-bi')}
        >
          Quay lại danh sách
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/thiet-bi/${thietBi.id}`)}
        >
          Chỉnh sửa
        </Button>
      </Box>

      {/* QR Code Modal */}
      <QRCodeModal
        open={qrModalOpen}
        onClose={handleCloseQRModal}
        thietBi={thietBi}
      />
    </Box>
  );
};

export default ThietBiView; 