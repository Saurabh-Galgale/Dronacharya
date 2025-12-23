import { useState } from "react";
import toast from "react-hot-toast";
import loadScript from "../utils/loadScript";
import { createOrder, verifyPayment } from "../services/paymentApi";
import { getProfile } from "../services/authService"; // Assuming a function to get the profile exists

const RAZORPAY_SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";

const usePaymentGateway = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState(null);

  const handleBuy = async (planId, planName, onSuccess) => {
    setLoading(true);
    const toastId = toast.loading("Initiating payment...");

    // Store the onSuccess callback to be used later
    setOnSuccessCallback(() => onSuccess);

    try {
      const scriptLoaded = await loadScript(RAZORPAY_SDK_URL);
      if (!scriptLoaded) {
        toast.error("Network error: Could not load payment gateway.", {
          id: toastId,
        });
        setLoading(false);
        return;
      }

      const orderData = await createOrder(planId);
      const { orderId, key, amount, currency } = orderData;
      const userProfile =
        JSON.parse(localStorage.getItem("user_profile")) || {};

      const options = {
        key,
        amount,
        currency,
        order_id: orderId,
        name: "MPSC KI TAIYARI",
        description: `Subscription: ${planName}`,
        handler: async function (response) {
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
              const updatedUserProfile = await getProfile();
              if (updatedUserProfile) {
                localStorage.setItem(
                  "user_profile",
                  JSON.stringify(updatedUserProfile)
                );
              }
              toast.success("Payment successful! Subscription activated.", {
                id: toastId,
              });
              setShowSuccessModal(true); // Show success modal, which will then trigger callback
            } else {
              toast.error(result.message || "Payment verification failed.", {
                id: toastId,
              });
            }
          } catch (verifyError) {
            toast.error(
              verifyError.message || "Payment verification failed.",
              { id: toastId }
            );
          }
        },
        prefill: {
          name: userProfile.name || "User",
          email: userProfile.email || "",
          contact: userProfile.phone || "",
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

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Execute the stored callback on close
    if (onSuccessCallback) {
      onSuccessCallback();
    }
  };

  return { handleBuy, loading, showSuccessModal, handleCloseSuccessModal };
};

export default usePaymentGateway;
