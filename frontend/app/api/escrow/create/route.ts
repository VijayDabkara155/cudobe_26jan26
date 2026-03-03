import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const creatorId = payload.userId as string;

    const { title, description, amount, currency, deadline, buyerEmail, sellerEmail } = await req.json();

    if (!title || !amount || !currency || !buyerEmail || !sellerEmail) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const buyer = await prisma.user.findUnique({ where: { email: buyerEmail } });
    if (!buyer) {
      return NextResponse.json({ error: "Buyer email not found on platform" }, { status: 404 });
    }

    const seller = await prisma.user.findUnique({ where: { email: sellerEmail } });
    if (!seller) {
      return NextResponse.json({ error: "Seller email not found on platform" }, { status: 404 });
    }

    const escrow = await prisma.escrow.create({
      data: {
        title,
        description,
        amount,
        currency,
        deadline: deadline ? new Date(deadline) : null,
        buyerId: buyer.id,
        sellerId: seller.id,
        creatorId,
      },
    });

    return NextResponse.json({ message: "Escrow created successfully", escrow });
  } catch (error: any) {
    console.error("Create Escrow Error:", error);
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 });
  }
}