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
  TableContainer,
  Paper,
  TablePagination,
  CircularProgress,
} from "@mui/material";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

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
    <Box sx={{ padding: "20px", width: "100%", minWidth: 0 }}>
      <Typography variant="h4" sx={{ mb: 3, color: "white" }}>
        Users
      </Typography>

      <TableContainer component={Paper} sx={{ width: "100%", maxWidth: "100%", minWidth: 0, display: "block", overflowX: "scroll", overflowY: "hidden", WebkitOverflowScrolling: "touch", bgcolor: "#111", "&::-webkit-scrollbar": { height: 8 }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#9ca3af", borderRadius: 4 } }}>
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "white" }}>User ID</TableCell>
            <TableCell sx={{ color: "white" }}>Phone</TableCell>
            <TableCell sx={{ color: "white" }}>Role</TableCell>
            <TableCell sx={{ color: "white" }}>Created</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u) => (
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
      </TableContainer>
      <TablePagination component="div" count={users.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[]} labelRowsPerPage="Users per page" />
    </Box>
  );
}
