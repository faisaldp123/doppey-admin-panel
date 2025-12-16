"use client";

import { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ Use environment variable for backend URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/admin/login`, { password });

      // ✅ Save token in localStorage (browser only)
      if (typeof window !== "undefined") {   
        localStorage.setItem("token", res.data.token);
      }

      router.push("/dashboard"); // Redirect to dashboard
    } catch (err) {
      setError("Wrong password");
      console.error("Admin login error:", err);
    }
  };

  return (
    <Box sx={{ width: 350, margin: "80px auto", textAlign: "center" }}>
      <Typography variant="h4" sx={{ color: "white", mb: 3 }}>
        Admin Login
      </Typography>

      <TextField
        type="password"
        label="Enter Admin Password"
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ style: { color: "white" } }}
        inputProps={{ style: { color: "white" } }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <Typography sx={{ color: "red", mb: 2 }}>{error}</Typography>
      )}

      <Button variant="contained" fullWidth onClick={handleLogin}>
        Login
      </Button>
    </Box>
  );
}
