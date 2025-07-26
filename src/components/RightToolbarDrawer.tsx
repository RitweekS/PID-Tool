import { Box, Paper, Typography, Divider } from "@mui/material";
import React from "react";

interface PIDNode {
    id: string;
    x: number;
    y: number;
    type: string;
    manufacturer?: string;
    model?: string;
    name?: string;
    notes?: string;
}

interface RightToolbarDrawerProps {
    selectedNode: PIDNode | null;
}

const RightToolbarDrawer: React.FC<RightToolbarDrawerProps> = ({
    selectedNode,
}) => {
    return (
        <Paper
            sx={{
                width: "240px",
                border: "2px solid black",
                overflow: "hidden",
                display: "flex",
                flexShrink: 0,
                flexDirection: "column",
                backgroundColor: "#e0e0e0",
                p: "16px 0px",
                borderRadius: "0px",
                borderBottom: "none",
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
                Component View
            </Paper>
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    padding: "8px",
                    gap: "2px",
                    overflowY: "auto",
                }}
            >
                <Box
                    sx={{
                        height: "200px",
                        backgroundColor: "transparent",
                        border: "2px solid #212121",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {selectedNode ? (
                        <Typography variant="body2" color="textPrimary">
                            {selectedNode.type} Component
                        </Typography>
                    ) : (
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ textAlign: "center", fontStyle: "italic" }}
                        >
                            Select a component to view details
                        </Typography>
                    )}
                </Box>

                {selectedNode && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                            overflowY: "auto",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: "#1976d2",
                                textAlign: "center",
                                textTransform: "capitalize",
                            }}
                        >
                            {selectedNode.type} Component
                        </Typography>

                        <Divider sx={{ margin: "4px 0" }} />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2px",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#212121",
                                        fontSize: "14px",
                                    }}
                                >
                                    ID Tag:
                                </Typography>
                                <Box
                                    sx={{
                                        fontFamily: "monospace",
                                        color: "#212121",
                                        border: "1px solid #212121",
                                        height: "24px",
                                        padding: "4px",
                                        backgroundColor: "white",
                                    }}
                                >
                                    {selectedNode.id}
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2px",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#212121",
                                        fontSize: "14px",
                                    }}
                                >
                                    Name:
                                </Typography>
                                <Box
                                    sx={{
                                        fontFamily: "monospace",
                                        height: "24px",
                                        color: "#212121",
                                        border: "1px solid #212121",
                                        padding: "4px",
                                        backgroundColor: "white",
                                    }}
                                >
                                    {selectedNode.name ?? ""}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default RightToolbarDrawer;