import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { buildMatchFilter } from "@/utils/matchFilter";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const client = await clientPromise;
    const db = client.db("crime_db");
    const collection = db.collection("crimes_2020");
    const matchFilter = buildMatchFilter(url.searchParams);

    // Pipeline de agregación para agrupar por Cluster
    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: "$cluster",
          Latitude: { $avg: "$Latitude" },
          Longitude: { $avg: "$Longitude" },
          count_crimes: { $first: "$count_crimes" },
        },
      },
      {
        $project: {
          cluster: "$_id",
          Latitude: 1,
          Longitude: 1,
          count_crimes: 1,
          _id: 0,
        },
      },
    ];

    const clusterPoints = await collection.aggregate(pipeline).toArray();

    return NextResponse.json({ clusters: clusterPoints });
  } catch (error: any) {
    console.error("❌ Error en /api/crimes/points:", error);
    return NextResponse.json(
      { error: "Error del servidor", detail: error.message || error.toString() },
      { status: 500 }
    );
  }
}
