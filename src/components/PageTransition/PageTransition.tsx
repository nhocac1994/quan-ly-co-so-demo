import React from 'react';
import { Box, Fade, Slide } from '@mui/material';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          animation: 'slideIn 0.3s ease-out',
          '@keyframes slideIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {children}
      </Box>
    </Fade>
  );
};

export default PageTransition; 