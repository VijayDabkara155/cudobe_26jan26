"use client";

import { useState } from "react";

export default function UploadPage() {
  const [cid, setCid] = useState("");

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setCid(data.cid);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Upload Document to IPFS</h1>

      <input type="file" onChange={handleUpload} />

      {cid && (
        <>
          <p>CID: {cid}</p>
          <a
            href={`http://localhost:8080/ipfs/${cid}`}
            target="_blank"
          >
            View File
          </a>
        </>
      )}
    </div>
  );
}