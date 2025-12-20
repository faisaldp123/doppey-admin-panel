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
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  IconButton,
  Switch,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import useAdminAuth from "../hooks/useAdminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductsPage() {
  const router = useRouter();
  const isLoading = useAdminAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [previewImages, setPreviewImages] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    subCategory: "",
    isActive: true,
    images: [],
  });

  /* ================= FETCH META ================= */

  useEffect(() => {
    const fetchMeta = async () => {
      const [cat, sub] = await Promise.all([
        axios.get(`${API_URL}/api/categories`),
        axios.get(`${API_URL}/api/subcategories`),
      ]);
      setCategories(cat.data);
      setSubCategories(sub.data);
    };
    fetchMeta();
  }, []);

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    if (isLoading) return;

    const token = localStorage.getItem("token");
    if (!token) return router.push("/admin-login");

    const fetchProducts = async () => {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
      setLoading(false);
    };

    fetchProducts();
  }, [isLoading, router]);

  /* ================= IMAGE HANDLING ================= */

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 5) {
      alert("You can upload only 5 images");
      return;
    }

    setForm({ ...form, images: files });
    setPreviewImages(files.map((f) => URL.createObjectURL(f)));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/admin-login");

    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.stock ||
      !form.category ||
      !form.subCategory
    ) {
      return alert("All fields are required");
    }

    if (!editId && form.images.length < 5) {
      return alert("Minimum 5 images required");
    }

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("category", form.category);
    formData.append("subCategory", form.subCategory);
    formData.append("isActive", form.isActive);

    form.images.forEach((img) => formData.append("images", img));

    try {
      const url = editId
        ? `${API_URL}/api/products/${editId}`
        : `${API_URL}/api/products`;

      const method = editId ? axios.put : axios.post;

      await method(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setOpen(false);
      setEditId(null);
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        subCategory: "",
        isActive: true,
        images: [],
      });
      setPreviewImages([]);

      const refreshed = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(refreshed.data);
    } catch (err) {
      alert(err.response?.data?.message || "Product save failed");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  /* ================= EDIT ================= */

  const handleEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category?._id,
      subCategory: p.subCategory?._id,
      isActive: p.isActive,
      images: [],
    });
    setPreviewImages([]);
    setOpen(true);
  };

  if (loading || isLoading) return <CircularProgress />;

  /* ================= UI ================= */

  return (
    <>
      <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
        Products
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Product
      </Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            {["Name", "Price", "Stock", "Status", "Actions"].map((h) => (
              <TableCell key={h} sx={{ color: "white" }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p._id}>
              <TableCell sx={{ color: "white" }}>{p.name}</TableCell>
              <TableCell sx={{ color: "white" }}>₹{p.price}</TableCell>
              <TableCell sx={{ color: "white" }}>{p.stock}</TableCell>
              <TableCell sx={{ color: "white" }}>
                {p.isActive ? "Active" : "Inactive"}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(p)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(p._id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ================= MODAL ================= */}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogContent sx={{ background: "#000" }}>
          <Stack spacing={2}>
            {["name", "description", "price", "stock"].map((f) => (
              <TextField
                key={f}
                label={f.toUpperCase()}
                value={form[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                InputLabelProps={{ sx: { color: "white" } }}
                inputProps={{ sx: { color: "white" } }}
                multiline={f === "description"}
              />
            ))}

            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              InputLabelProps={{ sx: { color: "white" } }}
              SelectProps={{ sx: { color: "white" } }}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="SubCategory"
              value={form.subCategory}
              onChange={(e) =>
                setForm({ ...form, subCategory: e.target.value })
              }
              InputLabelProps={{ sx: { color: "white" } }}
              SelectProps={{ sx: { color: "white" } }}
            >
              {subCategories.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row" alignItems="center">
              <Typography sx={{ color: "white" }}>Active</Typography>
              <Switch
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
            </Stack>

            <Typography sx={{ color: "white" }}>
              Upload Images (5 required)
            </Typography>

            <input type="file" multiple accept="image/*" onChange={handleImageChange} />

            <Typography
              sx={{
                color:
                  !editId && form.images.length < 5 ? "red" : "lightgreen",
                fontSize: 13,
              }}
            >
              {form.images.length} / 5 images selected
            </Typography>

            <Stack direction="row" spacing={1}>
              {previewImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  width={60}
                  height={60}
                  style={{ objectFit: "cover", borderRadius: 6 }}
                />
              ))}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ background: "#000" }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
