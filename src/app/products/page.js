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
  Checkbox,
  FormControlLabel,
  Chip,
  Box,
  Divider,
  TableContainer,
  Paper,
  Avatar,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import useAdminAuth from "../hooks/useAdminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AVAILABLE_SIZES  = ["XS", "S", "M", "L", "XL", "XXL"];
const AVAILABLE_COLORS = ["Black", "White", "Blue", "Red", "Green", "Yellow", "Pink", "Grey", "Brown", "Navy"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  subCategory: "",
  isActive: true,
  images: [],
  brand: "",
  sku: "",
  rating: "",
  discount: "",
  isBestSeller: false,
  isNewArrival: false,
  sizes: [],
  colors: [],
  material: "",
  fit: "",
  shipping: "Free shipping across India. Orders are delivered within 3-7 business days.",
  care: "Machine wash cold. Do not bleach. Tumble dry low. Iron on low heat.",
};

// Single reusable prop object — no duplicate keys possible
const fieldProps = {
  InputLabelProps: { sx: { color: "white" } },
  InputProps:      { sx: { color: "white" } },
};

export default function ProductsPage() {
  const router    = useRouter();
  const isLoading = useAdminAuth();

  const [products,      setProducts]      = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [open,          setOpen]          = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [form,          setForm]          = useState(EMPTY_FORM);

  /* ── helpers ── */
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

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
    if (files.length > 10) { alert("Maximum 10 images allowed"); return; }
    set("images", files);
    setPreviewImages(files.map((f) => URL.createObjectURL(f)));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/admin-login");

    if (!form.name || !form.description || !form.price || !form.stock || !form.category || !form.subCategory) {
      return alert("Name, description, price, stock, category and subcategory are required");
    }
    if (!editId && form.images.length < 5) {
      return alert("Minimum 5 images required");
    }

    const formData = new FormData();

    formData.append("name",         form.name);
    formData.append("description",  form.description);
    formData.append("price",        form.price);
    formData.append("stock",        form.stock);
    formData.append("category",     form.category);
    formData.append("subCategory",  form.subCategory);
    formData.append("isActive",     form.isActive);
    formData.append("brand",        form.brand);
    formData.append("sku",          form.sku);
    formData.append("rating",       form.rating   || 0);
    formData.append("discount",     form.discount || 0);
    formData.append("isBestSeller", form.isBestSeller);
    formData.append("isNewArrival", form.isNewArrival);
    formData.append("material",     form.material);
    formData.append("fit",          form.fit);
    formData.append("shipping",     form.shipping);
    formData.append("care",         form.care);
    formData.append("sizes",        JSON.stringify(form.sizes));
    formData.append("colors",       JSON.stringify(form.colors));

    form.images.forEach((img) => formData.append("images", img));

    try {
      const url    = editId ? `${API_URL}/api/products/${editId}` : `${API_URL}/api/products`;
      const method = editId ? axios.put : axios.post;

      await method(url, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      handleCloseModal();

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
      name:         p.name              || "",
      description:  p.description       || "",
      price:        p.price             || "",
      stock:        p.stock             || "",
      category:     p.category?._id     || "",
      subCategory:  p.subCategory?._id  || "",
      isActive:     p.isActive          ?? true,
      images:       [],
      brand:        p.brand             || "",
      sku:          p.sku               || "",
      rating:       p.rating            ?? "",
      discount:     p.discount          ?? "",
      isBestSeller: p.isBestSeller      || false,
      isNewArrival: p.isNewArrival      || false,
      sizes:        p.sizes             || [],
      colors:       p.colors            || [],
      material:     p.material          || "",
      fit:          p.fit               || "",
      shipping:     p.shipping          || EMPTY_FORM.shipping,
      care:         p.care              || EMPTY_FORM.care,
    });
    setPreviewImages(p.images || []);
    setOpen(true);
  };

  /* ================= CLOSE MODAL ================= */

  const handleCloseModal = () => {
    setOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setPreviewImages([]);
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

      <TableContainer
  component={Paper}
  sx={{
    mt: 2,
    bgcolor: "#111",
    overflowX: "auto",
    borderRadius: 2,
  }}
>
  <Table sx={{ minWidth: 1800 }}>
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: "white" }}>Image</TableCell>
        <TableCell sx={{ color: "white" }}>Name</TableCell>
        <TableCell sx={{ color: "white" }}>Brand</TableCell>
        <TableCell sx={{ color: "white" }}>Category</TableCell>
        <TableCell sx={{ color: "white" }}>SubCategory</TableCell>
        <TableCell sx={{ color: "white" }}>Price</TableCell>
        <TableCell sx={{ color: "white" }}>Stock</TableCell>
        <TableCell sx={{ color: "white" }}>Discount</TableCell>
        <TableCell sx={{ color: "white" }}>Rating</TableCell>
        <TableCell sx={{ color: "white" }}>Sizes</TableCell>
        <TableCell sx={{ color: "white" }}>Colors</TableCell>
        <TableCell sx={{ color: "white" }}>Material</TableCell>
        <TableCell sx={{ color: "white" }}>Fit</TableCell>
        <TableCell sx={{ color: "white" }}>Best Seller</TableCell>
        <TableCell sx={{ color: "white" }}>New Arrival</TableCell>
        <TableCell sx={{ color: "white" }}>Status</TableCell>
        <TableCell sx={{ color: "white" }}>Images</TableCell>
        <TableCell sx={{ color: "white" }}>Actions</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {products.map((p) => (
        <TableRow key={p._id}>

          <TableCell>
            <img
  src={p.images?.[0]}
  alt={p.name}
  style={{
    width: 70,
    height: 70,
    objectFit: "cover",
    borderRadius: 8,
  }}
/>
          </TableCell>

          <TableCell sx={{ color: "white", minWidth: 180 }}>
            {p.name}
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            {p.brand || "-"}
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            {p.category?.name || "-"}
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            {p.subCategory?.name || "-"}
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            ₹{p.price}
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            {p.stock}
          </TableCell>

          <TableCell sx={{ color: "#4caf50" }}>
            {p.discount || 0}%
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            {p.rating || 0}
          </TableCell>

          <TableCell>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
              }}
            >
              {p.sizes?.map((size) => (
                <Chip
                  key={size}
                  label={size}
                  size="small"
                />
              ))}
            </Box>
          </TableCell>

          <TableCell>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
              }}
            >
              {p.colors?.map((color) => (
                <Chip
                  key={color}
                  label={color}
                  size="small"
                />
              ))}
            </Box>
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            {p.material || "-"}
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            {p.fit || "-"}
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            {p.isBestSeller ? "✓" : "—"}
          </TableCell>

          <TableCell sx={{ color: "white" }}>
            {p.isNewArrival ? "✓" : "—"}
          </TableCell>

          <TableCell
            sx={{
              color: p.isActive
                ? "lightgreen"
                : "tomato",
            }}
          >
            {p.isActive ? "Active" : "Inactive"}
          </TableCell>

          <TableCell>
            <Box sx={{ display: "flex", gap: 1 }}>
  {p.images?.slice(0, 3).map((img, idx) => (
    <img
      key={idx}
      src={img}
      alt=""
      style={{
        width: 50,
        height: 50,
        objectFit: "cover",
        borderRadius: 6,
      }}
    />
  ))}

  {p.images?.length > 3 && (
    <Chip label={`+${p.images.length - 3}`} />
  )}
