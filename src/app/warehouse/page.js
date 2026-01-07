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

export default function WarehousePage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${API}/warehouse`).then((res) => setData(res.data));
  }, []);

  return (
    <Box sx={{ color: "#fff" }}>
      {/* TITLE */}
      <Typography variant="h5" mb={2} sx={{ color: "#fff", fontWeight: 600 }}>
        Warehouses
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
              Name
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              City
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Manager
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Contact
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{ color: "#aaa", py: 5 }}
              >
                No warehouses found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((w) => (
              <TableRow
                key={w._id}
                sx={{
                  "&:hover": { backgroundColor: "#1a1a2e" },
                }}
              >
                <TableCell sx={{ color: "#fff" }}>{w.name}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{w.city}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{w.managerName}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{w.contact}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
