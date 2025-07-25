'use client';
import React from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useNodeContext } from './NodeContext';
import CanvasNode from './CanvasNode';

const Canvas = () => {
  const { nodes, addNode, updateNodePosition } = useNodeContext();
  const width = typeof window !== "undefined" ? window.innerWidth - 250 : 800; // Subtract left drawer width
  const height = typeof window !== "undefined" ? window.innerHeight : 600;

  const gridSize = 20; // Size of each grid cell
  const verticalLines = [];
  const horizontalLines = [];

  // Generate vertical lines
  for (let i = 0; i < width; i += gridSize) {
    verticalLines.push(
      <Line
        key={`v-${i}`}
        points={[i, 0, i, height]}
        stroke="#ddd"
        strokeWidth={1}
      />
    );
  }

  // Generate horizontal lines
  for (let j = 0; j < height; j += gridSize) {
    horizontalLines.push(
      <Line
        key={`h-${j}`}
        points={[0, j, width, j]}
        stroke="#ddd"
        strokeWidth={1}
      />
    );
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stage = e.currentTarget;
    const point = stage.getBoundingClientRect();
    const x = e.clientX - point.left;
    const y = e.clientY - point.top;

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const newNode = {
        id: `${data.type}-${Date.now()}`,
        type: data.type,
        x: x,
        y: y,
        svgPath: data.svgPath,
      };
      addNode(newNode);
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: '100%', height: '100%' }}
    >
      <Stage width={width} height={height}>
        <Layer>
          {verticalLines}
          {horizontalLines}
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              onDragEnd={updateNodePosition}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
