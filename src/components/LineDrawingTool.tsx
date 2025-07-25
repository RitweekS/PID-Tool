'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useLineContext } from './LineContext';

interface LineDrawingToolProps {
  type: 'straight' | 'single-arrow' | 'double-arrow' | 'dashed';
  label: string;
  icon: React.ReactNode;
}

const LineDrawingTool: React.FC<LineDrawingToolProps> = ({ type, label, icon }) => {
  const { selectedLineType, setSelectedLineType } = useLineContext();

  const handleClick = () => {
    setSelectedLineType(selectedLineType === type ? null : type);
  };

  const isSelected = selectedLineType === type;

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        margin: 1,
        border: isSelected ? '2px solid #1976d2' : '1px solid #ddd',
        borderRadius: 1,
        backgroundColor: isSelected ? '#e3f2fd' : '#f9f9f9',
        cursor: 'pointer',
        minHeight: 80,
        '&:hover': {
          backgroundColor: isSelected ? '#e3f2fd' : '#f0f0f0',
          borderColor: isSelected ? '#1976d2' : '#999',
        },
      }}
    >
      <Box sx={{ 
        width: 60, 
        height: 60, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: 1 
      }}>
        {icon}
      </Box>
      <Typography 
        variant="body2" 
        textAlign="center" 
        sx={{ 
          fontWeight: isSelected ? 600 : 500,
          color: isSelected ? '#1976d2' : 'inherit'
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default LineDrawingTool; 