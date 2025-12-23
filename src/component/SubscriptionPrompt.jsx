import React from "react";
import { Container, Typography, Grid } from "@mui/material";
import { SUBSCRIPTION_PLANS } from "../config/plans";
import PricingCard from "./PricingCard";
import SubscriptionModal from "./SubscriptionModal";
import usePaymentGateway from "../hooks/usePaymentGateway";

const SubscriptionPrompt = () => {
  const { handleBuy, loading, showSuccessModal, handleCloseSuccessModal } =
    usePaymentGateway();
  const plans = Object.values(SUBSCRIPTION_PLANS);

  // When payment is successful from the prompt, we just want to reload the page
  // to re-check the subscription and unlock the content.
  const handlePaymentSuccess = () => {
    window.location.reload();
  };

  return (
    <>
      <Container maxWidth="md" sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Unlock Full Access
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 5 }}>
          Choose a plan to continue your learning journey and access all premium
          papers and features.
        </Typography>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {plans.map((plan) => (
            <Grid item key={plan.id} xs={12} sm={6} md={4}>
              <PricingCard
                plan={plan}
                onBuy={(planId) =>
                  handleBuy(planId, plan.name, handlePaymentSuccess)
                }
                loading={loading}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
      <SubscriptionModal
        open={showSuccessModal}
        handleClose={handleCloseSuccessModal}
      />
    </>
  );
};

export default SubscriptionPrompt;
