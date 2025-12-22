// src/component/PaperCardSkeleton.jsx
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

const PaperCardSkeleton = ({ count = 3 }) => {
  return (
    <Box sx={{ p: 2, pb: 4 }}>
      {/* Filter Toggle Skeleton */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value="unsolved"
          exclusive
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              py: 0.8,
              fontWeight: 580,
              fontSize: "0.8rem",
              textTransform: "none",
              border: "0.8px solid",
              borderColor: "divider",
            },
          }}
        >
          <ToggleButton value="unsolved" sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" />
          </ToggleButton>
          <ToggleButton value="solved" sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Card Skeletons */}
      {[...Array(count)].map((_, i) => (
        <Card
          key={i}
          sx={{
            mb: 2,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1.5,
              }}
            >
              <Box sx={{ flex: 1, pr: 2 }}>
                <Skeleton
                  variant="text"
                  width="70%"
                  height={30}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton variant="text" width="30%" height={20} />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.06)",
                }}
              >
                <Skeleton variant="text" width={50} />
              </Box>
            </Box>

            {/* Info Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box>
                <Skeleton variant="text" width="50%" height={15} />
                <Skeleton variant="text" width="30%" height={25} />
              </Box>
              <Box>
                <Skeleton variant="text" width="50%" height={15} />
                <Skeleton variant="text" width="30%" height={25} />
              </Box>
            </Box>

            {/* Bottom Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton
                variant="rectangular"
                width={100}
                height={40}
                sx={{ borderRadius: 3 }}
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default PaperCardSkeleton;
