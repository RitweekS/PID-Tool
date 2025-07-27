/**
 * Simplified image export/import utilities for layers
 */

import { Layer } from '../components/LayerContext';
import { Node } from './snapPointUtils';
import { Line } from '../components/LineContext';

export interface ImageImportResult {
  success: boolean;
  error?: string;
  imageUrl?: string;
  dimensions?: { width: number; height: number };
}

/**
 * Simple PNG export function
 */
export const exportLayerAsPNG = async (
  layer: Layer,
  allNodes: Node[],
  allLines: Line[],
  stageRef: any
): Promise<void> => {
  await exportLayerAsImage(layer, allNodes, allLines, stageRef, 'png');
};

/**
 * Simple SVG export function
 */
export const exportLayerAsSVG = async (
  layer: Layer,
  allNodes: Node[],
  allLines: Line[],
  stageRef: any
): Promise<void> => {
  await exportLayerAsImage(layer, allNodes, allLines, stageRef, 'svg');
};

/**
 * Simplified export layer as image - PNG or SVG only with white background
 */
const exportLayerAsImage = async (
  layer: Layer,
  allNodes: Node[],
  allLines: Line[],
  stageRef: any,
  format: 'png' | 'svg'
): Promise<void> => {
  try {
    if (!stageRef?.current) {
      throw new Error('Canvas not available for export.');
    }

    const stage = stageRef.current;
    
    // Filter layer elements
    const layerNodes = allNodes.filter(node => layer.nodes.includes(node.id));
    const layerLines = allLines.filter(line => layer.lines.includes(line.id));

    // Calculate bounds of layer content
    const bounds = calculateLayerBounds(layerNodes, layerLines);
    
    if (!bounds) {
      throw new Error(`No content to export in layer "${layer.name}".`);
    }

    // Add padding
    const padding = 50;
    const exportBounds = {
      x: bounds.x - padding,
      y: bounds.y - padding,
      width: bounds.width + (padding * 2),
      height: bounds.height + (padding * 2)
    };

    // Store original visibility to restore later
    const originalVisibility = new Map();
    
    // Hide all non-layer elements
    allNodes.forEach(node => {
      if (!layer.nodes.includes(node.id)) {
        const nodeElement = stage.find(`#${node.id}`)[0];
        if (nodeElement) {
          originalVisibility.set(node.id, nodeElement.visible());
          nodeElement.visible(false);
        }
      }
    });
    
    allLines.forEach(line => {
      if (!layer.lines.includes(line.id)) {
        const lineElement = stage.find(`#${line.id}`)[0];
        if (lineElement) {
          originalVisibility.set(line.id, lineElement.visible());
          lineElement.visible(false);
        }
      }
    });

    // Always hide grid elements
    const allStageLines = stage.find('Line');
    const gridElements = allStageLines.filter((line: any) => {
      const stroke = line.stroke();
      const key = line.attrs.key;
      return (stroke === '#ddd' || stroke === 'ddd') && 
             (key?.startsWith('v-') || key?.startsWith('h-'));
    });
    
    gridElements.forEach((gridLine: any) => {
      const key = gridLine.attrs.key || `grid-${Math.random()}`;
      originalVisibility.set(key, gridLine.visible());
      gridLine.visible(false);
    });

    // Create export options
    const konvaExportOptions: any = {
      x: exportBounds.x,
      y: exportBounds.y,
      width: exportBounds.width,
      height: exportBounds.height,
      pixelRatio: 1,
      background: '#ffffff' // Always white background
    };

    // Generate image
    let dataURL: string;
    
    try {
      if (format === 'svg') {
        dataURL = stage.toSVG ? stage.toSVG(konvaExportOptions) : stage.toDataURL(konvaExportOptions);
      } else {
        konvaExportOptions.mimeType = 'image/png';
        dataURL = stage.toDataURL(konvaExportOptions);
      }
    } finally {
      // Restore visibility
      originalVisibility.forEach((visible, elementId) => {
        const element = stage.find(`#${elementId}`)[0];
        if (element) {
          element.visible(visible);
        }
      });
      stage.batchDraw();
    }

    if (!dataURL || dataURL === 'data:,') {
      throw new Error('Failed to generate image.');
    }

    // Download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${layer.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_layer.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Layer exported as ${format.toUpperCase()} successfully!`);

  } catch (error) {
    console.error('Error exporting layer:', error);
    throw error;
  }
};

