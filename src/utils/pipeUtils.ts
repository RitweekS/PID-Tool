// Utility functions for pipe manipulation

export const getDistanceToLine = (point: { x: number; y: number }, linePoints: number[]): number => {
  if (linePoints.length < 4) return Infinity;
  
  let minDistance = Infinity;
  
  // Check distance to each line segment
  for (let i = 0; i < linePoints.length - 2; i += 2) {
    const x1 = linePoints[i];
    const y1 = linePoints[i + 1];
    const x2 = linePoints[i + 2];
    const y2 = linePoints[i + 3];
    
    const distance = getDistanceToLineSegment(point, { x: x1, y: y1 }, { x: x2, y: y2 });
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance;
};

export const getDistanceToLineSegment = (
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    // Line segment is a point
    return Math.sqrt(A * A + B * B);
  }
  
  let param = dot / lenSq;
  
  let xx, yy;
  
  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }
  
  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

export const findNearestLineSegment = (point: { x: number; y: number }, linePoints: number[]): {
  segmentIndex: number;
  insertIndex: number;
  distance: number;
} | null => {
  if (linePoints.length < 4) return null;
  
  let minDistance = Infinity;
  let nearestSegment = -1;
  
  for (let i = 0; i < linePoints.length - 2; i += 2) {
    const x1 = linePoints[i];
    const y1 = linePoints[i + 1];
    const x2 = linePoints[i + 2];
    const y2 = linePoints[i + 3];
    
    const distance = getDistanceToLineSegment(point, { x: x1, y: y1 }, { x: x2, y: y2 });
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestSegment = i;
    }
  }
  
  return nearestSegment >= 0 ? {
    segmentIndex: nearestSegment / 2,
    insertIndex: nearestSegment + 2,
    distance: minDistance
  } : null;
};

export const insertPointInPipe = (linePoints: number[], insertIndex: number, point: { x: number; y: number }): number[] => {
  const newPoints = [...linePoints];
  newPoints.splice(insertIndex, 0, point.x, point.y);
  return newPoints;
};

export const movePipePoint = (linePoints: number[], pointIndex: number, newPosition: { x: number; y: number }): number[] => {
  const newPoints = [...linePoints];
  newPoints[pointIndex * 2] = newPosition.x;
  newPoints[pointIndex * 2 + 1] = newPosition.y;
  return newPoints;
};

export const getPipeControlPoints = (linePoints: number[]): { x: number; y: number; index: number }[] => {
  const points = [];
  for (let i = 0; i < linePoints.length; i += 2) {
    points.push({
      x: linePoints[i],
      y: linePoints[i + 1],
      index: i / 2
    });
  }
  return points;
};

export const movePipe = (linePoints: number[], deltaX: number, deltaY: number): number[] => {
  const newPoints = [];
  for (let i = 0; i < linePoints.length; i += 2) {
    newPoints.push(linePoints[i] + deltaX);
    newPoints.push(linePoints[i + 1] + deltaY);
  }
  return newPoints;
};

export const isEndPoint = (pointIndex: number, totalPoints: number): boolean => {
  return pointIndex === 0 || pointIndex === (totalPoints / 2) - 1;
};