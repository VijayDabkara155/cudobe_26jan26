export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const ipfsForm = new FormData();
    ipfsForm.append("file", new Blob([buffer]));

    const response = await fetch(
      "http://127.0.0.1:5001/api/v0/add",
      {
        method: "POST",
        body: ipfsForm,
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: true,
      cid: data.Hash,
    });

  } catch (error) {
    console.error("IPFS Upload Error:", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}