/**
 * Import image and create a background node for the layer
 */
export const importImageToLayer = async (
  file: File,
  targetLayerId: string,
  addNode: (node: Node) => void,
  addNodeToLayer: (layerId: string, nodeId: string) => void,
  stageRef?: any
): Promise<ImageImportResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Please select a valid image file (PNG, JPEG, SVG, etc.)',
      };
    }

    // Create image URL
    const imageUrl = URL.createObjectURL(file);
    
    // Get image dimensions
    const dimensions = await getImageDimensions(imageUrl);
    
    // Calculate center position of the current viewport
    let centerX = 0;
    let centerY = 0;
    
    if (stageRef?.current) {
      const stage = stageRef.current;
      const stagePosition = stage.position();
      const stageScale = stage.scaleX();
      const stageSize = stage.size();
      
      // Calculate the center of the visible viewport in world coordinates
      centerX = (-stagePosition.x + stageSize.width / 2) / stageScale;
      centerY = (-stagePosition.y + stageSize.height / 2) / stageScale;
      
      console.log('Import center calculation:', {
        stagePosition,
        stageScale,
        stageSize,
        centerX,
        centerY
      });
    }

    // Scale down large images to fit better on screen
    let imageWidth = dimensions.width;
    let imageHeight = dimensions.height;
    
    const maxSize = 400; // Maximum size for imported images
    if (imageWidth > maxSize || imageHeight > maxSize) {
      const aspectRatio = imageWidth / imageHeight;
      if (imageWidth > imageHeight) {
        imageWidth = maxSize;
        imageHeight = maxSize / aspectRatio;
      } else {
        imageHeight = maxSize;
        imageWidth = maxSize * aspectRatio;
      }
    }
    
    // Create a new node with the image
    const imageNodeId = `image-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    const imageNode: Node = {
      id: imageNodeId,
      type: 'image',
      x: centerX, // Center of current viewport
      y: centerY,
      svgPath: imageUrl, // Use svgPath to store image URL
      snapPoints: [],
      width: imageWidth,
      height: imageHeight,
      // Add custom properties for image nodes
      isImageNode: true,
      originalFileName: file.name,
      fileType: file.type,
    };

    console.log('Creating image node:', imageNode);

    // Add node to global context
    addNode(imageNode);
    
    // Add node to target layer
    addNodeToLayer(targetLayerId, imageNodeId);

    return {
      success: true,
      imageUrl,
      dimensions: { width: imageWidth, height: imageHeight },
    };

  } catch (error) {
    console.error('Error importing image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Calculate bounds of layer content for export
 */
const calculateLayerBounds = (nodes: Node[], lines: Line[]): { x: number; y: number; width: number; height: number } | null => {
  if (nodes.length === 0 && lines.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Process nodes
  nodes.forEach(node => {
    const nodeWidth = node.width || 120;
    const nodeHeight = node.height || 120;
    
    const nodeMinX = node.x - nodeWidth / 2;
    const nodeMinY = node.y - nodeHeight / 2;
    const nodeMaxX = node.x + nodeWidth / 2;
    const nodeMaxY = node.y + nodeHeight / 2;

    minX = Math.min(minX, nodeMinX);
    minY = Math.min(minY, nodeMinY);
    maxX = Math.max(maxX, nodeMaxX);
    maxY = Math.max(maxY, nodeMaxY);
  });

  // Process lines
  lines.forEach(line => {
    for (let i = 0; i < line.points.length; i += 2) {
      const x = line.points[i];
      const y = line.points[i + 1];
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Get image dimensions from URL
 */
const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

