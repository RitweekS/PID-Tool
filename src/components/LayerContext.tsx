'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 1
  nodes: string[]; // Array of node IDs that belong to this layer
  lines: string[]; // Array of line IDs that belong to this layer
  createdAt: Date;
}

interface LayerContextType {
  layers: Layer[];
  activeLayerId: string | null;
  addLayer: (name?: string) => void;
  deleteLayer: (layerId: string, onDeleteNodes?: (nodeIds: string[]) => void, onDeleteLines?: (lineIds: string[]) => void) => void;
  mergeLayers: (layerIds: string[], newLayerName: string) => void;
  renameLayer: (layerId: string, newName: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setActiveLayer: (layerId: string | null) => void;
  addNodeToLayer: (layerId: string, nodeId: string) => void;
  removeNodeFromLayer: (layerId: string, nodeId: string) => void;
  addLineToLayer: (layerId: string, lineId: string) => void;
  removeLineFromLayer: (layerId: string, lineId: string) => void;
  getLayerById: (layerId: string) => Layer | undefined;
  getActiveLayer: () => Layer | undefined;
  getLayerElements: (layerId: string) => { nodes: string[], lines: string[] };
}

const LayerContext = createContext<LayerContextType | undefined>(undefined);

export const useLayerContext = () => {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error('useLayerContext must be used within a LayerProvider');
  }
  return context;
};

interface LayerProviderProps {
  children: ReactNode;
}

export const LayerProvider: React.FC<LayerProviderProps> = ({ children }) => {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'default-layer',
      name: 'Default Layer',
      visible: true,
      locked: false,
      opacity: 1,
      nodes: [],
      lines: [],
      createdAt: new Date(),
    }
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>('default-layer');

  const addLayer = (name?: string) => {
    const layerName = name || `Layer ${layers.length + 1}`;
    const newLayer: Layer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name: layerName,
      visible: true,
      locked: false,
      opacity: 1,
      nodes: [],
      lines: [],
      createdAt: new Date(),
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const deleteLayer = (layerId: string, onDeleteNodes?: (nodeIds: string[]) => void, onDeleteLines?: (lineIds: string[]) => void) => {
    // Don't allow deletion if this is the last layer
    if (layers.length <= 1) {
      return;
    }
    
    // Get the layer to be deleted
    const layerToDelete = getLayerById(layerId);
    if (!layerToDelete) return;
    
    // Call cleanup functions to delete associated elements
    if (onDeleteNodes && layerToDelete.nodes.length > 0) {
      onDeleteNodes(layerToDelete.nodes);
    }
    
    if (onDeleteLines && layerToDelete.lines.length > 0) {
      onDeleteLines(layerToDelete.lines);
    }
    
    setLayers(prev => {
      const updatedLayers = prev.filter(layer => layer.id !== layerId);
      
      // If we're deleting the active layer, switch to the first available layer
      if (activeLayerId === layerId) {
        if (updatedLayers.length > 0) {
          setActiveLayerId(updatedLayers[0].id);
        }
      }
      
      return updatedLayers;
    });
  };

  const mergeLayers = (layerIds: string[], newLayerName: string) => {
    if (layerIds.length < 2) return;

    const nodesToMerge: string[] = [];
    const linesToMerge: string[] = [];

    // Collect all nodes and lines from layers to be merged
    layerIds.forEach(layerId => {
      const layer = getLayerById(layerId);
      if (layer) {
        nodesToMerge.push(...layer.nodes);
        linesToMerge.push(...layer.lines);
      }
    });

    const newLayerId = `merged-layer-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newLayer: Layer = {
      id: newLayerId,
      name: newLayerName,
      visible: true,
      locked: false,
      opacity: 1,
      nodes: nodesToMerge,
      lines: linesToMerge,
      createdAt: new Date(),
    };

    // Add new merged layer and remove old layers
    setLayers(prev => {
      const updatedLayers = prev.filter(layer => !layerIds.includes(layer.id));
      
      // If we're merging the active layer, switch to the new merged layer
      if (activeLayerId && layerIds.includes(activeLayerId)) {
        setActiveLayerId(newLayerId);
      }
      
      return [...updatedLayers, newLayer];
    });
  };

  const renameLayer = (layerId: string, newName: string) => {
    if (!newName.trim()) return;
    
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, name: newName.trim() } : layer
    ));
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const toggleLayerLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const setLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity: Math.max(0, Math.min(1, opacity)) } : layer
    ));
  };

  const setActiveLayer = (layerId: string | null) => {
    setActiveLayerId(layerId || 'default-layer');
  };

  const addNodeToLayer = (layerId: string, nodeId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, nodes: [...layer.nodes, nodeId] }
        : layer
    ));
  };

  const removeNodeFromLayer = (layerId: string, nodeId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, nodes: layer.nodes.filter(id => id !== nodeId) }
        : layer
    ));
  };

  const addLineToLayer = (layerId: string, lineId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, lines: [...layer.lines, lineId] }
        : layer
    ));
  };

  const removeLineFromLayer = (layerId: string, lineId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, lines: layer.lines.filter(id => id !== lineId) }
        : layer
    ));
  };

  const getLayerById = (layerId: string) => {
    return layers.find(layer => layer.id === layerId);
  };

  const getActiveLayer = () => {
    return layers.find(layer => layer.id === activeLayerId);
  };

  const getLayerElements = (layerId: string) => {
    const layer = getLayerById(layerId);
    if (!layer) {
      return { nodes: [], lines: [] };
    }
    return { nodes: layer.nodes, lines: layer.lines };
  };

  return (
    <LayerContext.Provider value={{
      layers,
      activeLayerId,
      addLayer,
      deleteLayer,
      mergeLayers,
      renameLayer,
      toggleLayerVisibility,
      toggleLayerLock,
      setLayerOpacity,
      setActiveLayer,
      addNodeToLayer,
      removeNodeFromLayer,
      addLineToLayer,
      removeLineFromLayer,
      getLayerById,
      getActiveLayer,
      getLayerElements,
    }}>
      {children}
    </LayerContext.Provider>
  );
}; 