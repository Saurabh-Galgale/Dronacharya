import React from "react";
import { Container, Typography, Box, Grid } from "@mui/material";
import { SUBSCRIPTION_PLANS } from "../config/plans";
import PricingCard from "./PricingCard";
import usePaymentGateway from "../hooks/usePaymentGateway";

const SubscriptionPrompt = () => {
  const { handleBuy, loading } = usePaymentGateway();
  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", py: 5 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Unlock Full Access
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 5 }}>
        Choose a plan to continue your learning journey and access all premium
        papers and features.
      </Typography>
      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {plans.map((plan) => (
          <Grid item key={plan.id} xs={12} sm={6} md={4}>
            <PricingCard plan={plan} onBuy={handleBuy} loading={loading} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SubscriptionPrompt;
