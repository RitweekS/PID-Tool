'use client';
import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import {
  SnapPoint,
  Connection,
  Node,
  addSnapPointToNodes,
  removeSnapPointFromNodes,
  updateSnapPointInNodes,
  updateNodePositionInNodes,
  updateNodeSizeInNodes,
  updateNodeTransformInNodes,
  addConnectionToConnections,
  removeConnectionFromConnections,
  removeConnectionsForSnapPoint,
  updateConnectionPaths,
  recalculateSnapPointsAfterTransform
} from '../utils';

interface NodeContextType {
  nodes: Node[];
  connections: Connection[];
  addNode: (node: Node) => void;
  deleteNode: (nodeId: string) => void;
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
  const [nodeUpdateTrigger, setNodeUpdateTrigger] = useState(0);
  const nodesRef = useRef<Node[]>([]);

  // Keep nodesRef in sync with nodes state
  React.useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Update connections when nodes change position/transform
  React.useEffect(() => {
    if (nodeUpdateTrigger > 0) {
      setConnections(currentConnections => updateConnectionPaths(currentConnections, nodesRef.current));
    }
  }, [nodeUpdateTrigger]);

  const addNode = (node: Node) => {
    setNodes(prev => [...prev, node]);
  };

  const deleteNode = (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (nodeToDelete && nodeToDelete.snapPoints) {
      // Remove all connections related to this node's snap points
      nodeToDelete.snapPoints.forEach(snapPoint => {
        setConnections(prev => prev.filter(conn => 
          conn.fromSnapId !== snapPoint.id && conn.toSnapId !== snapPoint.id
        ));
      });
    }
    // Remove the node
    setNodes(prev => prev.filter(n => n.id !== nodeId));
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    setNodes(prev => updateNodePositionInNodes(prev, id, x, y));
    setNodeUpdateTrigger(prev => prev + 1);
  };

  const updateNodeSize = (id: string, width: number, height: number) => {
    setNodes(prev => updateNodeSizeInNodes(prev, id, width, height));
  };

  const updateNodeTransform = (id: string, attrs: any) => {
    setNodes(prev => {
      const targetNode = prev.find(node => node.id === id);
      if (!targetNode) return prev;
      
      // Store original dimensions for snap point recalculation
      const originalWidth = targetNode.width || 120;
      const originalHeight = targetNode.height || 120;
      
      const updatedNodes = updateNodeTransformInNodes(prev, id, {
        x: attrs.x,
        y: attrs.y,
        rotation: attrs.rotation,
        scaleX: attrs.scaleX,
        scaleY: attrs.scaleY,
        width: attrs.width,
        height: attrs.height
      });
      
      // Recalculate snap points if dimensions changed
      const finalNodes = updatedNodes.map(node => {
        if (node.id === id && (attrs.width !== originalWidth || attrs.height !== originalHeight)) {
          return recalculateSnapPointsAfterTransform(node, originalWidth, originalHeight);
        }
        return node;
      });
      
      setNodeUpdateTrigger(prev => prev + 1);
      
      return finalNodes;
    });
  };

  const addSnapPoint = (nodeId: string, snapPoint: Omit<SnapPoint, 'id' | 'nodeId'>) => {
    setNodes(prev => addSnapPointToNodes(prev, nodeId, snapPoint));
  };

  const removeSnapPoint = (nodeId: string, snapPointId: string) => {
    setConnections(prev => removeConnectionsForSnapPoint(prev, snapPointId));
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
      deleteNode,
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