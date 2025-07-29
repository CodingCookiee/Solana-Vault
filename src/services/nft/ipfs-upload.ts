interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export async function uploadToIPFS(file: File): Promise<string> {
  // Debug environment variables - use NEXT_PUBLIC_ prefix for client-side access
  console.log("Environment check:", {
    apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY ? "Present" : "Missing",
    secretKey: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY ? "Present" : "Missing",
    jwt: process.env.NEXT_PUBLIC_PINATA_JWT ? "Present" : "Missing",
  });

  const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
  const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

  // Try JWT method first (recommended by Pinata)
  if (PINATA_JWT) {
    return uploadWithJWT(file, PINATA_JWT);
  }

  // Fallback to API key method
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error(
      "Pinata credentials not configured. Please add NEXT_PUBLIC_PINATA_JWT or both NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY to your environment variables."
    );
  }

  return uploadWithAPIKeys(file, PINATA_API_KEY, PINATA_SECRET_KEY);
}

async function uploadWithJWT(file: File, jwt: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      })
    );
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: file.name,
        keyvalues: {
          type: "nft-image",
          timestamp: Date.now().toString(),
        },
      })
    );

    console.log("Uploading with JWT to Pinata...");
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pinata upload error:", response.status, errorText);
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }

    const result: PinataResponse = await response.json();
    console.log("Upload successful:", result);
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error("JWT upload error:", error);
    throw error;
  }
}

async function uploadWithAPIKeys(
  file: File,
  apiKey: string,
  secretKey: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      })
    );
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: file.name,
        keyvalues: {
          type: "nft-image",
          timestamp: Date.now().toString(),
        },
      })
    );

    console.log("Uploading with API keys to Pinata...");
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pinata upload error:", response.status, errorText);
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }

    const result: PinataResponse = await response.json();
    console.log("Upload successful:", result);
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error("API keys upload error:", error);
    throw error;
  }
}

export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

  // Try JWT method first
  if (PINATA_JWT) {
    return uploadMetadataWithJWT(metadata, PINATA_JWT);
  }

  // Fallback to API key method
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata credentials not configured");
  }

  return uploadMetadataWithAPIKeys(metadata, PINATA_API_KEY, PINATA_SECRET_KEY);
}

async function uploadMetadataWithJWT(
  metadata: any,
  jwt: string
): Promise<string> {
  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataOptions: {
            cidVersion: 1,
          },
          pinataMetadata: {
            name: `${metadata.name}-metadata`,
            keyvalues: {
              type: "nft-metadata",
              timestamp: Date.now().toString(),
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Pinata metadata upload failed: ${response.status} ${errorText}`
      );
    }

    const result: PinataResponse = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error("JWT metadata upload error:", error);
    throw error;
  }
}

async function uploadMetadataWithAPIKeys(
  metadata: any,
  apiKey: string,
  secretKey: string
): Promise<string> {
  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataOptions: {
            cidVersion: 1,
          },
          pinataMetadata: {
            name: `${metadata.name}-metadata`,
            keyvalues: {
              type: "nft-metadata",
              timestamp: Date.now().toString(),
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Pinata metadata upload failed: ${response.status} ${errorText}`
      );
    }

    const result: PinataResponse = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
  } catch (error) {
    console.error("API keys metadata upload error:", error);
    throw error;
  }
}