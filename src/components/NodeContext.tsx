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

  const addSnapPoint = (nodeId: string, snapPoint: Omit<SnapPoint, 'id' | 'nodeId'>) => {
    setNodes(prev => addSnapPointToNodes(prev, nodeId, snapPoint));
  };

  const removeSnapPoint = (nodeId: string, snapPointId: string) => {
    // Remove connections associated with this snap point
    setConnections(prev => removeConnectionsForSnapPoint(prev, snapPointId));
    // Remove the snap point
    setNodes(prev => removeSnapPointFromNodes(prev, nodeId, snapPointId));
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