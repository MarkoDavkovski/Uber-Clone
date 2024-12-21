const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(express.static("."));
app.use(express.json());
app.use(cors());

app.post("/payment-sheet", async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2024-12-18.acacia" }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: "eur",
    customer: customer.id,
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter
    // is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE,
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Node server listening on port ${process.env.PORT}!`)
);
