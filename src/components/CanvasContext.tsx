/**
 * Canvas Context to share stage reference across components
 */

import React, { createContext, useContext, ReactNode } from 'react';

interface CanvasContextType {
  stageRef: React.RefObject<any> | null;
  setStageRef: (ref: React.RefObject<any>) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
};

interface CanvasProviderProps {
  children: ReactNode;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [stageRef, setStageRefState] = React.useState<React.RefObject<any> | null>(null);

  const setStageRef = (ref: React.RefObject<any>) => {
    setStageRefState(ref);
  };

  return (
    <CanvasContext.Provider value={{
      stageRef,
      setStageRef,
    }}>
      {children}
    </CanvasContext.Provider>
  );
};