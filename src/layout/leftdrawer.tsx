import {
    Box,
    Paper,
} from "@mui/material";
import React from 'react'
import { useLineContext } from '../components/LineContext'

const LeftDrawer = () => {
  const { selectedLineType, setSelectedLineType } = useLineContext()
  
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
        </Box>
    </Box>
  )
}

export default LeftDrawer