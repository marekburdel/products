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
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import Layout from '../../components/common/Layout';
import Loader from '../../components/common/Loader';
import { useOrders } from '../../hooks/useOrders';
import { OrderDTO, OrderStatus } from '../../types/order.types';

const OrdersPage: React.FC = () => {
    const { orders, loading, error, cancelOrder, payOrder } = useOrders();
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'pay' | 'cancel' | null>(null);

    const handleOpenActionDialog = (orderId: number, action: 'pay' | 'cancel') => {
        setSelectedOrder(orderId);
        setActionType(action);
        setActionDialogOpen(true);
    };

    const handleCloseActionDialog = () => {
        setActionDialogOpen(false);
        setSelectedOrder(null);
        setActionType(null);
    };

    const handleConfirmAction = async () => {
        if (selectedOrder !== null && actionType) {
            try {
                if (actionType === 'pay') {
                    await payOrder(selectedOrder);
                } else if (actionType === 'cancel') {
                    await cancelOrder(selectedOrder);
                }
                handleCloseActionDialog();
            } catch (error) {
                console.error(`Failed to ${actionType} order:`, error);
            }
        }
    };

    const getStatusChip = (status: OrderStatus) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (status) {
            case OrderStatus.PENDING:
                color = 'warning';
                break;
            case OrderStatus.PAID:
                color = 'info';
                break;
            case OrderStatus.CANCELLED:
                color = 'error';
                break;
            case OrderStatus.COMPLETED:
                color = 'success';
                break;
        }

        return <Chip label={status} color={color} size="small" />;
    };

    // Calculate time remaining for pending orders
    const getTimeRemaining = (expiryTime: string): string => {
        const expiryDate = new Date(expiryTime);
        const now = new Date();

        // If already expired
        if (now > expiryDate) {
            return "Expired";
        }

        const diffMs = expiryDate.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);

        return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
    };

    return (
        <Layout title="Orders">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                    component={Link}
                    to="/orders/create"
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    Create Order
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading && orders.length === 0 ? (
                <Loader />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell align="right">Total Amount</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Expires In</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>#{order.id}</TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {order.items.length === 1
                                            ? `${order.items[0].quantity}x ${order.items[0].productName}`
                                            : `${order.items.length} items`}
                                    </TableCell>
                                    <TableCell align="right">${order.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell align="center">
                                        {getStatusChip(order.status)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {order.status === OrderStatus.PENDING && (
                                            <Typography
                                                variant="body2"
                                                color={
                                                    getTimeRemaining(order.expiryTime) === "Expired"
                                                        ? "error"
                                                        : "text.secondary"
                                                }
                                            >
                                                {getTimeRemaining(order.expiryTime)}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="View Details">
                                            <IconButton
                                                component={Link}
                                                to={`/orders/${order.id}`}
                                                color="primary"
                                                size="small"
                                            >
                                                <InfoIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {order.status === OrderStatus.PENDING && (
                                            <>
                                                <Tooltip title="Pay Order">
                                                    <IconButton
                                                        onClick={() => handleOpenActionDialog(order.id, 'pay')}
                                                        color="success"
                                                        size="small"
                                                        disabled={getTimeRemaining(order.expiryTime) === "Expired"}
                                                    >
                                                        <PaymentIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Cancel Order">
                                                    <IconButton
                                                        onClick={() => handleOpenActionDialog(order.id, 'cancel')}
                                                        color="error"
                                                        size="small"
                                                    >
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography variant="body1" sx={{ py: 2 }}>
                                            No orders found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Action Confirmation Dialog */}
            <Dialog
                open={actionDialogOpen}
                onClose={handleCloseActionDialog}
            >
                <DialogTitle>
                    {actionType === 'pay' ? 'Pay Order' : 'Cancel Order'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {actionType === 'pay'
                            ? 'Are you sure you want to mark this order as paid?'
                            : 'Are you sure you want to cancel this order? This will release all reserved stock.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseActionDialog}>No</Button>
                    <Button
                        onClick={handleConfirmAction}
                        color={actionType === 'pay' ? 'success' : 'error'}
                        autoFocus
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default OrdersPage;