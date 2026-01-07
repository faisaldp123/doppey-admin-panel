"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
} from "@mui/material";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${API}/payments`).then((res) => setData(res.data));
  }, []);

  return (
    <Box sx={{ color: "#fff" }}>
      {/* TITLE */}
      <Typography variant="h5" mb={2} sx={{ color: "#fff", fontWeight: 600 }}>
        Payments
      </Typography>

      {/* TABLE */}
      <Table
        sx={{
          bgcolor: "#121212",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: "#1e1e2f" }}>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Order ID
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Amount
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Method
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Status
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Transaction ID
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                sx={{ color: "#aaa", py: 5 }}
              >
                No payments found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((p) => (
              <TableRow
                key={p._id}
                sx={{
                  "&:hover": { backgroundColor: "#1a1a2e" },
                }}
              >
                <TableCell sx={{ color: "#fff" }}>{p.orderId}</TableCell>
                <TableCell sx={{ color: "#fff" }}>₹{p.amount}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{p.method}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{p.status}</TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {p.transactionId || "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
