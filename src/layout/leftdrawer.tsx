import {
    Box,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import React, { useState } from 'react'
import { useLineContext } from '../components/LineContext'
import { useLayerContext } from '../components/LayerContext'
import { useNodeContext } from '../components/NodeContext'
import LayerItem from '../components/LayerItem'
import { Add, CallMerge, Check } from '@mui/icons-material'

const LeftDrawer = () => {
  const { selectedLineType, setSelectedLineType, deleteLine } = useLineContext()
  const { nodes, deleteNode, connections, setConnections } = useNodeContext()
  const { 
    layers, 
    activeLayerId, 
    addLayer, 
    deleteLayer, 
    mergeLayers,
    renameLayer, 
    toggleLayerVisibility, 
    toggleLayerLock, 
    setActiveLayer 
  } = useLayerContext()
  
  // Merge functionality state
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergeLayerName, setMergeLayerName] = useState('');
  
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const nodeType = event.currentTarget.getAttribute('data-node-id')
    if (nodeType) {
      event.dataTransfer.setData('application/reactflow', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    }
  }
  
  const handlePipeTypeClick = (pipeType: string) => {
    setSelectedLineType(selectedLineType === pipeType ? null : pipeType)
  }

  // Function to handle layer deletion with proper cleanup
  const handleDeleteLayer = (layerId: string) => {
    deleteLayer(
      layerId,
      // Node cleanup function
      (nodeIds: string[]) => {
        nodeIds.forEach(nodeId => {
          // Find and delete related connections first
          const nodeToDelete = nodes.find(n => n.id === nodeId);
          if (nodeToDelete && nodeToDelete.snapPoints) {
            nodeToDelete.snapPoints.forEach(snapPoint => {
              const relatedConnections = connections.filter(conn => 
                conn.fromSnapId === snapPoint.id || conn.toSnapId === snapPoint.id
              );
              relatedConnections.forEach(conn => {
                // Remove the connection from connections array
                setConnections(prev => prev.filter(c => c.id !== conn.id));
              });
            });
          }
          // Delete the node
          deleteNode(nodeId);
        });
      },
      // Line cleanup function
      (lineIds: string[]) => {
        lineIds.forEach(lineId => {
          deleteLine(lineId);
        });
      }
    );
  };

  // Merge functionality handlers
  const handleToggleMergeMode = () => {
    setIsMergeMode(!isMergeMode);
    if (isMergeMode) {
      setSelectedLayers([]);
    }
  };

  const handleToggleLayerSelection = (layerId: string) => {
    setSelectedLayers(prev => {
      if (prev.includes(layerId)) {
        return prev.filter(id => id !== layerId);
      } else {
        return [...prev, layerId];
      }
    });
  };

  const handleMergeLayers = () => {
    if (selectedLayers.length >= 2) {
      setShowMergeDialog(true);
    }
  };

  const handleConfirmMerge = () => {
    if (mergeLayerName.trim() && selectedLayers.length >= 2) {
      mergeLayers(selectedLayers, mergeLayerName.trim());
      setSelectedLayers([]);
      setIsMergeMode(false);
      setShowMergeDialog(false);
      setMergeLayerName('');
    }
  };

  const handleCancelMerge = () => {
    setShowMergeDialog(false);
    setMergeLayerName('');
  };

  return (
    <Box sx={{
        width: "250px",
        flexShrink: 0,
        backgroundColor: "#e0e0e0",
        border: "2px solid black",
        borderBottom: "none",
        overflow: "auto",
    }}>
        <Box
            sx={{
                p: "16px 0px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                height: "100%",
                overflowY: "auto",
                overflowX: "visible",
                boxSizing: "border-box",
            }}
        >
            {/* Merge Confirmation Dialog */}
            <Dialog open={showMergeDialog} onClose={handleCancelMerge} maxWidth="sm" fullWidth>
                <DialogTitle>Merge Layers</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ fontSize: '14px', color: '#666', mb: 1 }}>
                            Merging {selectedLayers.length} layers:
                        </Box>
                        <Box sx={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                            {selectedLayers.map(layerId => {
                                const layer = layers.find(l => l.id === layerId);
                                return layer ? `${layer.name} (${layer.nodes.length + layer.lines.length} elements)` : '';
                            }).join(', ')}
                        </Box>
                    </Box>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Layer Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={mergeLayerName}
                        onChange={(e) => setMergeLayerName(e.target.value)}
                        placeholder="Enter name for merged layer"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleConfirmMerge();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelMerge} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmMerge} 
                        color="primary" 
                        variant="contained"
                        disabled={!mergeLayerName.trim()}
                    >
                        Merge Layers
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Components Section */}
            <Paper
                sx={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    bgcolor: "#424242",
                    borderRadius: "8px",
                    border: "2px solid #bdbdbd",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    color: "#ffffff",
                    cursor: "pointer",
                    "&:hover": {
                        bgcolor: "#616161",
                    },
                }}
            >
                Add Components
            </Paper>

            <Box
                sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    bgcolor: "#424242",
                    borderRadius: "8px 8px 0 0",
                    border: "2px solid #bdbdbd",
                    borderBottom: "none",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    color: "#ffffff",
                }}
            >
                Pipe
            </Box>

            <Box
                onClick={() => handlePipeTypeClick('single-arrow')}
                sx={{
                    cursor: "pointer",
                    padding: "12px",
                    borderRadius: "0 0 8px 8px",
                    border: selectedLineType === 'single-arrow' ? "2px solid #4caf50" : "2px solid #bdbdbd",
                    borderTop: "none",
                    backgroundColor: selectedLineType === 'single-arrow' ? "rgba(76, 175, 80, 0.1)" : "white",
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    width: "100%",
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        width: "120px",
                        height: "3px",
                        backgroundColor: "#424242",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            right: "-3px",
                            top: "-3px",
                            width: 0,
                            height: 0,
                            borderLeft: "6px solid #424242",
                            borderTop: "4px solid transparent",
                            borderBottom: "4px solid transparent",
                        }}
                    />
                </Box>
                {selectedLineType === 'single-arrow' && (
                    <Box sx={{
                        position: "absolute",
                        top: "-2px",
                        right: "-2px",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: "#4caf50",
                        border: "2px solid white",
                        fontSize: "8px",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold"
                    }}>
                        ✓
                    </Box>
                )}
            </Box>

            <Box
                sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    bgcolor: "#424242",
                    borderRadius: "8px",
                    border: "2px solid #bdbdbd",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    color: "#ffffff",
                    marginBottom: "8px",
                }}
            >
                Components
            </Box>

            {/* Components Grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 1,
                    width: "100%",
                    maxWidth: "100%",
                    marginBottom: "16px",
                }}
            >
                <Paper
                    draggable
                    data-node-id="pump"
                    onDragStart={handleDragStart}
                    sx={{
                        aspectRatio: "1",
                        border: "2px solid #3498db",
                        cursor: "grab",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3498db",
                        userSelect: "none",
                        gap: "4px",
                        borderRadius: "10px",
                        padding: "8px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        "&:hover": {
                            backgroundColor: "rgba(52, 152, 219, 0.08)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <img
                        src="/Pumps.svg"
                        alt="Pump"
                        style={{ width: "28px", height: "28px" }}
                    />
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            textAlign: "center",
                            color: "#2c3e50",
                        }}
                    >
                        Pump
                    </span>
                </Paper>
                <Paper
                    draggable
                    data-node-id="evaporators"
                    onDragStart={handleDragStart}
                    sx={{
                        aspectRatio: "1",
                        border: "2px solid #3498db",
                        cursor: "grab",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3498db",
                        userSelect: "none",
                        gap: "4px",
                        borderRadius: "10px",
                        padding: "8px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        "&:hover": {
                            backgroundColor: "rgba(52, 152, 219, 0.08)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <img
                        src="/Evaporators.svg"
                        alt="Evaporator"
                        style={{ width: "28px", height: "28px" }}
                    />
                    <span
                        style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            textAlign: "center",
                            color: "#2c3e50",
                        }}
                    >
                        Evaporator
                    </span>
                </Paper>
                <Paper
                    draggable
                    data-node-id="compressor"
                    onDragStart={handleDragStart}
                    sx={{
                        aspectRatio: "1",
                        border: "2px solid #3498db",
                        cursor: "grab",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3498db",
                        userSelect: "none",
                        gap: "4px",
                        borderRadius: "10px",
                        padding: "8px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        "&:hover": {
                            backgroundColor: "rgba(52, 152, 219, 0.08)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <img
                        src="/Compressor.svg"
                        alt="Compressor"
                        style={{ width: "24px", height: "24px" }}
                    />
                    <span style={{ fontSize: "7px", textAlign: "center" }}>
                        Compressor
                    </span>
                </Paper>
                <Paper
                    draggable
                    data-node-id="condensers"
                    onDragStart={handleDragStart}
                    sx={{
                        aspectRatio: "1",
                        border: "2px solid #3498db",
                        cursor: "grab",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3498db",
                        userSelect: "none",
                        gap: "4px",
                        borderRadius: "10px",
                        padding: "8px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        "&:hover": {
                            backgroundColor: "rgba(52, 152, 219, 0.08)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <img
                        src="/condenser.svg"
                        alt="Condenser"
                        style={{ width: "28px", height: "28px" }}
                    />
                    <span
                        style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            textAlign: "center",
                            color: "#2c3e50",
                        }}
                    >
                        Condenser
                    </span>
                </Paper>
                <Paper
                    draggable
                    data-node-id="vessels"
                    onDragStart={handleDragStart}
                    sx={{
                        aspectRatio: "1",
                        border: "2px solid #3498db",
                        cursor: "grab",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3498db",
                        userSelect: "none",
                        gap: "4px",
                        borderRadius: "10px",
                        padding: "8px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        "&:hover": {
                            backgroundColor: "rgba(52, 152, 219, 0.08)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <img
                        src="/Vessels.svg"
                        alt="Vessel"
                        style={{ width: "28px", height: "28px" }}
                    />
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            textAlign: "center",
                            color: "#2c3e50",
                        }}
                    >
                        Vessel
                    </span>
                </Paper>
                <Paper
                    draggable
                    data-node-id="heat-exchangers"
                    onDragStart={handleDragStart}
                    sx={{
                        aspectRatio: "1",
                        border: "2px solid #3498db",
                        cursor: "grab",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3498db",
                        userSelect: "none",
                        gap: "4px",
                        borderRadius: "10px",
                        padding: "8px",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        "&:hover": {
                            backgroundColor: "rgba(52, 152, 219, 0.08)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <img
                        src="/HeatExchanger.svg"
                        alt="Heat Exchanger"
                        style={{ width: "28px", height: "28px" }}
                    />
                    <span
                        style={{
                            fontSize: "9px",
                            fontWeight: "600",
                            textAlign: "center",
                            color: "#2c3e50",
                        }}
                    >
                        Heat Exchanger
                    </span>
                </Paper>
            </Box>

            {/* Layers Section */}
            <Box
                sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    bgcolor: "#424242",
                    borderRadius: "8px",
                    border: "2px solid #bdbdbd",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    color: "#ffffff",
                    marginBottom: "8px",
                }}
            >
                <span>Layers</span>
                <Box sx={{ display: 'flex', gap: '4px' }}>
                    <Button
                        onClick={handleToggleMergeMode}
                        sx={{
                            minWidth: "auto",
                            padding: "2px 2px",
                            color: isMergeMode ? "#4caf50" : "#ffffff",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                            },
                        }}
                    >
                        <CallMerge sx={{ fontSize: "16px" }} />
                    </Button>
                    {isMergeMode && selectedLayers.length >= 2 && (
                        <Button
                            onClick={handleMergeLayers}
                            sx={{
                                minWidth: "auto",
                                padding: "2px 2px",
                                color: "#4caf50",
                                "&:hover": {
                                    backgroundColor: "rgba(76, 175, 80, 0.2)",
                                },
                            }}
                        >
                            <Check sx={{ fontSize: "16px" }} />
                        </Button>
                    )}
                    <Button
                        onClick={() => addLayer()}
                        sx={{
                            minWidth: "auto",
                            padding: "2px 2px",
                            color: "#ffffff",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                            },
                        }}
                    >
                        <Add />
                    </Button>
                </Box>
            </Box>

            {/* Layers List */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    width: "100%",
                    maxHeight: "200px",
                    overflowY: "auto",
                    padding: "8px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                }}
            >
                {layers.map((layer) => (
                    <LayerItem
                        key={layer.id}
                        layer={layer}
                        isActive={activeLayerId === layer.id}
                        isSelected={isMergeMode && selectedLayers.includes(layer.id)}
                        totalLayers={layers.length}
                        onToggleVisibility={() => toggleLayerVisibility(layer.id)}
                        onToggleLock={() => toggleLayerLock(layer.id)}
                        onDelete={() => handleDeleteLayer(layer.id)}
                        onRename={(newName) => renameLayer(layer.id, newName)}
                        onSelect={() => setActiveLayer(layer.id)}
                        onToggleSelection={isMergeMode ? () => handleToggleLayerSelection(layer.id) : undefined}
                    />
                ))}
            </Box>
        </Box>
    </Box>
  )
}

export default LeftDrawer