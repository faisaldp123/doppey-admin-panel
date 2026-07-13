"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function AdminLogin() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ✅ If already logged in, redirect to dashboard
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    router.replace("/dashboard");
  }
}, [router]);

  const handleLogin = async () => {
    if (!password) {
      setError("Please enter password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/login`,
        { password },
        { timeout: 100000 }
      );

      localStorage.setItem("token", res.data.token);

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Wrong password or server not responding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f7f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "min(960px, 100%)",
          borderRadius: 2,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
        }}
      >
        <Box
          sx={{
            minHeight: { xs: 210, md: 560 },
            position: "relative",
            backgroundImage: "linear-gradient(rgba(20, 12, 14, 0.26), rgba(20, 12, 14, 0.5)), url('/login-banner.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: { xs: "none", md: "flex" },
            alignItems: "flex-end",
            p: 5,
          }}
        >
          <Box sx={{ color: "#fff" }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>Doppey Apparel</Typography>
            <Typography sx={{ color: "#fff", maxWidth: 340 }}>Store management, fulfilment, and customer care in one place.</Typography>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: "center", alignSelf: "center" }}>
          {/* LOGO */}
          <Box sx={{ mb: 2 }}>
            <Image
              src="/logo.bmp"
              alt="Doppey Logo"
              width={130}
              height={60}
              style={{ objectFit: "contain" }}
            />
          </Box>

          {/* TITLE */}
          <Typography
            variant="h5"
            sx={{ color: "#1f2937", fontWeight: 700, mb: 1 }}
          >
            Admin Login
          </Typography>

          <Typography sx={{ color: "#6b7280", mb: 3 }}>
            Login to manage your store
          </Typography>

          {/* PASSWORD FIELD WITH SHOW/HIDE */}
          <TextField
            type={showPassword ? "text" : "password"}
            placeholder="Enter Admin Password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: "#aaa" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              input: { color: "#1f2937" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#d1d5db" },
                "&:hover fieldset": { borderColor: "#9ca3af" },
                "&.Mui-focused fieldset": { borderColor: "#e11d48" },
              },
            }}
          />

          {/* ERROR */}
          {error && (
            <Typography sx={{ color: "#ff4d4f", mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* LOGIN BUTTON */}
          <Button
            fullWidth
            disabled={loading}
            onClick={handleLogin}
            sx={{
              mt: 1,
              py: 1.3,
              bgcolor: "#e11d48",
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#be123c" },
              "&:disabled": {
                bgcolor: "#444",
                color: "#aaa",
              },
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
