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
  ThemeProvider,
  createTheme,
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
// import WarehouseIcon from "@mui/icons-material/Warehouse";
import PaymentsIcon from "@mui/icons-material/Payments";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel"; // ← ADD THIS
import StorefrontIcon from "@mui/icons-material/Storefront";
import CampaignIcon from "@mui/icons-material/Campaign";
import WeekendIcon from "@mui/icons-material/Weekend";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import InstagramIcon from "@mui/icons-material/Instagram";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const drawerWidth = 264;

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#e11d48", dark: "#be123c" },
    background: { default: "#f7f7f8", paper: "#ffffff" },
    text: { primary: "#1f2937", secondary: "#6b7280" },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: "Arial, Helvetica, sans-serif", button: { textTransform: "none", fontWeight: 700 } },
  components: {
    MuiPaper: { styleOverrides: { root: { border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" } } },
    MuiTableCell: { styleOverrides: { head: { background: "#f9fafb", color: "#4b5563", fontWeight: 700 }, root: { borderColor: "#edf0f2" } } },
  },
});

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
  { href: "/dashboard",          label: "Dashboard",       icon: <DashboardIcon /> },
  { href: "/products",           label: "Products",        icon: <InventoryIcon /> },
  { href: "/categories",         label: "Categories",      icon: <CategoryIcon /> },
  { href: "/sub-categories",     label: "Sub Categories",  icon: <AccountTreeIcon /> },
  { href: "/banners",            label: "Banners",         icon: <ViewCarouselIcon /> },
  { href: "/shop-categories",    label: "Shop Categories",  icon: <StorefrontIcon /> },
  { href: "/promo-banners",      label: "Promo Banners",    icon: <CampaignIcon /> },
  { href: "/lifestyle-sections", label: "Lifestyle Sections", icon: <WeekendIcon /> },
  { href: "/brand-story",        label: "Brand Story",      icon: <AutoStoriesIcon /> },
  { href: "/instagram-posts",     label: "Instagram Posts",  icon: <InstagramIcon /> },
  // { href: "/inventory",          label: "Inventory",       icon: <StoreIcon /> },
  // { href: "/warehouse",          label: "Warehouse",       icon: <WarehouseIcon /> },
  { href: "/orders",             label: "Orders",          icon: <ShoppingCartIcon /> },
  { href: "/returns",            label: "Returns / RTO",   icon: <AssignmentReturnIcon /> },
  { href: "/coupon",             label: "Coupons",         icon: <LocalOfferIcon /> },
  { href: "/payments",           label: "Payments",        icon: <PaymentsIcon /> },
  { href: "/users",              label: "Users",           icon: <PeopleIcon /> },
];

  const drawerContent = (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ height: 72, px: 2.5, display: "flex", alignItems: "center", borderBottom: "1px solid #e5e7eb" }}>
        <Typography sx={{ fontWeight: 800, color: "#171717", letterSpacing: 0.4 }}>DOPPEY <Box component="span" sx={{ color: "#e11d48" }}>APPAREL</Box></Typography>
      </Box>
      <List sx={{ px: 1.25, py: 1.5 }}>
        {menuItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <Link href={item.href} passHref legacyBehavior>
              <ListItemButton
                component="a"
                sx={{
                  borderRadius: 1.5,
                  mb: 0.25,
                  bgcolor: pathname === item.href ? "#fff1f2" : "transparent",
                  color: pathname === item.href ? "#be123c" : "#4b5563",
                  "&:hover": { bgcolor: "#f3f4f6" },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: pathname === item.href ? 700 : 500 }} />
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
        <ThemeProvider theme={theme}>
        <Box sx={{ display: "flex", bgcolor: "#f7f7f8", minHeight: "100vh" }}>
          <CssBaseline />

          {isLoggedIn && (
            <Drawer
              variant={isMobile ? "temporary" : "permanent"}
              open={isMobile ? mobileOpen : true}
              onClose={() => setMobileOpen(false)}
              sx={{
                width: drawerWidth,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  bgcolor: "#fff",
                  color: "#1f2937",
                  borderRight: "1px solid #e5e7eb",
                },
              }}
            >
              {drawerContent}
            </Drawer>
          )}

          {isLoggedIn && (
            <AppBar
              position="fixed"
              sx={{
                width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
                ml: isMobile ? 0 : `${drawerWidth}px`,
                bgcolor: "rgba(255,255,255,0.96)",
                color: "#1f2937",
                boxShadow: "none",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Toolbar sx={{ justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isMobile && (
                    <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                      <MenuIcon />
                    </IconButton>
                  )}
                  <Typography variant="subtitle1" fontWeight={800}>
                    Store Operations
                  </Typography>
                </Box>
                <Button
                  color="primary"
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

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              p: { xs: 2, sm: 3 },
              width: "100%",
              bgcolor: "#f7f7f8",
              minHeight: "100vh",
            }}
          >
            {isLoggedIn && <Toolbar />}
            {children}
          </Box>
        </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
