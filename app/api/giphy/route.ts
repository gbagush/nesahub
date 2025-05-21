import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const limit = 12;

  const endpoint = query
    ? `https://api.giphy.com/v1/gifs/search`
    : `https://api.giphy.com/v1/gifs/trending`;

  try {
    const response = await axios.get(endpoint, {
      params: {
        api_key: GIPHY_API_KEY,
        q: query || undefined,
        limit,
      },
    });

    return NextResponse.json({
      message: "Success getting GIF",
      data: response.data.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error?.response?.data?.message || "Failed to fetch from Giphy",
      },
      { status: 500 }
    );
  }
}
