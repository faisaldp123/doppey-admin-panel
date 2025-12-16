"use client";
import { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", { password });

      localStorage.setItem("token", res.data.token);

      router.push("/dashboard"); // after login go to dashboard
    } catch (err) {
      setError("Wrong password");
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
