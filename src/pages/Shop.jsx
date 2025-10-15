// src/pages/Shop.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Pagination,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { apiGet } from "../services/api"; // uses your api.js instance

// Inline Card component (keeps your styles)
function ProductCard({ product, onImageClick }) {
  return (
    <Card
      sx={{
        width: "100%",
        mx: "auto",
        minWidth: "350",
        boxShadow: 3,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 8,
        },
      }}
    >
      <CardMedia
        component="img"
        image={product.imageUrl}
        alt={product.name}
        onClick={() => onImageClick && onImageClick(product.imageUrl)}
        sx={{
          height: 400,
          objectFit: "cover",
          cursor: "pointer",
          userSelect: "none",
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            minHeight: 40,
          }}
        >
          {product.description}
        </Typography>
        <Typography variant="subtitle1" color="secondary" fontWeight="bold">
          ₹ {Number(product.price).toLocaleString("en-IN")}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Shop() {
  // UI state
  const [open, setOpen] = useState(false);

  // API state
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12); // items per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [sort, setSort] = useState(null); // null | 'asc' | 'desc'
  const [query, setQuery] = useState("");

  // loading & errors
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // debounce ref
  const searchDebounceRef = useRef(null);

  // image preview state
  const [imageOpen, setImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // When query or sort changes, reset to first page
  useEffect(() => {
    setPage(1);
  }, [query, sort, limit]);

  // Fetch function using apiGet(path, params)
  const fetchProducts = async ({
    page: p = 1,
    q = query,
    s = sort,
    lim = limit,
  } = {}) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const params = {
        page: p,
        limit: lim,
      };
      if (q && String(q).trim() !== "") params.q = q.trim();
      if (s) params.sort = s;

      const res = await apiGet("/api/shop", params);
      // expected response: { page, limit, total, totalPages, data }
      const { data = [], total = 0, totalPages: tp = 1 } = res || {};
      setProducts(Array.isArray(data) ? data : []);
      setTotalItems(Number(total) || 0);
      setTotalPages(Number(tp) || 1);
      setPage(Number(res?.page || p));
    } catch (err) {
      // api.js normalizes errors to { message, status, raw }
      const msg = (err && err.message) || "Failed to load products";
      setErrorMsg(msg);
      setOpenSnackbar(true);

      // specific handling for 429 (rate limit)
      if (err && err.status && err.status === 429) {
        const retryAfter =
          (err.raw &&
            err.raw.response &&
            err.raw.response.headers &&
            (err.raw.response.headers["retry-after"] ||
              err.raw.response.headers["Retry-After"])) ||
          null;
        if (retryAfter) {
          setErrorMsg(`Too many requests. Retry after ${retryAfter} seconds.`);
        } else {
          setErrorMsg(
            "Too many requests. Please slow down and try again in a moment."
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced effect for search input to reduce quick repeated calls
  useEffect(() => {
    if (searchDebounceRef.current)
      window.clearTimeout(searchDebounceRef.current);
    // debounce 500ms
    searchDebounceRef.current = window.setTimeout(() => {
      fetchProducts({ page: 1 });
    }, 500);

    return () => {
      if (searchDebounceRef.current)
        window.clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, limit]);

  // Fetch on page change
  useEffect(() => {
    fetchProducts({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // handle change page from Pagination component
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  // UI derived: show skeleton count equal to limit
  const skeletons = useMemo(() => Array.from({ length: limit }), [limit]);

  // image handlers
  const handleImageOpen = (src) => {
    setSelectedImage(src);
    setImageOpen(true);
  };
  const handleImageClose = () => {
    setImageOpen(false);
    // small timeout to clear src after transition ends (keeps smooth closing)
    setTimeout(() => setSelectedImage(null), 200);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100vw", p: 2, overflowX: "hidden" }}>
      {/* Header with contact button */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography variant="h5">प्रोडक्टस</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          disabled={loading}
        >
          खरेदीसाठी संपर्क
        </Button>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "left",
            flex: 1,
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="शोधा (उत्पादन / वर्णन)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 220, flex: { xs: "1 1 100%", sm: "0 1 360px" } }}
            disabled={loading}
          />

          {/* Sort select */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InputLabel sx={{ mr: 1, fontSize: 13 }}>किंमत</InputLabel>
            <Select
              size="small"
              value={sort ?? ""}
              displayEmpty
              onChange={(e) => {
                const v = e.target.value || null;
                setSort(v === "" ? null : v);
              }}
              sx={{ minWidth: 160 }}
              disabled={loading}
            >
              <MenuItem value="">मूळ क्रम</MenuItem>
              <MenuItem value="asc">कमी → जास्त</MenuItem>
              <MenuItem value="desc">जास्त → कमी</MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>

      {/* Product grid */}
      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {loading &&
          skeletons.map((_, idx) => (
            // Grid item uses same breakpoints and forces its child to stretch
            <Grid
              item
              key={`skeleton-${idx}`}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{
                display: "flex",
                // ensure grid column controls sizing, not the child
                alignItems: "stretch",
                // prevent the grid item from collapsing unexpectedly
                minWidth: 0,
              }}
            >
              {/* wrapper ensures the Card takes full width of the grid column */}
              <Box sx={{ width: "100%", minWidth: 0, display: "flex" }}>
                {/* card-shaped skeleton matching your ProductCard exactly */}
                <Card
                  sx={{
                    width: "100%",
                    // keep the same minWidth you have on ProductCard so skeleton footprint matches exactly
                    // original used "350" — using "350px" makes the intent explicit
                    minWidth: "350px",
                    mx: "auto",
                    boxShadow: 3,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    // ensure the card grows to fill the grid column height
                    flexGrow: 1,
                    overflow: "hidden",
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={400}
                    animation="wave"
                  />
                  <CardContent>
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={28}
                      animation="wave"
                    />
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={20}
                      animation="wave"
                    />
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={24}
                      animation="wave"
                    />
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ))}

        {!loading && products.length === 0 && (
          <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              कोणतेही उत्पादन आढळले नाही
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              काहीही आढळले नाही — शोध शब्द बदला किंवा फिल्टर काढा.
            </Typography>
          </Box>
        )}

        {!loading &&
          products.map((p) => (
            <Grid
              item
              key={p.id || p._id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              sx={{ display: "flex" }}
            >
              <ProductCard product={p} onImageClick={handleImageOpen} />
            </Grid>
          ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          disabled={loading || totalPages <= 1}
        />
      </Box>

      {/* Contact modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>खरेदीसाठी संपर्क</DialogTitle>
        <DialogContent>
          <Typography>
            आपल्या आवडत्या उत्पादनाची खरेदी करण्यासाठी कृपया खालील क्रमांकावर
            संपर्क साधा:
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: "bold" }}>
            📞 ९८७६५४३२१०
          </Typography>
          <Typography sx={{ fontWeight: "bold" }}>📞 ९९८८७७६६५५</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>बंद करा</Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen image preview */}
      <Dialog
        open={imageOpen}
        onClose={handleImageClose}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        TransitionProps={{
          // let Dialog handle transition timing
          onExit: () => {},
        }}
      >
        {/* top-right close */}
        <IconButton
          onClick={handleImageClose}
          sx={{
            position: "fixed",
            top: { xs: 12, sm: 18 },
            right: { xs: 12, sm: 18 },
            zIndex: 1400,
            color: "common.white",
            backgroundColor: "rgba(255,255,255,0.06)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
          }}
          aria-label="Close image"
        >
          <CloseIcon />
        </IconButton>

        {/* image with scale/opacity transition */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
          onClick={handleImageClose} // clicking backdrop area closes
        >
          <Box
            component="img"
            src={selectedImage || ""}
            alt=""
            sx={{
              maxWidth: "95%",
              maxHeight: "92%",
              objectFit: "contain",
              borderRadius: 1,
              boxShadow: 24,
              transition: "transform 220ms ease, opacity 180ms ease",
              transform: imageOpen ? "scale(1)" : "scale(0.96)",
              opacity: imageOpen ? 1 : 0,
              // prevent image click propagate (so only clicking outside closes)
              pointerEvents: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Box>
      </Dialog>

      {/* Error snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// // src/pages/Shop.jsx
// import React, { useMemo, useState } from "react";
// import {
//   Box,
//   Grid,
//   Card,
//   CardMedia,
//   CardContent,
//   Typography,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Paper,
//   InputLabel,
//   Select,
//   MenuItem,
//   TextField,
//   IconButton,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// // Mock shoe data (replace with API response later)
// const mockProducts = [
//   {
//     id: 1,
//     name: "क्रीडा बूट (Sports Shoes)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694054/product-2_nidmy2.webp",
//     price: 2499,
//     description: "जिम व धावण्यासाठी आरामदायी व हलके क्रीडा बूट.",
//   },
//   {
//     id: 2,
//     name: "कॅज्युअल स्नीकर्स (Casual Sneakers)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694057/product-10_opesee.webp",
//     price: 1999,
//     description: "दररोजच्या वापरासाठी फॅशनेबल स्नीकर्स.",
//   },
//   {
//     id: 3,
//     name: "ट्रेकिंग बूट (Trekking Boots)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694054/product-1_buqsxp.webp",
//     price: 4499,
//     description: "डोंगर व ट्रेकिंगसाठी मजबूत बूट.",
//   },
//   {
//     id: 4,
//     name: "एथनिक फुटवेअर (Ethnic Footwear)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694055/product-6_fbq1gc.webp",
//     price: 2199,
//     description: "पारंपारिक पोशाखासाठी योग्य फुटवेअर.",
//   },
//   {
//     id: 5,
//     name: "लोफर्स (Loafers)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694056/product-12_ebzwxe.webp",
//     price: 1799,
//     description: "हलके, आरामदायी व कॅज्युअल वापरासाठी योग्य.",
//   },
//   {
//     id: 6,
//     name: "रनिंग शूज (Running Shoes)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694056/product-21_hzxusz.webp",
//     price: 2999,
//     description: "लांब पळण्यास योग्य लाइटवेट रनिंग शूज.",
//   },
//   {
//     id: 7,
//     name: "स्लिप-ऑन शूज (Slip-on Shoes)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694055/product-18_d2nrd3.webp",
//     price: 1599,
//     description: "सहज परिधान करता येणारे स्लिप-ऑन शूज.",
//   },
//   {
//     id: 8,
//     name: "हाय टॉप स्नीकर्स (High-top Sneakers)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694055/product-16_chyngm.webp",
//     price: 2299,
//     description: "युवकांसाठी स्टायलिश व ट्रेंडी स्नीकर्स.",
//   },
//   {
//     id: 9,
//     name: "लेदर शूज (Leather Shoes)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694056/product-9_axql1c.webp",
//     price: 3999,
//     description: "प्रीमियम दर्जाचे लेदर शूज.",
//   },
//   {
//     id: 10,
//     name: "स्पोर्ट्स सँडल्स (Sports Sandals)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694055/product-8_yn3yam.webp",
//     price: 1299,
//     description: "उन्हाळ्यासाठी हलक्या वजनाचे सँडल्स.",
//   },
//   {
//     id: 11,
//     name: "फॉर्मल शूज (Formal Shoes)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694056/product-13_p3k8g3.webp",
//     price: 3299,
//     description: "ऑफिस आणि समारंभासाठी दर्जेदार फॉर्मल शूज.",
//   },
//   {
//     id: 12,
//     name: "चप्पल (Sandals)",
//     imageUrl:
//       "https://res.cloudinary.com/dgj1tfu0j/image/upload/v1758694056/product-20_mrmfx0.webp",
//     price: 999,
//     description: "दैनंदिन वापरासाठी टिकाऊ चप्पल.",
//   },
// ];

// // Inline Card component
// function ProductCard({ product }) {
//   return (
//     <Card
//       sx={{
//         width: "100%",
//         mx: "auto",
//         minWidth: "350",
//         boxShadow: 3,
//         borderRadius: 2,
//         display: "flex",
//         flexDirection: "column",
//         height: "100%",
//         transition: "transform 0.2s ease, box-shadow 0.2s ease",
//         "&:hover": {
//           transform: "translateY(-4px)",
//           boxShadow: 8,
//         },
//       }}
//     >
//       <CardMedia
//         component="img"
//         image={product.imageUrl}
//         alt={product.name}
//         sx={{
//           height: 400,
//           objectFit: "cover", // bigger image, fills space
//         }}
//       />
//       <CardContent sx={{ flexGrow: 1 }}>
//         <Typography variant="h6" gutterBottom noWrap>
//           {product.name}
//         </Typography>
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{
//             display: "-webkit-box",
//             WebkitBoxOrient: "vertical",
//             WebkitLineClamp: 2,
//             overflow: "hidden",
//             minHeight: 40,
//           }}
//         >
//           {product.description}
//         </Typography>
//         <Typography variant="subtitle1" color="secondary" fontWeight="bold">
//           ₹ {product.price.toLocaleString("en-IN")}
//         </Typography>
//       </CardContent>
//     </Card>
//   );
// }

// export default function Shop() {
//   const [open, setOpen] = useState(false);
//   const [sort, setSort] = useState("default"); // 'default' | 'asc' | 'desc'
//   const [query, setQuery] = useState("");

//   // derived list: first filter by query, then sort if needed
//   const visibleProducts = useMemo(() => {
//     const q = (query || "").trim().toLowerCase();
//     let list = mockProducts.filter((p) => {
//       if (!q) return true;
//       return (
//         (p.name || "").toLowerCase().includes(q) ||
//         (p.description || "").toLowerCase().includes(q)
//       );
//     });

//     if (sort === "asc") {
//       list = [...list].sort((a, b) => a.price - b.price);
//     } else if (sort === "desc") {
//       list = [...list].sort((a, b) => b.price - a.price);
//     }
//     return list;
//   }, [query, sort]);

//   return (
//     <Box sx={{ width: "100%", maxWidth: "100vw", p: 2, overflowX: "hidden" }}>
//       {/* Header with contact button */}
//       <Box
//         sx={{
//           display: "flex",
//           gap: 2,
//           alignItems: "center",
//           mb: 2,
//           flexWrap: "wrap",
//           justifyContent: "space-between",
//           width: "100%",
//         }}
//       >
//         <Typography variant="h5">प्रोडक्टस</Typography>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => setOpen(true)}
//         >
//           खरेदीसाठी संपर्क
//         </Button>

//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 2,
//             alignItems: "left",
//             flex: 1,
//           }}
//         >
//           {/* Search */}
//           <TextField
//             size="small"
//             placeholder="शोधा (उत्पादन / वर्णन)"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             sx={{ minWidth: 220, flex: { xs: "1 1 100%", sm: "0 1 360px" } }}
//           />

//           {/* Sort select (no "मूळ क्रम" option shown) */}
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <InputLabel sx={{ mr: 1, fontSize: 13 }}>किंमत</InputLabel>
//             <Select
//               size="small"
//               value={sort ?? ""}
//               displayEmpty
//               width="160px"
//               placeholder="किंमत"
//               onChange={(e) => {
//                 const v = e.target.value || null;
//                 setSort(v);
//               }}
//               sx={{ minWidth: 160 }}
//             >
//               <MenuItem value="asc">कमी → जास्त</MenuItem>
//               <MenuItem value="desc">जास्त → कमी</MenuItem>
//             </Select>

//             {/* Show clear 'x' when sort is applied */}
//             {sort && (
//               <IconButton
//                 size="small"
//                 onClick={() => setSort(null)}
//                 aria-label="clear sort"
//                 sx={{ ml: 0.5 }}
//               >
//                 <CloseIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Box>
//       </Box>

//       {/* Product grid */}
//       <Grid container spacing={3} justifyContent="center">
//         {visibleProducts.map((p) => (
//           <Grid item key={p.id} xs={12} sm={6} md={4} lg={3}>
//             <ProductCard product={p} />
//           </Grid>
//         ))}
//       </Grid>

//       {/* Contact modal */}
//       <Dialog open={open} onClose={() => setOpen(false)}>
//         <DialogTitle>खरेदीसाठी संपर्क</DialogTitle>
//         <DialogContent>
//           <Typography>
//             आपल्या आवडत्या उत्पादनाची खरेदी करण्यासाठी कृपया खालील क्रमांकावर
//             संपर्क साधा:
//           </Typography>
//           <Typography sx={{ mt: 2, fontWeight: "bold" }}>
//             📞 ९८७६५४३२१०
//           </Typography>
//           <Typography sx={{ fontWeight: "bold" }}>📞 ९९८८७७६६५५</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>बंद करा</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }
