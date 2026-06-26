"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  IconButton,
  TableContainer,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_LABELS = [
  "Pending",
  "Approved",
  "Pickup Scheduled",
  "Picked Up",
  "Quality Check",
  "Refund Approved",
  "Refund Completed",
  "Rejected",
];

const STATUS_COLORS = {
  Pending: {
    bg: "#78350f",
    color: "#fde68a",
  },

  Approved: {
    bg: "#14532d",
    color: "#bbf7d0",
  },

  "Pickup Scheduled": {
    bg: "#0f766e",
    color: "#ccfbf1",
  },

  "Picked Up": {
    bg: "#1d4ed8",
    color: "#dbeafe",
  },

  "Quality Check": {
    bg: "#854d0e",
    color: "#fef3c7",
  },

  "Refund Approved": {
    bg: "#065f46",
    color: "#d1fae5",
  },

  "Refund Completed": {
    bg: "#312e81",
    color: "#e0e7ff",
  },

  Rejected: {
    bg: "#7f1d1d",
    color: "#fecaca",
  },
};

export default function ReturnsPage() {
  const [tab, setTab]           = useState(0);
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus]   = useState("");
  const [adminRemark, setAdminRemark] = useState("");
const [refundAmount, setRefundAmount] = useState("");
const [refundMethod, setRefundMethod] = useState("");
const [refundTransactionId, setRefundTransactionId] = useState("");
  const [updating, setUpdating]     = useState(false);
  const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [page, setPage] = useState(1);

