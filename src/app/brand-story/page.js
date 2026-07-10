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
  subtitle: "", heading: "", paragraphOne: "", paragraphTwo: "",
  paragraphThree: "", buttonText: "Explore", buttonLink: "/",
  order: "0", isActive: true, image: null,
};

export default function BrandStoryPage() {
  const [stories, setStories]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [preview, setPreview]       = useState(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/brand-stories");
      setStories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStories(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setPreview(null);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      subtitle: s.subtitle || "",
      heading: s.heading || "",
      paragraphOne: s.paragraphOne || "",
      paragraphTwo: s.paragraphTwo || "",
      paragraphThree: s.paragraphThree || "",
      buttonText: s.buttonText || "Explore",
      buttonLink: s.buttonLink || "/",
      order: String(s.order),
      isActive: s.isActive,
      image: null,
    });
    setPreview(s.image || null);
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
    data.append("subtitle", form.subtitle);
    data.append("heading", form.heading);
    data.append("paragraphOne", form.paragraphOne);
    data.append("paragraphTwo", form.paragraphTwo);
    data.append("paragraphThree", form.paragraphThree);
    data.append("buttonText", form.buttonText);
    data.append("buttonLink", form.buttonLink);
    data.append("order", form.order);
    data.append("isActive", String(form.isActive));
    if (form.image) data.append("image", form.image);

    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/api/brand-stories/${editingId}`, data);
      } else {
        await API.post("/api/brand-stories", data);
      }
      handleClose();
      fetchStories();
    } catch (err) {
      console.error(err);
      alert("Failed to save brand story");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this brand story?")) return;
    try {
      await API.delete(`/api/brand-stories/${id}`);
      fetchStories();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleToggle = async (s) => {
    const data = new FormData();
    data.append("isActive", String(!s.isActive));
    try {
      await API.put(`/api/brand-stories/${s._id}`, data);
      fetchStories();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#fff">
          Brand Story
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={openAdd}
          sx={{ bgcolor: "#6c63ff", "&:hover": { bgcolor: "#574fd6" } }}
        >
          Add Story
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: "#1e1e2f", border: "1px solid #2e2e42" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { color: "#aaa", borderColor: "#2e2e42", fontWeight: 600 } }}>
              <TableCell>Image</TableCell>
              <TableCell>Heading</TableCell>
              <TableCell>Subtitle</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, borderColor: "#2e2e42" }}>
                  <CircularProgress sx={{ color: "#6c63ff" }} />
                </TableCell>
              </TableRow>
            ) : stories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#666", borderColor: "#2e2e42" }}>
                  No brand stories yet. Click "Add Story" to get started.
                </TableCell>
              </TableRow>
            ) : (
              stories.map((s) => (
                <TableRow key={s._id} sx={{ "& td": { borderColor: "#2e2e42" } }}>
                  <TableCell>
                    <img src={s.image} alt={s.heading}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid #2e2e42" }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{s.heading}</TableCell>
                  <TableCell sx={{ color: "#aaa" }}>{s.subtitle}</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>{s.order}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.isActive ? "Active" : "Inactive"}
                      size="small"
                      onClick={() => handleToggle(s)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: s.isActive ? "#166534" : "#7f1d1d",
                        color:   s.isActive ? "#bbf7d0" : "#fecaca",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEdit(s)} sx={{ color: "#6c63ff" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(s._id)} sx={{ color: "#ef4444" }}>
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
          {editingId ? "Edit Brand Story" : "Add New Brand Story"}
        </DialogTitle>

        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Subtitle" value={form.subtitle}
            onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <TextField
            label="Heading" value={form.heading}
            onChange={(e) => setForm((p) => ({ ...p, heading: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <TextField
            label="Paragraph One" value={form.paragraphOne} multiline rows={2}
            onChange={(e) => setForm((p) => ({ ...p, paragraphOne: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <TextField
            label="Paragraph Two" value={form.paragraphTwo} multiline rows={2}
            onChange={(e) => setForm((p) => ({ ...p, paragraphTwo: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <TextField
            label="Paragraph Three" value={form.paragraphThree} multiline rows={2}
            onChange={(e) => setForm((p) => ({ ...p, paragraphThree: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Button Text" value={form.buttonText}
              onChange={(e) => setForm((p) => ({ ...p, buttonText: e.target.value }))}
              fullWidth size="small"
              InputLabelProps={{ sx: { color: "#aaa" } }}
              InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
            />
            <TextField
              label="Button Link" value={form.buttonLink}
              onChange={(e) => setForm((p) => ({ ...p, buttonLink: e.target.value }))}
              fullWidth size="small"
              InputLabelProps={{ sx: { color: "#aaa" } }}
              InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Order (1, 2, 3...)" type="number" value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
              fullWidth size="small"
              InputLabelProps={{ sx: { color: "#aaa" } }}
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
          </Box>

          <Box sx={{ border: "1px solid #2e2e42", borderRadius: 2, p: 2 }}>
            <Typography color="#aaa" fontSize={13} fontWeight={600} mb={1}>
              🖼️ Brand Story Image
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
            {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editingId ? "Update Story" : "Add Story"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}