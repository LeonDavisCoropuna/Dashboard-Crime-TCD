import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { CrimeRecord } from "@/interface/crime_records";
import { buildMatchFilter } from "@/utils/matchFilter";

const hourOrder = Array.from({ length: 24 }, (_, i) => i); // [0, 1, ..., 23]

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const collectionName = url.searchParams.get("collection") || "crimes_2020";

    const client = await clientPromise;
    const db = client.db("crime_db");
    // Validar collections permitidas para seguridad
    const allowedCollections = ["crimes_2020", "tweets_2020"];
    if (!allowedCollections.includes(collectionName)) {
      return NextResponse.json(
        { error: "Colección no permitida" },
        { status: 400 }
      );
    }

    // Seleccionar la colección según param
    const collection = db.collection(collectionName);

    const matchFilter = buildMatchFilter(url.searchParams, collectionName);

    const pipeline = [
      { $match: matchFilter },
      { $group: { _id: "$Hour", count: { $sum: 1 } } },
      { $match: { _id: { $in: hourOrder } } },
      { $sort: { _id: 1 } },
    ];

    const aggResult = await collection.aggregate(pipeline).toArray();

    const hourCounts: Record<string, number> = {};
    hourOrder.forEach((hour) => {
      const found = aggResult.find(r => r._id === hour);
      hourCounts[hour] = found ? found.count : 0;
    });

    return NextResponse.json({ data: hourCounts });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Error del servidor", detail: error.message || error.toString() },
      { status: 500 }
    );
  }
}
