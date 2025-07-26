import { Button, Menu } from "@mui/material";
import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface MenuButtonProps {
    label: string;
    children: React.ReactNode;
}

const MenuButton: React.FC<MenuButtonProps> = ({ label, children }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Button
                color="inherit"
                onClick={handleClick}
                sx={{
                    textTransform: "none",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "black",
                    height: "40px",
                    px: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                }}
            >
                {label}
                <KeyboardArrowDownIcon
                    sx={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        transition: "transform 0.2s",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        color: "black",
                    }}
                />
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    sx: {
                        width: "150px",
                        borderRadius: "8px",
                        border: "2px solid black",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        position: "relative",
                        overflow: "visible",
                    },
                }}
            >
                {children}
            </Menu>
        </>
    );
};

export default MenuButton;