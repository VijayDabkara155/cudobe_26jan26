import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(type && type !== "ALL" ? { type: type as any } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Transactions Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}