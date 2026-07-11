"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import API from "@/lib/axios";

// ← Same fixed order as backend — pick one, sequence is automatic
const CATEGORY_OPTIONS = ["All", "Men", "Women", "Kids", "Accessories"];

const emptyForm = { title: "All", link: "/", isActive: true, image: null };

export default function ShopCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [preview, setPreview]       = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/shop-categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setPreview(null);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat._id);
    setForm({
      title: cat.title || "All",
      link: cat.link || "/",
      isActive: cat.isActive,
      image: null,
    });
    setPreview(cat.image || null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!editingId && !form.image) {
      alert("Please upload an image");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("link", form.link);
    data.append("isActive", String(form.isActive));
    if (form.image) data.append("image", form.image);

    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/api/shop-categories/${editingId}`, data);
      } else {
        await API.post("/api/shop-categories", data);
      }
      handleClose();
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await API.delete(`/api/shop-categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleToggle = async (cat) => {
    const data = new FormData();
    data.append("isActive", String(!cat.isActive));
    try {
      await API.put(`/api/shop-categories/${cat._id}`, data);
      fetchCategories();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#fff">
          Shop Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={openAdd}
          sx={{ bgcolor: "#6c63ff", "&:hover": { bgcolor: "#574fd6" } }}
        >
          Add Category
        </Button>
      </Box>

      <Typography sx={{ color: "#666", fontSize: 13, mb: 2 }}>
        Categories always appear in this order on your site: All → Men → Women → Kids → Accessories.
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: "#1e1e2f", border: "1px solid #2e2e42" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { color: "#aaa", borderColor: "#2e2e42", fontWeight: 600 } }}>
              <TableCell>Image</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, borderColor: "#2e2e42" }}>
                  <CircularProgress sx={{ color: "#6c63ff" }} />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#666", borderColor: "#2e2e42" }}>
                  No categories yet. Click "Add Category" to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat._id} sx={{ "& td": { borderColor: "#2e2e42" } }}>
                  <TableCell>
                    <img src={cat.image} alt={cat.title}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid #2e2e42" }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>{cat.title}</TableCell>
                  <TableCell sx={{ color: "#aaa" }}>{cat.link}</TableCell>
                  <TableCell>
                    <Chip
                      label={cat.isActive ? "Active" : "Inactive"}
                      size="small"
                      onClick={() => handleToggle(cat)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: cat.isActive ? "#166534" : "#7f1d1d",
                        color:   cat.isActive ? "#bbf7d0" : "#fecaca",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEdit(cat)} sx={{ color: "#6c63ff" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(cat._id)} sx={{ color: "#ef4444" }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#1e1e2f", border: "1px solid #2e2e42" } }}
      >
        <DialogTitle sx={{ color: "#fff", borderBottom: "1px solid #2e2e42" }}>
          {editingId ? "Edit Category" : "Add New Category"}
        </DialogTitle>

        <DialogContent sx={{ pt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Category"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            fullWidth size="small"
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Link"
            placeholder="/category/men or /shop"
            value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
            }
            label={<Typography color="#aaa">Active</Typography>}
          />

          <Box sx={{ border: "1px solid #2e2e42", borderRadius: 2, p: 2 }}>
            <Typography color="#aaa" fontSize={13} fontWeight={600} mb={1}>
              🖼️ Category Image
            </Typography>
            <Button
              variant="outlined" component="label" fullWidth
              sx={{ borderColor: "#2e2e42", color: "#aaa", mb: 2, "&:hover": { borderColor: "#6c63ff" } }}
            >
              Choose Image
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            {preview ? (
              <img src={preview} alt="preview"
                style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #2e2e42" }}
              />
            ) : (
              <Box sx={{ height: 60, bgcolor: "#0f0f1a", borderRadius: 2, border: "1px dashed #2e2e42", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="#444" fontSize={12}>No image selected</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid #2e2e42", px: 3, py: 2 }}>
          <Button onClick={handleClose} sx={{ color: "#aaa" }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            sx={{ bgcolor: "#6c63ff", "&:hover": { bgcolor: "#574fd6" } }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editingId ? "Update Category" : "Add Category"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}