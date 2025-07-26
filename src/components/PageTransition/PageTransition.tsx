import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [animationClass, setAnimationClass] = useState('fade-in');
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Tạo key mới để force re-render
    setKey(prev => prev + 1);
    
    // Chọn animation dựa trên route
    const getAnimationClass = (pathname: string): string => {
      if (pathname.includes('/dashboard') || pathname === '/') {
        return 'slide-in-top';
      } else if (pathname.includes('/thiet-bi')) {
        return 'slide-in-right';
      } else if (pathname.includes('/co-so-vat-chat')) {
        return 'slide-in-left';
      } else if (pathname.includes('/lich-su-su-dung')) {
        return 'slide-in-bottom';
      } else if (pathname.includes('/bao-cao')) {
        return 'scale-in';
      } else if (pathname.includes('/thong-bao')) {
        return 'bounce-in';
      } else if (pathname.includes('/quan-ly-dong-bo')) {
        return 'flip-in-x';
      } else {
        return 'fade-in';
      }
    };

    setAnimationClass(getAnimationClass(location.pathname));
  }, [location.pathname]);

  return (
    <div 
      key={key}
      className={animationClass}
      style={{ 
        minHeight: '100vh',
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition; 