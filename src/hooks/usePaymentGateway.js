import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import loadScript from "../utils/loadScript";
import { createOrder, verifyPayment } from "../services/paymentApi";

const RAZORPAY_SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";

// Testing creds for cards
// Card Number: 5267 3181 8797 5449
// Expiry: 12/30
// CVV: 123
// OTP: 123456

// Failure testing:
// Card Number: 4000 0000 0000 0002
// Card Number: 4111 1111 1111 1111
// Expiry: 12/30
// CVV: 123
// OTP: 123456

const usePaymentGateway = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBuy = async (planId, planName) => {
    setLoading(true);
    const toastId = toast.loading("Initiating payment...");

    try {
      // 1. Load Razorpay SDK
      const scriptLoaded = await loadScript(RAZORPAY_SDK_URL);
      if (!scriptLoaded) {
        toast.error("Network error: Could not load payment gateway.", {
          id: toastId,
        });
        setLoading(false);
        return;
      }

      // 2. Call backend to create an order
      const orderData = await createOrder(planId);
      const { orderId, key, amount, currency } = orderData;

      // 3. Get user profile for prefill
      const userProfile =
        JSON.parse(localStorage.getItem("user_profile")) || {};

      // 4. Define Razorpay options
      const options = {
        key,
        amount,
        currency,
        order_id: orderId,
        name: "Dronacharya Academy",
        description: `Subscription: ${planName}`,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        handler: async function (response) {
          // 5. On Success, call Backend to verify payment
          toast.loading("Verifying your payment...", { id: toastId });
          try {
            const verificationData = {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId,
            };
            const result = await verifyPayment(verificationData);

            if (result.success) {
              // Update user profile in local storage with new subscription details
              const updatedProfile = {
                ...userProfile,
                subscription: result.subscription,
              };

              localStorage.setItem(
                "user_profile",
                JSON.stringify(updatedProfile)
              );

              toast.success("Payment successful! Subscription activated.", {
                id: toastId,
              });
              navigate("/mock");
            } else {
              toast.error(result.message || "Payment verification failed.", {
                id: toastId,
              });
            }
          } catch (verifyError) {
            toast.error(verifyError.message || "Payment verification failed.", {
              id: toastId,
            });
          }
        },
        prefill: {
          name: userProfile.name || "User",
          email: userProfile.email || "",
          contact: userProfile.phone || "", // Phone is not available, so this will be empty
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            console.log("User cancelled payment.");
            toast.dismiss(toastId);
          },
        },
      };

      // 6. Initialize Razorpay and open the modal
      toast.dismiss(toastId);
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleBuy, loading };
};

export default usePaymentGateway;
