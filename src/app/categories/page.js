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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "" });
  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/categories");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    await axios.post("http://localhost:5000/api/categories", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOpen(false);
    fetchCategories();
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
            <TableCell sx={{ color: "#fff !important" }}>Name</TableCell>
            <TableCell sx={{ color: "#fff !important" }}>Slug</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {categories.map((c) => (
            <TableRow key={c._id}>
              <TableCell sx={{ color: "#fff !important" }}>{c.name}</TableCell>
              <TableCell sx={{ color: "#fff !important" }}>{c.slug}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#111",
            color: "#fff",
          },
        }}
      >
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{ style: { color: "#fff" } }}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField
            label="Slug"
            fullWidth
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{ style: { color: "#fff" } }}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
