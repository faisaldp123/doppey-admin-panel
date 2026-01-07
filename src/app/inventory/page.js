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
  CircularProgress,
  Box,
} from "@mui/material";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function InventoryPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        console.log("Fetching inventory from:", `${API}/inventory`);

        const res = await axios.get(`${API}/inventory`, {
          timeout: 10000,
        });

        console.log("Inventory response:", res.data);

        setData(res.data);
      } catch (err) {
        console.error("Inventory fetch error:", err);
        setError("Failed to load inventory. Server not responding.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#fff" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ color: "#fff" }}>
      {/* TITLE */}
      <Typography variant="h5" mb={2} sx={{ color: "#fff", fontWeight: 600 }}>
        Inventory
      </Typography>

      {/* ERROR */}
      {error && (
        <Typography sx={{ color: "#ff4d4f", mb: 2 }}>
          {error}
        </Typography>
      )}

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
              Product
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              SKU
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Quantity
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Reserved
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Warehouse
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
                No inventory data found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item._id}
                sx={{
                  "&:hover": { backgroundColor: "#1a1a2e" },
                }}
              >
                <TableCell sx={{ color: "#fff" }}>
                  {item.product?.name || "-"}
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>{item.sku}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{item.quantity}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{item.reserved}</TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {item.warehouse?.name || "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
