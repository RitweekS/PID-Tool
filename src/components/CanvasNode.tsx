'use client';
import React from 'react';
import { Image, Group, Circle, Rect, Transformer } from 'react-konva';
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
  isSelected?: boolean;
  onSelect?: () => void;
  onTransform?: (id: string, attrs: any) => void;
  draggable?: boolean;
  opacity?: number;
}


const CanvasNode: React.FC<CanvasNodeProps> = ({ 
  node, 
  onDragEnd, 
  onDragMove, 
  onRightClick, 
  onSnapPointRightClick, 
  onSnapPointClick, 
  movingSnapPointId, 
  connectingSnapPointId, 
  isSelected,
  onSelect,
  onTransform,
  draggable = true,
  opacity = 1
}) => {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const groupRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);

  React.useEffect(() => {
    const img = new window.Image();
    img.src = node.svgPath;
    img.onload = () => {
      setImage(img);
    };
  }, [node.svgPath]);

  React.useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Update transformer when node dimensions change
  React.useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.forceUpdate();
      transformerRef.current.getLayer().batchDraw();
    }
  }, [node.width, node.height, node.scaleX, node.scaleY, isSelected]);

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

  const handleTransform = () => {
    // This is called during transform for real-time updates
    if (transformerRef.current && groupRef.current) {
      const groupNode = groupRef.current;
      // Force re-render during transform
      groupNode.getLayer()?.batchDraw();
    }
  };

  const handleTransformEnd = () => {
    if (onTransform && groupRef.current && transformerRef.current) {
      const groupNode = groupRef.current;
      const scaleX = groupNode.scaleX();
      const scaleY = groupNode.scaleY();
      
      // Calculate new dimensions based on original width/height and current scale
      const newWidth = originalWidth * scaleX;
      const newHeight = originalHeight * scaleY;
      
      onTransform(node.id, {
        x: groupNode.x(),
        y: groupNode.y(),
        rotation: groupNode.rotation(),
        scaleX: 1, // Reset scale after applying to dimensions
        scaleY: 1, // Reset scale after applying to dimensions
        width: newWidth,
        height: newHeight,
      });
      
      // Reset the scale on the group since we've applied it to dimensions
      groupNode.scaleX(1);
      groupNode.scaleY(1);
      
      // Force transformer to update with new dimensions
      setTimeout(() => {
        if (transformerRef.current && groupRef.current) {
          transformerRef.current.nodes([groupRef.current]);
          transformerRef.current.forceUpdate();
          transformerRef.current.getLayer().batchDraw();
        }
      }, 0);
    }
  };

  const handleClick = (e: any) => {
    // Transform mode is now activated via context menu only
    e.cancelBubble = true;
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
  
  // Store original dimensions for transform calculations
  const originalWidth = width;
  const originalHeight = height;

  return (
    <>
      <Group
        ref={groupRef}
        id={node.id}
        x={node.x}
        y={node.y}
        rotation={node.rotation || 0}
        scaleX={node.scaleX || 1}
        scaleY={node.scaleY || 1}
        opacity={opacity}
        draggable={draggable}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
        onClick={handleClick}
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
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
      </Group>
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={[
            'top-left',
            'top-right', 
            'bottom-left',
            'bottom-right',
            'top-center',
            'bottom-center',
            'middle-left',
            'middle-right'
          ]}
          rotateEnabled={true}
          resizeEnabled={true}
          keepRatio={node.isImageNode ? true : false}
          anchorSize={8}
          anchorStroke="#4285f4"
          anchorFill="white"
          anchorStrokeWidth={2}
          borderStroke="#4285f4"
          borderStrokeWidth={2}
          rotateAnchorOffset={30}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum resize
            if (newBox.width < 30 || newBox.height < 30) {
              return oldBox;
            }
            // Limit maximum resize
            if (newBox.width > 800 || newBox.height > 800) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
      
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
        
        // Calculate transformed snap point position
        const cos = Math.cos((node.rotation || 0) * Math.PI / 180);
        const sin = Math.sin((node.rotation || 0) * Math.PI / 180);
        const scaleX = node.scaleX || 1;
        const scaleY = node.scaleY || 1;
        
        const scaledX = snapPoint.x * scaleX;
        const scaledY = snapPoint.y * scaleY;
        const rotatedX = scaledX * cos - scaledY * sin;
        const rotatedY = scaledX * sin + scaledY * cos;
        
        return (
          <Circle
            key={snapPoint.id}
            x={node.x + rotatedX}
            y={node.y + rotatedY}
            radius={8}
            fill={snapPointFill}
            stroke={snapPointStroke}
            strokeWidth={snapPointStrokeWidth}
            opacity={opacity}
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