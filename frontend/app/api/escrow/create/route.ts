import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: NextRequest) {
  try {
    // 🔐 Verify JWT
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const creatorId = payload.userId as string;

    // 📦 Get form data
    const {
      title,
      description,
      amount,
      currency,
      deadline,
      buyerEmail,
      sellerEmail,
    } = await req.json();

    // 🛑 Basic validation
    if (!title || !amount || !currency || !buyerEmail || !sellerEmail) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // 👤 Find Buyer
    const buyer = await prisma.user.findUnique({
      where: { email: buyerEmail },
    });

    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer email not found on platform" },
        { status: 404 }
      );
    }

    // 👤 Find Seller
    const seller = await prisma.user.findUnique({
      where: { email: sellerEmail },
    });

    if (!seller) {
      return NextResponse.json(
        { error: "Seller email not found on platform" },
        { status: 404 }
      );
    }

    // 💰 Create Escrow (Decimal Safe)
    const escrow = await prisma.escrow.create({
      data: {
        title,
        description: description || null,
        amount: new Prisma.Decimal(amount), // ✅ important
        currency,
        deadline: deadline ? new Date(deadline) : null,
        buyerId: buyer.id,
        sellerId: seller.id,
        creatorId,
      },
    });

    return NextResponse.json({
      message: "Escrow created successfully",
      escrow,
    });
  } catch (error: any) {
    console.error("Create Escrow Error:", error);
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: 500 }
    );
  }
}