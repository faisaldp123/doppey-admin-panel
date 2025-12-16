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

export default function ProductsPage() {
  const router = useRouter();

  // Check admin authentication (same hook used in dashboard)
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

  // Fetch products AFTER admin is authenticated
  useEffect(() => {
    if (isLoading) return;

    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.push("/admin-login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProducts(res.data);
      } catch (err) {
        console.log("Fetch Error:", err.response?.data);
        router.push("/admin-login");
      }
    };

    fetchProducts();
  }, [isLoading, router]);

  // Add Product
  const handleAdd = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return router.push("/admin-login");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory);
      formData.append("image", form.image);

      await axios.post("http://localhost:5000/api/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product Added Successfully!");
      setOpen(false);
      window.location.reload();
    } catch (err) {
      alert("Error Adding Product");
      console.log(err);
    }
  };

  // Delete Product
  const handleDelete = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return router.push("/admin-login");

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.reload();
    } catch (err) {
      alert("Error deleting");
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

      {/* Add Product Modal */}
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
            SelectProps={{
              MenuProps: { PaperProps: { sx: { background: "#111", color: "white" } } },
            }}
            inputProps={{ style: { color: "white" } }}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <MenuItem sx={{ color: "white" }} value="mens">Men</MenuItem>
            <MenuItem sx={{ color: "white" }} value="womens">Women</MenuItem>
            <MenuItem sx={{ color: "white" }} value="kids">Kids</MenuItem>
          </TextField>

          <TextField
            select
            label="Sub Category"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ style: { color: "white" } }}
            SelectProps={{
              MenuProps: { PaperProps: { sx: { background: "#111", color: "white" } } },
            }}
            inputProps={{ style: { color: "white" } }}
            onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
          >
            <MenuItem sx={{ color: "white" }} value="winter">Winter</MenuItem>
            <MenuItem sx={{ color: "white" }} value="summer">Summer</MenuItem>
            <MenuItem sx={{ color: "white" }} value="casual">Casual</MenuItem>
          </TextField>

          <input
            type="file"
            accept="image/*"
            style={{ color: "white", marginBottom: "10px" }}
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
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
