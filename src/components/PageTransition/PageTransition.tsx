import React from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const location = useLocation();

  return (
    <div style={{ 
      animation: 'fadeIn 0.3s ease-in-out',
      minHeight: '100vh'
    }}>
      {children}
    </div>
  );
};

export default PageTransition; 