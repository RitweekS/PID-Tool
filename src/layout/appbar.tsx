import { Box, Button, MenuItem, styled } from '@mui/material'
import Image from 'next/image'
import MenuButton from '@/components/MenuButton'
import React from 'react'
import { useAuthContext } from '@/components/AuthProvider'
import LogoutIcon from "@mui/icons-material/Logout";

const StyledMenuItem = styled(MenuItem)({
    fontSize: "16px",
    py: 0.75,
});

const Appbar = () => {
    const { logout } = useAuthContext();

    const handleLogout = () => {
        logout();
    };

    return (
        <Box sx={{
            width: "100%",
            height: "40px",
            display: "flex",
            justifyContent: "space-between",
            background: "linear-gradient(to bottom, #e3f2fd 0%, #bbdefb 30%, #64b5f6 100%)",
            p: "4px 16px"
        }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mr: 1,
                    }}
                >
                    <Image
                        src="https://www.onelineage.com/themes/custom/lineage_custom_new/assets/lineage_logo.svg"
                        alt="Lineage Logo"
                        width={100}
                        height={40}
                        priority
                        style={{ objectFit: 'contain' }}
                    />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ position: "relative", display: "flex", gap: 2 }}>
                        <MenuButton label="File">
                            <StyledMenuItem>New</StyledMenuItem>
                            <StyledMenuItem>Open</StyledMenuItem>
                            <StyledMenuItem>Save</StyledMenuItem>
                            <StyledMenuItem>Export</StyledMenuItem>
                        </MenuButton>
                        <MenuButton label="Edit">
                            <StyledMenuItem>Undo</StyledMenuItem>
                            <StyledMenuItem>Redo</StyledMenuItem>
                            <StyledMenuItem>Cut</StyledMenuItem>
                            <StyledMenuItem>Copy</StyledMenuItem>
                            <StyledMenuItem>Paste</StyledMenuItem>
                        </MenuButton>
                        <MenuButton label="View">
                            <StyledMenuItem>Zoom In</StyledMenuItem>
                            <StyledMenuItem>Zoom Out</StyledMenuItem>
                            <StyledMenuItem>Reset View</StyledMenuItem>
                            <StyledMenuItem>Show Grid</StyledMenuItem>
                        </MenuButton>
                        <MenuButton label="Component">
                            <StyledMenuItem>Add Valve</StyledMenuItem>
                            <StyledMenuItem>Add Pump</StyledMenuItem>
                            <StyledMenuItem>Add Tank</StyledMenuItem>
                        </MenuButton>
                        <MenuButton label="Help">
                            <StyledMenuItem>Report a feature</StyledMenuItem>
                            <StyledMenuItem>Report Bug</StyledMenuItem>
                            <StyledMenuItem>Documentation</StyledMenuItem>
                            <StyledMenuItem>About</StyledMenuItem>
                        </MenuButton>
                    </Box>
                </Box>
            </Box>
            <Button
                variant="outlined"
                size="small"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                    textTransform: 'none',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        borderColor: '#1565c0'
                    }
                }}
            >
                Logout
            </Button>
        </Box>
    )
}

export default Appbar