import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  useTheme,
  Slide,
  Portal,
  Backdrop
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';

interface FilterOption {
  value: string;
  label: string;
}

interface MobileFilterDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const MobileFilterDialog: React.FC<MobileFilterDialogProps> = ({
  open,
  onClose,
  title,
  options,
  selectedValue,
  onSelect
}) => {
  const theme = useTheme();

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Portal>
      {/* Backdrop */}
      <Backdrop
        open={open}
        onClick={handleBackdropClick}
        sx={{
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      
      {/* Dialog */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60vh', // Chiếm 60% màn hình
            zIndex: 9999, // Cao hơn backdrop
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            boxShadow: '0px -4px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List>
              {options.map((option, index) => (
                <React.Fragment key={option.value}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleSelect(option.value)}
                      sx={{
                        py: 2,
                        px: 3,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ListItemText
                        primary={option.label}
                        primaryTypographyProps={{
                          fontSize: '1rem',
                          fontWeight: selectedValue === option.value ? 600 : 400,
                        }}
                      />
                      {selectedValue === option.value && (
                        <CheckIcon color="primary" />
                      )}
                    </ListItemButton>
                  </ListItem>
                  {index < options.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Paper>
      </Slide>
    </Portal>
  );
};

export default MobileFilterDialog; 