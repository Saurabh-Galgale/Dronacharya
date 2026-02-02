import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import { getPackages } from "../services/api";
import { getStoredUserProfile } from "../services/authService";
import usePaymentGateway from "../hooks/usePaymentGateway";
import { getPaginatedCache, setPaginatedCache } from "../utils/sessionCache";
import PackageCard from "../component/PackageCard";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton, Button as MuiButton } from "@mui/material";

const Packages = () => {
  const navigate = useNavigate();
  const { handleBuyPackage } = usePaymentGateway();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("available");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const userProfile = getStoredUserProfile();
  const isSubscribed =
    userProfile?.subscription?.isActive ||
    userProfile?.subscription?.active ||
    false;

  const fetchPackagesData = async () => {
    setLoading(true);
    setError(null);

    const cachePrefix = `packages_${filter}`;
    const cacheKey = `${cachePrefix}_page_${currentPage}`;
    const cachedData = getPaginatedCache(cacheKey, cachePrefix);

    if (cachedData) {
      setPackages(cachedData.packages || []);
      setTotalPages(cachedData.totalPages || 1);
      setLoading(false);
      return;
    }

    try {
      const data = await getPackages(filter, currentPage);
      setPackages(data.packages || []);
      setTotalPages(data.totalPages || 1);
      setPaginatedCache(cacheKey, data, cachePrefix);
    } catch (err) {
      setError(err.message || "पॅकेज लोड करण्यात अडचण आली आहे.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackagesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, currentPage]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setCurrentPage(1);
    }
  };

  const handleEnterPackage = (pkg) => {
    navigate(`/packages/${pkg._id}`, { state: { package: pkg } });
  };

  const handleBuyPackageAction = (pkg) => {
    handleBuyPackage(pkg._id, pkg.name);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        pb: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 3,
            textAlign: "center",
            background: "linear-gradient(135deg, #de6925, #f8b14a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          विशेष पॅकेजेस 📦
        </Typography>

        <Box
          sx={{
            position: "sticky",
            top: 66,
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
            borderRadius: 3,
            p: 1,
            mb: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            fullWidth
            sx={{
              "& .MuiToggleButton-root": {
                py: 1,
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
                border: "none",
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #de6925, #f8b14a)",
                  color: "black",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              },
            }}
          >
            <ToggleButton value="available">उपलब्ध पॅकेजेस</ToggleButton>
            <ToggleButton value="purchased">खरेदी केलेले</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress sx={{ color: "#de6925" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : packages.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 10 }}>
            <Typography variant="h6" color="text.secondary">
              {filter === "purchased"
                ? "तुम्ही अद्याप कोणतेही पॅकेज खरेदी केलेले नाही."
                : "सध्या कोणतेही नवीन पॅकेज उपलब्ध नाही."}
            </Typography>
          </Box>
        ) : (
          <Box>
            {packages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                onEnter={handleEnterPackage}
                onBuy={handleBuyPackageAction}
                isSubscribed={isSubscribed}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  mt: 4,
                }}
              >
                <IconButton
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  sx={{ bgcolor: "white", boxShadow: 1 }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Typography sx={{ fontWeight: 700 }}>
                  पाने {currentPage} / {totalPages}
                </Typography>
                <IconButton
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  sx={{ bgcolor: "white", boxShadow: 1 }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Packages;
