'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Line {
  id: string;
  type: 'straight' | 'single-arrow' | 'double-arrow' | 'dashed';
  points: number[];
  stroke: string;
  strokeWidth: number;
  dashPattern?: number[];
  connectionId?: string;
}

interface LineContextType {
  lines: Line[];
  addLine: (line: Line) => void;
  updateLine: (id: string, line: Partial<Line>) => void;
  deleteLine: (id: string) => void;
  selectedLineType: string | null;
  setSelectedLineType: (type: string | null) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  selectedLineId: string | null;
  setSelectedLineId: (id: string | null) => void;
  movingLineId: string | null;
  setMovingLineId: (id: string | null) => void;
}

const LineContext = createContext<LineContextType | undefined>(undefined);

export const useLineContext = () => {
  const context = useContext(LineContext);
  if (!context) {
    throw new Error('useLineContext must be used within a LineProvider');
  }
  return context;
};

interface LineProviderProps {
  children: ReactNode;
}

export const LineProvider: React.FC<LineProviderProps> = ({ children }) => {
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedLineType, setSelectedLineType] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [movingLineId, setMovingLineId] = useState<string | null>(null);

  const addLine = (line: Line) => {
    setLines(prev => [...prev, line]);
  };

  const updateLine = (id: string, line: Partial<Line>) => {
    setLines(prev => prev.map(l => 
      l.id === id ? { ...l, ...line } : l
    ));
  };

  const deleteLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  return (
    <LineContext.Provider value={{
      lines,
      addLine,
      updateLine,
      deleteLine,
      selectedLineType,
      setSelectedLineType,
      isDrawing,
      setIsDrawing,
      selectedLineId,
      setSelectedLineId,
      movingLineId,
      setMovingLineId,
    }}>
      {children}
    </LineContext.Provider>
  );
}; 