import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { SUBSCRIPTION_PLANS } from "../config/plans";
import PricingCard from "../component/PricingCard";
import usePaymentGateway from "../hooks/usePaymentGateway";
import { getStoredUserProfile } from "../services/authService";

const Subscription = () => {
  const { handleBuy, loading } = usePaymentGateway();
  const plans = Object.values(SUBSCRIPTION_PLANS);

  // Get current user profile and subscription status
  const userProfile = getStoredUserProfile();
  const userSub = userProfile?.subscription;

  // Professional check: Is active AND not expired?
  const isSubscribed =
    userSub?.active &&
    userSub?.endDate &&
    new Date(userSub.endDate) > new Date();

  const activePlanId = isSubscribed ? userSub?.plan : null;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        textAlign="center"
        fontWeight="bold"
      >
        {isSubscribed ? "Your Membership" : "Choose Your Plan"}
      </Typography>
      <Typography
        variant="h6"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 6 }}
      >
        {isSubscribed
          ? `Your access is valid until ${new Date(
              userSub.endDate
            ).toLocaleDateString("en-IN", { dateStyle: "long" })}`
          : "Select the perfect plan to boost your exam preparation and unlock exclusive content."}
      </Typography>

      <Box justifyContent="center" alignItems="stretch">
        {plans.map((plan) => (
          <Box mb={2}>
            <PricingCard
              plan={plan}
              onBuy={handleBuy}
              loading={loading}
              isActive={activePlanId === plan.id}
              hideBuyButton={isSubscribed}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Subscription;
