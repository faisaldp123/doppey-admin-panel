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
  label: "", heading: "", description: "", buttonText: "Shop Now",
  buttonLink: "/", rightTopTitle: "", rightBottomTitle: "",
  isActive: true,
  leftImage: null, rightTopImage: null, rightBottomImage: null,
};

export default function LifestyleSectionsPage() {
  const [sections, setSections]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [previews, setPreviews]     = useState({ leftImage: null, rightTopImage: null, rightBottomImage: null });

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/lifestyle-sections");
      setSections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSections(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setPreviews({ leftImage: null, rightTopImage: null, rightBottomImage: null });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      label: s.label || "",
      heading: s.heading || "",
      description: s.description || "",
      buttonText: s.buttonText || "Shop Now",
      buttonLink: s.buttonLink || "/",
      rightTopTitle: s.rightTopTitle || "",
      rightBottomTitle: s.rightBottomTitle || "",
      isActive: s.isActive,
      leftImage: null,
      rightTopImage: null,
      rightBottomImage: null,
    });
    setPreviews({
      leftImage: s.leftImage || null,
      rightTopImage: s.rightTopImage || null,
      rightBottomImage: s.rightBottomImage || null,
    });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setPreviews({ leftImage: null, rightTopImage: null, rightBottomImage: null });
  };

  const handleImageChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, [field]: file }));
    setPreviews((p) => ({ ...p, [field]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async () => {
    if (!editingId && (!form.leftImage || !form.rightTopImage || !form.rightBottomImage)) {
      alert("Please upload all 3 images");
      return;
    }

    const data = new FormData();
    data.append("label", form.label);
    data.append("heading", form.heading);
    data.append("description", form.description);
    data.append("buttonText", form.buttonText);
    data.append("buttonLink", form.buttonLink);
    data.append("rightTopTitle", form.rightTopTitle);
    data.append("rightBottomTitle", form.rightBottomTitle);
    data.append("isActive", String(form.isActive));
    if (form.leftImage) data.append("leftImage", form.leftImage);
    if (form.rightTopImage) data.append("rightTopImage", form.rightTopImage);
    if (form.rightBottomImage) data.append("rightBottomImage", form.rightBottomImage);

    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/api/lifestyle-sections/${editingId}`, data);
      } else {
        await API.post("/api/lifestyle-sections", data);
      }
      handleClose();
      fetchSections();
    } catch (err) {
      console.error(err);
      alert("Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this section?")) return;
    try {
      await API.delete(`/api/lifestyle-sections/${id}`);
      fetchSections();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleToggle = async (s) => {
    const data = new FormData();
    data.append("isActive", String(!s.isActive));
    try {
      await API.put(`/api/lifestyle-sections/${s._id}`, data);
      fetchSections();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const ImageUploadBox = ({ field, label }) => (
    <Box sx={{ border: "1px solid #2e2e42", borderRadius: 2, p: 2 }}>
      <Typography color="#aaa" fontSize={13} fontWeight={600} mb={1}>{label}</Typography>
      <Button
        variant="outlined" component="label" fullWidth
        sx={{ borderColor: "#2e2e42", color: "#aaa", mb: 1.5, "&:hover": { borderColor: "#6c63ff" } }}
      >
        Choose Image
        <input type="file" accept="image/*" hidden onChange={(e) => handleImageChange(field, e)} />
      </Button>
      {previews[field] ? (
        <img src={previews[field]} alt={label}
          style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #2e2e42" }}
        />
      ) : (
        <Box sx={{ height: 60, bgcolor: "#0f0f1a", borderRadius: 2, border: "1px dashed #2e2e42", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography color="#444" fontSize={11}>No image</Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#fff">
          Lifestyle Sections
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={openAdd}
          sx={{ bgcolor: "#6c63ff", "&:hover": { bgcolor: "#574fd6" } }}
        >
          Add Section
        </Button>
      </Box>

      <Typography sx={{ color: "#666", fontSize: 13, mb: 2 }}>
        New sections are added to the top automatically — no need to set any order.
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: "#1e1e2f", border: "1px solid #2e2e42" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { color: "#aaa", borderColor: "#2e2e42", fontWeight: 600 } }}>
              <TableCell>Images</TableCell>
              <TableCell>Heading</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Added</TableCell>
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
            ) : sections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#666", borderColor: "#2e2e42" }}>
                  No lifestyle sections yet. Click "Add Section" to get started.
                </TableCell>
              </TableRow>
            ) : (
              sections.map((s) => (
                <TableRow key={s._id} sx={{ "& td": { borderColor: "#2e2e42" } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <img src={s.leftImage} alt="left"
                        style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid #2e2e42" }} />
                      <img src={s.rightTopImage} alt="rt"
                        style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid #2e2e42" }} />
                      <img src={s.rightBottomImage} alt="rb"
                        style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid #2e2e42" }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{s.heading}</TableCell>
                  <TableCell sx={{ color: "#aaa" }}>{s.label}</TableCell>
                  <TableCell sx={{ color: "#888", fontSize: 13 }}>
                    {new Date(s.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
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
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#1e1e2f", border: "1px solid #2e2e42" } }}
      >
        <DialogTitle sx={{ color: "#fff", borderBottom: "1px solid #2e2e42" }}>
          {editingId ? "Edit Section" : "Add New Section"}
        </DialogTitle>

        <DialogContent sx={{ pt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Label" value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            fullWidth size="small"
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <TextField
            label="Heading" value={form.heading}
            onChange={(e) => setForm((p) => ({ ...p, heading: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <TextField
            label="Description" value={form.description} multiline rows={3}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            fullWidth size="small"
            InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
            InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Button Text" value={form.buttonText}
              onChange={(e) => setForm((p) => ({ ...p, buttonText: e.target.value }))}
              fullWidth size="small"
              InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
              InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
            />
            <TextField
              label="Button Link" value={form.buttonLink}
              onChange={(e) => setForm((p) => ({ ...p, buttonLink: e.target.value }))}
              fullWidth size="small"
              InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
              InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Right Top Title" value={form.rightTopTitle}
              onChange={(e) => setForm((p) => ({ ...p, rightTopTitle: e.target.value }))}
              fullWidth size="small"
              InputLabelProps={{ shrink: true, sx: { color: "#aaa" } }}
              InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
            />
            <TextField
              label="Right Bottom Title" value={form.rightBottomTitle}
              onChange={(e) => setForm((p) => ({ ...p, rightBottomTitle: e.target.value }))}
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

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <ImageUploadBox field="leftImage" label="⬅️ Left Image" />
            <ImageUploadBox field="rightTopImage" label="↗️ Right Top Image" />
            <ImageUploadBox field="rightBottomImage" label="↘️ Right Bottom Image" />
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
            {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editingId ? "Update Section" : "Add Section"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}