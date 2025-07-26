/**
 * Hook that demonstrates using centralized snap point utils
 * Can be used anywhere in the application for snap point operations
 */

'use client';
import { useCallback } from 'react';
import { useNodeContext } from '../components/NodeContext';
import {
  SnapPoint,
  Connection,
  Node,
  getSnapPointWorldPosition,
  getSnapPointsNear,
  getComponentBounds,
  isPositionWithinBounds,
  getAllSnapPoints,
  findNodeBySnapPointId,
  addSnapPointToNodes,
  removeSnapPointFromNodes,
  updateSnapPointInNodes,
  updateNodePositionInNodes,
  addConnectionToConnections,
  removeConnectionsForSnapPoint
} from '../utils';

export const useSnapPointUtils = () => {
  const { nodes, connections } = useNodeContext();

  // Get all snap points across all nodes
  const getAllSnapPointsFromNodes = useCallback((): SnapPoint[] => {
    return getAllSnapPoints(nodes);
  }, [nodes]);

  // Find which node contains a specific snap point
  const findNodeContainingSnapPoint = useCallback((snapPointId: string): Node | null => {
    return findNodeBySnapPointId(nodes, snapPointId);
  }, [nodes]);

  // Get world position of any snap point
  const getWorldPosition = useCallback((snapPointId: string) => {
    return getSnapPointWorldPosition(nodes, snapPointId);
  }, [nodes]);

  // Find nearby snap points
  const findNearbySnapPoints = useCallback((x: number, y: number, radius: number = 20) => {
    return getSnapPointsNear(nodes, x, y, radius);
  }, [nodes]);

  // Check if position is within a component's bounds
  const isWithinComponentBounds = useCallback((nodeId: string, position: { x: number; y: number }): boolean => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return false;
    
    const bounds = getComponentBounds(node);
    return isPositionWithinBounds(position, bounds);
  }, [nodes]);

  // Get component bounds for any node
  const getNodeBounds = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? getComponentBounds(node) : null;
  }, [nodes]);

  // Check if two snap points are connected
  const areSnapPointsConnected = useCallback((snapPoint1Id: string, snapPoint2Id: string): boolean => {
    return connections.some(conn => 
      (conn.fromSnapId === snapPoint1Id && conn.toSnapId === snapPoint2Id) ||
      (conn.fromSnapId === snapPoint2Id && conn.toSnapId === snapPoint1Id)
    );
  }, [connections]);

  // Get all connections for a specific snap point
  const getConnectionsForSnapPoint = useCallback((snapPointId: string): Connection[] => {
    return connections.filter(conn => 
      conn.fromSnapId === snapPointId || conn.toSnapId === snapPointId
    );
  }, [connections]);

  // Calculate distance between two points
  const calculateDistance = useCallback((point1: { x: number; y: number }, point2: { x: number; y: number }): number => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }, []);

  // Get snap points within a specific area/rectangle
  const getSnapPointsInArea = useCallback((
    topLeft: { x: number; y: number },
    bottomRight: { x: number; y: number }
  ): Array<{ snapPoint: SnapPoint; worldPos: { x: number; y: number } }> => {
    const snapPointsInArea: Array<{ snapPoint: SnapPoint; worldPos: { x: number; y: number } }> = [];
    
    for (const node of nodes) {
      for (const snapPoint of node.snapPoints) {
        const worldPos = {
          x: node.x + snapPoint.x,
          y: node.y + snapPoint.y
        };
        
        if (worldPos.x >= topLeft.x && worldPos.x <= bottomRight.x &&
            worldPos.y >= topLeft.y && worldPos.y <= bottomRight.y) {
          snapPointsInArea.push({ snapPoint, worldPos });
        }
      }
    }
    
    return snapPointsInArea;
  }, [nodes]);

  // Direct state manipulation functions (can be used without NodeContext)
  const directAddSnapPoint = useCallback((
    nodes: Node[], 
    nodeId: string, 
    snapPoint: Omit<SnapPoint, 'id' | 'nodeId'>
  ): Node[] => {
    return addSnapPointToNodes(nodes, nodeId, snapPoint);
  }, []);

  const directRemoveSnapPoint = useCallback((
    nodes: Node[], 
    connections: Connection[], 
    nodeId: string, 
    snapPointId: string
  ): { nodes: Node[]; connections: Connection[] } => {
    return {
      nodes: removeSnapPointFromNodes(nodes, nodeId, snapPointId),
      connections: removeConnectionsForSnapPoint(connections, snapPointId)
    };
  }, []);

  const directUpdateSnapPoint = useCallback((
    nodes: Node[], 
    nodeId: string, 
    snapPointId: string, 
    x: number, 
    y: number
  ): Node[] => {
    return updateSnapPointInNodes(nodes, nodeId, snapPointId, x, y);
  }, []);

  const directUpdateNodePosition = useCallback((
    nodes: Node[], 
    nodeId: string, 
    x: number, 
    y: number
  ): Node[] => {
    return updateNodePositionInNodes(nodes, nodeId, x, y);
  }, []);

  const directAddConnection = useCallback((
    connections: Connection[], 
    fromSnapId: string, 
    toSnapId: string, 
    points: number[]
  ): Connection[] => {
    return addConnectionToConnections(connections, fromSnapId, toSnapId, points);
  }, []);

  return {
    // Data access
    nodes,
    connections,
    
    // Utility functions (read-only)
    getAllSnapPointsFromNodes,
    findNodeContainingSnapPoint,
    getWorldPosition,
    findNearbySnapPoints,
    isWithinComponentBounds,
    getNodeBounds,
    areSnapPointsConnected,
    getConnectionsForSnapPoint,
    calculateDistance,
    getSnapPointsInArea,

    // Direct manipulation functions (pure functions)
    directAddSnapPoint,
    directRemoveSnapPoint,
    directUpdateSnapPoint,
    directUpdateNodePosition,
    directAddConnection
  };
};