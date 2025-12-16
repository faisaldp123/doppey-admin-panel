"use client";
import useAdminAuth from "../hooks/useAdminAuth";
import { Box, Typography, Button } from "@mui/material";

export default function AdminDashboard() {
  useAdminAuth(); // protect the page

  return (
    <Box sx={{ padding: "40px", color: "white" }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Typography variant="h6" sx={{ mb: 4 }}>
        Welcome, Admin! Here you can manage:
      </Typography>

      <ul style={{ fontSize: "18px", lineHeight: "32px" }}>
        <li>✔ Categories</li>
        <li>✔ Subcategories</li>
        <li>✔ Products</li>
        <li>✔ Orders</li>
        <li>✔ Users</li>
      </ul>
    </Box>
  );
}
