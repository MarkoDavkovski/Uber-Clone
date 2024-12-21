import React, { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { useStripe, InitPaymentSheetResult } from "@stripe/stripe-react-native";
import CustomButton from "./CustomButton";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/types/type";

class PaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

// Constants
const MERCHANT_NAME = "Example, Inc.";
const API_ENDPOINT = "/(api)/(stripe)/create";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentState, setPaymentState] = useState({
    isLoading: false,
    isInitialized: false,
    isSuccess: false,
  });

  const fetchPaymentSheetParams = useCallback(async () => {
    try {
      const name = fullName || email.split("@")[0];
      const data = await fetchAPI(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          amount: Number(amount),
          driverId,
          rideTime,
        }),
      });
      console.log("fetchPaymentSheetParams");
      if (!data || !data.paymentIntent || !data.ephemeralKey || !data.customer)
        throw new Error("Invalid payment sheet parameters received");

      return {
        paymentIntent: data.paymentIntent.client_secret,
        ephemeralKey: data.ephemeralKey.secret,
        customer: data.customer,
      };
    } catch (error) {
      console.error("Payment sheet params fetch error:", error);
      throw new Error("Unable to process payment setup");
    }
  }, [fullName, email, amount, driverId, rideTime]);

  // Initialize payment sheet with proper error handling
  const initializePaymentSheet = useCallback(async () => {
    if (paymentState.isLoading) return;

    setPaymentState((prev) => ({ ...prev, isLoading: true }));
    try {
      const params = await fetchPaymentSheetParams();
      const initResult: InitPaymentSheetResult = await initPaymentSheet({
        merchantDisplayName: MERCHANT_NAME,
        customerId: params.customer,
        customerEphemeralKeySecret: params.ephemeralKey,
        paymentIntentClientSecret: params.paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: fullName || email.split("@")[0],
          email,
        },
        returnURL: "myapp",
      });

      if (initResult.error)
        throw new PaymentError(initResult.error.message, initResult.error.code);

      setPaymentState((prev) => ({ ...prev, isInitialized: true }));
    } catch (error) {
      const paymentError =
        error instanceof PaymentError
          ? error
          : new PaymentError(
              "Payment initialization failed",
              "INIT_ERROR",
              error
            );

      console.error("Payment Sheet Initialization Error:", paymentError);
      showErrorAlert(paymentError.message);
    } finally {
      setPaymentState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [initPaymentSheet, fetchPaymentSheetParams, fullName, email]);

  const handlePayment = useCallback(async () => {
    try {
      if (!paymentState.isInitialized) await initializePaymentSheet();

      const { error } = await presentPaymentSheet();
      if (error) throw new PaymentError(error.message, error.code);

      //IMPLEMENT LOGIC TO HANDLE THE PAYMENT PROCESS

      setPaymentState((prev) => ({ ...prev, isSuccess: true }));
      Alert.alert("Success", "Your payment was processed successfully");
    } catch (error) {
      const paymentError =
        error instanceof PaymentError
          ? error
          : new PaymentError("Payment failed", "PAYMENT_ERROR", error);

      console.error("Payment Presentation Error:", paymentError);
      showErrorAlert(paymentError.message);
    }
  }, [paymentState.isInitialized, initializePaymentSheet, presentPaymentSheet]);

  useEffect(() => {
    initializePaymentSheet();
  }, [initializePaymentSheet]);

  const showErrorAlert = (message: string) => {
    Alert.alert("Payment Error", message);
  };

  return (
    <CustomButton
      title="Confirm Ride"
      className="my-5"
      onPress={handlePayment}
      disabled={paymentState.isLoading}
      loading={paymentState.isLoading}
    />
  );
};

export default Payment;
