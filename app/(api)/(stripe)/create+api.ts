import { Stripe } from "stripe";
import { z } from "zod";

// Environment variable validation
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  EXPO_PUBLIC_STRIPE_PUBLISHABLE: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE,
};

// Validate environment variables are set
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Request body schema validation
const PaymentRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  amount: z.number().positive("Amount must be positive"),
});

// Custom error class for better error handling
class PaymentError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

async function findOrCreateCustomer(
  email: string,
  name: string
): Promise<Stripe.Customer> {
  try {
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    return await stripe.customers.create({ name, email });
  } catch (error) {
    throw new PaymentError(
      "Failed to process customer information",
      500,
      "customer_error"
    );
  }
}

async function createEphemeralKey(
  customerId: string
): Promise<Stripe.EphemeralKey> {
  try {
    return await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2024-12-18.acacia" }
    );
  } catch (error) {
    throw new PaymentError(
      "Failed to create ephemeral key",
      500,
      "ephemeral_key_error"
    );
  }
}

async function createPaymentIntent(
  customerId: string,
  amount: number
): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });
  } catch (error) {
    throw new PaymentError(
      "Failed to create payment intent",
      500,
      "payment_intent_error"
    );
  }
}

function handleError(error: unknown): Response {
  console.error("Payment processing error:", error);

  if (error instanceof z.ZodError) {
    return new Response(
      JSON.stringify({
        error: "Validation error",
        details: error.errors,
        status: 400,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (error instanceof PaymentError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
        status: error.statusCode,
      }),
      {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Handle unexpected errors
  return new Response(
    JSON.stringify({
      error: "Internal server error",
      status: 500,
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = PaymentRequestSchema.parse(body);
    const { name, email, amount } = validatedData;

    const customer = await findOrCreateCustomer(email, name);
    const ephemeralKey = await createEphemeralKey(customer.id);
    const paymentIntent = await createPaymentIntent(customer.id, amount);

    const responseData = {
      paymentIntent,
      ephemeralKey,
      customer: customer.id,
      publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
