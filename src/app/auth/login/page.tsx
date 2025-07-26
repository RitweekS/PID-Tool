"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    useMediaQuery,
    useTheme,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
} from "@mui/icons-material";
import { useAuthContext } from "@/components/AuthProvider";
import { authService, AuthError } from "@/services/authService";

const LoginPage = () => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "#f8f9fa",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                position: "relative",
            }}
        >
            <Box sx={{ position: 'initial', padding: 'inherit', zIndex: 1 }}>
                <Box 
                    component="img"
                    src="https://www.onelineage.com/themes/custom/lineage_custom_new/assets/lineage_logo.svg"
                    alt="OneLineage Logo"
                    sx={{ 
                        width: 'auto',
                        height: '60px'
                    }}
                />
            </Box>
            
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 3, sm: 4 },
                    width: isSmall ? "100%" : 450,
                    borderRadius: 2,
                    background: "#ffffff",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                    position: "relative",
                    overflow: "hidden",
                    zIndex: 1,
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight={600}
                    align="center"
                    mb={1}
                    sx={{
                        color: "#0067a0",
                    }}
                >
                    Welcome Back
                </Typography>

                <Typography
                    variant="body2"
                    align="center"
                    mb={4}
                    color="text.secondary"
                >
                    Sign in to access your P&ID Design Tool
                </Typography>

                <SignInForm />
            </Paper>
        </Box>
    );
};

const SignInForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuthContext();
    
    const redirectUrl = searchParams.get("redirect") || "/";

    const handleChange =
        (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev) => ({ ...prev, [field]: event.target.value }));
            setError("");
        };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await authService.login({
                email: formData.email,
                password: formData.password,
            });

            const success = login(response.user, response.token, response.refreshToken, response.expiresIn);
            
            if (success) {
                console.log("Authentication successful!");
                router.push(redirectUrl);
            } else {
                setError("Failed to log in. Please try again.");
            }
        } catch (error) {
            if (error instanceof AuthError) {
                setError(error.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
                fullWidth
                label="Email"
                margin="normal"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange("email")}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Email color="action" />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        "&:hover fieldset": {
                            borderColor: "#0067a0",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#0067a0",
                        },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0067a0",
                    },
                }}
            />
            <TextField
                fullWidth
                label="Password"
                margin="normal"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={formData.password}
                onChange={handleChange("password")}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Lock color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                            >
                                {showPassword ? (
                                    <VisibilityOff />
                                ) : (
                                    <Visibility />
                                )}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        "&:hover fieldset": {
                            borderColor: "#0067a0",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#0067a0",
                        },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#0067a0",
                    },
                }}
            />

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{
                    mt: 3,
                    mb: 2,
                    borderRadius: 1,
                    height: 48,
                    background: "#0067a0",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 6px rgba(26, 54, 93, 0.25)",
                    "&:hover": {
                        background: "#2c5282",
                    },
                }}
            >
                {loading ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    "Sign In"
                )}
            </Button>
        </Box>
    );
};

export default LoginPage;