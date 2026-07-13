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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import useAdminAuth from "../hooks/useAdminAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23222222'/%3E%3Cpath d='M20 55h40L48 39l-8 10-6-7z' fill='%23555'/%3E%3Ccircle cx='30' cy='28' r='6' fill='%23666'/%3E%3C/svg%3E";

const getMediaUrl = (src) => {
  if (!src) return PLACEHOLDER_IMAGE;
  if (src.startsWith("http") || src.startsWith("blob:") || src.startsWith("data:")) {
    return src;
  }
  if (src.startsWith("/")) return `${API_URL}${src}`;
  return `${API_URL}/${src}`;
};

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
  video: null,
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
  const [previewVideo,  setPreviewVideo]  = useState("");
  const [customColor,   setCustomColor]   = useState("");
  const [form,          setForm]          = useState(EMPTY_FORM);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, Math.max(0, 5 - form.images.length));
    if (!files.length) return;
    const nextImages = [...form.images, ...files].slice(0, 5);
    set("images", nextImages);
    setPreviewImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, 5));
    e.target.value = "";
  };

  const removeImageAt = (index) => {
    set("images", form.images.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomColor = () => {
    const color = customColor.trim();
    if (!color) return;
    if (!form.colors.some((item) => item.toLowerCase() === color.toLowerCase())) {
      set("colors", [...form.colors, color]);
    }
    setCustomColor("");
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0] || null;
    set("video", file);
    setPreviewVideo(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/admin-login");

    if (!form.name || !form.description || !form.price || !form.stock || !form.category || !form.subCategory) {
      return alert("Name, description, price, stock, category and subcategory are required");
    }
    if (!editId && (form.images.length < 1 || form.images.length > 5)) {
      return alert("Upload 1 to 5 product images");
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
    if (form.video) formData.append("video", form.video);

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

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

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
      video:        null,
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
    setPreviewImages((p.images || []).map(getMediaUrl));
    setPreviewVideo(getMediaUrl(p.video));
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setCustomColor("");
    setPreviewImages([]);
    setPreviewVideo("");
  };

  if (loading || isLoading) return <CircularProgress />;

  return (
    // ← Key fix: overflow hidden on wrapper so table scroll is contained
    <Box sx={{ width: "100%", minWidth: 0 }}>

      <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
        Products
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add Product
      </Button>

      {/* ← width:100% + overflowX:auto on the box wrapping the table */}
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          bgcolor: "#111",
          border: "1px solid #222",
          borderRadius: 2,
        }}
      >
        <Table sx={{ minWidth: 1720, borderCollapse: "separate", borderSpacing: 0 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#1a1a2e" }}>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Image</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Name</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Brand</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Category</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>SubCategory</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Price</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Stock</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Discount</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Rating</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Sizes</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Colors</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Material</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Fit</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Best Seller</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>New Arrival</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Status</TableCell>
              <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #333" }}>Media</TableCell>
              <TableCell
                sx={{
                  color: "white",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #333",
                  position: "sticky",
                  right: 0,
                  bgcolor: "#1a1a2e",
                  zIndex: 3,
                  boxShadow: "-4px 0 12px rgba(0,0,0,0.6)",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p._id}
                sx={{
                  bgcolor: "#111",
                  "&:hover": { bgcolor: "#1c1c1c" },
                  "&:hover td:last-child": { bgcolor: "#1c1c2e" },
                }}
              >
                <TableCell sx={{ borderBottom: "1px solid #222" }}>
                  <img
                    src={getMediaUrl(p.images?.[0])}
                    alt={p.name}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                  />
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222", minWidth: 160 }}>
                  {p.name}
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  {p.brand || "-"}
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  {p.category?.name || "-"}
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  {p.subCategory?.name || "-"}
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  ₹{p.price}
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  {p.stock}
                </TableCell>

                <TableCell sx={{ color: "#4caf50", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  {p.discount || 0}%
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  {p.rating || 0}
                </TableCell>

                <TableCell sx={{ borderBottom: "1px solid #222" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, minWidth: 100 }}>
                    {p.sizes?.map((size) => (
                      <Chip key={size} label={size} size="small" sx={{ color: "white", bgcolor: "#333" }} />
                    ))}
                  </Box>
                </TableCell>

                <TableCell sx={{ borderBottom: "1px solid #222" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, minWidth: 120 }}>
                    {p.colors?.map((color) => (
                      <Chip key={color} label={color} size="small" sx={{ color: "white", bgcolor: "#333" }} />
                    ))}
                  </Box>
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  {p.material || "-"}
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  {p.fit || "-"}
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222", textAlign: "center" }}>
                  {p.isBestSeller ? "✓" : "—"}
                </TableCell>

                <TableCell sx={{ color: "white", whiteSpace: "nowrap", borderBottom: "1px solid #222", textAlign: "center" }}>
                  {p.isNewArrival ? "✓" : "—"}
                </TableCell>

                <TableCell sx={{ color: p.isActive ? "lightgreen" : "tomato", whiteSpace: "nowrap", borderBottom: "1px solid #222" }}>
                  {p.isActive ? "Active" : "Inactive"}
                </TableCell>

                <TableCell sx={{ borderBottom: "1px solid #222" }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {p.images?.slice(0, 2).map((img, idx) => (
                      <img
                        key={idx}
                        src={getMediaUrl(img)}
                        alt=""
                        style={{ width: 45, height: 45, objectFit: "cover", borderRadius: 6 }}
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                      />
                    ))}
                    {p.images?.length > 2 && (
                      <Chip label={`+${p.images.length - 2}`} size="small" sx={{ color: "white", bgcolor: "#333" }} />
                    )}
                    {p.video && (
                      <Chip label="🎬" size="small" color="primary" />
                    )}
                  </Box>
                </TableCell>

                {/* Sticky actions — always visible */}
                <TableCell
                  sx={{
                    position: "sticky",
                    right: 0,
                    bgcolor: "#1a1a2e",
                    borderBottom: "1px solid #222",
                    boxShadow: "-4px 0 12px rgba(0,0,0,0.6)",
                    whiteSpace: "nowrap",
                    zIndex: 2,
                  }}
                >
                  <IconButton onClick={() => handleEdit(p)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(p._id)} color="error" size="small">
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

            <Typography sx={{ color: "white", fontWeight: 600 }}>Basic Info</Typography>

            <TextField label="Name" value={form.name} onChange={(e) => set("name", e.target.value)} {...fieldProps} />
            <TextField label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} multiline rows={3} {...fieldProps} />
            <TextField label="Brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} {...fieldProps} />
            <TextField label="SKU" value={form.sku} onChange={(e) => set("sku", e.target.value)} {...fieldProps} />

            <Stack direction="row" spacing={2}>
              <TextField label="Price (₹)" value={form.price} onChange={(e) => set("price", e.target.value)} type="number" fullWidth {...fieldProps} />
              <TextField label="Stock" value={form.stock} onChange={(e) => set("stock", e.target.value)} type="number" fullWidth {...fieldProps} />
              <TextField label="Discount (%)" value={form.discount} onChange={(e) => set("discount", e.target.value)} type="number" fullWidth {...fieldProps} />
              <TextField label="Rating (0-5)" value={form.rating} onChange={(e) => set("rating", e.target.value)} type="number" fullWidth inputProps={{ min: 0, max: 5, step: 0.1 }} {...fieldProps} />
            </Stack>

            <Divider sx={{ borderColor: "#333" }} />

            <Typography sx={{ color: "white", fontWeight: 600 }}>Category</Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                select label="Category" value={form.category}
                onChange={(e) => set("category", e.target.value)} fullWidth
                InputLabelProps={{ sx: { color: "white" } }}
                SelectProps={{ sx: { color: "white" } }}
              >
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select label="SubCategory" value={form.subCategory}
                onChange={(e) => set("subCategory", e.target.value)} fullWidth
                InputLabelProps={{ sx: { color: "white" } }}
                SelectProps={{ sx: { color: "white" } }}
              >
                {subCategories.map((s) => (
                  <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Divider sx={{ borderColor: "#333" }} />

            <Typography sx={{ color: "white", fontWeight: 600 }}>Sizes</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {AVAILABLE_SIZES.map((size) => (
                <Chip
                  key={size} label={size}
                  onClick={() => toggleArrayItem("sizes", size)}
                  variant={form.sizes.includes(size) ? "filled" : "outlined"}
                  color={form.sizes.includes(size) ? "primary" : "default"}
                  sx={{
                    color: form.sizes.includes(size) ? "#fff" : "#374151",
                    bgcolor: form.sizes.includes(size) ? "#e11d48" : "#fff",
                    borderColor: form.sizes.includes(size) ? "#e11d48" : "#d1d5db",
                    cursor: "pointer",
                    fontWeight: 700,
                    "&:hover": { bgcolor: form.sizes.includes(size) ? "#be123c" : "#fff1f2" },
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ color: "white", fontWeight: 600 }}>Colors</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {[...new Set([...AVAILABLE_COLORS, ...form.colors])].map((color) => (
                <Chip
                  key={color} label={color}
                  onClick={() => toggleArrayItem("colors", color)}
                  variant={form.colors.includes(color) ? "filled" : "outlined"}
                  color={form.colors.includes(color) ? "secondary" : "default"}
                  sx={{
                    color: form.colors.includes(color) ? "#fff" : "#374151",
                    bgcolor: form.colors.includes(color) ? "#334155" : "#fff",
                    borderColor: form.colors.includes(color) ? "#334155" : "#d1d5db",
                    cursor: "pointer",
                    fontWeight: 700,
                    "&:hover": { bgcolor: form.colors.includes(color) ? "#1e293b" : "#fff1f2" },
                  }}
                />
              ))}
            </Box>
            <Stack direction="row" spacing={1}>
              <TextField
                label="Add Custom Color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomColor();
                  }
                }}
                fullWidth
                {...fieldProps}
              />
              <Button variant="outlined" onClick={addCustomColor} sx={{ color: "white", borderColor: "#555" }}>
                Add
              </Button>
            </Stack>

            <Divider sx={{ borderColor: "#333" }} />

            <Typography sx={{ color: "white", fontWeight: 600 }}>Product Details</Typography>

            <Stack direction="row" spacing={2}>
              <TextField label="Material" value={form.material} onChange={(e) => set("material", e.target.value)} fullWidth {...fieldProps} />
              <TextField label="Fit" value={form.fit} onChange={(e) => set("fit", e.target.value)} fullWidth {...fieldProps} />
            </Stack>

            <TextField label="Shipping Info" value={form.shipping} onChange={(e) => set("shipping", e.target.value)} multiline rows={2} {...fieldProps} />
            <TextField label="Care Instructions" value={form.care} onChange={(e) => set("care", e.target.value)} multiline rows={2} {...fieldProps} />

            <Divider sx={{ borderColor: "#333" }} />

            <Typography sx={{ color: "white", fontWeight: 600 }}>Flags</Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ color: "white" }}>Active</Typography>
                <Switch checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
              </Stack>
              <FormControlLabel
                label={<Typography sx={{ color: "white" }}>Best Seller</Typography>}
                control={<Checkbox checked={form.isBestSeller} onChange={(e) => set("isBestSeller", e.target.checked)} sx={{ color: "white" }} />}
              />
              <FormControlLabel
                label={<Typography sx={{ color: "white" }}>New Arrival</Typography>}
                control={<Checkbox checked={form.isNewArrival} onChange={(e) => set("isNewArrival", e.target.checked)} sx={{ color: "white" }} />}
              />
            </Stack>

            <Divider sx={{ borderColor: "#333" }} />

            <Typography sx={{ color: "white", fontWeight: 600 }}>
              Images {editId ? "(upload new to replace existing)" : "(1 to 5 required)"}
            </Typography>

            <input type="file" accept="image/*" onChange={handleImageChange} style={{ color: "white" }} />

            <Typography sx={{ color: !editId && form.images.length < 1 ? "tomato" : "lightgreen", fontSize: 13 }}>
              {form.images.length > 0
                ? `${form.images.length} new image(s) selected`
                : editId
                ? "No new images — existing images will be kept"
                : "0 / 5 images selected"}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {previewImages.map((src, i) => (
                <Box key={i} sx={{ position: "relative" }}>
                  <img
                    src={getMediaUrl(src)}
                    width={70}
                    height={70}
                    style={{ objectFit: "cover", borderRadius: 6, border: "1px solid #333" }}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                  />
                  {form.images.length > 0 && (
                    <IconButton
                      size="small"
                      onClick={() => removeImageAt(i)}
                      sx={{ position: "absolute", top: -8, right: -8, bgcolor: "#111", color: "#ef4444" }}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>

            <Typography sx={{ color: "white", fontWeight: 600 }}>Optional Product Video</Typography>

            <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoChange} style={{ color: "white" }} />

            {previewVideo && (
              <video src={previewVideo} controls style={{ width: "100%", maxHeight: 260, borderRadius: 8, background: "#000" }} />
            )}

          </Stack>
        </DialogContent>

        <DialogActions sx={{ background: "#111" }}>
          <Button onClick={handleCloseModal} sx={{ color: "white" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editId ? "Update Product" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
