import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarsIcon from "@mui/icons-material/Stars";

const PricingCard = ({ plan, onBuy, loading, isActive, hideBuyButton }) => {
  return (
    <Card
      sx={{
        minWidth: 275,
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: isActive ? 10 : 3,
        borderRadius: 4,
        height: "100%",
        position: "relative",
        border: isActive ? "2px solid" : "1px solid",
        borderColor: isActive ? "primary.main" : "divider",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: isActive ? "none" : "scale(1.02)",
        },
      }}
    >
      {/* Active Plan Badge */}
      {isActive && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <Chip
            icon={<StarsIcon style={{ color: "white" }} />}
            label="Active Plan"
            color="primary"
            sx={{ fontWeight: "bold" }}
          />
        </Box>
      )}

      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h5"
          component="div"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: isActive ? "primary.main" : "text.primary",
          }}
        >
          {plan.name}
        </Typography>

        <Typography
          variant="h4"
          color="text.primary"
          sx={{ my: 2, fontWeight: "bold" }}
        >
          ₹{(plan.price / 100).toLocaleString("en-IN")}
          <Typography
            variant="body1"
            component="span"
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            / {plan.duration}
          </Typography>
        </Typography>

        <List dense sx={{ mt: 2 }}>
          {plan.features.map((feature, index) => (
            <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>

      <Box sx={{ p: 3, pt: 0 }}>
        {!hideBuyButton && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => onBuy(plan.id, plan.name)}
            disabled={loading}
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: "bold",
              borderRadius: 2,
              py: 1.2,
            }}
          >
            {loading ? "Processing..." : "Buy Now"}
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default PricingCard;
