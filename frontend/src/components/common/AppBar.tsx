import React, { useState } from 'react';
import {
    AppBar as MuiAppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Drawer from './Drawer';
import { useAuth } from '../../context/AuthContext'; // Add this import

interface AppBarProps {
    isAuthenticated?: boolean;
    isAdmin?: boolean;
    username?: string;
}

const AppBar: React.FC<AppBarProps> = ({ isAuthenticated, isAdmin, username }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path: string) => location.pathname.startsWith(path);

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            <MuiAppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2, display: { sm: 'none' } }}
                        onClick={toggleDrawer}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                        Dashboard
                    </Typography>

                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Button
                            component={Link}
                            to="/products"
                            color="inherit"
                            sx={{
                                mx: 1,
                                borderBottom: isActive('/products') ? '2px solid white' : 'none',
                                borderRadius: 0
                            }}
                        >
                            Products
                        </Button>
                        <Button
                            component={Link}
                            to="/orders"
                            color="inherit"
                            sx={{
                                mx: 1,
                                borderBottom: isActive('/orders') ? '2px solid white' : 'none',
                                borderRadius: 0
                            }}
                        >
                            Orders
                        </Button>
                    </Box>

                    {/* Authentication buttons */}
                    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', ml: 2 }}>
                        {isAuthenticated ? (
                            <>
                                <Box sx={{ mr: 2, display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
                                    <AccountCircleIcon sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                        {username} {isAdmin && '(Admin)'}
                                    </Typography>
                                </Box>
                                <Button
                                    color="inherit"
                                    onClick={handleLogout}
                                    startIcon={<LogoutIcon />}
                                    size="small"
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button
                                color="inherit"
                                component={Link}
                                to="/login"
                                startIcon={<LoginIcon />}
                                size="small"
                            >
                                Login
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </MuiAppBar>
            <Drawer open={drawerOpen} onClose={toggleDrawer} isAdmin={isAdmin} />
        </>
    );
};

export default AppBar;