import { Box, Typography } from '@mui/material'
import React from 'react'

const Footer = () => {
    return (
        <Box sx={{
            width: "100%",
            height: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(to top, #e3f2fd 0%, #bbdefb 30%, #64b5f6 100%)",
            borderTop: "1px solid rgba(0, 0, 0, 0.1)"
        }}>
            <Typography variant="body2" sx={{ color: "#333", fontSize: "12px" }}>
                © 2025 P&ID Design Tool - OneLineage
            </Typography>
        </Box>
    )
}

export default Footer