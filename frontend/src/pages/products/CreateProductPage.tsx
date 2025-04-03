import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    Grid,
    Alert,
    InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import Layout from '../../components/common/Layout';
import { useProducts } from '../../hooks/useProducts';
import { ProductDTO } from '../../types/product.types';

const CreateProductPage: React.FC = () => {
    const navigate = useNavigate();
    const { createProduct } = useProducts();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [product, setProduct] = useState<ProductDTO>({
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'price' || name === 'stockQuantity') {
            setProduct({
                ...product,
                [name]: value === '' ? 0 : parseFloat(value)
            });
        } else {
            setProduct({
                ...product,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const createdProduct = await createProduct(product);
            navigate(`/products/${createdProduct.id}`);
        } catch (err) {
            setError('Failed to create product');
            setLoading(false);
        }
    };

    return (
        <Layout title="Create Product">
            <Box sx={{ mb: 3 }}>
                <Button
                    component={Link}
                    to="/products"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Products
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Product Information
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Name"
                                name="name"
                                value={product.name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={product.description}
                                onChange={handleChange}
                                multiline
                                rows={4}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Price"
                                name="price"
                                type="number"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                inputProps={{ min: 0, step: 0.01 }}
                                value={product.price}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Stock Quantity"
                                name="stockQuantity"
                                type="number"
                                inputProps={{ min: 0, step: 1 }}
                                value={product.stockQuantity}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    sx={{ mr: 2 }}
                                    disabled={loading}
                                    component={Link}
                                    to="/products"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={loading}
                                >
                                    Save Product
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Layout>
    );
};

export default CreateProductPage;