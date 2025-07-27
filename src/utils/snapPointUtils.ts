/**
 * Centralized Snap Point Utilities
 * Single source of truth for all snap point operations
 */

export interface SnapPoint {
  id: string;
  nodeId: string;
  x: number; // relative to node center
  y: number; // relative to node center
  type: 'input' | 'output';
}

export interface Connection {
  id: string;
  fromSnapId: string;
  toSnapId: string;
  points: number[];
}

export interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
  svgPath: string;
  snapPoints: SnapPoint[];
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  // Image node specific properties
  isImageNode?: boolean;
  originalFileName?: string;
  fileType?: string;
}

/**
 * Generate unique ID for snap points and connections
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Create a new snap point
 */
export const createSnapPoint = (nodeId: string, x: number, y: number, type: SnapPoint['type'] = 'output'): SnapPoint => {
  return {
    id: generateId('snap'),
    nodeId,
    x,
    y,
    type
  };
};

/**
 * Add snap point to a node
 */
export const addSnapPointToNode = (node: Node, snapPoint: Omit<SnapPoint, 'id' | 'nodeId'>): Node => {
  const newSnapPoint = createSnapPoint(node.id, snapPoint.x, snapPoint.y, snapPoint.type);
  return {
    ...node,
    snapPoints: [...node.snapPoints, newSnapPoint]
  };
};

/**
 * Remove snap point from a node
 */
export const removeSnapPointFromNode = (node: Node, snapPointId: string): Node => {
  return {
    ...node,
    snapPoints: node.snapPoints.filter(snap => snap.id !== snapPointId)
  };
};

/**
 * Update snap point position in a node
 */
export const updateSnapPointInNode = (node: Node, snapPointId: string, x: number, y: number): Node => {
  return {
    ...node,
    snapPoints: node.snapPoints.map(snap => 
      snap.id === snapPointId 
        ? { ...snap, x: x - node.x, y: y - node.y } // Convert world to relative position
        : snap
    )
  };
};

/**
 * Get snap point world position
 */
export const getSnapPointWorldPosition = (nodes: Node[], snapPointId: string): { x: number; y: number } | null => {
  for (const node of nodes) {
    const snapPoint = node.snapPoints.find(sp => sp.id === snapPointId);
    if (snapPoint) {
      // Apply transformations
      const cos = Math.cos((node.rotation || 0) * Math.PI / 180);
      const sin = Math.sin((node.rotation || 0) * Math.PI / 180);
      const scaleX = node.scaleX || 1;
      const scaleY = node.scaleY || 1;
      
      const scaledX = snapPoint.x * scaleX;
      const scaledY = snapPoint.y * scaleY;
      const rotatedX = scaledX * cos - scaledY * sin;
      const rotatedY = scaledX * sin + scaledY * cos;
      
      return {
        x: node.x + rotatedX,
        y: node.y + rotatedY
      };
    }
  }
  return null;
};

/**
 * Find snap points near a given position
 */
export const getSnapPointsNear = (
  nodes: Node[], 
  x: number, 
  y: number, 
  radius: number = 20
): { snapPoint: SnapPoint; worldPos: { x: number; y: number }; distance: number }[] => {
  const nearbySnapPoints: { snapPoint: SnapPoint; worldPos: { x: number; y: number }; distance: number }[] = [];
  
  for (const node of nodes) {
    for (const snapPoint of node.snapPoints) {
      // Apply transformations
      const cos = Math.cos((node.rotation || 0) * Math.PI / 180);
      const sin = Math.sin((node.rotation || 0) * Math.PI / 180);
      const scaleX = node.scaleX || 1;
      const scaleY = node.scaleY || 1;
      
      const scaledX = snapPoint.x * scaleX;
      const scaledY = snapPoint.y * scaleY;
      const rotatedX = scaledX * cos - scaledY * sin;
      const rotatedY = scaledX * sin + scaledY * cos;
      
      const worldPos = {
        x: node.x + rotatedX,
        y: node.y + rotatedY
      };
      
      const distance = Math.sqrt(
        Math.pow(worldPos.x - x, 2) + Math.pow(worldPos.y - y, 2)
      );
      
      if (distance <= radius) {
        nearbySnapPoints.push({ snapPoint, worldPos, distance });
      }
    }
  }
  
  return nearbySnapPoints.sort((a, b) => a.distance - b.distance);
};

