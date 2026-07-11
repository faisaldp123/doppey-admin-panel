"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import API from "@/lib/axios";

const emptyForm = {
  title: "", subtitle: "", buttonText: "Shop Now", buttonLink: "/",
  isActive: true, backgroundImage: null,
};

export default function PromoBannersPage() {
  const [banners, setBanners]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [preview, setPreview]       = useState(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/promo-banners");
      setBanners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setPreview(null);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (b) => {
    setEditingId(b._id);
    setForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      buttonText: b.buttonText || "Shop Now",
      buttonLink: b.buttonLink || "/",
      isActive: b.isActive,
      backgroundImage: null,
    });
    setPreview(b.backgroundImage || null);
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
    setForm((p) => ({ ...p, backgroundImage: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!editingId && !form.backgroundImage) {
      alert("Please upload a background image");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("subtitle", form.subtitle);
    data.append("buttonText", form.buttonText);
    data.append("buttonLink", form.buttonLink);
    data.append("isActive", String(form.isActive));
    if (form.backgroundImage) data.append("backgroundImage", form.backgroundImage);

    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/api/promo-banners/${editingId}`, data);
      } else {
        await API.post("/api/promo-banners", data);
      }
      handleClose();
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await API.delete(`/api/promo-banners/${id}`);
      fetchBanners();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleToggle = async (b) => {
    const data = new FormData();
    data.append("isActive", String(!b.isActive));
    try {
      await API.put(`/api/promo-banners/${b._id}`, data);
      fetchBanners();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#fff">
          Promo Banners
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={openAdd}
          sx={{ bgcolor: "#6c63ff", "&:hover": { bgcolor: "#574fd6" } }}
        >
          Add Banner
        </Button>
      </Box>

      <Typography sx={{ color: "#666", fontSize: 13, mb: 2 }}>
        New banners are added to the top automatically — no need to set any order.
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: "#1e1e2f", border: "1px solid #2e2e42" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { color: "#aaa", borderColor: "#2e2e42", fontWeight: 600 } }}>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Subtitle</TableCell>
              <TableCell>Button</TableCell>
              <TableCell>Added</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, borderColor: "#2e2e42" }}>
                  <CircularProgress sx={{ color: "#6c63ff" }} />
                </TableCell>
              </TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: "#666", borderColor: "#2e2e42" }}>
                  No promo banners yet. Click "Add Banner" to get started.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((b) => (
                <TableRow key={b._id} sx={{ "& td": { borderColor: "#2e2e42" } }}>
                  <TableCell>
                    <img src={b.backgroundImage} alt={b.title}
                      style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 6, border: "1px solid #2e2e42" }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{b.title}</TableCell>
                  <TableCell sx={{ color: "#aaa" }}>{b.subtitle}</TableCell>
                  <TableCell sx={{ color: "#aaa" }}>{b.buttonText}</TableCell>
                  <TableCell sx={{ color: "#888", fontSize: 13 }}>
                    {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={b.isActive ? "Active" : "Inactive"}
                      size="small"
                      onClick={() => handleToggle(b)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: b.isActive ? "#166534" : "#7f1d1d",
                        color:   b.isActive ? "#bbf7d0" : "#fecaca",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEdit(b)} sx={{ color: "#6c63ff" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(b._id)} sx={{ color: "#ef4444" }}>
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
          {editingId ? "Edit Banner" : "Add New Banner"}
        </DialogTitle>

        <DialogContent sx={{ pt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            fullWidth size="small"
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <TextField
            label="Subtitle"
            value={form.subtitle}
            onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Button Text"
              value={form.buttonText}
              onChange={(e) => setForm((p) => ({ ...p, buttonText: e.target.value }))}
              fullWidth size="small"
              InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
              InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
            />
            <TextField
              label="Button Link"
              placeholder="/shop"
              value={form.buttonLink}
              onChange={(e) => setForm((p) => ({ ...p, buttonLink: e.target.value }))}
              fullWidth size="small"
              InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
              InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
            />
          </Box>

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
              🖼️ Background Image
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
            {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editingId ? "Update Banner" : "Add Banner"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}