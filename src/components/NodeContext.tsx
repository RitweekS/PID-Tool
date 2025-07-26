'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  SnapPoint,
  Connection,
  Node,
  addSnapPointToNodes,
  removeSnapPointFromNodes,
  updateSnapPointInNodes,
  updateNodePositionInNodes,
  updateNodeSizeInNodes,
  addConnectionToConnections,
  removeConnectionFromConnections,
  removeConnectionsForSnapPoint,
  updateConnectionPaths
} from '../utils';

interface NodeContextType {
  nodes: Node[];
  connections: Connection[];
  addNode: (node: Node) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  updateNodeSize: (id: string, width: number, height: number) => void;
  updateNodeTransform: (id: string, attrs: any) => void;
  addSnapPoint: (nodeId: string, snapPoint: Omit<SnapPoint, 'id' | 'nodeId'>) => void;
  removeSnapPoint: (nodeId: string, snapPointId: string) => void;
  updateSnapPointPosition: (nodeId: string, snapPointId: string, x: number, y: number) => void;
  addConnection: (fromSnapId: string, toSnapId: string, points: number[]) => void;
  removeConnection: (connectionId: string) => void;
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
}

const NodeContext = createContext<NodeContextType | undefined>(undefined);

export const useNodeContext = () => {
  const context = useContext(NodeContext);
  if (!context) {
    throw new Error('useNodeContext must be used within a NodeProvider');
  }
  return context;
};

interface NodeProviderProps {
  children: ReactNode;
}

export const NodeProvider: React.FC<NodeProviderProps> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const addNode = (node: Node) => {
    setNodes(prev => [...prev, node]);
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    setNodes(prev => {
      const updatedNodes = updateNodePositionInNodes(prev, id, x, y);
      
      // Update connections when nodes move
      setConnections(currentConnections => updateConnectionPaths(currentConnections, updatedNodes));
      
      return updatedNodes;
    });
  };

  const updateNodeSize = (id: string, width: number, height: number) => {
    setNodes(prev => updateNodeSizeInNodes(prev, id, width, height));
  };

  const updateNodeTransform = (id: string, attrs: any) => {
    setNodes(prev => {
      const updatedNodes = prev.map(node => 
        node.id === id 
          ? { 
              ...node, 
              x: attrs.x, 
              y: attrs.y, 
              rotation: attrs.rotation,
              scaleX: attrs.scaleX,
              scaleY: attrs.scaleY,
              width: attrs.width,
              height: attrs.height
            } 
          : node
      );
      
      // Update connections when nodes transform
      setConnections(currentConnections => updateConnectionPaths(currentConnections, updatedNodes));
      
      return updatedNodes;
    });
  };

  const addSnapPoint = (nodeId: string, snapPoint: Omit<SnapPoint, 'id' | 'nodeId'>) => {
    setNodes(prev => addSnapPointToNodes(prev, nodeId, snapPoint));
  };

  const removeSnapPoint = (nodeId: string, snapPointId: string) => {
    // Remove connections associated with this snap point
    const connectionsToRemove = connections.filter(conn => 
      conn.fromSnapId === snapPointId || conn.toSnapId === snapPointId
    );
    
    setConnections(prev => removeConnectionsForSnapPoint(prev, snapPointId));
    setNodes(prev => removeSnapPointFromNodes(prev, nodeId, snapPointId));
    
    // Also remove associated pipe lines
    connectionsToRemove.forEach(conn => {
      const pipeLineId = `pipe-${conn.id}`;
      // This will be handled by the canvas component
    });
  };

  const updateSnapPointPosition = (nodeId: string, snapPointId: string, x: number, y: number) => {
    setNodes(prev => updateSnapPointInNodes(prev, nodeId, snapPointId, x, y));
  };

  const addConnection = (fromSnapId: string, toSnapId: string, points: number[]) => {
    setConnections(prev => addConnectionToConnections(prev, fromSnapId, toSnapId, points));
  };

  const removeConnection = (connectionId: string) => {
    setConnections(prev => removeConnectionFromConnections(prev, connectionId));
  };

  return (
    <NodeContext.Provider value={{
      nodes,
      connections,
      addNode,
      updateNodePosition,
      updateNodeSize,
      updateNodeTransform,
      addSnapPoint,
      removeSnapPoint,
      updateSnapPointPosition,
      addConnection,
      removeConnection,
      setConnections,
    }}>
      {children}
    </NodeContext.Provider>
  );
}; 