/**
 * Create a connection between two snap points
 */
export const createConnection = (fromSnapId: string, toSnapId: string, points: number[]): Connection => {
  return {
    id: generateId('conn'),
    fromSnapId,
    toSnapId,
    points
  };
};

/**
 * Remove connections associated with a snap point
 */
export const removeConnectionsForSnapPoint = (connections: Connection[], snapPointId: string): Connection[] => {
  return connections.filter(conn => 
    conn.fromSnapId !== snapPointId && conn.toSnapId !== snapPointId
  );
};

/**
 * Get all snap points from all nodes
 */
export const getAllSnapPoints = (nodes: Node[]): SnapPoint[] => {
  return nodes.flatMap(node => node.snapPoints);
};

/**
 * Find node containing a specific snap point
 */
export const findNodeBySnapPointId = (nodes: Node[], snapPointId: string): Node | null => {
  return nodes.find(node => 
    node.snapPoints.some(sp => sp.id === snapPointId)
  ) || null;
};

/**
 * Calculate component bounds for snap point validation
 */
export const getComponentBounds = (node: Node, baseSize: number = 120, padding: number = 10) => {
  // Use actual node dimensions if available, otherwise use base size
  const width = node.width || baseSize;
  const height = node.height || baseSize;
  
  const halfWidth = width / 2 + padding;
  const halfHeight = height / 2 + padding;
  
  return {
    left: node.x - halfWidth,
    right: node.x + halfWidth,
    top: node.y - halfHeight,
    bottom: node.y + halfHeight
  };
};

/**
 * Check if position is within component bounds
 */
export const isPositionWithinBounds = (
  pos: { x: number; y: number }, 
  bounds: { left: number; right: number; top: number; bottom: number }
): boolean => {
  return pos.x >= bounds.left && 
         pos.x <= bounds.right &&
         pos.y >= bounds.top && 
         pos.y <= bounds.bottom;
};

/**
 * State management functions for complete operations
 */

/**
 * Add snap point to nodes array - returns updated nodes array
 */
export const addSnapPointToNodes = (
  nodes: Node[], 
  nodeId: string, 
  snapPoint: Omit<SnapPoint, 'id' | 'nodeId'>
): Node[] => {
  return nodes.map(node => 
    node.id === nodeId ? addSnapPointToNode(node, snapPoint) : node
  );
};

/**
 * Remove snap point from nodes array - returns updated nodes array
 */
export const removeSnapPointFromNodes = (
  nodes: Node[], 
  nodeId: string, 
  snapPointId: string
): Node[] => {
  return nodes.map(node => 
    node.id === nodeId ? removeSnapPointFromNode(node, snapPointId) : node
  );
};

/**
 * Update snap point position in nodes array - returns updated nodes array
 */
export const updateSnapPointInNodes = (
  nodes: Node[], 
  nodeId: string, 
  snapPointId: string, 
  x: number, 
  y: number
): Node[] => {
  return nodes.map(node => 
    node.id === nodeId ? updateSnapPointInNode(node, snapPointId, x, y) : node
  );
};

/**
 * Update node position in nodes array - returns updated nodes array
 */
export const updateNodePositionInNodes = (
  nodes: Node[], 
  nodeId: string, 
  x: number, 
  y: number
): Node[] => {
  return nodes.map(node => 
    node.id === nodeId ? { ...node, x, y } : node
  );
};

/**
 * Update node size in nodes array - returns updated nodes array
 */
