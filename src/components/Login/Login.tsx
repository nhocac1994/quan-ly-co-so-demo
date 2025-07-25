import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Container,
  Paper,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { forceInitializeSampleUsers } from '../../data/sampleUsers';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Khởi tạo dữ liệu mẫu khi component mount
  useEffect(() => {
    console.log('🚀 Login component mounted, khởi tạo dữ liệu mẫu...');
    forceInitializeSampleUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Lỗi đăng nhập không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'quanTriVien' | 'giaoVien' | 'hocSinh') => {
    setError('');
    setIsLoading(true);

    try {
      // Force khởi tạo lại dữ liệu mẫu để đảm bảo
      forceInitializeSampleUsers();
      
      let demoEmail = '';
      let demoPassword = '';

      switch (role) {
        case 'quanTriVien':
          demoEmail = 'admin@school.com';
          demoPassword = 'admin@school.com';
          break;
        case 'giaoVien':
          demoEmail = 'teacher@school.com';
          demoPassword = 'teacher@school.com';
          break;
        case 'hocSinh':
          demoEmail = 'student@school.com';
          demoPassword = 'student@school.com';
          break;
      }

      console.log('🔐 Đang đăng nhập với:', { email: demoEmail, password: demoPassword });
      
      setEmail(demoEmail);
      setPassword(demoPassword);
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Lỗi đăng nhập demo:', error);
      setError(error instanceof Error ? error.message : 'Lỗi đăng nhập demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            width: '100%',
            maxWidth: 400,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Box textAlign="center" mb={4}>
            <LoginIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Đăng Nhập
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Hệ thống quản lý cơ sở vật chất
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: 'white',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />,
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 'auto' }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: 'white',
                  },
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: 'white',
                color: '#667eea',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.5)',
                }
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Nhập'}
            </Button>
          </form>

          {/* Demo Accounts */}
          <Box mt={4}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              Tài khoản Demo
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="outlined"
                onClick={() => handleDemoLogin('quanTriVien')}
                disabled={isLoading}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                👨‍💼 Quản Trị Viên
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleDemoLogin('giaoVien')}
                disabled={isLoading}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                👨‍🏫 Giáo Viên
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleDemoLogin('hocSinh')}
                disabled={isLoading}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                👨‍🎓 Học Sinh
              </Button>
            </Box>
          </Box>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              💡 Mẹo: Sử dụng email làm mật khẩu để đăng nhập
            </Typography>
            <Box display="flex" flexDirection="column" gap={1} alignItems="center">
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  forceInitializeSampleUsers();
                  setError('');
                  console.log('🔄 Đã khởi tạo lại dữ liệu mẫu');
                }}
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.75rem',
                  textTransform: 'none'
                }}
              >
                🔄 Khởi tạo dữ liệu mẫu
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  const users = localStorage.getItem('nguoiDung');
                  console.log('📊 Dữ liệu hiện tại:', users);
                  alert(`Dữ liệu người dùng: ${users ? 'Có' : 'Không có'}`);
                }}
                sx={{ 
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.7rem',
                  textTransform: 'none'
                }}
              >
                🔍 Kiểm tra dữ liệu
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 