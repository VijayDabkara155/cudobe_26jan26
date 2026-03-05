import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // 🔥 When payment is successful
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const amount = Number(session.metadata?.amount);

      if (userId && amount) {
        await prisma.$transaction([
          // Update user balance
          prisma.user.update({
            where: { id: userId },
            data: {
              balance: {
                increment: amount,
              },
            },
          }),
          // ✅ Save transaction record so history works
          prisma.transaction.create({
            data: {
              userId,
              amount,
              type: "CREDIT",
              stripeId: session.id,
              status: "SUCCESS",
            },
          }),
        ]);

        console.log(`✅ Wallet updated and transaction saved: $${amount} for user ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return new NextResponse("Webhook error", { status: 400 });
  }
}