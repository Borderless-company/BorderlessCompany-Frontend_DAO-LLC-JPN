import { Stripe } from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

console.log("Stripe PUBLIC: ", process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

export default stripe;

/**
 * @description Create a payment link for a product
 * @param productId
 * @param price
 * @returns payment link url
 */
export type CreatePaymentLinkProps = {
  productId: string;
  price: number;
};

export const createPaymentLink = async (productId: string, price: number) => {
  try {
    const stripePrice = await stripe.prices.create({
      currency: "jpy",
      unit_amount: price,
      product: productId,
    });
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
    });
    return paymentLink;
  } catch (error) {
    console.log("[ERROR] Failed to create product: ", error);
    throw error;
  }
};
