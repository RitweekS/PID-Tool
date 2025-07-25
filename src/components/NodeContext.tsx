'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
  svgPath: string;
}

interface NodeContextType {
  nodes: Node[];
  addNode: (node: Node) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  draggedNodeType: string | null;
  setDraggedNodeType: (type: string | null) => void;
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
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);

  const addNode = (node: Node) => {
    setNodes(prev => [...prev, node]);
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, x, y } : node
    ));
  };

  return (
    <NodeContext.Provider value={{
      nodes,
      addNode,
      updateNodePosition,
      isDragging,
      setIsDragging,
      draggedNodeType,
      setDraggedNodeType,
    }}>
      {children}
    </NodeContext.Provider>
  );
}; 