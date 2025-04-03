import React from 'react';
import {
    Drawer as MuiDrawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    Box
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    isAdmin?: boolean;
}

const Drawer: React.FC<DrawerProps> = ({ open, onClose, isAdmin }) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <MuiDrawer
            anchor="left"
            open={open}
            onClose={onClose}
        >
            <List sx={{ width: 250 }}>
                <ListItem>
                    <ListItemText primary="Menu" primaryTypographyProps={{ variant: 'h6' }} />
                </ListItem>
                <Divider />

                {/* Products section */}
                <ListItemButton
                    component={Link}
                    to="/products"
                    selected={isActive('/products') && !isActive('/products/create')}
                    onClick={onClose}
                >
                    <ListItemIcon>
                        <InventoryIcon />
                    </ListItemIcon>
                    <ListItemText primary="Products" />
                </ListItemButton>

                {/* Admin-only create product option */}
                {isAdmin && (
                    <ListItemButton
                        component={Link}
                        to="/products/create"
                        selected={isActive('/products/create')}
                        onClick={onClose}
                        sx={{ pl: 4 }}
                    >
                        <ListItemIcon>
                            <AddCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Add Product" />
                    </ListItemButton>
                )}

                <ListItemButton
                    component={Link}
                    to="/orders"
                    selected={isActive('/orders')}
                    onClick={onClose}
                >
                    <ListItemIcon>
                        <ShoppingCartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Orders" />
                </ListItemButton>

                <ListItemButton
                    component={Link}
                    to="/reservations"
                    selected={isActive('/reservations')}
                    onClick={onClose}
                >
                    <ListItemIcon>
                        <EventNoteIcon />
                    </ListItemIcon>
                    <ListItemText primary="Reservations" />
                </ListItemButton>
            </List>
        </MuiDrawer>
    );
};

export default Drawer;