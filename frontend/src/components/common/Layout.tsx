import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import AppBar from './AppBar';
import { useAuth } from '../../context/AuthContext'; // Add this import

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
    // Get authentication context
    const { isAuthenticated, isAdmin, user } = useAuth();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Pass auth information to AppBar component */}
            <AppBar
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                username={user?.username}
            />

            <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
                {title && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" component="h1">
                            {title}
                        </Typography>

                        {/* Display user info in the main content area (optional) */}
                        {isAuthenticated && (
                            <Typography variant="body2" color="text.secondary">
                                Logged in as: {user?.username} {isAdmin && ' (Admin)'}
                            </Typography>
                        )}
                    </Box>
                )}

                {children}
            </Container>

            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: (theme) => theme.palette.grey[100]
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} Burdemar
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;