'use client';
import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Path } from 'react-konva';
import { useNodeContext } from './NodeContext';
import { useLineContext } from './LineContext';
import CanvasNode from './CanvasNode';
import { getComponentBounds, isPositionWithinBounds, getSnapPointWorldPosition, getSnapPointsNear, updatePipeLines } from '../utils';
import { getDistanceToLine, findNearestLineSegment, insertPointInPipe, movePipePoint, getPipeControlPoints, movePipe, isEndPoint } from '../utils/pipeUtils';

// Constants
const GRID_SIZE = 20;
const ARROW_LENGTH = 12;
const ARROW_ANGLE = Math.PI / 6; // 30 degrees
const LINE_STROKE_WIDTH = 1;
const LINE_COLOR = '#333';
const GRID_COLOR = '#ddd';

// Line type configurations
const LINE_CONFIGS = {
  straight: { strokeWidth: LINE_STROKE_WIDTH + 1, dashPattern: undefined },
  'single-arrow': { strokeWidth: LINE_STROKE_WIDTH + 1, dashPattern: undefined },
  'double-arrow': { strokeWidth: LINE_STROKE_WIDTH + 1, dashPattern: undefined },
  dashed: { strokeWidth: LINE_STROKE_WIDTH + 1, dashPattern: [8, 4] as number[] }
} as const;

// Create strict orthogonal pipe path (only vertical/horizontal segments)
const createOrthogonalPipePath = (from: { x: number; y: number }, to: { x: number; y: number }): number[] => {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  
  // If the points are aligned horizontally, draw a straight horizontal line
  if (Math.abs(deltaY) < 10) {
    return [from.x, from.y, to.x, from.y];
  }
  
  // If the points are aligned vertically, draw a straight vertical line
  if (Math.abs(deltaX) < 10) {
    return [from.x, from.y, from.x, to.y];
  }
  
  // Create L-shaped path: horizontal first, then vertical
  return [
    from.x, from.y,    // Start point
    to.x, from.y,      // Horizontal to target X
    to.x, to.y         // Vertical to target Y
  ];
};

