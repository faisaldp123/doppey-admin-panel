"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

const API = process.env.NEXT_PUBLIC_API_URL;
const statuses = ["Placed", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const statusColor = {
  Placed: "default",
  Confirmed: "info",
  Shipped: "warning",
  Delivered: "success",
  Cancelled: "error",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const LIMIT = 6;

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("FIRST ORDER:", res.data[0]);
      setOrders(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const res = await axios.put(
        `${API}/api/admin/orders/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
      setSelectedOrder((prev) => (prev?._id === id ? res.data : prev));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingId("");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o._id?.toLowerCase().includes(q) ||
        o.user?.phone?.includes(search) ||
        o.user?.email?.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const formatAddress = (address = {}) =>
    [
      address.fullName,
      address.phone,
      address.street,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ") || "-";

  return (
    <Box sx={{ color: "white" }}>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>

      <TextField
        placeholder="Search by Order ID, phone, or email"
        fullWidth
        sx={{
          mb: 2,
          input: { color: "white" },
          "& fieldset": { borderColor: "white" },
        }}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <TableContainer component={Paper} sx={{ background: "#111", overflowX: "auto" }}>
        <Table sx={{ minWidth: 940 }}>
          <TableHead>
            <TableRow>
              {["Order", "User", "Total", "Payment", "Status", "Action", "View"].map((h) => (
                <TableCell key={h} sx={{ color: "white" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((o) => (
              <TableRow key={o._id}>
                <TableCell sx={{ color: "white" }}>#{o._id.slice(-6)}</TableCell>
                <TableCell sx={{ color: "white" }}>
  <Box>
    <Typography sx={{ color: "white", fontWeight: 600 }}>
      {o.address?.fullName || o.user?.name || "N/A"}
    </Typography>

    <Typography variant="body2" sx={{ color: "#bdbdbd" }}>
      {o.user?.phone ||
        o.address?.phone ||
        o.user?.email ||
        "-"}
    </Typography>
  </Box>
</TableCell>
                <TableCell sx={{ color: "white" }}>Rs. {o.totalAmount}</TableCell>
                <TableCell sx={{ color: "white" }}>{o.paymentMethod || "-"}</TableCell>
                <TableCell>
                  <Chip sx={{ color: "white" }} label={o.status} color={statusColor[o.status]} />
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={o.status || "Placed"}
                    disabled={updatingId === o._id}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    sx={{
                      color: "white",
                      "& .MuiSvgIcon-root": { color: "white" },
                      "& fieldset": { borderColor: "white" },
                    }}
                  >
                    {statuses.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectedOrder(o)}
                    sx={{ color: "white", borderColor: "white" }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
      </Box>

      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={2}>
              <Typography><strong>Order ID:</strong> {selectedOrder._id}</Typography>
             <Typography>
  <strong>Name:</strong>{" "}
  {selectedOrder.address?.fullName ||
    selectedOrder.user?.name ||
    "-"}
</Typography>

<Typography>
  <strong>Phone:</strong>{" "}
  {selectedOrder.user?.phone ||
    selectedOrder.address?.phone ||
    "-"}
</Typography>

<Typography>
  <strong>Email:</strong>{" "}
  {selectedOrder.user?.email || "-"}
</Typography>
              <Typography><strong>Status:</strong> {selectedOrder.status}</Typography>
              <Typography><strong>Total:</strong> Rs. {selectedOrder.totalAmount}</Typography>
              <Typography><strong>Payment:</strong> {selectedOrder.paymentMethod || "-"}</Typography>
              <Typography><strong>Waybill:</strong> {selectedOrder.waybill || "-"}</Typography>

              <Typography fontWeight="bold">Products</Typography>
              {selectedOrder.items?.map((i) => (
                <Typography key={i._id || i.product?._id}>
                  - {i.product?.name || "Product"} x {i.quantity} at Rs. {i.price}
                </Typography>
              ))}

              <Typography fontWeight="bold">Address</Typography>
              <Typography>{formatAddress(selectedOrder.address)}</Typography>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
