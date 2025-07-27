/**
 * Layer export/import utilities
 */

import React from 'react';
import { Layer } from '../components/LayerContext';
import { Node, Connection, getSnapPointWorldPosition, updateConnectionPaths } from './snapPointUtils';
import { Line } from '../components/LineContext';

export interface LayerExportData {
  version: string;
  layerInfo: {
    name: string;
    id: string;
    exportedAt: string;
  };
  nodes: Node[];
  lines: Line[];
  connections: Connection[];
  metadata: {
    totalNodes: number;
    totalLines: number;
    totalConnections: number;
  };
}

export interface ImportResult {
  success: boolean;
  error?: string;
  importedNodes: number;
  importedLines: number;
}

/**
 * Export a layer's design as JSON
 */
export const exportLayerAsJSON = (
  layer: Layer,
  allNodes: Node[],
  allLines: Line[],
  allConnections: Connection[]
): LayerExportData => {
  // Filter nodes that belong to this layer
  const layerNodes = allNodes.filter(node => layer.nodes.includes(node.id));
  
  // Filter lines that belong to this layer
  const layerLines = allLines.filter(line => layer.lines.includes(line.id));
  
  // Get all snap point IDs from layer nodes
  const layerSnapPointIds = new Set(
    layerNodes.flatMap(node => node.snapPoints.map(sp => sp.id))
  );
  
  // Filter connections that involve snap points from this layer's nodes
  const layerConnections = allConnections.filter(connection => 
    layerSnapPointIds.has(connection.fromSnapId) && 
    layerSnapPointIds.has(connection.toSnapId)
  );

  // Debug logging (can be removed in production)
  console.log('Export Debug:', {
    layerName: layer.name,
    totalNodes: layerNodes.length,
    totalLines: layerLines.length,
    totalConnections: layerConnections.length,
    allConnectionsCount: allConnections.length
  });

  return {
    version: '1.0.0',
    layerInfo: {
      name: layer.name,
      id: layer.id,
      exportedAt: new Date().toISOString(),
    },
    nodes: layerNodes,
    lines: layerLines,
    connections: layerConnections,
    metadata: {
      totalNodes: layerNodes.length,
      totalLines: layerLines.length,
      totalConnections: layerConnections.length,
    },
  };
};

/**
 * Generate new IDs for imported elements to avoid conflicts
 */