const Canvas = () => {
  const { 
    nodes, 
    connections, 
    addNode, 
    updateNodePosition, 
    updateNodeSize,
    updateNodeTransform,
    addConnection, 
    addSnapPoint,
    removeSnapPoint,
    updateSnapPointPosition,
    setConnections
  } = useNodeContext();
  const { lines, addLine, updateLine, deleteLine, selectedLineType, isDrawing, setIsDrawing, selectedLineId, setSelectedLineId, movingLineId, setMovingLineId } = useLineContext();
  const stageRef = useRef<any>(null);
  const [drawingPoints, setDrawingPoints] = useState<number[]>([]);
  const [startSnapPoint, setStartSnapPoint] = useState<string | null>(null);
  const [nearbySnapPoint, setNearbySnapPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string | null;
    snapPointId: string | null;
    type: 'node' | 'snapPoint';
  }>({ visible: false, x: 0, y: 0, nodeId: null, snapPointId: null, type: 'node' });
  
  
  const [movingSnapPoint, setMovingSnapPoint] = useState<{
    nodeId: string | null;
    snapPointId: string | null;
    previewPos: { x: number; y: number } | null;
  }>({ nodeId: null, snapPointId: null, previewPos: null });
  
  const [addingSnapPoint, setAddingSnapPoint] = useState<{
    nodeId: string | null;
    previewPos: { x: number; y: number } | null;
  }>({ nodeId: null, previewPos: null });
  
  const [connectingSnapPoint, setConnectingSnapPoint] = useState<{
    snapPointId: string | null;
    nodeId: string | null;
    previewLine: { x1: number; y1: number; x2: number; y2: number; orthogonalPoints?: number[] } | null;
  }>({ snapPointId: null, nodeId: null, previewLine: null });
  
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingPipe, setIsDraggingPipe] = useState(false);
  const [pipeHover, setPipeHover] = useState<string | null>(null);
  
  
  const width = typeof window !== "undefined" ? window.innerWidth - 490 : 800;
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
    
    // Create filled triangle path
    const pathData = `M ${arrowX} ${arrowY} L ${arrowPoint1X} ${arrowPoint1Y} L ${arrowPoint2X} ${arrowPoint2Y} Z`;
    
    return (
      <Path
        data={pathData}
        fill={LINE_COLOR}
        stroke={LINE_COLOR}
        strokeWidth={1}
      />
    );
  }, []);

  // Optimized event handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const stage = e.currentTarget;
    const point = stage.getBoundingClientRect();
    const x = e.clientX - point.left;
    const y = e.clientY - point.top;

    const nodeType = e.dataTransfer.getData('application/reactflow');
    if (nodeType) {
      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        x,
        y,
        svgPath: `/${nodeType === 'pump' ? 'Pumps' : nodeType === 'evaporators' ? 'Evaporators' : nodeType === 'compressor' ? 'Compressor' : nodeType === 'condensers' ? 'condenser' : nodeType === 'vessels' ? 'Vessels' : nodeType === 'heat-exchangers' ? 'HeatExchanger' : nodeType}.svg`,
        snapPoints: [],
      };
      addNode(newNode);
    }
  }, [addNode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleNodeRightClick = useCallback((nodeId: string, x: number, y: number) => {
    setContextMenu({
      visible: true,
      x,
      y,
      nodeId,
      snapPointId: null,
      type: 'node'
    });
  }, []);

  const handleSnapPointRightClick = useCallback((nodeId: string, snapPointId: string, x: number, y: number) => {
    setContextMenu({
      visible: true,
      x,
      y,
      nodeId,
      snapPointId,
      type: 'snapPoint'
    });
  }, []);

  const handleAddSnapPointDirect = useCallback(() => {
    if (!contextMenu.nodeId) return;
    
    // Enter snap point preview mode
    setAddingSnapPoint({
      nodeId: contextMenu.nodeId,
      previewPos: { x: contextMenu.x, y: contextMenu.y }
    });
    
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null, snapPointId: null, type: 'node' });
  }, [contextMenu]);

  const handleTransformMode = useCallback(() => {
    if (!contextMenu.nodeId) return;
    
    setTransformMode(contextMenu.nodeId);
    setSelectedNodeId(contextMenu.nodeId);
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null, snapPointId: null, type: 'node' });
  }, [contextMenu]);


  const handleDeleteSnapPoint = useCallback(() => {
    if (!contextMenu.nodeId || !contextMenu.snapPointId) return;
    
    removeSnapPoint(contextMenu.nodeId, contextMenu.snapPointId);
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null, snapPointId: null, type: 'node' });
  }, [contextMenu, removeSnapPoint]);

  const handleMoveSnapPoint = useCallback(() => {
    if (!contextMenu.nodeId || !contextMenu.snapPointId) return;
    
    // Get current snap point position to start preview there
    const currentPos = getSnapPointWorldPosition(nodes, contextMenu.snapPointId!);
    
    setMovingSnapPoint({
      nodeId: contextMenu.nodeId,
      snapPointId: contextMenu.snapPointId,
      previewPos: currentPos || { x: contextMenu.x, y: contextMenu.y }
    });
    
    setContextMenu({ visible: false, x: 0, y: 0, nodeId: null, snapPointId: null, type: 'node' });
  }, [contextMenu, nodes]);


  const handlePipeMouseDown = useCallback((lineId: string, clickPos: { x: number; y: number }) => {
    const line = lines.find(l => l.id === lineId);
    if (!line) return;
    
    setSelectedLineId(lineId);
    
    // Check if clicking near an end point (for extension)
    const controlPoints = getPipeControlPoints(line.points);
    const clickedPoint = controlPoints.find(point => {
      const distance = Math.sqrt(Math.pow(point.x - clickPos.x, 2) + Math.pow(point.y - clickPos.y, 2));
      return distance < 20; // 20px tolerance for end points
    });
    
    if (clickedPoint && isEndPoint(clickedPoint.index, line.points.length)) {
      // Start extending from end point
      setDraggedPointIndex(clickedPoint.index);
      setDragOffset({ x: 0, y: 0 }); // No offset for direct positioning
    } else {
      // Start moving entire pipe
      setIsDraggingPipe(true);
      const snappedPos = snapToGrid(clickPos.x, clickPos.y);
      setDragOffset({
        x: snappedPos.x,
        y: snappedPos.y
      });
    }
  }, [lines, setSelectedLineId, snapToGrid]);

  const handleSnapPointClick = useCallback((nodeId: string, snapPointId: string, x: number, y: number) => {
    // Use selected line type or default to 'straight' for piping
    const pipeLineType = selectedLineType || 'straight';

    if (connectingSnapPoint.snapPointId) {
      // Second click - complete the connection using selected or default line type
      if (connectingSnapPoint.snapPointId !== snapPointId) {
        // Get positions of both snap points
        const fromPos = getSnapPointWorldPosition(nodes, connectingSnapPoint.snapPointId);
        const toPos = getSnapPointWorldPosition(nodes, snapPointId);
        
        if (fromPos && toPos) {
          // Create orthogonal pipe path (only vertical/horizontal)
          const orthogonalPoints = createOrthogonalPipePath(fromPos, toPos);
          
          // Get line configuration for the pipe type
          const lineConfig = LINE_CONFIGS[pipeLineType as keyof typeof LINE_CONFIGS];
          
          // Also create a connection for data relationship first to get the connection ID
          const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          
          // Create line using the pipe type with connection reference
          const newLine = {
            id: `pipe-${connectionId}`,
            type: pipeLineType as any,
            points: orthogonalPoints,
            stroke: LINE_COLOR,
            strokeWidth: lineConfig.strokeWidth, // Same thickness as other lines
            dashPattern: lineConfig.dashPattern,
            connectionId: connectionId, // Store connection reference
          };

          addLine(newLine);
          
          // Create the connection with matching ID
          const newConnection = {
            id: connectionId,
            fromSnapId: connectingSnapPoint.snapPointId,
            toSnapId: snapPointId,
            points: orthogonalPoints
          };
          
          setConnections(prev => [...prev, newConnection]);
        }
      }
      
      // Reset connecting state
      setConnectingSnapPoint({ snapPointId: null, nodeId: null, previewLine: null });
    } else {
      // First click - start connection (always works, uses default if no type selected)
      const snapPos = getSnapPointWorldPosition(nodes, snapPointId);
      if (snapPos) {
        setConnectingSnapPoint({
          snapPointId,
          nodeId,
          previewLine: { x1: snapPos.x, y1: snapPos.y, x2: snapPos.x, y2: snapPos.y }
        });
      }
    }
  }, [connectingSnapPoint, nodes, addConnection, selectedLineType, addLine]);

  // Close context menu when clicking elsewhere and handle escape key
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, nodeId: null, snapPointId: null, type: 'node' });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (addingSnapPoint.nodeId) {
          setAddingSnapPoint({ nodeId: null, previewPos: null });
        }
        if (movingSnapPoint.nodeId) {
          setMovingSnapPoint({ nodeId: null, snapPointId: null, previewPos: null });
        }
        if (contextMenu.visible) {
          setContextMenu({ visible: false, x: 0, y: 0, nodeId: null, snapPointId: null, type: 'node' });
        }
        if (connectingSnapPoint.snapPointId) {
          setConnectingSnapPoint({ snapPointId: null, nodeId: null, previewLine: null });
        }
        if (transformMode) {
          setTransformMode(null);
          setSelectedNodeId(null);
        }
        if (selectedLineId) {
          setSelectedLineId(null);
          setDraggedPointIndex(null);
          setIsDraggingPipe(false);
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLineId) {
          deleteLine(selectedLineId);
          setSelectedLineId(null);
          setDraggedPointIndex(null);
          setIsDraggingPipe(false);
        }
    
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.visible, addingSnapPoint.nodeId, movingSnapPoint.nodeId, connectingSnapPoint.snapPointId, transformMode, selectedLineId, deleteLine, isDraggingPipe]);

  // Update pipe lines when connections change (to sync with moving components)
  React.useEffect(() => {
    const connectionIds = connections.map(conn => `pipe-${conn.id}`);
    
    // Remove lines that no longer have connections
    lines.forEach(line => {
      if (line.id.startsWith('pipe-') && !connectionIds.includes(line.id)) {
        deleteLine(line.id);
      }
    });
    
    connections.forEach(connection => {
      // Find the corresponding pipe line using connection ID
      const pipeLineId = `pipe-${connection.id}`;
      const existingLine = lines.find(line => line.id === pipeLineId);
      
      if (existingLine) {
        // Check if the points have changed
        const pointsChanged = JSON.stringify(existingLine.points) !== JSON.stringify(connection.points);
        
        if (pointsChanged) {
          // Update the line with new connection points
          updateLine(pipeLineId, { points: connection.points });
        }
      }
    });
  }, [connections, lines, updateLine, deleteLine]);


  const handleMouseDown = useCallback((e: any) => {
    const pos = e.target.getStage().getPointerPosition();

    
    // Check if clicking on end point circle
    if (e.target.getClassName() === 'Circle' && e.target.attrs.id?.startsWith('endpoint-')) {
      const [, lineId, pointIndex] = e.target.attrs.id.split('-');

      setSelectedLineId(lineId);
      setDraggedPointIndex(parseInt(pointIndex));
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    
    // Check if clicking on a pipe line
    if (e.target.getClassName() === 'Line') {
      const lineId = e.target.attrs.id;

      if (lineId) {
        handlePipeMouseDown(lineId, pos);
        return;
      }
    }
    
    // Deselect node and line if clicking on empty canvas
    if (e.target === e.target.getStage()) {
      setSelectedNodeId(null);
      setTransformMode(null);
      setSelectedLineId(null);
      setDraggedPointIndex(null);
      setIsDraggingPipe(false);
    }
    
    // Handle snap point adding mode
    if (addingSnapPoint.nodeId) {
      const targetNode = nodes.find(n => n.id === addingSnapPoint.nodeId);
      if (targetNode) {
        const componentBounds = getComponentBounds(targetNode);
        const isWithinBounds = isPositionWithinBounds(pos, componentBounds);

        if (isWithinBounds) {
          // Calculate relative position from node center
          const relativeX = pos.x - targetNode.x;
          const relativeY = pos.y - targetNode.y;
          
          // Add the snap point only to the target component
          addSnapPoint(addingSnapPoint.nodeId, {
            x: relativeX,
            y: relativeY,
            type: 'output'
          });
        }
        // If clicked outside target component, just cancel the operation
      }
      
      setAddingSnapPoint({ nodeId: null, previewPos: null });
      return;
    }
    
    // Handle snap point moving
    if (movingSnapPoint.nodeId && movingSnapPoint.snapPointId) {
      updateSnapPointPosition(movingSnapPoint.nodeId, movingSnapPoint.snapPointId, pos.x, pos.y);
      setMovingSnapPoint({ nodeId: null, snapPointId: null, previewPos: null });
      return;
    }
    
    if (!selectedLineType) return;
    
    // Check for nearby snap points first
    const nearbySnaps = getSnapPointsNear(nodes, pos.x, pos.y, 20);
    let startPos;
    let snapId = null;
    
    if (nearbySnaps.length > 0) {
      // Snap to the nearest snap point
      startPos = nearbySnaps[0].worldPos;
      snapId = nearbySnaps[0].snapPoint.id;
    } else {
      // Snap to grid
      startPos = snapToGrid(pos.x, pos.y);
    }
    
    setDrawingPoints([startPos.x, startPos.y]);
    setStartSnapPoint(snapId);
    setIsDrawing(true);
  }, [selectedLineType, setIsDrawing, snapToGrid, movingSnapPoint, updateSnapPointPosition, addingSnapPoint, nodes, addSnapPoint, handlePipeMouseDown, setSelectedLineId, setDraggedPointIndex, setIsDraggingPipe]);

  const handleMouseMove = useCallback((e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    
    // Handle pipe extension (dragging end points)
    if (selectedLineId && draggedPointIndex !== null) {
      const line = lines.find(l => l.id === selectedLineId);
      if (line) {
        const snappedPos = snapToGrid(pos.x, pos.y);
        
        // Get the adjacent point to maintain orthogonal connection
        const adjacentIndex = draggedPointIndex === 0 ? 1 : (line.points.length / 2) - 2;
        const adjacentX = line.points[adjacentIndex * 2];
        const adjacentY = line.points[adjacentIndex * 2 + 1];
        
        // Determine if we should move horizontally or vertically based on mouse position
        const deltaX = Math.abs(snappedPos.x - adjacentX);
        const deltaY = Math.abs(snappedPos.y - adjacentY);
        
        let finalPos;
        if (deltaX > deltaY) {
          // Move horizontally
          finalPos = { x: snappedPos.x, y: adjacentY };
        } else {
          // Move vertically
          finalPos = { x: adjacentX, y: snappedPos.y };
        }
        
        const newPoints = movePipePoint(line.points, draggedPointIndex, finalPos);
        updateLine(selectedLineId, { points: newPoints });
      }
      return;
    }
    
    // Handle moving entire pipe
    if (selectedLineId && isDraggingPipe) {
      const line = lines.find(l => l.id === selectedLineId);
      if (line) {
        const snappedPos = snapToGrid(pos.x, pos.y);
        const deltaX = snappedPos.x - dragOffset.x;
        const deltaY = snappedPos.y - dragOffset.y;
        const newPoints = movePipe(line.points, deltaX, deltaY);
        updateLine(selectedLineId, { points: newPoints });
        
        // Update drag offset for continuous movement
        setDragOffset({ x: snappedPos.x, y: snappedPos.y });
      }
      return;
    }
    
    // Handle moving snap point preview mode
    if (movingSnapPoint.nodeId) {
      setMovingSnapPoint(prev => ({
        ...prev,
        previewPos: { x: pos.x, y: pos.y }
      }));
      return;
    }
    
    // Handle snap point preview mode
    if (addingSnapPoint.nodeId) {
      setAddingSnapPoint(prev => ({
        ...prev,
        previewPos: { x: pos.x, y: pos.y }
      }));
      return;
    }
    
    // Handle connection preview mode with orthogonal path
    if (connectingSnapPoint.snapPointId && connectingSnapPoint.previewLine) {
      const fromPos = { x: connectingSnapPoint.previewLine.x1, y: connectingSnapPoint.previewLine.y1 };
      const toPos = { x: pos.x, y: pos.y };
      
      // Create orthogonal preview path
      const orthogonalPoints = createOrthogonalPipePath(fromPos, toPos);
      
      setConnectingSnapPoint(prev => ({
        ...prev,
        previewLine: {
          x1: fromPos.x,
          y1: fromPos.y,
          x2: toPos.x,
          y2: toPos.y,
          orthogonalPoints // Store the full orthogonal path for rendering
        } as any
      }));
      return;
    }
    
    if (!isDrawing || !selectedLineType) return;
    
    const startX = drawingPoints[0];
    const startY = drawingPoints[1];
    
    // Check for nearby snap points
    const nearbySnaps = getSnapPointsNear(nodes, pos.x, pos.y, 20);
    let endPos;
    
    if (nearbySnaps.length > 0) {
      // Show nearby snap point indicator
      endPos = nearbySnaps[0].worldPos;
      setNearbySnapPoint(endPos);
    } else {
      // Snap to grid and determine line direction
      const snappedPos = snapToGrid(pos.x, pos.y);
      
      // Determine if line should be horizontal or vertical based on which axis has more movement
      const deltaX = Math.abs(snappedPos.x - startX);
      const deltaY = Math.abs(snappedPos.y - startY);
      
      if (deltaX > deltaY) {
        // Horizontal line - keep Y coordinate from start, snap X to grid
        endPos = { x: snappedPos.x, y: startY };
      } else {
        // Vertical line - keep X coordinate from start, snap Y to grid
        endPos = { x: startX, y: snappedPos.y };
      }
      
      setNearbySnapPoint(null);
    }
    
    setDrawingPoints([startX, startY, endPos.x, endPos.y]);
  }, [isDrawing, selectedLineType, drawingPoints, snapToGrid, addingSnapPoint, nodes, connectingSnapPoint, selectedLineId, draggedPointIndex, lines, updateLine, dragOffset, isDraggingPipe, setDragOffset]);

  const handleMouseUp = useCallback((e: any) => {
    // Handle pipe interaction end
    if (selectedLineId && (draggedPointIndex !== null || isDraggingPipe)) {
      setDraggedPointIndex(null);
      setIsDraggingPipe(false);
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    
    if (!isDrawing || !selectedLineType) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const startX = drawingPoints[0];
    const startY = drawingPoints[1];
    
    // Check for nearby snap points at end position
    const nearbySnaps = getSnapPointsNear(nodes, pos.x, pos.y, 20);
    let endPos;
    let endSnapId = null;
    
    if (nearbySnaps.length > 0) {
      endPos = nearbySnaps[0].worldPos;
      endSnapId = nearbySnaps[0].snapPoint.id;
    } else {
      // Snap to grid and determine line direction
      const snappedPos = snapToGrid(pos.x, pos.y);
      
      const deltaX = Math.abs(snappedPos.x - startX);
      const deltaY = Math.abs(snappedPos.y - startY);
      
      if (deltaX > deltaY) {
        endPos = { x: snappedPos.x, y: startY };
      } else {
        endPos = { x: startX, y: snappedPos.y };
      }
    }
    
    const finalPoints = [startX, startY, endPos.x, endPos.y];
    
    // Only create line/connection if start and end points are different
    if (finalPoints[0] !== finalPoints[2] || finalPoints[1] !== finalPoints[3]) {
      if (startSnapPoint && endSnapId) {
        // Create a connection between snap points
        addConnection(startSnapPoint, endSnapId, finalPoints);
      } else {
        // Create a regular line
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
    }
    
    setDrawingPoints([]);
    setStartSnapPoint(null);
    setNearbySnapPoint(null);
    setIsDrawing(false);
  }, [isDrawing, selectedLineType, drawingPoints, addLine, addConnection, setIsDrawing, snapToGrid, startSnapPoint, nodes, selectedLineId, draggedPointIndex, setDraggedPointIndex, setDragOffset, isDraggingPipe, setIsDraggingPipe]);

  // Memoized line rendering
  const renderedLines = useMemo(() => {
    return lines.map((line) => {
      const isSelected = selectedLineId === line.id;
      const isHovered = pipeHover === line.id;
      const controlPoints = isSelected ? getPipeControlPoints(line.points) : [];
      
      return (
        <React.Fragment key={line.id}>
          <Line
            id={line.id}
            points={line.points}
            stroke={isSelected ? '#FF6B35' : isHovered ? '#2196F3' : line.stroke}
            strokeWidth={isSelected ? line.strokeWidth + 2 : isHovered ? line.strokeWidth + 1 : line.strokeWidth}
            dash={line.dashPattern}
            lineCap="round"
            lineJoin="round"
            hitStrokeWidth={20} // Wider hit area for easier clicking
            onMouseEnter={() => setPipeHover(line.id)}
            onMouseLeave={() => setPipeHover(null)}
          />
          {line.type === 'single-arrow' && renderArrow(line.points, false)}
          {line.type === 'double-arrow' && (
            <>
              {renderArrow(line.points, false)}
              {renderArrow(line.points, true)}
            </>
          )}
          {/* Render end point indicators for selected line */}
          {isSelected && controlPoints.map((point, index) => {
            const isEndPt = isEndPoint(index, line.points.length);
            return (
              <Circle
                key={`control-${line.id}-${index}`}
                id={`endpoint-${line.id}-${index}`}
                x={point.x}
                y={point.y}
                radius={isEndPt ? 8 : 4}
                fill={isEndPt ? '#4CAF50' : '#FF6B35'}
                stroke="white"
                strokeWidth={2}
                draggable={false}
                onMouseDown={(e) => {
                  if (isEndPt) {
                    e.cancelBubble = true;

                    setSelectedLineId(line.id);
                    setDraggedPointIndex(index);
                    setDragOffset({ x: 0, y: 0 });
                  }
                }}
              />
            );
          })}
        </React.Fragment>
      );
    });
  }, [lines, renderArrow, selectedLineId, pipeHover]);

  // Note: Connections are now rendered as lines in the line system
  // This maintains data relationships between snap points

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
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Stage 
        ref={stageRef}
        width={width} 
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {gridLines}
          {renderedLines}
          {drawingPreview}
          
          {/* Nearby snap point indicator */}
          {nearbySnapPoint && (
            <Circle
              x={nearbySnapPoint.x}
              y={nearbySnapPoint.y}
              radius={10}
              stroke="#FF9800"
              strokeWidth={3}
              fill="transparent"
            />
          )}
          
          {/* Snap point preview */}
          {addingSnapPoint.previewPos && (
            <Circle
              x={addingSnapPoint.previewPos.x}
              y={addingSnapPoint.previewPos.y}
              radius={8}
              fill="#87CEEB"
              stroke="#333"
              strokeWidth={2}
              opacity={0.7}
            />
          )}
          
          {/* Moving snap point preview */}
          {movingSnapPoint.previewPos && (
            <Circle
              x={movingSnapPoint.previewPos.x}
              y={movingSnapPoint.previewPos.y}
              radius={8}
              fill="#87CEEB"
              stroke="#FF9800"
              strokeWidth={3}
              opacity={0.8}
            />
          )}
          
          {/* Connection preview line with orthogonal path */}
          {connectingSnapPoint.previewLine && connectingSnapPoint.previewLine.orthogonalPoints && (
            <Line
              points={connectingSnapPoint.previewLine.orthogonalPoints}
              stroke="#FF6B35"
              strokeWidth={3}
              dash={[10, 5]}
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
            />
          )}
          
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              onDragEnd={updateNodePosition}
              onDragMove={updateNodePosition}
              onRightClick={handleNodeRightClick}
              onSnapPointRightClick={handleSnapPointRightClick}
              onSnapPointClick={handleSnapPointClick}
              movingSnapPointId={movingSnapPoint.snapPointId}
              connectingSnapPointId={connectingSnapPoint.snapPointId}
              isSelected={transformMode === node.id}
              onSelect={() => {}}
              onTransform={updateNodeTransform}
            />
          ))}
        </Layer>
      </Stage>
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'absolute',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            padding: '8px 0',
            minWidth: '120px'
          }}
        >
          {contextMenu.type === 'node' ? (
            <>
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #eee'
                }}
                onClick={handleAddSnapPointDirect}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
              >
                Add Snap Point
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={handleTransformMode}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
              >
                Transform
              </div>
        </>
          ) : (
            <>
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #eee'
                }}
                onClick={handleMoveSnapPoint}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
              >
                Move Snap
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={handleDeleteSnapPoint}
                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
              >
                Delete Snap
              </div>
            </>
          )}
        </div>
      )}

      
      {/* Move Mode Indicator */}
      {movingSnapPoint.nodeId && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FF9800',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000
          }}
        >
          Move to new position and click to place snap point
        </div>
      )}
      
      {/* Add Snap Point Mode Indicator */}
      {addingSnapPoint.nodeId && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000
          }}
        >
          Move to position and click to add snap point
        </div>
      )}
      
      {/* Connection Mode Indicator */}
      {connectingSnapPoint.snapPointId && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FF6B35',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000
          }}
        >
          Click on another snap point to create {selectedLineType || 'straight'} pipe connection
          {!selectedLineType && (
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
              Select a line type from left drawer for different pipe styles
            </div>
          )}
        </div>
      )}
      
      {/* Pipe Manipulation Mode Indicator */}
      {selectedLineId && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FF6B35',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000
          }}
        >
          {isDraggingPipe ? 'Moving entire pipe' : 
           draggedPointIndex !== null ? 'Extending pipe from end point' : 
           'Green circles = drag to extend • Click pipe body to move entire pipe'}
        </div>
      )}
      
      {/* Pipe Hover Indicator */}
      {pipeHover && !selectedLineId && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#2196F3',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 1000,
            opacity: 0.9
          }}
        >
          Click to select pipe for moving/extending
        </div>
      )}
      
    
    </div>
  );
};

export default Canvas;
