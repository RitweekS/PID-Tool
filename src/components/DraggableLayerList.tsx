import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';
import { Layer } from './LayerContext';
import LayerItem from './LayerItem';

interface DraggableLayerItemProps {
  layer: Layer;
  index: number;
  isActive: boolean;
  isSelected?: boolean;
  totalLayers: number;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onOpacityChange: (opacity: number) => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onSelect: () => void;
  onToggleSelection?: () => void;
  onMoveLayer: (fromIndex: number, toIndex: number) => void;
}

const DraggableLayerItem: React.FC<DraggableLayerItemProps> = ({
  layer,
  index,
  isActive,
  isSelected = false,
  totalLayers,
  onToggleVisibility,
  onToggleLock,
  onOpacityChange,
  onDelete,
  onRename,
  onSelect,
  onToggleSelection,
  onMoveLayer,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== index) {
      onMoveLayer(fromIndex, index);
    }
  };

  return (
    <Box
      ref={itemRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        backgroundColor: dragOver ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
        border: dragOver ? '2px dashed #4caf50' : '2px solid transparent',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        userSelect: 'none',
      }}
    >
      <LayerItem
        layer={layer}
        isActive={isActive}
        isSelected={isSelected}
        totalLayers={totalLayers}
        onToggleVisibility={onToggleVisibility}
        onToggleLock={onToggleLock}
        onOpacityChange={onOpacityChange}
        onDelete={onDelete}
        onRename={onRename}
        onSelect={onSelect}
        onToggleSelection={onToggleSelection}
      />
    </Box>
  );
};

interface DraggableLayerListProps {
  layers: Layer[];
  activeLayerId: string | null;
  selectedLayers: string[];
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
  onDelete: (layerId: string) => void;
  onRename: (layerId: string, newName: string) => void;
  onSelect: (layerId: string) => void;
  onToggleSelection: (layerId: string) => void;
  onReorderLayers: (fromIndex: number, toIndex: number) => void;
}

const DraggableLayerList: React.FC<DraggableLayerListProps> = ({
  layers,
  activeLayerId,
  selectedLayers,
  onToggleVisibility,
  onToggleLock,
  onOpacityChange,
  onDelete,
  onRename,
  onSelect,
  onToggleSelection,
  onReorderLayers,
}) => {
  const handleMoveLayer = (fromIndex: number, toIndex: number) => {
    onReorderLayers(fromIndex, toIndex);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        width: "100%",
        maxHeight: "200px",
        overflowY: "auto",
        padding: "8px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      {layers.map((layer, index) => (
        <DraggableLayerItem
          key={layer.id}
          layer={layer}
          index={index}
          isActive={activeLayerId === layer.id}
          isSelected={selectedLayers.includes(layer.id)}
          totalLayers={layers.length}
          onToggleVisibility={() => onToggleVisibility(layer.id)}
          onToggleLock={() => onToggleLock(layer.id)}
          onOpacityChange={(opacity) => onOpacityChange(layer.id, opacity)}
          onDelete={() => onDelete(layer.id)}
          onRename={(newName) => onRename(layer.id, newName)}
          onSelect={() => onSelect(layer.id)}
          onToggleSelection={() => onToggleSelection(layer.id)}
          onMoveLayer={handleMoveLayer}
        />
      ))}
    </Box>
  );
};

export default DraggableLayerList; 