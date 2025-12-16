"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    };
    fetchOrders();
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>Orders</Typography>
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
              <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
