"use client";
import { useEffect, useState } from "react";
import useAdminAuth from "../hooks/useAdminAuth";
import axios from "axios";
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
} from "@mui/material";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  useAdminAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes, returnsRes] = await Promise.all([
          axios.get(`${API}/orders`),
          axios.get(`${API}/products`),
          axios.get(`${API}/returns`),
        ]);

        setOrders(ordersRes.data.slice(0, 5));
        setProducts(productsRes.data.slice(0, 5));
        setReturns(returnsRes.data.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
  }, []);

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

  return (
    <Box sx={{ p: 3, color: "#fff" }}>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Welcome Doppey Apparel 👋
        </Typography>
        <Typography sx={{ color: "#888" }}>
          Here’s what’s happening in your store today
        </Typography>
      </Box>

      <Grid container spacing={3}>
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
                sx={{
                  color: "#6C63FF",
                  textTransform: "none",
                  fontWeight: 600,
                }}
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
                    <TableCell colSpan={3} sx={{ color: "#666", py: 2 }}>
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow
                      key={o._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#1a1a2e",
                        },
                      }}
                    >
                      <TableCell sx={tableCell}>
                        #{o._id.slice(-6)}
                      </TableCell>
                      <TableCell sx={tableCell}>
                        ₹{o.totalAmount || o.amount || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...tableCell,
                          color:
                            o.status === "Delivered"
                              ? "#4caf50"
                              : o.status === "Cancelled"
                              ? "#f44336"
                              : "#ff9800",
                          fontWeight: 600,
                        }}
                      >
                        {o.status || "Pending"}
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
                sx={{
                  color: "#6C63FF",
                  textTransform: "none",
                  fontWeight: 600,
                }}
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
                    <TableCell colSpan={2} sx={{ color: "#666", py: 2 }}>
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow
                      key={p._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#1a1a2e",
                        },
                      }}
                    >
                      <TableCell sx={tableCell}>{p.name}</TableCell>
                      <TableCell sx={tableCell}>₹{p.price}</TableCell>
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
                sx={{
                  color: "#6C63FF",
                  textTransform: "none",
                  fontWeight: 600,
                }}
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
                    <TableCell colSpan={3} sx={{ color: "#666", py: 2 }}>
                      No returns found
                    </TableCell>
                  </TableRow>
                ) : (
                  returns.map((r) => (
                    <TableRow
                      key={r._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#1a1a2e",
                        },
                      }}
                    >
                      <TableCell sx={tableCell}>{r.orderId}</TableCell>
                      <TableCell sx={tableCell}>{r.reason}</TableCell>
                      <TableCell
                        sx={{
                          ...tableCell,
                          color:
                            r.status === "Delivered"
                              ? "#4caf50"
                              : r.status === "Lost"
                              ? "#f44336"
                              : "#ff9800",
                          fontWeight: 600,
                        }}
                      >
                        {r.status}
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
