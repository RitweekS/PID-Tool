import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Visibility, VisibilityOff, Lock, LockOpen, Delete, MoreVert, FileDownload, FileUpload } from '@mui/icons-material';
import { Layer } from './LayerContext';

interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  isSelected?: boolean;
  totalLayers: number; // Add new prop for total number of layers
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onSelect: () => void;
  onToggleSelection?: () => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  isActive,
  isSelected = false,
  totalLayers,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onRename,
  onSelect,
  onToggleSelection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Menu states
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [importMenuAnchor, setImportMenuAnchor] = useState<null | HTMLElement>(null);

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

  // Menu handlers
  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
    setMoreMenuAnchor(null);
  };

  const handleImportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setImportMenuAnchor(event.currentTarget);
  };

  const handleImportMenuClose = () => {
    setImportMenuAnchor(null);
    setMoreMenuAnchor(null);
  };

  return (
    <>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "6px 8px",
        borderRadius: "4px",
        border: isActive ? "2px solid #1976d2" : isSelected ? "2px solid #4caf50" : "1px solid #e0e0e0",
        backgroundColor: isActive ? "rgba(25, 118, 210, 0.1)" : isSelected ? "rgba(76, 175, 80, 0.1)" : "#ffffff",
        cursor: "pointer",
        position: "relative", // Add position relative for menu positioning
        "&:hover": {
            backgroundColor: isActive ? "rgba(25, 118, 210, 0.2)" : isSelected ? "rgba(76, 175, 80, 0.2)" : "rgba(0, 0, 0, 0.05)",
        },
      }}
      onClick={onSelect}
    >
      {/* Selection Checkbox */}
      {onToggleSelection && (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection();
          }}
          sx={{
            width: '16px',
            height: '16px',
            border: '2px solid #ccc',
            borderRadius: '2px',
            backgroundColor: isSelected ? '#4caf50' : 'transparent',
            marginRight: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              borderColor: '#4caf50',
            },
          }}
        >
          {isSelected && (
            <Box
              sx={{
                width: '8px',
                height: '8px',
                backgroundColor: 'white',
                borderRadius: '1px',
              }}
            />
          )}
        </Box>
      )}

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

        {/* More Menu */}
        <IconButton
          size="small"
          onClick={handleMoreMenuOpen}
          sx={{
            padding: '4px',
            color: '#757575',
          }}
          disableRipple
          disableFocusRipple
        >
          <MoreVert sx={{ fontSize: "14px" }} />
        </IconButton>
      </Box>
    </Box>

    {/* More Menu */}
    <Menu
      anchorEl={moreMenuAnchor}
      open={Boolean(moreMenuAnchor)}
      onClose={handleMoreMenuClose}
      onClick={(e) => e.stopPropagation()}
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e0e0e0',
          minWidth: '160px',
          '& .MuiMenuItem-root': {
            fontSize: '13px',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          },
        },
      }}
    >
      <MenuItem onClick={handleExportMenuOpen}>
        <ListItemIcon>
          <FileDownload sx={{ fontSize: "16px", color: '#2196f3' }} />
        </ListItemIcon>
        <ListItemText 
          primary="Export" 
          primaryTypographyProps={{ 
            fontSize: '13px',
            fontWeight: 500 
          }}
        />
        <Box sx={{ 
          width: '16px', 
          height: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#757575'
        }}>
          ▶
        </Box>
      </MenuItem>
      <MenuItem onClick={handleImportMenuOpen}>
        <ListItemIcon>
          <FileUpload sx={{ fontSize: "16px", color: '#9c27b0' }} />
        </ListItemIcon>
        <ListItemText 
          primary="Import" 
          primaryTypographyProps={{ 
            fontSize: '13px',
            fontWeight: 500 
          }}
        />
        <Box sx={{ 
          width: '16px', 
          height: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#757575'
        }}>
          ▶
        </Box>
      </MenuItem>
      {totalLayers > 1 && (
        <MenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleMoreMenuClose();
            if (window.confirm(`Are you sure you want to delete "${layer.name}"? This will permanently remove all elements on this layer.`)) {
              onDelete();
            }
          }}
          sx={{ 
            color: '#d32f2f',
            '&:hover': {
              backgroundColor: '#ffebee',
            },
          }}
        >
          <ListItemIcon>
            <Delete sx={{ fontSize: "16px", color: '#d32f2f' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Delete" 
            primaryTypographyProps={{ 
              fontSize: '13px',
              fontWeight: 500,
              color: '#d32f2f'
            }}
          />
        </MenuItem>
      )}
    </Menu>

    {/* Export Submenu */}
    <Menu
      anchorEl={exportMenuAnchor}
      open={Boolean(exportMenuAnchor)}
      onClose={handleExportMenuClose}
      onClick={(e) => e.stopPropagation()}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e0e0e0',
          minWidth: '140px',
          '& .MuiMenuItem-root': {
            fontSize: '12px',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#e3f2fd',
            },
          },
        },
      }}
    >
      <MenuItem onClick={handleExportMenuClose}>
        <ListItemIcon>
          <Box sx={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#4caf50', 
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            J
          </Box>
        </ListItemIcon>
        <ListItemText 
          primary="Export as JSON" 
          primaryTypographyProps={{ 
            fontSize: '12px',
            fontWeight: 500 
          }}
        />
      </MenuItem>
      <MenuItem onClick={handleExportMenuClose}>
        <ListItemIcon>
          <Box sx={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#ff9800', 
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            I
          </Box>
        </ListItemIcon>
        <ListItemText 
          primary="Export as Image" 
          primaryTypographyProps={{ 
            fontSize: '12px',
            fontWeight: 500 
          }}
        />
      </MenuItem>
    </Menu>

    {/* Import Submenu */}
    <Menu
      anchorEl={importMenuAnchor}
      open={Boolean(importMenuAnchor)}
      onClose={handleImportMenuClose}
      onClick={(e) => e.stopPropagation()}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e0e0e0',
          minWidth: '140px',
          '& .MuiMenuItem-root': {
            fontSize: '12px',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#f3e5f5',
            },
          },
        },
      }}
    >
      <MenuItem onClick={handleImportMenuClose}>
        <ListItemIcon>
          <Box sx={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#4caf50', 
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            J
          </Box>
        </ListItemIcon>
        <ListItemText 
          primary="Import from JSON" 
          primaryTypographyProps={{ 
            fontSize: '12px',
            fontWeight: 500 
          }}
        />
      </MenuItem>
      <MenuItem onClick={handleImportMenuClose}>
        <ListItemIcon>
          <Box sx={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#ff9800', 
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            I
          </Box>
        </ListItemIcon>
        <ListItemText 
          primary="Import from Image" 
          primaryTypographyProps={{ 
            fontSize: '12px',
            fontWeight: 500 
          }}
        />
      </MenuItem>
    </Menu>
  </>
  );
};

export default LayerItem; 