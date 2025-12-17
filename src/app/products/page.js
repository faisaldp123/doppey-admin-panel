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
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import useAdminAuth from "../hooks/useAdminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductsPage() {
  const router = useRouter();

  // Admin auth check
  const isLoading = useAdminAuth();

  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    subCategory: "",
    image: null,
  });

  // 🔹 Fetch products
  useEffect(() => {
    if (isLoading) return;

    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin-login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Fetch products failed", err.response?.data);
        router.push("/admin-login");
      }
    };

    fetchProducts();
  }, [isLoading, router]);

  // 🔹 Add Product
  const handleAdd = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/admin-login");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory);
      formData.append("image", form.image);

      await axios.post(`${API_URL}/api/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Product Added Successfully!");
      setOpen(false);

      // Refresh list without full reload
      const res = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      alert("Error Adding Product");
      console.error(err.response?.data || err.message);
    }
  };

  // 🔹 Delete Product
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/admin-login");

    try {
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("Error deleting product");
      console.error(err.response?.data || err.message);
    }
  };

  if (isLoading) return null;

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
        Products
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Product
      </Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "white" }}>Name</TableCell>
            <TableCell sx={{ color: "white" }}>Price</TableCell>
            <TableCell sx={{ color: "white" }}>Category</TableCell>
            <TableCell sx={{ color: "white" }}>Subcategory</TableCell>
            <TableCell sx={{ color: "white" }}>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.map((p) => (
            <TableRow key={p._id}>
              <TableCell sx={{ color: "white" }}>{p.name}</TableCell>
              <TableCell sx={{ color: "white" }}>₹{p.price}</TableCell>
              <TableCell sx={{ color: "white" }}>{p.category}</TableCell>
              <TableCell sx={{ color: "white" }}>{p.subCategory}</TableCell>
              <TableCell>
                <Button color="error" onClick={() => handleDelete(p._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Product Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent sx={{ background: "#000" }}>
          <TextField
            label="Name"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "white" } }}
            inputProps={{ style: { color: "white" } }}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField
            label="Price"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "white" } }}
            inputProps={{ style: { color: "white" } }}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <TextField
            select
            label="Category"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "white" } }}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <MenuItem value="mens">Men</MenuItem>
            <MenuItem value="womens">Women</MenuItem>
            <MenuItem value="kids">Kids</MenuItem>
          </TextField>

          <TextField
            select
            label="Sub Category"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "white" } }}
            onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
          >
            <MenuItem value="winter">Winter</MenuItem>
            <MenuItem value="summer">Summer</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
          </TextField>

          <input
            type="file"
            accept="image/*"
            style={{ color: "white" }}
            onChange={(e) =>
              setForm({ ...form, image: e.target.files[0] })
            }
          />
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
