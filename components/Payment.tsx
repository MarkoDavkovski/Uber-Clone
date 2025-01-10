import React, { useState, useCallback } from "react";
import { Alert, Image, Text, View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import CustomButton from "./CustomButton";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/types/type";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import ReactNativeModal from "react-native-modal";
import { images } from "@/constants";
import { useRouter } from "expo-router";

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
const STRIPE_API_ENDPOINT = "/(api)/(stripe)";
const RIDE_API_ENDPOINT = "/(api)/ride";

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
    paymentDetails: {
      customerId: "",
      paymentIntentId: "",
      paymentMethodId: "",
      client_secret: "",
    },
  });
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();
  const { userId } = useAuth();
  const router = useRouter();

  // Initialize payment sheet with proper error handling
  const initializePaymentSheet = useCallback(async () => {
    debugger;
    if (paymentState.isLoading || paymentState.isSuccess) return;

    setPaymentState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await fetchAPI(`${STRIPE_API_ENDPOINT}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName || email.split("@")[0],
          email,
          amount: Number(amount),
        }),
      });

      if (
        !data.paymentIntent ||
        !data.ephemeralKey ||
        !data.customer ||
        !data.publishableKey
      ) {
        throw new PaymentError("Invalid payment sheet parameters received");
      }

      const { paymentIntent, ephemeralKey, customer } = data;

      setPaymentState((prev) => ({
        ...prev,
        paymentDetails: {
          ...prev.paymentDetails,
          customerId: customer,
          paymentIntentId: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
        },
      }));

      const initResult = await initPaymentSheet({
        merchantDisplayName: MERCHANT_NAME,
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey.secret,
        paymentIntentClientSecret: paymentIntent.client_secret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: fullName || email.split("@")[0],
          email,
        },
        returnURL: "myapp://book-ride",
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
  }, [initPaymentSheet, fullName, email, amount]);

  const handlePayment = useCallback(async () => {
    try {
      await initializePaymentSheet();

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        throw new PaymentError(presentError.message, presentError.code);
      }

      setPaymentState((prev) => ({ ...prev, isSuccess: true }));
      await fetchAPI(`${RIDE_API_ENDPOINT}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_address: userAddress,
          destination_address: destinationAddress,
          origin_latitude: userLatitude,
          origin_longitude: userLongitude,
          destination_latitude: destinationLatitude,
          destination_longitude: destinationLongitude,
          ride_time: rideTime.toFixed(0),
          fare_price: Number(amount) * 100,
          payment_status: "paid",
          driver_id: driverId,
          user_id: userId,
        }),
      });
    } catch (error) {
      const paymentError =
        error instanceof PaymentError
          ? error
          : new PaymentError("Payment failed", "PAYMENT_ERROR", error);

      console.error("Payment Presentation Error:", paymentError);
      showErrorAlert(paymentError.message);
    }
  }, [
    paymentState.isInitialized,
    initializePaymentSheet,
    presentPaymentSheet,
    amount,
    userAddress,
    destinationAddress,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    rideTime,
    driverId,
    userId,
  ]);

  const showErrorAlert = (message: string) => {
    Alert.alert("Payment Error", message);
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-5"
        onPress={handlePayment}
        disabled={paymentState.isLoading}
        loading={paymentState.isLoading}
      />
      <ReactNativeModal
        isVisible={paymentState.isSuccess}
        onBackdropPress={() =>
          setPaymentState((prev) => ({ ...prev, isSuccess: false }))
        }>
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setPaymentState((prev) => ({ ...prev, isSuccess: false }));
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
