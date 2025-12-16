"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Card, CardContent, Typography } from "@mui/material";

export default function DashboardPage() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card><CardContent><Typography variant="h6">Total Users</Typography><Typography>{stats.totalUsers}</Typography></CardContent></Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card><CardContent><Typography variant="h6">Total Products</Typography><Typography>{stats.totalProducts}</Typography></CardContent></Card>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Card><CardContent><Typography variant="h6">Total Orders</Typography><Typography>{stats.totalOrders}</Typography></CardContent></Card>
      </Grid>
    </Grid>
  );
}
