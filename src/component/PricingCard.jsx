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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const PricingCard = ({ plan, onBuy, loading }) => {
  return (
    <Card
      data-testid="pricing-card"
      sx={{
        minWidth: 275,
        maxWidth: 320,
        margin: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: 3,
        borderRadius: 2,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
          {plan.name}
        </Typography>
        <Typography variant="h4" color="text.primary" sx={{ my: 2 }}>
          ₹{plan.price / 100}
          <Typography variant="body1" component="span" color="text.secondary">
            / {plan.duration}
          </Typography>
        </Typography>
        <List dense>
          {plan.features.map((feature, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => onBuy(plan.id, plan.name)}
          disabled={loading}
          sx={{ textTransform: "none", fontSize: "1rem", fontWeight: "bold" }}
        >
          {loading ? "Processing..." : "Buy Now"}
        </Button>
      </Box>
    </Card>
  );
};

export default PricingCard;
