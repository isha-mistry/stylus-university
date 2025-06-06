import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

export async function POST(req: NextRequest, res: NextResponse) {
  // console.log("GET req call");
  const query = req.url.split("search-session/")[1];

  const { dao_name } = await req.json();
  // console.log("Dao name: ", dao_name);

  // console.log(user_address);
  try {
    // Connect to MongoDB
    // console.log("Connecting to MongoDB...");

    const client = await connectDB();
    // console.log("Connected to MongoDB");

    // Access the collection
    const db = client.db();
    const collection = db.collection("sessions");

    // Find documents based on user_address
    // console.log("Finding documents for user:", user_address);
    const documents = await collection
      .find({
        $and: [
          {
            $or: [
              { title: { $regex: `\\b${query}`, $options: "i" } },
              { host_address: { $regex: `\\b${query}`, $options: "i" } },
            ],
          },
          { dao_name: dao_name }, // Condition for matching dao_name
        ],
      })
      .toArray();
    // console.log("Documents found:", documents);

    client.close();
    // console.log("MongoDB connection closed");

    // Return the found documents
    return NextResponse.json(
      { success: true, data: documents },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data in get session by user:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