</Box>
          </TableCell>

          <TableCell>
            <IconButton
              onClick={() => handleEdit(p)}
              color="primary"
            >
              <EditIcon />
            </IconButton>

            <IconButton
              onClick={() => handleDelete(p._id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </TableCell>

        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

      {/* ================= MODAL ================= */}

      <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogContent sx={{ background: "#111", overflowY: "auto" }}>
          <Stack spacing={2.5}>

            {/* ── Basic Info ── */}
            <Typography sx={{ color: "white", fontWeight: 600 }}>Basic Info</Typography>

            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              {...fieldProps}
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              multiline
              rows={3}
              {...fieldProps}
            />
            <TextField
              label="Brand"
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              {...fieldProps}
            />
            <TextField
              label="SKU"
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
              {...fieldProps}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Price (₹)"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                type="number"
                fullWidth
                {...fieldProps}
              />
              <TextField
                label="Stock"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
                type="number"
                fullWidth
                {...fieldProps}
              />
              <TextField
                label="Discount (%)"
                value={form.discount}
                onChange={(e) => set("discount", e.target.value)}
                type="number"
                fullWidth
                {...fieldProps}
              />
              {/* Rating — inputProps (lowercase) is separate: only for HTML min/max/step */}
              <TextField
                label="Rating (0-5)"
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                type="number"
                fullWidth
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                {...fieldProps}
              />
            </Stack>

            <Divider sx={{ borderColor: "#333" }} />

            {/* ── Category ── */}
            <Typography sx={{ color: "white", fontWeight: 600 }}>Category</Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                fullWidth
                InputLabelProps={{ sx: { color: "white" } }}
                SelectProps={{ sx: { color: "white" } }}
              >
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="SubCategory"
                value={form.subCategory}
                onChange={(e) => set("subCategory", e.target.value)}
                fullWidth
                InputLabelProps={{ sx: { color: "white" } }}
                SelectProps={{ sx: { color: "white" } }}
              >
                {subCategories.map((s) => (
                  <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Divider sx={{ borderColor: "#333" }} />

            {/* ── Sizes ── */}
            <Typography sx={{ color: "white", fontWeight: 600 }}>Sizes</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {AVAILABLE_SIZES.map((size) => (
                <Chip
                  key={size}
                  label={size}
                  onClick={() => toggleArrayItem("sizes", size)}
                  variant={form.sizes.includes(size) ? "filled" : "outlined"}
                  color={form.sizes.includes(size) ? "primary" : "default"}
                  sx={{ color: "white", borderColor: "#555", cursor: "pointer" }}
                />
              ))}
            </Box>

            {/* ── Colors ── */}
            <Typography sx={{ color: "white", fontWeight: 600 }}>Colors</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {AVAILABLE_COLORS.map((color) => (
                <Chip
                  key={color}
                  label={color}
                  onClick={() => toggleArrayItem("colors", color)}
                  variant={form.colors.includes(color) ? "filled" : "outlined"}
                  color={form.colors.includes(color) ? "secondary" : "default"}
                  sx={{ color: "white", borderColor: "#555", cursor: "pointer" }}
                />
              ))}
            </Box>

            <Divider sx={{ borderColor: "#333" }} />

            {/* ── Product Details ── */}
            <Typography sx={{ color: "white", fontWeight: 600 }}>Product Details</Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Material"
                value={form.material}
                onChange={(e) => set("material", e.target.value)}
                fullWidth
                {...fieldProps}
              />
              <TextField
                label="Fit"
                value={form.fit}
                onChange={(e) => set("fit", e.target.value)}
                fullWidth
                {...fieldProps}
              />
            </Stack>

            <TextField
              label="Shipping Info"
              value={form.shipping}
              onChange={(e) => set("shipping", e.target.value)}
              multiline
              rows={2}
              {...fieldProps}
            />
            <TextField
              label="Care Instructions"
              value={form.care}
              onChange={(e) => set("care", e.target.value)}
              multiline
              rows={2}
              {...fieldProps}
            />

            <Divider sx={{ borderColor: "#333" }} />

            {/* ── Flags ── */}
            <Typography sx={{ color: "white", fontWeight: 600 }}>Flags</Typography>

            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ color: "white" }}>Active</Typography>
                <Switch
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                />
              </Stack>

              <FormControlLabel
                label={<Typography sx={{ color: "white" }}>Best Seller</Typography>}
                control={
                  <Checkbox
                    checked={form.isBestSeller}
                    onChange={(e) => set("isBestSeller", e.target.checked)}
                    sx={{ color: "white" }}
                  />
                }
              />

              <FormControlLabel
                label={<Typography sx={{ color: "white" }}>New Arrival</Typography>}
                control={
                  <Checkbox
                    checked={form.isNewArrival}
                    onChange={(e) => set("isNewArrival", e.target.checked)}
                    sx={{ color: "white" }}
                  />
                }
              />
            </Stack>

            <Divider sx={{ borderColor: "#333" }} />

            {/* ── Images ── */}
            <Typography sx={{ color: "white", fontWeight: 600 }}>
              Images {editId ? "(upload new to replace existing)" : "(min 5 required)"}
            </Typography>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ color: "white" }}
            />

            <Typography sx={{ color: !editId && form.images.length < 5 ? "tomato" : "lightgreen", fontSize: 13 }}>
              {form.images.length > 0
                ? `${form.images.length} new image(s) selected`
                : editId
                ? "No new images — existing images will be kept"
                : "0 / 5 images selected"}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {previewImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  width={70}
                  height={70}
                  style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #333" }}
                />
              ))}
            </Box>

          </Stack>
        </DialogContent>

        <DialogActions sx={{ background: "#111" }}>
          <Button onClick={handleCloseModal} sx={{ color: "white" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editId ? "Update Product" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
