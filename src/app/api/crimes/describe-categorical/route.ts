import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { buildMatchFilter } from "@/utils/matchFilter";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const collectionName = url.searchParams.get("collection") || "crimes_2020";
    const variable = url.searchParams.get("variable"); // Ej. "Category", "Arrest", etc.

    if (!variable) {
      return NextResponse.json({ error: "Falta parámetro 'variable'" }, { status: 400 });
    }

    const allowedCollections = ["crimes_2020", "tweets_2020"];
    if (!allowedCollections.includes(collectionName)) {
      return NextResponse.json({ error: "Colección no permitida" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("crime_db");
    const collection = db.collection(collectionName);

    const matchFilter = buildMatchFilter(url.searchParams, collectionName);

    const pipeline = [
      { $match: { ...matchFilter, [variable]: { $ne: null } } },
      {
        $group: {
          _id: `$${variable}`,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 }, // Opcional: ordenar por frecuencia
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const frequencies = results.map((r) => ({
      value: r._id,
      count: r.count,
    }));

    return NextResponse.json({ frequencies });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error del servidor", detail: error.message || error.toString() },
      { status: 500 }
    );
  }
}
