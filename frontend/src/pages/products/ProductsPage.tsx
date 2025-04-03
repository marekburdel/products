import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Typography,
    Alert,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Layout from '../../components/common/Layout';
import Loader from '../../components/common/Loader';
import { useProducts } from '../../hooks/useProducts';
import { ProductDTO } from '../../types/product.types';
import { useAuth } from '../../context/AuthContext';

const ProductsPage: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const { products, loading, error, deleteProduct } = useProducts();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);

    const handleOpenDeleteDialog = (productId: number) => {
        setProductToDelete(productId);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (productToDelete !== null) {
            try {
                await deleteProduct(productToDelete);
                handleCloseDeleteDialog();
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    };

    // Function to calculate and display available stock (considering reservations)
    const getStockDisplay = (product: ProductDTO) => {
        const availableStock = product.stockQuantity;

        let color: 'success' | 'warning' | 'error' = 'success';
        if (availableStock <= 0) {
            color = 'error';
        } else if (availableStock < 10) {
            color = 'warning';
        }

        return (
            <Box>
                <Chip
                    label={`${availableStock} available`}
                    color={color}
                    size="small"
                />
            </Box>
        );
    };

    if (loading && products.length === 0) {
        return (
            <Layout title="Products">
                <Loader />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Products">
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            </Layout>
        );
    }

    return (
        <Layout title="Products">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                    Note: Products are automatically reserved for 30 minutes when added to orders.
                </Typography>

                {isAuthenticated && isAdmin && (
                    <Button
                        component={Link}
                        to="/products/create"
                        variant="contained"
                        startIcon={<AddIcon />}
                    >
                        Add Product
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="center">Stock Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>
                                    {product.description && product.description.length > 50
                                        ? `${product.description.substring(0, 50)}...`
                                        : product.description}
                                </TableCell>
                                <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                                <TableCell align="center">
                                    {getStockDisplay(product)}
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View Details">
                                        <IconButton
                                            component={Link}
                                            to={`/products/${product.id}`}
                                            color="primary"
                                            size="small"
                                        >
                                            <InfoIcon />
                                        </IconButton>
                                    </Tooltip>

                                    {isAuthenticated && isAdmin && (
                                        <>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    component={Link}
                                                    to={`/products/${product.id}/edit`}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Delete">
                                                <IconButton
                                                    onClick={() => product.id && handleOpenDeleteDialog(product.id)}
                                                    color="error"
                                                    size="small"
                                                    disabled={product.stockQuantity > 0}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body1" sx={{ py: 2 }}>
                                        No products found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle>Delete Product</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this product? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default ProductsPage;