import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        walletAddress: true,
        balance: true,
        createdAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });

  } catch (error: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;

    const { firstName, lastName, walletAddress, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // If changing password
    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName, walletAddress, password: hashedPassword },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName, walletAddress },
      });
    }

    return NextResponse.json({ message: "Profile updated successfully" });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 });
  }
}