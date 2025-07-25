import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import QRCode from 'react-qr-code';
import QRCodeLib from 'qrcode';
import { ThietBi } from '../../types';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  thietBi: ThietBi | null;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ open, onClose, thietBi }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!thietBi) return null;

  // Tạo dữ liệu cho QR code
  const qrData = JSON.stringify({
    id: thietBi.id,
    ten: thietBi.ten,
    loai: thietBi.loai,
    viTri: thietBi.viTri,
    ngayNhap: thietBi.ngayNhap
  });

  const handlePrint = async () => {
    if (!printRef.current) return;

    setIsPrinting(true);
    
    try {
      // Tạo QR code SVG
      const qrSvg = await QRCodeLib.toString(qrData, {
        type: 'svg',
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Không thể mở cửa sổ in. Vui lòng cho phép popup.');
        return;
      }

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mã QR Thiết Bị - ${thietBi.ten}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .qr-container {
              border: 2px solid #333;
              padding: 20px;
              margin: 20px auto;
              max-width: 400px;
              background: white;
            }
            .qr-code {
              margin: 20px 0;
              display: flex;
              justify-content: center;
            }
            .device-info {
              margin: 10px 0;
              text-align: left;
            }
            .device-info strong {
              display: inline-block;
              width: 120px;
            }
            .header {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #1976d2;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .qr-container { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="header">MÃ QR THIẾT BỊ</div>
          <div class="qr-container">
            <div class="device-info">
              <strong>Tên thiết bị:</strong> ${thietBi.ten}
            </div>
            <div class="device-info">
              <strong>Loại:</strong> ${thietBi.loai}
            </div>
            <div class="device-info">
              <strong>Vị trí:</strong> ${thietBi.viTri}
            </div>
            <div class="device-info">
              <strong>Số lượng:</strong> ${thietBi.soLuong}
            </div>
            <div class="device-info">
              <strong>Ngày nhập:</strong> ${new Date(thietBi.ngayNhap).toLocaleDateString('vi-VN')}
            </div>
            <div class="qr-code">
              ${qrSvg}
            </div>
            <div class="footer">
              Quét mã QR để xem thông tin chi tiết thiết bị
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Đợi một chút để content load
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

    } catch (error) {
      console.error('Lỗi khi in:', error);
      alert('Có lỗi xảy ra khi in mã QR');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <QrCodeIcon color="primary" />
        Mã QR Thiết Bị
      </DialogTitle>
      
      <DialogContent>
        <Box ref={printRef}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            {/* Thông tin thiết bị */}
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
              {thietBi.ten}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Loại thiết bị
                </Typography>
                <Typography variant="body1">
                  {thietBi.loai}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Vị trí
                </Typography>
                <Typography variant="body1">
                  {thietBi.viTri}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Số lượng
                </Typography>
                <Typography variant="body1">
                  {thietBi.soLuong}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Ngày nhập
                </Typography>
                <Typography variant="body1">
                  {new Date(thietBi.ngayNhap).toLocaleDateString('vi-VN')}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* QR Code */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <QRCode
                value={qrData}
                size={200}
                level="M"
                style={{ border: '1px solid #ddd', padding: '10px' }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary">
              Quét mã QR để xem thông tin chi tiết thiết bị
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Đóng
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          startIcon={<PrintIcon />}
          disabled={isPrinting}
        >
          {isPrinting ? 'Đang in...' : 'In mã QR'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeModal; 