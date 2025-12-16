"use client";

import "./globals.css";
import {
  Box,
  CssBaseline,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Typography,
  ListItemIcon,
  ListItemButton,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const drawerWidth = 240;

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check admin login
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token === "admin-secret-token") {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      // Redirect if trying to access admin protected pages
      if (pathname !== "/admin-login") {
        router.push("/admin-login");
      }
    }
  }, [pathname]);

  // Hide sidebar & navbar on login page
  if (pathname === "/admin-login") {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <Box sx={{ display: "flex", bgcolor: "#000", minHeight: "100vh" }}>
          <CssBaseline />

          {/* ✅ LEFT SIDEBAR (Only if logged in) */}
          {isLoggedIn && (
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  boxSizing: "border-box",
                  bgcolor: "#111",
                  color: "#fff",
                },
              }}
              variant="permanent"
              anchor="left"
            >
              <Toolbar />
              <Box sx={{ overflow: "auto" }}>
                <List>
                  {[
                    { href: "/admin", label: "Dashboard", icon: <DashboardIcon /> },
                    { href: "/products", label: "Products", icon: <InventoryIcon /> },
                    { href: "/categories", label: "Categories", icon: <CategoryIcon /> },
                    { href: "/orders", label: "Orders", icon: <ShoppingCartIcon /> },
                    { href: "/users", label: "Users", icon: <PeopleIcon /> },
                  ].map((item) => (
                    <ListItem key={item.href} disablePadding>
                      <Link href={item.href} passHref legacyBehavior>
                        <ListItemButton component="a">
                          <ListItemIcon sx={{ color: "#fff" }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText primary={item.label} />
                        </ListItemButton>
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Drawer>
          )}

          {/* ✅ TOP NAVBAR (Only if logged in) */}
          {isLoggedIn && (
            <AppBar
              position="fixed"
              sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                bgcolor: "#1e1e2f",
              }}
            >
              <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" noWrap>
                  Doppey Admin Panel
                </Typography>

                <Button
                  color="error"
                  variant="contained"
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/admin-login");
                  }}
                >
                  Logout
                </Button>
              </Toolbar>
            </AppBar>
          )}

          {/* MAIN CONTENT */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              color: "#fff",
            }}
          >
            {isLoggedIn && <Toolbar />}
            {children}
          </Box>
        </Box>
      </body>
    </html>
  );
}
