import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { Visibility, VisibilityOff, Lock, LockOpen, Delete } from '@mui/icons-material';
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
      if (inputRef.current.select && typeof inputRef.current.select === 'function') {
        inputRef.current.select();
      }
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
        display: "flex",
        alignItems: "center",
        padding: "6px 8px",
        borderRadius: "4px",
        border: isActive ? "2px solid #1976d2" : "1px solid #e0e0e0",
        backgroundColor: isActive ? "rgba(25, 118, 210, 0.1)" : "#ffffff",
        cursor: "pointer",
        position: "relative", // Add position relative for menu positioning
        "&:hover": {
            backgroundColor: isActive ? "rgba(25, 118, 210, 0.2)" : "rgba(0, 0, 0, 0.05)",
        },
      }}
      onClick={onSelect}
    >
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
          <Box
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleEditClick();
            }}
            sx={{ cursor: 'text' }}
          >
            <Box
              sx={{
                fontSize: '12px',
                fontWeight: isActive ? 'bold' : 'normal',
                color: layer.visible ? '#333' : '#757575',
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

      {/* Visibility Toggle */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        sx={{
          padding: '4px',
          color: layer.visible ? '#4caf50' : '#757575',
        }}
        disableRipple
        disableFocusRipple
      >
        {layer.visible ? <Visibility sx={{ fontSize: "14px" }} /> : <VisibilityOff sx={{ fontSize: "14px" }} />}
      </IconButton>
      
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
          disableRipple
          disableFocusRipple
        >
          {layer.locked ? <Lock sx={{ fontSize: "14px" }} /> : <LockOpen sx={{ fontSize: "14px" }} />}
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
            disableRipple 
            disableFocusRipple
          >
            <Delete sx={{ fontSize: "14px" }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default LayerItem; 