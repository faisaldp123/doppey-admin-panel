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
  TableContainer,
  Paper,
  TablePagination,
} from "@mui/material";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function PaymentsPage() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    axios.get(`${API}/payments`).then((res) => setData(res.data));
  }, []);

  return (
    <Box sx={{ color: "#fff", width: "100%", minWidth: 0 }}>
      {/* TITLE */}
      <Typography variant="h5" mb={2} sx={{ color: "#fff", fontWeight: 600 }}>
        Payments
      </Typography>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ width: "100%", maxWidth: "100%", minWidth: 0, display: "block", overflowX: "scroll", overflowY: "hidden", WebkitOverflowScrolling: "touch", bgcolor: "#121212", borderRadius: 2, "&::-webkit-scrollbar": { height: 8 }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#9ca3af", borderRadius: 4 } }}>
      <Table
        sx={{
          minWidth: 900,
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
            data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
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
      </TableContainer>
      <TablePagination component="div" count={data.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[]} labelRowsPerPage="Payments per page" />
    </Box>
  );
}
