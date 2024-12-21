import { Stripe } from "stripe";
import { z } from "zod";

// Environment variable validation
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Request body schema validation
const PaymentConfirmationSchema = z.object({
  payment_method_id: z.string().min(1, "Payment method ID is required"),
  payment_intent_id: z.string().min(1, "Payment intent ID is required"),
  customer_id: z.string().min(1, "Customer ID is required"),
});

// Custom error class for payment confirmation errors
class PaymentConfirmationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "PaymentConfirmationError";
  }
}

async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> {
  try {
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new PaymentConfirmationError(
        error.message,
        error.statusCode || 400,
        "payment_method_attachment_error"
      );
    }
    throw new PaymentConfirmationError(
      "Failed to attach payment method",
      500,
      "payment_method_error"
    );
  }
}

async function confirmPayment(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new PaymentConfirmationError(
        error.message,
        error.statusCode || 400,
        "payment_confirmation_error"
      );
    }
    throw new PaymentConfirmationError(
      "Failed to confirm payment",
      500,
      "confirmation_error"
    );
  }
}

function handleError(error: unknown): Response {
  console.error("Payment confirmation error:", error);

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

  if (error instanceof PaymentConfirmationError) {
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
    const body = await request.json();
    const validatedData = PaymentConfirmationSchema.parse(body);
    const { payment_method_id, payment_intent_id, customer_id } = validatedData;

    // Attach payment method to customer
    const paymentMethod = await attachPaymentMethod(
      payment_method_id,
      customer_id
    );

    // Confirm the payment
    const result = await confirmPayment(payment_intent_id, paymentMethod.id);

    // Check payment status
    if (result.status === "succeeded") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment successful",
          paymentIntent: result,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      throw new PaymentConfirmationError(
        `Payment not successful. Status: ${result.status}`,
        400,
        "payment_failed"
      );
    }
  } catch (error) {
    return handleError(error);
  }
}
