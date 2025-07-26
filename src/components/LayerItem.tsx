import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { Visibility, VisibilityOff, Lock, LockOpen, Delete, Edit } from '@mui/icons-material';
import { Layer } from './LayerContext';

interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onSelect: () => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  isActive,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onRename,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditName(layer.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editName.trim() !== layer.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(layer.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
        border: isActive ? '2px solid #4caf50' : '1px solid #e0e0e0',
        borderRadius: '6px',
        marginBottom: '4px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: isActive ? 'rgba(76, 175, 80, 0.15)' : 'rgba(0, 0, 0, 0.04)',
        },
        transition: 'all 0.2s ease',
      }}
      onClick={onSelect}
    >
      {/* Visibility Toggle */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        sx={{
          padding: '4px',
          marginRight: '8px',
          color: layer.visible ? '#4caf50' : '#757575',
        }}
      >
        {layer.visible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
      </IconButton>

      {/* Layer Name */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <TextField
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            size="small"
            variant="standard"
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '12px',
                padding: '4px 0',
              },
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Box>
            <Box
              sx={{
                fontSize: '12px',
                fontWeight: isActive ? 'bold' : 'normal',
                color: layer.visible ? '#333' : '#757575',
                textDecoration: layer.visible ? 'none' : 'line-through',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {layer.name}
            </Box>
            <Box
              sx={{
                fontSize: '10px',
                color: '#666',
                marginTop: '1px',
              }}
            >
              {layer.nodes.length + layer.lines.length} elements
            </Box>
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {/* Lock Toggle */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          sx={{
            padding: '4px',
            color: layer.locked ? '#f57c00' : '#757575',
          }}
        >
          {layer.locked ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />}
        </IconButton>

        {/* Edit Button */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick();
          }}
          sx={{
            padding: '4px',
            color: '#757575',
          }}
        >
          <Edit fontSize="small" />
        </IconButton>

        {/* Delete Button */}
        {layer.id !== 'default-layer' && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete "${layer.name}"? This will permanently remove all elements on this layer.`)) {
                onDelete();
              }
            }}
            sx={{
              padding: '4px',
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
              },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default LayerItem; 