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

export default function CouponsPage() {
  const router = useRouter();
  const isLoading = useAdminAuth();

  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: 1,
    expiryDate: "",
    isActive: true,
  });

  /* ================= FETCH COUPONS ================= */

  useEffect(() => {
    if (isLoading) return;

    const token = localStorage.getItem("token");
    if (!token) return router.push("/admin-login");

    const fetchCoupons = async () => {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data);
      setLoading(false);
    };

    fetchCoupons();
  }, [isLoading, router]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!form.code || !form.discountValue || !form.expiryDate) {
      return alert("Required fields missing");
    }

    try {
      const url = editId
        ? `${API_URL}/api/coupons/${editId}`
        : `${API_URL}/api/coupons`;

      const method = editId ? axios.put : axios.post;

      await method(url, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpen(false);
      setEditId(null);
      setForm({
        code: "",
        discountType: "PERCENT",
        discountValue: "",
        minOrderValue: "",
        maxDiscount: "",
        usageLimit: 1,
        expiryDate: "",
        isActive: true,
      });

      const refreshed = await axios.get(`${API_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(refreshed.data);
    } catch (err) {
      alert(err.response?.data?.message || "Coupon save failed");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;

    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/api/coupons/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCoupons((prev) => prev.filter((c) => c._id !== id));
  };

  /* ================= EDIT ================= */

  const handleEdit = (c) => {
    setEditId(c._id);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount || "",
      usageLimit: c.usageLimit,
      expiryDate: c.expiryDate.split("T")[0],
      isActive: c.isActive,
    });
    setOpen(true);
  };

  if (loading || isLoading) return <CircularProgress />;

  /* ================= UI ================= */

  return (
    <>
      <Typography variant="h4" sx={{ color: "white", mb: 2 }}>
        Coupons
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Coupon
      </Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            {["Code", "Discount", "Expiry", "Status", "Actions"].map((h) => (
              <TableCell key={h} sx={{ color: "white" }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.map((c) => (
            <TableRow key={c._id}>
              <TableCell sx={{ color: "white" }}>{c.code}</TableCell>
              <TableCell sx={{ color: "white" }}>
                {c.discountType === "PERCENT"
                  ? `${c.discountValue}%`
                  : `₹${c.discountValue}`}
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                {new Date(c.expiryDate).toLocaleDateString()}
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                {c.isActive ? "Active" : "Inactive"}
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(c)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(c._id)} color="error">
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
            <TextField
              label="Coupon Code"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              InputLabelProps={{ sx: { color: "white" } }}
              inputProps={{ sx: { color: "white" } }}
            />

            <TextField
              select
              label="Discount Type"
              value={form.discountType}
              onChange={(e) =>
                setForm({ ...form, discountType: e.target.value })
              }
              InputLabelProps={{ sx: { color: "white" } }}
              SelectProps={{ sx: { color: "white" } }}
            >
              <MenuItem value="PERCENT">Percentage</MenuItem>
              <MenuItem value="FLAT">Flat</MenuItem>
            </TextField>

            <TextField
              label="Discount Value"
              value={form.discountValue}
              onChange={(e) =>
                setForm({ ...form, discountValue: e.target.value })
              }
              InputLabelProps={{ sx: { color: "white" } }}
              inputProps={{ sx: { color: "white" } }}
            />

            <TextField
              label="Minimum Order Value"
              value={form.minOrderValue}
              onChange={(e) =>
                setForm({ ...form, minOrderValue: e.target.value })
              }
              InputLabelProps={{ sx: { color: "white" } }}
              inputProps={{ sx: { color: "white" } }}
            />

            <TextField
              label="Max Discount"
              value={form.maxDiscount}
              onChange={(e) =>
                setForm({ ...form, maxDiscount: e.target.value })
              }
              InputLabelProps={{ sx: { color: "white" } }}
              inputProps={{ sx: { color: "white" } }}
            />

            <TextField
              label="Usage Limit"
              value={form.usageLimit}
              onChange={(e) =>
                setForm({ ...form, usageLimit: e.target.value })
              }
              InputLabelProps={{ sx: { color: "white" } }}
              inputProps={{ sx: { color: "white" } }}
            />

            <TextField
              type="date"
              label="Expiry Date"
              value={form.expiryDate}
              onChange={(e) =>
                setForm({ ...form, expiryDate: e.target.value })
              }
              InputLabelProps={{ shrink: true, sx: { color: "white" } }}
              inputProps={{ sx: { color: "white" } }}
            />

            <Stack direction="row" alignItems="center">
              <Typography sx={{ color: "white" }}>Active</Typography>
              <Switch
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
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
