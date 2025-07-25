'use client';
import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useNodeContext } from './NodeContext';
import { useLineContext } from './LineContext';
import CanvasNode from './CanvasNode';

// Constants
const GRID_SIZE = 20;
const ARROW_LENGTH = 12;
const ARROW_ANGLE = Math.PI / 6; // 30 degrees
const LINE_STROKE_WIDTH = 1;
const LINE_COLOR = '#333';
const GRID_COLOR = '#ddd';

// Line type configurations
const LINE_CONFIGS = {
  straight: { strokeWidth: LINE_STROKE_WIDTH, dashPattern: undefined },
  'single-arrow': { strokeWidth: LINE_STROKE_WIDTH, dashPattern: undefined },
  'double-arrow': { strokeWidth: LINE_STROKE_WIDTH, dashPattern: undefined },
  dashed: { strokeWidth: LINE_STROKE_WIDTH, dashPattern: [8, 4] as number[] }
} as const;

const Canvas = () => {
  const { nodes, addNode, updateNodePosition } = useNodeContext();
  const { lines, addLine, selectedLineType, isDrawing, setIsDrawing } = useLineContext();
  const stageRef = useRef<any>(null);
  const [drawingPoints, setDrawingPoints] = useState<number[]>([]);
  
  const width = typeof window !== "undefined" ? window.innerWidth - 250 : 800;
  const height = typeof window !== "undefined" ? window.innerHeight : 600;

  // Memoized grid lines to prevent unnecessary re-renders
  const gridLines = useMemo(() => {
    const verticalLines = [];
    const horizontalLines = [];

    // Generate vertical lines
    for (let i = 0; i < width; i += GRID_SIZE) {
      verticalLines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, height]}
          stroke={GRID_COLOR}
          strokeWidth={1}
        />
      );
    }

    // Generate horizontal lines
    for (let j = 0; j < height; j += GRID_SIZE) {
      horizontalLines.push(
        <Line
          key={`h-${j}`}
          points={[0, j, width, j]}
          stroke={GRID_COLOR}
          strokeWidth={1}
        />
      );
    }

    return [...verticalLines, ...horizontalLines];
  }, [width, height]);

  // Grid snapping function
  const snapToGrid = useCallback((x: number, y: number) => {
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
    return { x: snappedX, y: snappedY };
  }, []);

  // Optimized arrow rendering function
  const renderArrow = useCallback((points: number[], isStart: boolean = false) => {
    if (points.length < 4) return null;
    
    const [x1, y1, x2, y2] = points;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    
    const arrowX = isStart ? x1 : x2;
    const arrowY = isStart ? y1 : y2;
    
    // Calculate arrow angles based on position
    const baseAngle = isStart ? angle + Math.PI : angle;
    const arrowAngle1 = baseAngle - ARROW_ANGLE;
    const arrowAngle2 = baseAngle + ARROW_ANGLE;
    
    // Calculate arrow head points
    const arrowPoint1X = arrowX - ARROW_LENGTH * Math.cos(arrowAngle1);
    const arrowPoint1Y = arrowY - ARROW_LENGTH * Math.sin(arrowAngle1);
    const arrowPoint2X = arrowX - ARROW_LENGTH * Math.cos(arrowAngle2);
    const arrowPoint2Y = arrowY - ARROW_LENGTH * Math.sin(arrowAngle2);
    
    return (
      <React.Fragment>
        <Line
          points={[arrowX, arrowY, arrowPoint1X, arrowPoint1Y]}
          stroke={LINE_COLOR}
          strokeWidth={LINE_STROKE_WIDTH}
        />
        <Line
          points={[arrowX, arrowY, arrowPoint2X, arrowPoint2Y]}
          stroke={LINE_COLOR}
          strokeWidth={LINE_STROKE_WIDTH}
        />
      </React.Fragment>
    );
  }, []);

  // Optimized event handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
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
        x,
        y,
        svgPath: data.svgPath,
      };
      addNode(newNode);
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  }, [addNode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleMouseDown = useCallback((e: any) => {
    if (!selectedLineType) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const snappedPos = snapToGrid(pos.x, pos.y);
    setDrawingPoints([snappedPos.x, snappedPos.y]);
    setIsDrawing(true);
  }, [selectedLineType, setIsDrawing, snapToGrid]);

  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing || !selectedLineType) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const snappedPos = snapToGrid(pos.x, pos.y);
    const startX = drawingPoints[0];
    const startY = drawingPoints[1];
    
    // Determine if line should be horizontal or vertical based on which axis has more movement
    const deltaX = Math.abs(snappedPos.x - startX);
    const deltaY = Math.abs(snappedPos.y - startY);
    
    let endX, endY;
    if (deltaX > deltaY) {
      // Horizontal line - keep Y coordinate from start, snap X to grid
      endX = snappedPos.x;
      endY = startY;
    } else {
      // Vertical line - keep X coordinate from start, snap Y to grid
      endX = startX;
      endY = snappedPos.y;
    }
    
    setDrawingPoints([startX, startY, endX, endY]);
  }, [isDrawing, selectedLineType, drawingPoints, snapToGrid]);

  const handleMouseUp = useCallback((e: any) => {
    if (!isDrawing || !selectedLineType) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const snappedPos = snapToGrid(pos.x, pos.y);
    const startX = drawingPoints[0];
    const startY = drawingPoints[1];
    
    // Determine if line should be horizontal or vertical based on which axis has more movement
    const deltaX = Math.abs(snappedPos.x - startX);
    const deltaY = Math.abs(snappedPos.y - startY);
    
    let endX, endY;
    if (deltaX > deltaY) {
      // Horizontal line - keep Y coordinate from start, snap X to grid
      endX = snappedPos.x;
      endY = startY;
    } else {
      // Vertical line - keep X coordinate from start, snap Y to grid
      endX = startX;
      endY = snappedPos.y;
    }
    
    const finalPoints = [startX, startY, endX, endY];
    
    // Only create line if start and end points are different
    if (finalPoints[0] !== finalPoints[2] || finalPoints[1] !== finalPoints[3]) {
      const lineConfig = LINE_CONFIGS[selectedLineType as keyof typeof LINE_CONFIGS];
      
      const newLine = {
        id: `line-${Date.now()}`,
        type: selectedLineType as any,
        points: finalPoints,
        stroke: LINE_COLOR,
        strokeWidth: lineConfig.strokeWidth,
        dashPattern: lineConfig.dashPattern,
      };

      addLine(newLine);
    }
    
    setDrawingPoints([]);
    setIsDrawing(false);
  }, [isDrawing, selectedLineType, drawingPoints, addLine, setIsDrawing, snapToGrid]);

  // Memoized line rendering
  const renderedLines = useMemo(() => {
    return lines.map((line) => (
      <React.Fragment key={line.id}>
        <Line
          points={line.points}
          stroke={line.stroke}
          strokeWidth={line.strokeWidth}
          dash={line.dashPattern}
        />
        {line.type === 'single-arrow' && renderArrow(line.points, false)}
        {line.type === 'double-arrow' && (
          <>
            {renderArrow(line.points, false)}
            {renderArrow(line.points, true)}
          </>
        )}
      </React.Fragment>
    ));
  }, [lines, renderArrow]);

  // Memoized drawing preview
  const drawingPreview = useMemo(() => {
    if (!isDrawing || drawingPoints.length < 4) return null;
    
    const lineConfig = LINE_CONFIGS[selectedLineType as keyof typeof LINE_CONFIGS];
    
    return (
      <React.Fragment>
        <Line
          points={drawingPoints}
          stroke={LINE_COLOR}
          strokeWidth={lineConfig.strokeWidth}
          dash={lineConfig.dashPattern}
        />
        {selectedLineType === 'single-arrow' && renderArrow(drawingPoints, false)}
        {selectedLineType === 'double-arrow' && (
          <>
            {renderArrow(drawingPoints, false)}
            {renderArrow(drawingPoints, true)}
          </>
        )}
      </React.Fragment>
    );
  }, [isDrawing, drawingPoints, selectedLineType, renderArrow]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{ width: '100%', height: '100%' }}
    >
      <Stage 
        ref={stageRef}
        width={width} 
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: selectedLineType ? 'crosshair' : 'default' }}
      >
        <Layer>
          {gridLines}
          {renderedLines}
          {drawingPreview}
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
