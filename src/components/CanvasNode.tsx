'use client';
import React from 'react';
import { Image, Group, Circle, Rect } from 'react-konva';
import { Node } from '../utils';

interface CanvasNodeProps {
  node: Node;
  onDragEnd: (id: string, x: number, y: number) => void;
  onDragMove?: (id: string, x: number, y: number) => void;
  onRightClick: (nodeId: string, x: number, y: number) => void;
  onSnapPointRightClick: (nodeId: string, snapPointId: string, x: number, y: number) => void;
  onSnapPointClick: (nodeId: string, snapPointId: string, x: number, y: number) => void;
  movingSnapPointId?: string | null;
  connectingSnapPointId?: string | null;
  isResizing?: boolean;
}


const CanvasNode: React.FC<CanvasNodeProps> = ({ node, onDragEnd, onDragMove, onRightClick, onSnapPointRightClick, onSnapPointClick, movingSnapPointId, connectingSnapPointId, isResizing }) => {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const img = new window.Image();
    img.src = node.svgPath;
    img.onload = () => {
      setImage(img);
    };
  }, [node.svgPath]);

  const handleDragEnd = (e: any) => {
    const { x, y } = e.target.position();
    onDragEnd(node.id, x, y);
  };

  const handleDragMove = (e: any) => {
    if (onDragMove) {
      const { x, y } = e.target.position();
      onDragMove(node.id, x, y);
    }
  };

  const handleRightClick = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    onRightClick(node.id, pointerPos.x, pointerPos.y);
  };

  const handleSnapPointRightClick = (snapPointId: string) => (e: any) => {
    e.evt.preventDefault();
    e.evt.stopPropagation(); // Prevent node right click from firing
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    onSnapPointRightClick(node.id, snapPointId, pointerPos.x, pointerPos.y);
  };

  const handleSnapPointMouseDown = (snapPointId: string) => (e: any) => {
    e.evt.stopPropagation();
    
    // Check if it's a right click (button 2)
    if (e.evt.button === 2) {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      onSnapPointRightClick(node.id, snapPointId, pointerPos.x, pointerPos.y);
    } else if (e.evt.button === 0) {
      // Left click for connecting snap points
      e.evt.preventDefault();
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      onSnapPointClick(node.id, snapPointId, pointerPos.x, pointerPos.y);
    }
  };

  if (!image) {
    return null;
  }

  // Calculate aspect ratio to maintain proportions
  const aspectRatio = image.width / image.height;
  const baseSize = 120;
  
  // Use custom size if available, otherwise use calculated size
  let width = node.width || baseSize;
  let height = node.height || baseSize;

  // If no custom size, maintain aspect ratio
  if (!node.width && !node.height) {
    if (aspectRatio > 1) {
      // Wider than tall
      width = baseSize;
      height = baseSize / aspectRatio;
    } else if (aspectRatio < 1) {
      // Taller than wide
      height = baseSize;
      width = baseSize * aspectRatio;
    }
  }

  return (
    <>
      <Group
        x={node.x}
        y={node.y}
        draggable
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
      >
        {/* Invisible clickable area covering the entire component */}
        <Rect
          x={-width / 2 - 10}
          y={-height / 2 - 10}
          width={width + 20}
          height={height + 20}
          fill="transparent"
          onContextMenu={handleRightClick}
          listening={true}
        />
        <Image
          image={image}
          width={width}
          height={height}
          offsetX={width / 2}
          offsetY={height / 2}
          onContextMenu={handleRightClick}
        />
        
        {/* Resize mode visual feedback */}
        {isResizing && (
          <Rect
            x={-width / 2 - 5}
            y={-height / 2 - 5}
            width={width + 10}
            height={height + 10}
            stroke="#FF6B35"
            strokeWidth={2}
            dash={[5, 5]}
            fill="transparent"
            listening={false}
          />
        )}
      </Group>
      
      {/* Render snap points outside the draggable group */}
      {node.snapPoints.map((snapPoint) => {
        // Hide the snap point that's being moved
        if (movingSnapPointId === snapPoint.id) {
          return null;
        }
        
        // Determine visual state
        const isConnecting = connectingSnapPointId === snapPoint.id;
        const snapPointFill = isConnecting ? "#FF6B35" : "#87CEEB";
        const snapPointStroke = isConnecting ? "#FF6B35" : "#333";
        const snapPointStrokeWidth = isConnecting ? 3 : 2;
        
        return (
          <Circle
            key={snapPoint.id}
            x={node.x + snapPoint.x}
            y={node.y + snapPoint.y}
            radius={8}
            fill={snapPointFill}
            stroke={snapPointStroke}
            strokeWidth={snapPointStrokeWidth}
            onMouseDown={handleSnapPointMouseDown(snapPoint.id)}
            onContextMenu={handleSnapPointRightClick(snapPoint.id)}
            listening={true}
            perfectDrawEnabled={false}
          />
        );
      })}
    </>
  );
};

export default CanvasNode; 