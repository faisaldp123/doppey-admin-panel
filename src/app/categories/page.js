"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [token, setToken] = useState(null);

  // ✅ Get token safely (browser only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      setToken(t);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Fetch categories failed", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!token) {
      alert("Unauthorized");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/categories`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOpen(false);
      setForm({ name: "", slug: "" });
      fetchCategories();
    } catch (err) {
      console.error("Add category failed", err);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: "#fff" }}>
        Categories
      </Typography>

      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        sx={{ background: "#fff", color: "#000", fontWeight: "bold" }}
      >
        Add Category
      </Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "#fff" }}>Name</TableCell>
            <TableCell sx={{ color: "#fff" }}>Slug</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {categories.map((c) => (
            <TableRow key={c._id}>
              <TableCell sx={{ color: "#fff" }}>{c.name}</TableCell>
              <TableCell sx={{ color: "#fff" }}>{c.slug}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { backgroundColor: "#111", color: "#fff" },
        }}
      >
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{ style: { color: "#fff" } }}
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <TextField
            label="Slug"
            fullWidth
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{ style: { color: "#fff" } }}
            value={form.slug}
            onChange={(e) =>
              setForm({ ...form, slug: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button sx={{ color: "#fff" }} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
