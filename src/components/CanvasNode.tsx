'use client';
import React from 'react';
import { Image, Group } from 'react-konva';
import { Node } from './NodeContext';

interface CanvasNodeProps {
  node: Node;
  onDragEnd: (id: string, x: number, y: number) => void;
}

const CanvasNode: React.FC<CanvasNodeProps> = ({ node, onDragEnd }) => {
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

  if (!image) {
    return null;
  }

  // Calculate aspect ratio to maintain proportions
  const aspectRatio = image.width / image.height;
  const baseSize = 120; // Increased base size
  let width = baseSize;
  let height = baseSize;

  // Maintain aspect ratio
  if (aspectRatio > 1) {
    // Wider than tall
    width = baseSize;
    height = baseSize / aspectRatio;
  } else if (aspectRatio < 1) {
    // Taller than wide
    height = baseSize;
    width = baseSize * aspectRatio;
  }

  return (
    <Group
      x={node.x}
      y={node.y}
      draggable
      onDragEnd={handleDragEnd}
    >
      <Image
        image={image}
        width={width}
        height={height}
        offsetX={width / 2}
        offsetY={height / 2}
      />
    </Group>
  );
};

export default CanvasNode; 