'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNodeContext } from './NodeContext';

interface DraggableNodeProps {
  type: string;
  svgPath: string;
  label: string;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ type, svgPath, label }) => {
  const { setDraggedNodeType, setIsDragging } = useNodeContext();

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedNodeType(type);
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify({ type, svgPath }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedNodeType(null);
  };

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        margin: 1,
        border: '1px solid #ddd',
        borderRadius: 1,
        backgroundColor: '#f9f9f9',
        cursor: 'grab',
        minHeight: 100,
        '&:hover': {
          backgroundColor: '#f0f0f0',
          borderColor: '#999',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <Box
        component="img"
        src={svgPath}
        alt={label}
        sx={{
          width: 80,
          height: 80,
          objectFit: 'contain',
          marginBottom: 1,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      />
      <Typography variant="body2" textAlign="center" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
};

export default DraggableNode; 