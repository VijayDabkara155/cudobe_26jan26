import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await jwtVerify(token, SECRET);
    const { id } = await params;

    const escrow = await prisma.escrow.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
        seller: { select: { id: true, firstName: true, lastName: true, email: true } },
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }

    return NextResponse.json({ escrow });

  } catch (error: any) {
    console.error("Get Escrow Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;
    const { id } = await params;
    const { action } = await req.json();

    const escrow = await prisma.escrow.findUnique({ where: { id } });
    if (!escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }

    // Check user is part of this escrow
    if (escrow.buyerId !== userId && escrow.sellerId !== userId && escrow.creatorId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let newStatus;
    switch (action) {
      case "FUND":
        if (escrow.status !== "PENDING") {
          return NextResponse.json({ error: "Escrow can only be funded when PENDING" }, { status: 400 });
        }
        newStatus = "FUNDED";
        break;
      case "RELEASE":
        if (escrow.status !== "FUNDED" && escrow.status !== "LOCKED") {
          return NextResponse.json({ error: "Escrow must be FUNDED or LOCKED to release" }, { status: 400 });
        }
        newStatus = "RELEASED";
        break;
      case "DISPUTE":
        if (escrow.status === "RELEASED" || escrow.status === "CANCELLED") {
          return NextResponse.json({ error: "Cannot dispute a completed escrow" }, { status: 400 });
        }
        newStatus = "DISPUTED";
        break;
      case "CANCEL":
        if (escrow.status === "RELEASED" || escrow.status === "LOCKED") {
          return NextResponse.json({ error: "Cannot cancel this escrow" }, { status: 400 });
        }
        newStatus = "CANCELLED";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.escrow.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ message: "Escrow updated", escrow: updated });

  } catch (error: any) {
    console.error("Update Escrow Error:", error);
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 });
  }
}