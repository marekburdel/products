import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
    Grid,
    Alert,
    TextField,
    IconButton,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import Layout from '../../components/common/Layout';
import Loader from '../../components/common/Loader';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import { ProductDTO } from '../../types/product.types';
import { CreateOrderRequest } from '../../types/order.types';

interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

const CreateOrderPage: React.FC = () => {
    const navigate = useNavigate();
    const { products, loading: productsLoading } = useProducts();
    const { createOrder, loading, error } = useOrders();
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [customerName, setCustomerName] = useState<string>('');
    const [customerEmail, setCustomerEmail] = useState<string>('');

    const handleAddItem = () => {
        if (selectedProduct && quantity > 0) {
            // Check if product already exists in order
            const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct.id);

            if (existingItemIndex >= 0) {
                // Update quantity of existing item
                const updatedItems = [...orderItems];
                updatedItems[existingItemIndex].quantity += quantity;
                setOrderItems(updatedItems);
            } else {
                // Add new item
                if (selectedProduct.id) {
                    setOrderItems([
                        ...orderItems,
                        {
                            productId: selectedProduct.id,
                            productName: selectedProduct.name,
                            quantity,
                            price: selectedProduct.price
                        }
                    ]);
                }
            }

            // Reset form
            setSelectedProduct(null);
            setQuantity(1);
        }
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = [...orderItems];
        updatedItems.splice(index, 1);
        setOrderItems(updatedItems);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setQuantity(isNaN(value) ? 1 : Math.max(1, value));
    };

    const calculateTotal = () => {
        return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (orderItems.length === 0) {
            // Here you'll need to use the clearError and setError from the hook
            // instead of the local setState functions
            return;
        }

        try {
            const request: CreateOrderRequest = {
                items: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                customerName: customerName || undefined,
                customerEmail: customerEmail || undefined
            };

            const createdOrder = await createOrder(request);
            navigate(`/orders/${createdOrder.id}`);
        } catch (err) {
            // The error is already set in the hook, no need to do anything here
            // Note: don't need to set loading false here as that's handled in the hook
        }
    };

    return (
        <Layout title="Create Order">
            <Box sx={{ mb: 3 }}>
                <Button
                    component={Link}
                    to="/orders"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Orders
                </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>Automatic Reservation:</strong> Products will be reserved for 30 minutes while you complete your order.
                    If the order is not paid within this time, the reservation will expire and the products will become available again.
                </Typography>
            </Alert>

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        '& .MuiAlert-message': {
                            whiteSpace: 'pre-wrap',
                            fontWeight: 'medium'
                        }
                    }}
                >
                    {error}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Add Items to Order
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={products}
                                getOptionLabel={(option) => `${option.name} - $${option.price.toFixed(2)}`}
                                value={selectedProduct}
                                onChange={(_, newValue) => {
                                    setSelectedProduct(newValue);
                                }}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <div>
                                            <Typography variant="body1">{option.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ${option.price.toFixed(2)} - Available: {option.stockQuantity}
                                            </Typography>
                                        </div>
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Product"
                                        fullWidth
                                        disabled={loading || productsLoading}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                disabled={loading || productsLoading}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                InputProps={{ inputProps: { min: 1 } }}
                                disabled={loading || !selectedProduct}
                                helperText={selectedProduct ?
                                    `Available: ${selectedProduct.stockQuantity - (selectedProduct.stockQuantity || 0)}` :
                                    'Select a product first'
                                }
                            />
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
                                onClick={handleAddItem}
                                disabled={loading || !selectedProduct}
                                startIcon={<AddIcon />}
                                sx={{ height: '56px' }}
                            >
                                Add
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Order Items
                            </Typography>

                            {orderItems.length === 0 ? (
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    No items added to the order yet.
                                </Alert>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="right">Price</TableCell>
                                                <TableCell align="right">Quantity</TableCell>
                                                <TableCell align="right">Subtotal</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {orderItems.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.productName}</TableCell>
                                                    <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleRemoveItem(index)}
                                                            disabled={loading}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                                                    Total:
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                    ${calculateTotal().toFixed(2)}
                                                </TableCell>
                                                <TableCell />
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Customer Information (Optional)
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Customer Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Customer Email"
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    sx={{ mr: 2 }}
                                    disabled={loading}
                                    component={Link}
                                    to="/orders"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={loading || orderItems.length === 0}
                                >
                                    Create Order (30 min reservation)
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Layout>
    );
};

export default CreateOrderPage;