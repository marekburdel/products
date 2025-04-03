import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Divider,
    Grid,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../../components/common/Layout';
import Loader from '../../components/common/Loader';
import { useProducts } from '../../hooks/useProducts';
import { ProductDTO } from '../../types/product.types';
import { useAuth } from '../../context/AuthContext';

const ProductDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getProduct, deleteProduct } = useProducts();
    const [product, setProduct] = useState<ProductDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { isAdmin } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productData = await getProduct(Number(id));
                setProduct(productData);
            } catch (err) {
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, getProduct]);

    const handleOpenDeleteDialog = () => {
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const handleDelete = async () => {
        try {
            await deleteProduct(Number(id));
            navigate('/products');
        } catch (err) {
            setError('Failed to delete product');
            handleCloseDeleteDialog();
        }
    };

    if (loading) {
        return (
            <Layout title="Product Details">
                <Loader />
            </Layout>
        );
    }

    if (error || !product) {
        return (
            <Layout title="Product Details">
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || 'Product not found'}
                </Alert>
                <Button
                    component={Link}
                    to="/products"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Products
                </Button>
            </Layout>
        );
    }

    return (
        <Layout title={product.name}>
            <Box sx={{ mb: 3 }}>
                <Button
                    component={Link}
                    to="/products"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Products
                </Button>
            </Box>

            <Paper elevation={3}>
                <Grid container>
                    <Grid item xs={12} md={8}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Product Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <List disablePadding>
                                <ListItem disablePadding sx={{ pb: 1 }}>
                                    <ListItemText
                                        primary="Name"
                                        secondary={product.name}
                                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1' }}
                                    />
                                </ListItem>

                                <ListItem disablePadding sx={{ pb: 1 }}>
                                    <ListItemText
                                        primary="Description"
                                        secondary={product.description || 'No description'}
                                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1' }}
                                    />
                                </ListItem>

                                <ListItem disablePadding sx={{ pb: 1 }}>
                                    <ListItemText
                                        primary="Price"
                                        secondary={`$${product.price.toFixed(2)}`}
                                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1' }}
                                    />
                                </ListItem>

                                <ListItem disablePadding>
                                    <ListItemText
                                        primary="Stock Quantity"
                                        secondary={product.stockQuantity.toString()}
                                        primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                                        secondaryTypographyProps={{ variant: 'body1' }}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Actions
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {isAdmin ? (
                                    <>
                                        <Button
                                            component={Link}
                                            to={`/products/${id}/edit`}
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            fullWidth
                                        >
                                            Edit Product
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={handleDelete}
                                            fullWidth
                                            disabled={product.stockQuantity > 0}
                                        >
                                            Delete Product
                                        </Button>

                                        {product.stockQuantity > 0 && (
                                            <Alert severity="info">
                                                This product cannot be deleted while there are pending orders with reserved units.
                                            </Alert>
                                        )}
                                    </>
                                ) : (
                                    <Alert severity="info">
                                        Only administrators can edit or delete products.
                                    </Alert>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle>Delete Product</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{product.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default ProductDetailsPage;