"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Barcode from "react-barcode";
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

// ← EDIT THESE with your actual store/warehouse details —
// they print as the "Sender" on every label.
const STORE_INFO = {
  name: "Doppey Apparel",
  address: "H.No-536, Street No. 08, Moonga Nagar, Karawal Nagar, Dayalpur, Delhi - 110094",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState("");

  // ← NEW: holds the order currently being printed, so the hidden
  // label template below can render its data before window.print() fires.
  const [printOrder, setPrintOrder] = useState(null);

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

  // ← NEW: sets the order to print, then waits a tick for the hidden
  // label template to render with that order's data before printing.
  const handlePrintLabel = (order) => {
    if (!order.waybill) {
      alert("This order has no waybill/AWB number yet — nothing to print.");
      return;
    }
    setPrintOrder(order);
    setTimeout(() => window.print(), 150);
  };

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
        Orders
      </Typography>
      <Typography color="text.secondary">Manage fulfilment, payments, delivery status, and shipping labels.</Typography>
      </Box>

      <TextField
        placeholder="Search by Order ID, phone, or email"
        fullWidth
        sx={{
          mb: 2,
          maxWidth: 620,
          bgcolor: "#fff",
        }}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 940 }}>
          <TableHead>
            <TableRow>
              {["Order", "User", "Total", "Payment", "Status", "Action", "View", "Label"].map((h) => (
                <TableCell key={h}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((o) => (
              <TableRow key={o._id}>
                <TableCell sx={{ fontWeight: 700 }}>#{o._id.slice(-6)}</TableCell>
                <TableCell>
  <Box>
    <Typography sx={{ fontWeight: 600 }}>
      {o.address?.fullName || o.user?.name || "N/A"}
    </Typography>

    <Typography variant="body2" color="text.secondary">
      {o.user?.phone ||
        o.address?.phone ||
        o.user?.email ||
        "-"}
    </Typography>
  </Box>
</TableCell>
                <TableCell>Rs. {o.totalAmount}</TableCell>
                <TableCell>{o.paymentMethod || "-"}</TableCell>
                <TableCell>
                  <Chip size="small" label={o.status} color={statusColor[o.status]} />
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={o.status || "Placed"}
                    disabled={updatingId === o._id}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    sx={{
                      minWidth: 120,
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
                    sx={{ borderColor: "#d1d5db" }}
                  >
                    View
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!o.waybill}
                    onClick={() => handlePrintLabel(o)}
                    sx={{ borderColor: "#d1d5db" }}
                  >
                    Print Label
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

              <Button
                variant="contained"
                disabled={!selectedOrder.waybill}
                onClick={() => handlePrintLabel(selectedOrder)}
              >
                Print Label
              </Button>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= PRINTABLE SHIPPING LABEL =================
          Hidden on screen at all times; only becomes visible inside
          the browser's print dialog thanks to the @media print rules
          below, which hide everything else on the page. */}
      {printOrder && (
        <Box id="print-label">
          <Box className="labelBox">
            <Box className="labelHeader">
              <Typography className="labelStoreName">{STORE_INFO.name}</Typography>
              <Typography className="labelSmall">{STORE_INFO.address}</Typography>
            </Box>

            <Box className="labelDivider" />

            <Typography className="labelSectionTitle">DELIVER TO</Typography>
            <Typography className="labelReceiverName">
              {printOrder.address?.fullName || printOrder.user?.name || "-"}
            </Typography>
            <Typography className="labelText">
              {[
                printOrder.address?.street,
                printOrder.address?.city,
                printOrder.address?.state,
                printOrder.address?.pincode,
              ]
                .filter(Boolean)
                .join(", ")}
            </Typography>
            <Typography className="labelText">
              Ph: {printOrder.address?.phone || printOrder.user?.phone || "-"}
            </Typography>

            <Box className="labelDivider" />

            <Box className="labelRow">
              <Typography className="labelSmall">
                Order #{printOrder._id?.slice(-6)}
              </Typography>
              <Typography className="labelSmall">
                {printOrder.paymentMethod === "cod"
                  ? `COD: Rs. ${printOrder.totalAmount}`
                  : "PREPAID"}
              </Typography>
            </Box>

            <Box className="labelBarcodeWrap">
              <Barcode
                value={printOrder.waybill || "NA"}
                format="CODE128"
                width={1.4}
                height={45}
                fontSize={12}
                margin={4}
              />
            </Box>

            <Typography className="labelSmall" sx={{ mt: 1 }}>
              Items:{" "}
              {printOrder.items
                ?.map((i) => `${i.product?.name || "Item"} x${i.quantity}`)
                .join(", ")}
            </Typography>
          </Box>
        </Box>
      )}

      <style jsx global>{`
        #print-label {
          display: none;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #print-label,
          #print-label * {
            visibility: visible;
          }
          #print-label {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .labelBox {
            width: 4in;
            min-height: 5.75in;
            margin: 0 auto;
            padding: 16px;
            border: 2px solid #000;
            font-family: Arial, sans-serif;
            color: #000;
          }
          .labelHeader {
            text-align: center;
            margin-bottom: 8px;
          }
          .labelStoreName {
            font-size: 16px;
            font-weight: 700;
          }
          .labelSmall {
            font-size: 11px;
          }
          .labelDivider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .labelSectionTitle {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          .labelReceiverName {
            font-size: 16px;
            font-weight: 700;
            margin-top: 2px;
          }
          .labelText {
            font-size: 13px;
            margin-top: 2px;
          }
          .labelRow {
            display: flex;
            justify-content: space-between;
            margin-top: 6px;
          }
          .labelBarcodeWrap {
            text-align: center;
            margin-top: 10px;
          }
        }
      `}</style>
    </Box>
  );
}
