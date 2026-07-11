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
  link: "https://instagram.com", isActive: true, image: null,
};

export default function InstagramPostsPage() {
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [preview, setPreview]       = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/instagram-posts");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setPreview(null);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      link: p.link || "https://instagram.com",
      isActive: p.isActive,
      image: null,
    });
    setPreview(p.image || null);
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
    data.append("link", form.link);
    data.append("isActive", String(form.isActive));
    if (form.image) data.append("image", form.image);

    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/api/instagram-posts/${editingId}`, data);
      } else {
        await API.post("/api/instagram-posts", data);
      }
      handleClose();
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to save post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await API.delete(`/api/instagram-posts/${id}`);
      fetchPosts();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleToggle = async (p) => {
    const data = new FormData();
    data.append("isActive", String(!p.isActive));
    try {
      await API.put(`/api/instagram-posts/${p._id}`, data);
      fetchPosts();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#fff">
          Instagram Posts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={openAdd}
          sx={{ bgcolor: "#6c63ff", "&:hover": { bgcolor: "#574fd6" } }}
        >
          Add Post
        </Button>
      </Box>

      <Typography sx={{ color: "#666", fontSize: 13, mb: 2 }}>
        New posts are added to the top automatically — no need to set any order.
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: "#1e1e2f", border: "1px solid #2e2e42" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { color: "#aaa", borderColor: "#2e2e42", fontWeight: 600 } }}>
              <TableCell>Image</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Added</TableCell>
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
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#666", borderColor: "#2e2e42" }}>
                  No Instagram posts yet. Click "Add Post" to get started.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((p) => (
                <TableRow key={p._id} sx={{ "& td": { borderColor: "#2e2e42" } }}>
                  <TableCell>
                    <img src={p.image} alt="post"
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid #2e2e42" }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#aaa",
                      maxWidth: 220,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={p.link}
                  >
                    {p.link}
                  </TableCell>
                  <TableCell sx={{ color: "#888", fontSize: 13 }}>
                    {new Date(p.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.isActive ? "Active" : "Inactive"}
                      size="small"
                      onClick={() => handleToggle(p)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: p.isActive ? "#166534" : "#7f1d1d",
                        color:   p.isActive ? "#bbf7d0" : "#fecaca",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEdit(p)} sx={{ color: "#6c63ff" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(p._id)} sx={{ color: "#ef4444" }}>
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
          {editingId ? "Edit Post" : "Add New Post"}
        </DialogTitle>

        <DialogContent sx={{ pt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Instagram Post Link"
            placeholder="https://instagram.com/p/..."
            value={form.link}
            onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
            fullWidth size="small"
            sx={{ mt: 1 }}
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
              🖼️ Post Image
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
            {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editingId ? "Update Post" : "Add Post"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}