export const updateNodeSizeInNodes = (
  nodes: Node[], 
  nodeId: string, 
  width: number, 
  height: number
): Node[] => {
  return nodes.map(node => 
    node.id === nodeId ? { ...node, width, height } : node
  );
};

/**
 * Update node transform properties in nodes array - returns updated nodes array
 */
export const updateNodeTransformInNodes = (
  nodes: Node[], 
  nodeId: string, 
  transform: Partial<Pick<Node, 'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY' | 'width' | 'height'>>
): Node[] => {
  return nodes.map(node => 
    node.id === nodeId ? { ...node, ...transform } : node
  );
};

/**
 * Recalculate snap point positions after node transform
 */
export const recalculateSnapPointsAfterTransform = (
  node: Node,
  originalWidth: number,
  originalHeight: number
): Node => {
  if (!node.width || !node.height || !originalWidth || !originalHeight) {
    return node; // No recalculation needed if dimensions are missing
  }
  
  const widthRatio = node.width / originalWidth;
  const heightRatio = node.height / originalHeight;
  
  return {
    ...node,
    snapPoints: node.snapPoints.map(snap => ({
      ...snap,
      x: snap.x * widthRatio,
      y: snap.y * heightRatio
    }))
  };
};

/**
 * Add connection to connections array - returns updated connections array
 */
export const addConnectionToConnections = (
  connections: Connection[], 
  fromSnapId: string, 
  toSnapId: string, 
  points: number[]
): Connection[] => {
  const newConnection = createConnection(fromSnapId, toSnapId, points);
  return [...connections, newConnection];
};

/**
 * Remove connection from connections array - returns updated connections array
 */
export const removeConnectionFromConnections = (
  connections: Connection[], 
  connectionId: string
): Connection[] => {
  return connections.filter(conn => conn.id !== connectionId);
};

/**
 * Update connection paths when nodes move
 */
export const updateConnectionPaths = (
  connections: Connection[],
  nodes: Node[]
): Connection[] => {
  return connections.map(connection => {
    // Find the snap points for this connection
    const fromSnapPoint = getAllSnapPoints(nodes).find(sp => sp.id === connection.fromSnapId);
    const toSnapPoint = getAllSnapPoints(nodes).find(sp => sp.id === connection.toSnapId);
    
    if (!fromSnapPoint || !toSnapPoint) {
      return connection; // Keep original if snap points not found
    }
    
    // Get world positions of the snap points
    const fromPos = getSnapPointWorldPosition(nodes, fromSnapPoint.id);
    const toPos = getSnapPointWorldPosition(nodes, toSnapPoint.id);
    
    if (!fromPos || !toPos) {
      return connection; // Keep original if positions not found
    }
    
    // Create new orthogonal path
    const newPath = createOrthogonalPath(fromPos, toPos);
    
    return {
      ...connection,
      points: newPath
    };
  });
};

/**
 * Create orthogonal path between two points (same logic as in canvas)
 */
const createOrthogonalPath = (from: { x: number; y: number }, to: { x: number; y: number }): number[] => {
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
  
  // Create L-shaped path: horizontal first, then vertical (simpler and more predictable)
  return [
    from.x, from.y,    // Start point
    to.x, from.y,      // Horizontal to target X
    to.x, to.y         // Vertical to target Y
  ];
};

/**
 * Update line paths for pipe connections when nodes move or transform
 */
export const updatePipeLines = (
  lines: any[],
  connections: Connection[],
  nodes: Node[]
): any[] => {
  return lines.map(line => {
    // Check if this line is a pipe connection (starts with 'pipe-')
    if (line.id.startsWith('pipe-')) {
      // Extract connection ID from pipe line ID
      const connectionId = line.id.replace('pipe-', '');
      const connection = connections.find(conn => conn.id === connectionId);
      
      if (connection) {
        // Update the line with the new connection path
        return {
          ...line,
          points: connection.points
        };
      }
    }
    
    return line; // Keep non-pipe lines unchanged
  });
};