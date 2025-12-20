"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Stack,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SubCategoryPage() {
  const router = useRouter();
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", parentCategory: "" });

  // Fetch subcategories and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Categories
        const catRes = await axios.get(`${API_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(catRes.data);

        // Subcategories
        const subRes = await axios.get(`${API_URL}/api/subcategories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubCategories(subRes.data);
      } catch (err) {
        console.error(err);
        router.push("/admin-login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleAdd = async () => {
    if (!form.name || !form.parentCategory) {
      alert("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/subcategories`,
        {
          name: form.name,
          parentCategory: form.parentCategory,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubCategories((prev) => [...prev, res.data]);
      setForm({ name: "", parentCategory: "" });
      setOpen(false); // close modal
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Error creating subcategory");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this subcategory?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubCategories((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting subcategory");
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
        SubCategories
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Add SubCategory
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "white" }}>Name</TableCell>
            <TableCell sx={{ color: "white" }}>Parent Category</TableCell>
            <TableCell sx={{ color: "white" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subCategories.map((s) => (
            <TableRow key={s._id}>
              <TableCell sx={{ color: "white" }}>{s.name}</TableCell>
              <TableCell sx={{ color: "white" }}>
                {s.parentCategory?.name}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(s._id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add SubCategory Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ background: "#000" }}>
          <Stack spacing={2}>
            <TextField
              label="Subcategory Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              InputLabelProps={{ style: { color: "white" } }}
              inputProps={{ style: { color: "white" } }}
              fullWidth
            />
            <TextField
              select
              label="Parent Category"
              value={form.parentCategory}
              onChange={(e) =>
                setForm({ ...form, parentCategory: e.target.value })
              }
              InputLabelProps={{ style: { color: "white" } }}
              fullWidth
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ background: "#000" }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
