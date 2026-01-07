"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Button,
} from "@mui/material";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ReturnsPage() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${API}/returns`).then((res) => setData(res.data));
  }, []);

  const statusLabels = [
    "In Transit",
    "Out For Delivery",
    "Delivered",
    "Lost",
    "Disposed",
  ];

  const currentStatus = statusLabels[tab];
  const filtered = data.filter((item) => item.status === currentStatus);

  return (
    <Box sx={{ color: "#fff" }}>
      {/* TITLE */}
      <Typography variant="h5" mb={2} sx={{ color: "#fff", fontWeight: 600 }}>
        Return / RTO Orders
      </Typography>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        textColor="inherit"
        TabIndicatorProps={{ style: { backgroundColor: "#fff" } }}
        sx={{
          "& .MuiTab-root": {
            color: "#aaa",
            fontWeight: 500,
          },
          "& .Mui-selected": {
            color: "#fff",
          },
        }}
      >
        <Tab label="In Transit" />
        <Tab label="Out For Delivery" />
        <Tab label="Delivered" />
        <Tab label="Lost" />
        <Tab label="Disposed" />
      </Tabs>

      {/* DOWNLOAD BUTTON */}
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "#555",
            "&:hover": {
              borderColor: "#fff",
              backgroundColor: "rgba(255,255,255,0.05)",
            },
          }}
        >
          Download CSV
        </Button>
      </Box>

      {/* TABLE */}
      <Table
        sx={{
          mt: 2,
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
              Product
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Reason
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
              Expected Delivery
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{ color: "#aaa", py: 5 }}
              >
                No data as of now.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((item) => (
              <TableRow
                key={item._id}
                sx={{
                  "&:hover": { backgroundColor: "#1a1a2e" },
                }}
              >
                <TableCell sx={{ color: "#fff" }}>{item.orderId}</TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {item.product?.name || "-"}
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>{item.reason}</TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {item.expectedDeliveryDate
                    ? new Date(item.expectedDeliveryDate).toDateString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
