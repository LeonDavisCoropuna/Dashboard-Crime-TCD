import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { CrimeRecord } from "@/interface/crime_records";
import { buildMatchFilter } from "@/utils/matchFilter";

const monthOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const client = await clientPromise;
    const db = client.db("crime_db");
    const collection = db.collection<CrimeRecord>("crimes_2020");

    const matchFilter = buildMatchFilter(url.searchParams);

    const pipeline = [
      { $match: matchFilter },
      { $group: { _id: "$Month", count: { $sum: 1 } } },
      { $match: { _id: { $in: monthOrder } } },
      { $sort: { _id: 1 } },
    ];

    const aggResult = await collection.aggregate(pipeline).toArray();

    const monthCounts: Record<string, number> = {};
    monthOrder.forEach((month) => {
      const found = aggResult.find(r => r._id === month);
      if (found) monthCounts[month] = found.count;
    });

    return NextResponse.json({ data: monthCounts });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Error del servidor", detail: error.message || error.toString() },
      { status: 500 }
    );
  }
}
