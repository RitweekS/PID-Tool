'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Line {
  id: string;
  type: 'straight' | 'single-arrow' | 'double-arrow' | 'dashed';
  points: number[];
  stroke: string;
  strokeWidth: number;
  dashPattern?: number[];
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
    }}>
      {children}
    </LineContext.Provider>
  );
}; 