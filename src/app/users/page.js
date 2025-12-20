"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; // ✅ USE AXIOS INSTANCE
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/api/users"); // ✅ NO localhost
        setUsers(res.data);
      } catch (err) {
        console.error("Users fetch error:", err.response?.status);

        // 🔐 Redirect ONLY if token invalid
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/admin-login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "white" }}>
        Users
      </Typography>

      <Table sx={{ background: "#111" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "white" }}>User ID</TableCell>
            <TableCell sx={{ color: "white" }}>Phone</TableCell>
            <TableCell sx={{ color: "white" }}>Role</TableCell>
            <TableCell sx={{ color: "white" }}>Created</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id}>
              <TableCell sx={{ color: "white" }}>{u._id}</TableCell>
              <TableCell sx={{ color: "white" }}>{u.phone}</TableCell>
              <TableCell sx={{ color: "white" }}>{u.role}</TableCell>
              <TableCell sx={{ color: "white" }}>
                {new Date(u.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