const rowsPerPage = 10;

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("API URL:", API_URL);
console.log("Returns URL:", `${API_URL}/returns`);
      const res = await axios.get(`${API_URL}/api/returns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch returns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const currentStatus = STATUS_LABELS[tab];

  const filtered = data.filter((item) => {
  const matchesTab =
    item.status === currentStatus;

  const matchesSearch =
    String(item.orderId?._id || item.orderId)
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    item.product?.name
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||

    item.user?.phone
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||

    item.user?.email
      ?.toLowerCase()
      .includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All"
      ? true
      : item.status === statusFilter;

  return (
    matchesTab &&
    matchesSearch &&
    matchesStatus
  );
});

const totalPages = Math.ceil(
  filtered.length / rowsPerPage
);

const paginatedReturns = filtered.slice(
  (page - 1) * rowsPerPage,
  page * rowsPerPage
);

  const handleView = (item) => {
  setSelected(item);

  setNewStatus(item.status || "Pending");

  setAdminRemark(item.adminRemark || "");

  setRefundAmount(item.refundAmount || "");

  setRefundMethod(item.refundMethod || "");

  setRefundTransactionId(item.refundTransactionId || "");

  setDialogOpen(true);
};

  const handleStatusUpdate = async () => {
  if (!selected) return;

  try {
    setUpdating(true);

    const token = localStorage.getItem("token");

    await axios.put(
      `${API_URL}/api/returns/${selected._id}`,
      {
        status: newStatus,
        adminRemark,
        refundAmount,
        refundMethod,
        refundTransactionId,

        refundDate:
          newStatus === "Refund Completed"
            ? new Date()
            : null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setDialogOpen(false);

    fetchReturns();
  } catch (err) {
    console.log(err);

    alert("Failed to update return.");
  } finally {
    setUpdating(false);
  }
};

  const handleDelete = async (id) => {
    if (!confirm("Delete this return request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/returns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReturns();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleDownloadCSV = () => {
    if (filtered.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = ["Order ID", "Product", "Customer", "Reason", "Status", "Date"];
    const rows = filtered.map((item) => [
      item.orderId?._id || item.orderId || "-",
      item.product?.name || "-",
      item.user?.phone || "-",
      item.reason || "-",
      item.status || "-",
      item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "-",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `returns-${currentStatus.toLowerCase().replace(" ", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRefund = data.reduce(
  (sum, item) => sum + Number(item.refundAmount || 0),
  0
);

const pendingReturns = data.filter(
  (i) => i.status === "Pending"
).length;

const completedReturns = data.filter(
  (i) => i.status === "Refund Completed"
).length;

const analytics = {
  total: data.length,

  pending: data.filter((r) => r.status === "Pending").length,

  approved: data.filter((r) => r.status === "Approved").length,

  pickup: data.filter((r) => r.status === "Pickup Scheduled").length,

  pickedUp: data.filter((r) => r.status === "Picked Up").length,

  quality: data.filter((r) => r.status === "Quality Check").length,

  refundApproved: data.filter(
    (r) => r.status === "Refund Approved"
  ).length,

  refunded: data.filter(
    (r) => r.status === "Refund Completed"
  ).length,

  rejected: data.filter(
    (r) => r.status === "Rejected"
  ).length,

  refundAmount: data.reduce(
    (sum, r) => sum + Number(r.refundAmount || 0),
    0
  ),
};

  return (
    <Box sx={{ color: "#fff" }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#fff">
          Return / RTO Orders
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography color="#aaa" fontSize={13}>
            Total Returns : {data.length}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleDownloadCSV}
            sx={{
              color: "#fff",
              borderColor: "#555",
              "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
            }}
          >
            Download CSV
          </Button>
        </Box>
      </Box>

      {/* Stats row */}
      <Box
  sx={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 2,
    mb: 4,
  }}
>
  {[
    {
      title: "Total Returns",
      value: analytics.total,
      color: "#6366f1",
    },
    {
      title: "Pending",
      value: analytics.pending,
      color: "#f59e0b",
    },
    {
      title: "Approved",
      value: analytics.approved,
      color: "#22c55e",
    },
    {
      title: "Pickup Scheduled",
      value: analytics.pickup,
      color: "#06b6d4",
    },
    {
      title: "Picked Up",
      value: analytics.pickedUp,
      color: "#3b82f6",
    },
    {
      title: "Quality Check",
      value: analytics.quality,
      color: "#f97316",
    },
    {
      title: "Refund Approved",
      value: analytics.refundApproved,
      color: "#10b981",
    },
    {
      title: "Refund Completed",
      value: analytics.refunded,
      color: "#8b5cf6",
    },
    {
      title: "Rejected",
      value: analytics.rejected,
      color: "#ef4444",
    },
    {
      title: "Refund Amount",
      value: `₹${analytics.refundAmount.toLocaleString(
        "en-IN"
      )}`,
      color: "#14b8a6",
    },
  ].map((card) => (
    <Paper
      key={card.title}
      sx={{
        p: 2.5,
        bgcolor: "#1e1e2f",
        borderRadius: 3,
        border: `1px solid ${card.color}`,
      }}
    >
      <Typography
        sx={{
          color: "#999",
          fontSize: 13,
        }}
      >
        {card.title}
      </Typography>

      <Typography
        sx={{
          color: card.color,
          fontSize: 30,
          fontWeight: 700,
          mt: 1,
        }}
      >
        {card.value}
      </Typography>
    </Paper>
  ))}
</Box>

      <Box
sx={{
display:"flex",
gap:2,
mb:2,
flexWrap:"wrap"
}}
>

<TextField

placeholder="Search Order, Product or Customer"

value={search}

onChange={(e)=>setSearch(e.target.value)}

size="small"

sx={{
width:350,

"& fieldset":{
borderColor:"#333"
},

input:{
color:"#fff"
}
}}

/>

<TextField

select

size="small"

value={statusFilter}

onChange={(e)=>setStatusFilter(e.target.value)}

sx={{
width:220,

"& fieldset":{
borderColor:"#333"
}
}}

>

<MenuItem value="All">
All Status
</MenuItem>

{STATUS_LABELS.map(status=>(

<MenuItem
key={status}
value={status}
>

{status}

</MenuItem>

))}

</TextField>

</Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        textColor="inherit"
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{ style: { backgroundColor: "#6c63ff" } }}
        sx={{
          bgcolor: "#1e1e2f",
          borderRadius: 2,
          mb: 2,
          "& .MuiTab-root": { color: "#aaa", fontWeight: 500, fontSize: 13 },
          "& .Mui-selected": { color: "#fff" },
        }}
      >
        {STATUS_LABELS.map((label) => (
          <Tab
            key={label}
            label={`${label} (${data.filter((d) => d.status === label).length})`}
          />
        ))}
      </Tabs>

      {/* Table */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#6c63ff" }} />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ bgcolor: "#1e1e2f", border: "1px solid #2e2e42" }}
        >
          <Table>
            <TableHead
  sx={{
    bgcolor: "#25253b",
  }}
>
              <TableRow sx={{ "& th": { color: "#aaa", borderColor: "#2e2e42", fontWeight: 600, whiteSpace: "nowrap" } }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Images</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ color: "#aaa", py: 6, borderColor: "#2e2e42" }}
                  >
                    <Box
  sx={{
    py: 4,
  }}
>
  <Typography
    color="#888"
    fontSize={16}
  >
    No return requests found.
  </Typography>

  <Typography
    color="#555"
    fontSize={13}
  >
    New requests will automatically appear here.
  </Typography>
</Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReturns.map((item) => (
                  <TableRow
                    key={item._id}
                    sx={{ "& td": { borderColor: "#2e2e42" }, "&:hover": {
  bgcolor: "#25253b",
  transition: ".25s",
} }}
                  >
                    <TableCell sx={{ color: "#aaa", fontSize: 12, whiteSpace: "nowrap" }}>
                      {String(item.orderId?._id || item.orderId || "-").slice(-8)}...
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {item.product?.images?.[0] && (
                          <img
                            src={item.product.images[0]}
                            alt=""
                            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                          />
                        )}
                        <Typography color="#fff" fontSize={13}>
                          {item.product?.name || "-"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ color: "#aaa", fontSize: 13, whiteSpace: "nowrap" }}>
                      {item.user?.phone || item.user?.email || "-"}
                    </TableCell>

                    <TableCell sx={{ color: "#fff", fontSize: 13, maxWidth: 160 }}>
                      {item.reason}
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {(item.images || []).slice(0, 2).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }}
                          />
                        ))}
                        {item.images?.length > 2 && (
                          <Box sx={{ width: 36, height: 36, bgcolor: "#333", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography fontSize={11} color="#aaa">+{item.images.length - 2}</Typography>
                          </Box>
                        )}
                        {(!item.images || item.images.length === 0) && (
                          <Typography color="#444" fontSize={12}>—</Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          bgcolor: STATUS_COLORS[item.status]?.bg || "#333",
                          color:   STATUS_COLORS[item.status]?.color || "#fff",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#aaa", fontSize: 12, whiteSpace: "nowrap" }}>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "-"}
                    </TableCell>

                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleView(item)}
                        sx={{ color: "#6c63ff" }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item._id)}
                        sx={{ color: "#ef4444" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
      )}
      <Box

display="flex"

justifyContent="space-between"

alignItems="center"

mt={2}

>

<Typography color="#aaa">

Showing

{" "}

{paginatedReturns.length}

{" "}of{" "}

{filtered.length}

returns

</Typography>

<Box
display="flex"
gap={1}
>

<Button

disabled={page===1}

variant="outlined"

onClick={()=>setPage(page-1)}

>

Previous

</Button>

<Button

disabled={page===totalPages}

variant="outlined"

onClick={()=>setPage(page+1)}

>

Next

</Button>

</Box>

</Box>

      {/* Detail / Status Update Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#1e1e2f", border: "1px solid #2e2e42" } }}
      >
        <DialogTitle sx={{ color: "#fff", borderBottom: "1px solid #2e2e42" }}>
          Return Request Details
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {selected && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

              {/* Product */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {selected.product?.images?.[0] && (
                  <img
                    src={selected.product.images[0]}
                    alt=""
                    style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8 }}
                  />
                )}
                <Box>
                  <Typography color="#fff" fontWeight={600}>
                    {selected.product?.name || "Product"}
                  </Typography>
                  <Typography color="#aaa" fontSize={13}>
                    ₹{selected.product?.price?.toLocaleString("en-IN") || "-"}
                  </Typography>
                </Box>
              </Box>

              {/* Info rows */}
              {[
                { label: "Order ID",  value: String(selected.orderId?._id || selected.orderId || "-") },
                { label: "Customer",  value: selected.user?.phone || selected.user?.email || "-" },
                { label: "Reason",    value: selected.reason },
                { label: "Comment",   value: selected.comment || "—" },
                { label: "Submitted", value: selected.createdAt ? new Date(selected.createdAt).toLocaleString("en-IN") : "-" },
                {
  label: "Refund Amount",
  value: selected.refundAmount
    ? `₹${selected.refundAmount}`
    : "Not Refunded",
},

{
  label: "Refund Method",
  value:
    selected.refundMethod || "-",
},

{
  label: "Transaction ID",
  value:
    selected.refundTransactionId || "-",
},

{
  label: "Admin Remark",
  value:
    selected.adminRemark || "-",
},
              ].map((row) => (
                <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2e2e42", pb: 1 }}>
                  <Typography color="#aaa" fontSize={13}>{row.label}</Typography>
                  <Typography color="#fff" fontSize={13} fontWeight={500}>{row.value}</Typography>
                </Box>
              ))}

              {/* Return images */}
              {selected.images?.length > 0 && (
                <Box>
                  <Typography color="#aaa" fontSize={13} mb={1}>Return Images</Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {selected.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        style={{
width:90,
height:90,
objectFit:"cover",
borderRadius:10,
cursor:"pointer",
transition:"0.3s"
}}d w2
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Status update */}
              <TextField
                select
                label="Save Changes"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ sx: { color: "#aaa" } }}
                SelectProps={{ sx: { color: "#fff" } }}
                sx={{ "& fieldset": { borderColor: "#2e2e42" } }}
              >
                {STATUS_LABELS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
              <TextField
  fullWidth
  multiline
  rows={3}
  label="Admin Remark"
  value={adminRemark}
  onChange={(e) => setAdminRemark(e.target.value)}
  margin="normal"
  InputLabelProps={{
    sx: { color: "#aaa" },
  }}
  InputProps={{
    sx: {
      color: "#fff",
    },
  }}
  sx={{
    "& fieldset": {
      borderColor: "#2e2e42",
    },
  }}
/>
<TextField
  fullWidth
  type="number"
  label="Refund Amount"
  value={refundAmount}
  onChange={(e) =>
    setRefundAmount(e.target.value)
  }
  margin="normal"
  InputLabelProps={{
    sx: { color: "#aaa" },
  }}
  InputProps={{
    sx: {
      color: "#fff",
    },
  }}
  sx={{
    "& fieldset": {
      borderColor: "#2e2e42",
    },
  }}
/>
<TextField
  fullWidth
  label="Refund Method"
  value={refundMethod}
  onChange={(e) =>
    setRefundMethod(e.target.value)
  }
  margin="normal"
  InputLabelProps={{
    sx: { color: "#aaa" },
  }}
  InputProps={{
    sx: {
      color: "#fff",
    },
  }}
  sx={{
    "& fieldset": {
      borderColor: "#2e2e42",
    },
  }}
/>
<TextField
  fullWidth
  label="Refund Transaction ID"
  value={refundTransactionId}
  onChange={(e) =>
    setRefundTransactionId(e.target.value)
  }
  margin="normal"
  InputLabelProps={{
    sx: { color: "#aaa" },
  }}
  InputProps={{
    sx: {
      color: "#fff",
    },
  }}
  sx={{
    "& fieldset": {
      borderColor: "#2e2e42",
    },
  }}
/>

            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid #2e2e42", px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: "#aaa" }}>
            Close
          </Button>
          <Button
variant="contained"
fullWidth
onClick={handleStatusUpdate}
disabled={updating}
sx={{
mt:2,
height:48,
fontWeight:700,
bgcolor:"#6c63ff",
"&:hover":{
bgcolor:"#5a52dd"
}
}}
>
{updating
? "Saving..."
: "Save Changes"}
</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}