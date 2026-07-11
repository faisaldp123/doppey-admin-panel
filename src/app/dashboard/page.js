"use client";
import { useEffect, useState } from "react";
import useAdminAuth from "../hooks/useAdminAuth";
import API from "@/lib/axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory2";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import { useRouter } from "next/navigation";

// Handles responses that are either a bare array, or nested like
// { orders: [...] } / { data: [...] } / { returns: [...] }
const extractArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

export default function AdminDashboard() {
  useAdminAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ orders: null, products: null, returns: null });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [ordersResult, productsResult, returnsResult] = await Promise.allSettled([
        API.get("/api/admin/orders"), // ← admin-only route, returns ALL orders
        API.get("/api/products"),
        API.get("/api/returns"),
      ]);

      const newErrors = { orders: null, products: null, returns: null };

      if (ordersResult.status === "fulfilled") {
        setOrders(extractArray(ordersResult.value.data, ["orders", "data"]));
      } else {
        console.error("Orders fetch error:", ordersResult.reason);
        newErrors.orders = "Couldn't load orders.";
      }

      if (productsResult.status === "fulfilled") {
        setProducts(extractArray(productsResult.value.data, ["products", "data"]));
      } else {
        console.error("Products fetch error:", productsResult.reason);
        newErrors.products = "Couldn't load products.";
      }

      if (returnsResult.status === "fulfilled") {
        setReturns(extractArray(returnsResult.value.data, ["returns", "data"]));
      } else {
        console.error("Returns fetch error:", returnsResult.reason);
        newErrors.returns = "Couldn't load returns.";
      }

      setErrors(newErrors);
      setLoading(false);
    };

    fetchData();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount || o.amount || 0),
    0
  );
  const pendingReturns = returns.filter(
    (r) => r.status !== "Delivered" && r.status !== "Lost"
  ).length;

  const cardStyle = {
    bgcolor: "#121212",
    borderRadius: 3,
    p: 2.5,
    height: "100%",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    border: "1px solid #1f1f2e",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      borderColor: "#6C63FF",
    },
  };

  const statCardStyle = {
    ...cardStyle,
    display: "flex",
    alignItems: "center",
    gap: 2,
    p: 3,
  };

  const iconBadgeStyle = (bg) => ({
    width: 52,
    height: 52,
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: bg,
    flexShrink: 0,
  });

  const headerRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 1.5,
  };

  const tableHeaderCell = {
    color: "#aaa",
    fontWeight: 600,
    borderBottom: "1px solid #222",
  };

  const tableCell = {
    color: "#fff",
    borderBottom: "1px solid #1f1f2e",
    fontSize: "14px",
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#6C63FF" }} />
      </Box>
    );
  }

  const hasAnyError = errors.orders || errors.products || errors.returns;

  return (
    <Box sx={{ p: 3, color: "#fff" }}>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "#fff" }}>
          Welcome Doppey Apparel 👋
        </Typography>
        <Typography sx={{ color: "#888" }}>
          Here's what's happening in your store today
        </Typography>
      </Box>

      {hasAnyError && (
        <Paper sx={{ ...cardStyle, mb: 3, borderColor: "#f44336", bgcolor: "#2a1414" }}>
          {errors.orders && <Typography sx={{ color: "#ff6b6b", fontWeight: 600 }}>{errors.orders}</Typography>}
          {errors.products && <Typography sx={{ color: "#ff6b6b", fontWeight: 600 }}>{errors.products}</Typography>}
          {errors.returns && <Typography sx={{ color: "#ff6b6b", fontWeight: 600 }}>{errors.returns}</Typography>}
        </Paper>
      )}

      {/* STAT CARDS */}
      <Grid container spacing={3} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCardStyle}>
            <Box sx={iconBadgeStyle("rgba(108,99,255,0.15)")}>
              <ShoppingBagIcon sx={{ color: "#6C63FF" }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontSize: 13, opacity: 0.8 }}>Total Orders</Typography>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>{orders.length}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCardStyle}>
            <Box sx={iconBadgeStyle("rgba(76,175,80,0.15)")}>
              <CurrencyRupeeIcon sx={{ color: "#4caf50" }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontSize: 13, opacity: 0.8 }}>Total Revenue</Typography>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>
                ₹{totalRevenue.toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCardStyle}>
            <Box sx={iconBadgeStyle("rgba(255,152,0,0.15)")}>
              <InventoryIcon sx={{ color: "#ff9800" }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontSize: 13, opacity: 0.8 }}>Total Products</Typography>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>{products.length}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={statCardStyle}>
            <Box sx={iconBadgeStyle("rgba(244,67,54,0.15)")}>
              <AssignmentReturnIcon sx={{ color: "#f44336" }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontSize: 13, opacity: 0.8 }}>Pending Returns</Typography>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 22 }}>{pendingReturns}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* ORDERS */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box sx={headerRowStyle}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#fff" }}>
                Latest Orders
              </Typography>
              <Button
                size="small"
                onClick={() => router.push("/orders")}
                sx={{ color: "#6C63FF", textTransform: "none", fontWeight: 600 }}
              >
                View More →
              </Button>
            </Box>

            <Divider sx={{ mb: 1.5, borderColor: "#1f1f2e" }} />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCell}>Order ID</TableCell>
                  <TableCell sx={tableHeaderCell}>Amount</TableCell>
                  <TableCell sx={tableHeaderCell}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ color: "#666", py: 3, textAlign: "center" }}>
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.slice(0, 5).map((o) => (
                    <TableRow key={o._id} sx={{ "&:hover": { backgroundColor: "#1a1a2e" } }}>
                      <TableCell sx={tableCell}>#{o._id?.slice(-6)}</TableCell>
                      <TableCell sx={tableCell}>
                        ₹{Number(o.totalAmount || o.amount || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell sx={tableCell}>
                        <Chip
                          label={o.status || "Pending"}
                          size="small"
                          sx={{
                            bgcolor:
                              o.status === "Delivered"
                                ? "#16341f"
                                : o.status === "Cancelled"
                                ? "#3a1414"
                                : "#3a2a10",
                            color:
                              o.status === "Delivered"
                                ? "#4caf50"
                                : o.status === "Cancelled"
                                ? "#f44336"
                                : "#ff9800",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* PRODUCTS */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box sx={headerRowStyle}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#fff" }}>
                Latest Products
              </Typography>
              <Button
                size="small"
                onClick={() => router.push("/products")}
                sx={{ color: "#6C63FF", textTransform: "none", fontWeight: 600 }}
              >
                View More →
              </Button>
            </Box>

            <Divider sx={{ mb: 1.5, borderColor: "#1f1f2e" }} />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCell}>Name</TableCell>
                  <TableCell sx={tableHeaderCell}>Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ color: "#666", py: 3, textAlign: "center" }}>
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.slice(0, 5).map((p) => (
                    <TableRow key={p._id} sx={{ "&:hover": { backgroundColor: "#1a1a2e" } }}>
                      <TableCell sx={tableCell}>{p.name}</TableCell>
                      <TableCell sx={tableCell}>
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* RETURNS – FULL WIDTH */}
        <Grid item xs={12}>
          <Paper sx={cardStyle}>
            <Box sx={headerRowStyle}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#fff" }}>
                Recent Returns / RTO
              </Typography>
              <Button
                size="small"
                onClick={() => router.push("/returns")}
                sx={{ color: "#6C63FF", textTransform: "none", fontWeight: 600 }}
              >
                View More →
              </Button>
            </Box>

            <Divider sx={{ mb: 1.5, borderColor: "#1f1f2e" }} />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCell}>Order ID</TableCell>
                  <TableCell sx={tableHeaderCell}>Reason</TableCell>
                  <TableCell sx={tableHeaderCell}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {returns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ color: "#666", py: 3, textAlign: "center" }}>
                      No returns found
                    </TableCell>
                  </TableRow>
                ) : (
                  returns.slice(0, 5).map((r) => (
                    <TableRow key={r._id} sx={{ "&:hover": { backgroundColor: "#1a1a2e" } }}>
                      <TableCell sx={tableCell}>{r.orderId}</TableCell>
                      <TableCell sx={tableCell}>{r.reason}</TableCell>
                      <TableCell sx={tableCell}>
                        <Chip
                          label={r.status}
                          size="small"
                          sx={{
                            bgcolor:
                              r.status === "Delivered"
                                ? "#16341f"
                                : r.status === "Lost"
                                ? "#3a1414"
                                : "#3a2a10",
                            color:
                              r.status === "Delivered"
                                ? "#4caf50"
                                : r.status === "Lost"
                                ? "#f44336"
                                : "#ff9800",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}