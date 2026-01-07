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
    if (token === "admin-secret-token") {
      router.push("/admin");
    }
  }, []);

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
        { timeout: 10000 }
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
        bgcolor: "#0f0f1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: 400,
          bgcolor: "#121212",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* TOP BORDER */}
        <Box sx={{ height: 5, bgcolor: "#6C63FF" }} />

        <Box sx={{ p: 4, textAlign: "center" }}>
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
            sx={{ color: "#fff", fontWeight: 600, mb: 1 }}
          >
            Admin Login
          </Typography>

          <Typography sx={{ color: "#aaa", mb: 3 }}>
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
              input: { color: "#fff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#444" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
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
              bgcolor: "#6C63FF",
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#5a52d4" },
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
