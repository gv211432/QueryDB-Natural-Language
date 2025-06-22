import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query, db_uri } = await request.json()

    if (!query || !db_uri) {
      return NextResponse.json(
        { error: "Query and database URI are required" },
        { status: 400 }
      )
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
    console.log(`Sending request to: ${backendUrl}/send-message`)

    const response = await fetch(`${backendUrl}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        db_uri,
      }),
    })

    let data
    try {
      data = await response.json()
    } catch (err) {
      console.error("Failed to parse JSON:", err)
      return NextResponse.json(
        { error: "Invalid response from backend", message: "Invalid response format" },
        { status: 500 }
      )
    }

    if (!response.ok) {
      console.error(`Backend error: ${response.status} - ${JSON.stringify(data)}`)
      return NextResponse.json(
        { error: data.error || data.detail || "Backend error", message: data.message || "Failed to process request" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error calling backend:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: "Sorry, I'm having trouble connecting to the database. Please try again later.",
      },
      { status: 500 }
    )
  }
}