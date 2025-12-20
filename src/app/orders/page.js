"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Typography,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Pagination,
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

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const LIMIT = 6;

  const fetchOrders = async () => {
    const res = await axios.get(`${API}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(
      `${API}/admin/orders/${id}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchOrders();
  };

  /* ================= FILTER + PAGINATION ================= */

  const filtered = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.phone?.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paginated = filtered.slice(
    (page - 1) * LIMIT,
    page * LIMIT
  );

  /* ================= UI ================= */

  return (
    <Box sx={{ color: "white" }}>
      <Typography variant="h4" gutterBottom>
        Orders (Admin)
      </Typography>

      {/* SEARCH */}
      <TextField
        placeholder="Search by Order ID or Phone"
        fullWidth
        sx={{
          mb: 2,
          input: { color: "white" },
          "& fieldset": { borderColor: "white" },
        }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <Table sx={{ background: "#111" }}>
        <TableHead>
          <TableRow>
            {["Order", "User", "Total", "Status", "Action", "View"].map(
              (h) => (
                <TableCell key={h} sx={{ color: "white" }}>
                  {h}
                </TableCell>
              )
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {paginated.map((o) => (
            <TableRow key={o._id}>
              <TableCell sx={{ color: "white" }}>
                #{o._id.slice(-6)}
              </TableCell>

              <TableCell sx={{ color: "white" }}>
                {o.user?.phone}
              </TableCell>

              <TableCell sx={{ color: "white" }}>
                ₹{o.totalAmount}
              </TableCell>

              <TableCell>
                <Chip
                  label={o.status}
                  color={statusColor[o.status]}
                />
              </TableCell>

              <TableCell>
                <Select
                  size="small"
                  value={o.status}
                  onChange={(e) =>
                    updateStatus(o._id, e.target.value)
                  }
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

      {/* PAGINATION */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => setPage(p)}
          color="primary"
        />
      </Box>

      {/* ================= ORDER DETAILS MODAL ================= */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        fullWidth
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={2}>
              <Typography>
                <strong>Order ID:</strong> {selectedOrder._id}
              </Typography>

              <Typography>
                <strong>User:</strong> {selectedOrder.user?.phone}
              </Typography>

              <Typography>
                <strong>Status:</strong> {selectedOrder.status}
              </Typography>

              <Typography>
                <strong>Total:</strong> ₹{selectedOrder.totalAmount}
              </Typography>

              <Typography fontWeight="bold">Products</Typography>
              {selectedOrder.items.map((i) => (
                <Typography key={i._id}>
                  • {i.product?.name} × {i.quantity}
                </Typography>
              ))}

              <Typography fontWeight="bold">Address</Typography>
              <Typography>
                {selectedOrder.address}
              </Typography>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
