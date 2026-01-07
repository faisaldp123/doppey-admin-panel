"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Typography, CircularProgress
} from "@mui/material";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function InventoryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/inventory`).then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5" mb={2}>Inventory</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Reserved</TableCell>
            <TableCell>Warehouse</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{item.product?.name}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.reserved}</TableCell>
              <TableCell>{item.warehouse?.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
