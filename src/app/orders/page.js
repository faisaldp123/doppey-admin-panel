"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(null);

  // ✅ Safe localStorage access
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      setToken(t);
    }
  }, []);

  // ✅ Fetch orders once token is available
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Fetch orders failed", err);
      }
    };

    fetchOrders();
  }, [token]);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {orders.map((o) => (
            <TableRow key={o._id}>
              <TableCell>{o.user?.name || "N/A"}</TableCell>
              <TableCell>{o.status}</TableCell>
              <TableCell>₹{o.totalAmount}</TableCell>
              <TableCell>
                {new Date(o.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
