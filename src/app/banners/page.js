"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel,
} from "@mui/material";
import EditIcon    from "@mui/icons-material/Edit";
import DeleteIcon  from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import API from "@/lib/axios";

const emptyForm = {
  order:         "0",
  isActive:      true,
  videoHref:     "/shop",
  desktopImages: [],
  mobileImages:  [],
  existingDesktopUrls: [],
  existingMobileUrls: [],
  desktopHrefs:  ["/shop"],
  mobileHrefs:   ["/shop"],
  video:         null,
};

export default function BannersPage() {
  const [banners, setBanners]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [previews, setPreviews]     = useState({ desktop: [], mobile: [], video: null });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/banners");
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
    setPreviews({ desktop: [], mobile: [], video: null });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (banner) => {
    setEditingId(banner._id);
    setForm({
      order:         String(banner.order),
      isActive:      banner.isActive,
      videoHref:     banner.videoHref || "/shop",
      desktopImages: [],
      mobileImages:  [],
      existingDesktopUrls: (banner.desktopImages || []).map((i) => i.url),
      existingMobileUrls:  (banner.mobileImages  || []).map((i) => i.url),
      desktopHrefs:  (banner.desktopImages || []).map((i) => i.href || "/shop"),
      mobileHrefs:   (banner.mobileImages  || []).map((i) => i.href || "/shop"),
      video:         null,
    });
    setPreviews({
      desktop: (banner.desktopImages || []).map((i) => i.url),
      mobile:  (banner.mobileImages  || []).map((i) => i.url),
      video:   banner.video || null,
    });
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setPreviews({ desktop: [], mobile: [], video: null });
  };

  const handleImagesChange = (e, type) => {
    const existingKey = type === "desktopImages" ? "existingDesktopUrls" : "existingMobileUrls";
    const hrefKey = type === "desktopImages" ? "desktopHrefs" : "mobileHrefs";
    const previewKey = type === "desktopImages" ? "desktop" : "mobile";
    const availableSlots = 4 - ((form[existingKey]?.length || 0) + (form[type]?.length || 0));
    const files = Array.from(e.target.files).slice(0, Math.max(0, availableSlots));
    if (!files.length) return;
    setForm((p) => ({
      ...p,
      [type]: [...p[type], ...files],
      [hrefKey]: [...p[hrefKey], ...files.map(() => "/shop")].slice(0, 4),
    }));
    setPreviews((p) => ({
      ...p,
      [previewKey]: [...p[previewKey], ...files.map((f) => URL.createObjectURL(f))].slice(0, 4),
    }));
    e.target.value = "";
  };

  const removeImage = (type, previewKey, hrefKey, index) => {
    const existingKey = type === "desktopImages" ? "existingDesktopUrls" : "existingMobileUrls";
    setForm((p) => {
      const existing = [...p[existingKey]];
      const files = [...p[type]];

      if (index < existing.length) existing.splice(index, 1);
      else files.splice(index - existing.length, 1);

      return {
        ...p,
        [existingKey]: existing,
        [type]: files,
        [hrefKey]: p[hrefKey].filter((_, i) => i !== index),
      };
    });
    setPreviews((p) => ({
      ...p,
      [previewKey]: p[previewKey].filter((_, i) => i !== index),
    }));
  };

  const handleHrefChange = (type, index, value) => {
    setForm((p) => {
      const updated = [...p[type]];
      updated[index] = value;
      return { ...p, [type]: updated };
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, video: file }));
    setPreviews((p) => ({ ...p, video: URL.createObjectURL(file) }));
  };

  const handleSubmit = async () => {
    if (!editingId && (form.desktopImages.length === 0 || form.mobileImages.length === 0)) {
      alert("Please upload at least 1 desktop and 1 mobile image");
      return;
    }

    const data = new FormData();
    data.append("order",         form.order);
    data.append("isActive",      String(form.isActive));
    data.append("videoHref",     form.videoHref);
    data.append("desktopHrefs",  JSON.stringify(form.desktopHrefs.slice(0, previews.desktop.length)));
    data.append("mobileHrefs",   JSON.stringify(form.mobileHrefs.slice(0, previews.mobile.length)));
    data.append("existingDesktopUrls", JSON.stringify(form.existingDesktopUrls));
    data.append("existingMobileUrls",  JSON.stringify(form.existingMobileUrls));

    form.desktopImages.forEach((file) => data.append("desktopImages", file));
    form.mobileImages.forEach((file)  => data.append("mobileImages",  file));
    if (form.video) data.append("video", form.video);

    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/api/banners/${editingId}`, data);
      } else {
        await API.post("/api/banners", data);
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
      await API.delete(`/api/banners/${id}`);
      fetchBanners();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleToggle = async (banner) => {
    const data = new FormData();
    data.append("isActive", String(!banner.isActive));
    try {
      await API.put(`/api/banners/${banner._id}`, data);
      fetchBanners();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Reusable image upload section with per-image href fields
  const ImageUploadSection = ({ type, label, size, previewKey, hrefKey }) => (
    <Box>
      <Typography color="#aaa" fontSize={13} fontWeight={600} mb={1}>
        {label} — {size} (max 4)
      </Typography>
      <Button
        variant="outlined" component="label" fullWidth
        sx={{ borderColor: "#2e2e42", color: "#aaa", mb: 2, "&:hover": { borderColor: "#6c63ff" } }}
      >
        Add Image
        <input type="file" accept="image/*" hidden
          onChange={(e) => handleImagesChange(e, type)}
        />
      </Button>

      {previews[previewKey].length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {previews[previewKey].map((src, i) => (
            <Box key={i} sx={{ border: "1px solid #2e2e42", borderRadius: 2, p: 1.5 }}>
              <img
                src={src} alt={`preview-${i}`}
                style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, marginBottom: 8 }}
              />
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                label={`Image ${i + 1} — Link URL`}
                placeholder="/category/cargo or /shop"
                value={form[hrefKey][i] || ""}
                onChange={(e) => handleHrefChange(hrefKey, i, e.target.value)}
                fullWidth size="small"
                InputLabelProps={{ sx: { color: "#888", fontSize: 12 } }}
                InputProps={{ sx: { color: "#fff", fontSize: 13, "& fieldset": { borderColor: "#2e2e42" } } }}
              />
              <IconButton onClick={() => removeImage(type, previewKey, hrefKey, i)} sx={{ color: "#ef4444" }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: 80, bgcolor: "#0f0f1a", borderRadius: 2, border: "1px dashed #2e2e42", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography color="#444" fontSize={12}>No images selected</Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#fff">
          Banner Management
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

      {/* Size guide */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          { icon: "🖥️", label: "Desktop Images", value: "1920 × 750 px",  sub: "Max 4 · Each has its own link" },
          { icon: "📱", label: "Mobile Images",  value: "768 × 900 px",   sub: "Max 4 · Each has its own link" },
          { icon: "🎬", label: "Video",          value: "MP4 / WebM",     sub: "1 video · Auto-plays muted" },
          { icon: "🔗", label: "Per-image Links", value: "Category / Subcategory", sub: "e.g. /category/cargo" },
        ].map((card) => (
          <Box key={card.label} sx={{ bgcolor: "#1e1e2f", borderRadius: 2, p: 2, flex: 1, minWidth: 160, border: "1px solid #2e2e42" }}>
            <Typography color="#aaa" fontSize={12} mb={0.5}>{card.icon} {card.label}</Typography>
            <Typography color="#fff" fontWeight={600}>{card.value}</Typography>
            <Typography color="#666" fontSize={12}>{card.sub}</Typography>
          </Box>
        ))}
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ bgcolor: "#1e1e2f", border: "1px solid #2e2e42" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { color: "#aaa", borderColor: "#2e2e42", fontWeight: 600 } }}>
              <TableCell>Order</TableCell>
              <TableCell>Desktop Images</TableCell>
              <TableCell>Mobile Images</TableCell>
              <TableCell>Video</TableCell>
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
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#666", borderColor: "#2e2e42" }}>
                  No banners yet. Click "Add Banner" to get started.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner._id} sx={{ "& td": { borderColor: "#2e2e42" } }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>{banner.order}</TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {(banner.desktopImages || []).map((img, i) => (
                        <Box key={i} sx={{ position: "relative" }}>
                          <img src={img.url} alt={`d${i}`}
                            style={{ width: 60, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid #2e2e42", display: "block" }}
                          />
                          <Typography fontSize={9} color="#666" sx={{ maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {img.href}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {(banner.mobileImages || []).map((img, i) => (
                        <Box key={i}>
                          <img src={img.url} alt={`m${i}`}
                            style={{ width: 28, height: 36, objectFit: "cover", borderRadius: 4, border: "1px solid #2e2e42", display: "block" }}
                          />
                          <Typography fontSize={9} color="#666" sx={{ maxWidth: 30, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {img.href}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </TableCell>

                  <TableCell>
                    {banner.video ? (
                      <video src={banner.video} style={{ width: 60, height: 36, objectFit: "cover", borderRadius: 4 }} muted />
                    ) : (
                      <Typography color="#444" fontSize={12}>—</Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={banner.isActive ? "Active" : "Inactive"}
                      size="small"
                      onClick={() => handleToggle(banner)}
                      sx={{
                        cursor: "pointer",
                        bgcolor: banner.isActive ? "#166534" : "#7f1d1d",
                        color:   banner.isActive ? "#bbf7d0" : "#fecaca",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <IconButton onClick={() => openEdit(banner)} sx={{ color: "#6c63ff" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(banner._id)} sx={{ color: "#ef4444" }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#1e1e2f", border: "1px solid #2e2e42" } }}
      >
        <DialogTitle sx={{ color: "#fff", borderBottom: "1px solid #2e2e42" }}>
          {editingId ? "Edit Banner" : "Add New Banner"}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>

          {/* Order + Active */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
            <TextField
              label="Order (1, 2, 3...)"
              type="number"
              value={form.order}
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

          {/* Desktop + Mobile side by side */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
            <ImageUploadSection
              type="desktopImages"
              label="🖥️ Desktop Images"
              size="1920×750px"
              previewKey="desktop"
              hrefKey="desktopHrefs"
            />
            <ImageUploadSection
              type="mobileImages"
              label="📱 Mobile Images"
              size="768×900px"
              previewKey="mobile"
              hrefKey="mobileHrefs"
            />
          </Box>

          {/* Video */}
          <Box sx={{ border: "1px solid #2e2e42", borderRadius: 2, p: 2 }}>
            <Typography color="#aaa" fontSize={13} fontWeight={600} mb={1}>
              🎬 Video (optional) — MP4 / WebM
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 1 }}>
              <Button
                variant="outlined" component="label" fullWidth
                sx={{ borderColor: "#2e2e42", color: "#aaa", "&:hover": { borderColor: "#6c63ff" } }}
              >
                Choose Video
                <input type="file" accept="video/mp4,video/webm,video/mov" hidden onChange={handleVideoChange} />
              </Button>
              <TextField
                label="Video Link URL"
                placeholder="/shop or /category/new-arrivals"
                value={form.videoHref}
                onChange={(e) => setForm((p) => ({ ...p, videoHref: e.target.value }))}
                fullWidth size="small"
                InputLabelProps={{ sx: { color: "#aaa" } }}
                InputProps={{ sx: { color: "#fff", "& fieldset": { borderColor: "#2e2e42" } } }}
              />
            </Box>
            {previews.video ? (
              <video src={previews.video} controls muted
                style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #2e2e42" }}
              />
            ) : (
              <Box sx={{ height: 60, bgcolor: "#0f0f1a", borderRadius: 2, border: "1px dashed #2e2e42", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="#444" fontSize={12}>No video selected (optional)</Typography>
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
            {submitting
              ? <CircularProgress size={20} sx={{ color: "#fff" }} />
              : editingId ? "Update Banner" : "Add Banner"
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