const generateNewId = (_originalId: string, type: 'node' | 'line' | 'snap' | 'conn'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${type}-imported-${timestamp}-${random}`;
};

/**
 * Import layer design from JSON
 */
export const importLayerFromJSON = (
  layerData: LayerExportData,
  targetLayerId: string,
  addNode: (node: Node) => void,
  addLine: (line: Line) => void,
  _addConnection: (fromSnapId: string, toSnapId: string, points: number[]) => void,
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>,
  addNodeToLayer: (layerId: string, nodeId: string) => void,
  addLineToLayer: (layerId: string, lineId: string) => void,
  getAllNodes: () => Node[]
): ImportResult => {
  try {
    // Validate the JSON structure
    if (!layerData.version || !layerData.nodes || !layerData.lines) {
      return {
        success: false,
        error: 'Invalid layer file format. Missing required fields.',
        importedNodes: 0,
        importedLines: 0,
      };
    }

    // Create mapping for old IDs to new IDs
    const nodeIdMap = new Map<string, string>();
    const snapPointIdMap = new Map<string, string>();
    const lineIdMap = new Map<string, string>();
    // Note: connectionIdMap could be used for more complex connection mapping if needed

    let importedNodes = 0;
    let importedLines = 0;

    // First pass: Import nodes with new IDs
    layerData.nodes.forEach(node => {
      const newNodeId = generateNewId(node.id, 'node');
      nodeIdMap.set(node.id, newNodeId);

      // Update snap point IDs and create mapping
      const updatedSnapPoints = node.snapPoints.map(snapPoint => {
        const newSnapPointId = generateNewId(snapPoint.id, 'snap');
        snapPointIdMap.set(snapPoint.id, newSnapPointId);
        
        return {
          ...snapPoint,
          id: newSnapPointId,
          nodeId: newNodeId,
        };
      });

      // Create the new node with updated IDs
      const newNode: Node = {
        ...node,
        id: newNodeId,
        snapPoints: updatedSnapPoints,
        // Offset position slightly to avoid overlapping with existing elements
        x: node.x + 50,
        y: node.y + 50,
      };

      // Add node to global context
      addNode(newNode);
      
      // Add node to the target layer
      addNodeToLayer(targetLayerId, newNodeId);
      importedNodes++;
    });

    // Second pass: Import non-pipe lines (pipe lines will be handled with connections)
    layerData.lines.forEach(line => {
      // Skip pipe lines - they'll be handled in the connection pass
      if (line.id.startsWith('pipe-') || line.connectionId) {
        return;
      }
      
      const newLineId = generateNewId(line.id, 'line');
      lineIdMap.set(line.id, newLineId);

      const newLine: Line = {
        ...line,
        id: newLineId,
        // Keep the same points for now - could be offset if needed
      };

      // Add line to global context
      addLine(newLine);

      // Add line to the target layer
      addLineToLayer(targetLayerId, newLineId);
      importedLines++;
    });

    // Third pass: Import connections with updated snap point references
    console.log('Import Debug:', {
      connectionsToImport: layerData.connections?.length || 0,
      snapPointIdMap: Object.fromEntries(snapPointIdMap),
      connections: layerData.connections
    });
    
    if (layerData.connections) {
      layerData.connections.forEach(connection => {
        const newFromSnapId = snapPointIdMap.get(connection.fromSnapId);
        const newToSnapId = snapPointIdMap.get(connection.toSnapId);
        
        if (newFromSnapId && newToSnapId) {
          // Generate new connection ID
          const newConnectionId = generateNewId(connection.id, 'conn');
          
          // Create the corresponding pipe line first (visual representation)
          const correspondingLine = layerData.lines.find(line => line.connectionId === connection.id);
          if (correspondingLine) {
            const newPipeLineId = `pipe-${newConnectionId}`;
            const newPipeLine: Line = {
              ...correspondingLine,
              id: newPipeLineId,
              connectionId: newConnectionId,
              // Update points to match connection
              points: connection.points
            };
            
            // Add the pipe line
            addLine(newPipeLine);
            addLineToLayer(targetLayerId, newPipeLineId);
            
            // Update our line mapping for consistency
            lineIdMap.set(correspondingLine.id, newPipeLineId);
            
            // Count this as an imported line
            importedLines++;
          }
          
          // Add the connection with updated snap point IDs and specific connection ID
          const newConnection: Connection = {
            id: newConnectionId,
            fromSnapId: newFromSnapId,
            toSnapId: newToSnapId,
            points: connection.points
          };
          
          setConnections(prev => [...prev, newConnection]);
        }
      });
    }

    // Fourth pass: Force update of connection paths after import
    // This ensures the connections are recalculated based on actual node positions
    setTimeout(() => {
      const currentNodes = getAllNodes();
      console.log('Force updating connections with nodes:', currentNodes.length);
      
      setConnections(currentConnections => {
        const updatedConnections = updateConnectionPaths(currentConnections, currentNodes);
        console.log('Updated connections:', updatedConnections);
        return updatedConnections;
      });
    }, 150); // Small delay to ensure nodes are fully rendered

    return {
      success: true,
      importedNodes,
      importedLines,
    };

  } catch (error) {
    console.error('Error importing layer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      importedNodes: 0,
      importedLines: 0,
    };
  }
};

/**
 * Validate layer export data structure
 */
export const validateLayerData = (data: any): data is LayerExportData => {
  return (
    data &&
    typeof data.version === 'string' &&
    data.layerInfo &&
    typeof data.layerInfo.name === 'string' &&
    Array.isArray(data.nodes) &&
    Array.isArray(data.lines) &&
    data.metadata &&
    typeof data.metadata.totalNodes === 'number'
  );
};