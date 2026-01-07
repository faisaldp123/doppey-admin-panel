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
  IconButton,
  useMediaQuery,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MenuIcon from "@mui/icons-material/Menu";
import StoreIcon from "@mui/icons-material/Store";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import PaymentsIcon from "@mui/icons-material/Payments";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const drawerWidth = 240;
const collapsedWidth = 70;

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:900px)");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token === "admin-secret-token") {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      if (pathname !== "/admin-login") {
        router.push("/admin-login");
      }
    }
  }, [pathname]);

  if (pathname === "/admin-login") {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: <DashboardIcon /> },

    // CATALOG
    { href: "/products", label: "Products", icon: <InventoryIcon /> },
    { href: "/categories", label: "Categories", icon: <CategoryIcon /> },
    { href: "/sub-categories", label: "Sub Categories", icon: <AccountTreeIcon /> },

    // INVENTORY & WAREHOUSE
    { href: "/inventory", label: "Inventory", icon: <StoreIcon /> },
    { href: "/warehouse", label: "Warehouse", icon: <WarehouseIcon /> },

    // ORDERS & RETURNS
    { href: "/orders", label: "Orders", icon: <ShoppingCartIcon /> },
    { href: "/returns", label: "Returns / RTO", icon: <AssignmentReturnIcon /> },

    // OFFERS & PAYMENTS
    { href: "/coupon", label: "Coupons", icon: <LocalOfferIcon /> },
    { href: "/payments", label: "Payments", icon: <PaymentsIcon /> },

    // USERS
    { href: "/users", label: "Users", icon: <PeopleIcon /> },
  ];

  const drawerContent = (
    <Box>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <Link href={item.href} passHref legacyBehavior>
              <ListItemButton
                component="a"
                sx={{
                  justifyContent: isMobile ? "center" : "flex-start",
                  bgcolor: pathname === item.href ? "#2e2e42" : "transparent",
                  "&:hover": {
                    bgcolor: "#2e2e42",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "#fff",
                    minWidth: isMobile ? "auto" : 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isMobile && <ListItemText primary={item.label} />}
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <html lang="en">
      <body>
        <Box sx={{ display: "flex", bgcolor: "#000", minHeight: "100vh" }}>
          <CssBaseline />

          {/* SIDEBAR */}
          {isLoggedIn && (
            <Drawer
              variant={isMobile ? "temporary" : "permanent"}
              open={isMobile ? mobileOpen : true}
              onClose={() => setMobileOpen(false)}
              sx={{
                width: isMobile ? collapsedWidth : drawerWidth,
                "& .MuiDrawer-paper": {
                  width: isMobile ? collapsedWidth : drawerWidth,
                  bgcolor: "#111",
                  color: "#fff",
                  borderRight: "1px solid #222",
                },
              }}
            >
              {drawerContent}
            </Drawer>
          )}

          {/* TOP BAR */}
          {isLoggedIn && (
            <AppBar
              position="fixed"
              sx={{
                width: `calc(100% - ${isMobile ? collapsedWidth : drawerWidth}px)`,
                ml: `${isMobile ? collapsedWidth : drawerWidth}px`,
                bgcolor: "#1e1e2f",
                boxShadow: "none",
                borderBottom: "1px solid #2e2e42",
              }}
            >
              <Toolbar sx={{ justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isMobile && (
                    <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                      <MenuIcon />
                    </IconButton>
                  )}
                  <Typography variant="h6" fontWeight="bold">
                    Doppey Admin Panel
                  </Typography>
                </Box>

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
              width: "100%",
              bgcolor: "#0f0f1a",
              minHeight: "100vh",
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
