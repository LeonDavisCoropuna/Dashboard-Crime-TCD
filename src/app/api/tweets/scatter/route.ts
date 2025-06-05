import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { buildMatchFilter } from "@/utils/matchFilter";
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const collectionName = url.searchParams.get("collection") || "tweets_2020";
    const xField = url.searchParams.get("xAxis") || "likes_count"; // Cambiado a xAxis y valor por defecto coherente
    const yField = url.searchParams.get("yAxis") || "likeCount"; // Cambiado a yAxis y valor por defecto coherente

    const client = await clientPromise;
    const db = client.db("crime_db");

    // Validar la colección por seguridad
    const allowedCollections = ["tweets_2020"];
    if (!allowedCollections.includes(collectionName)) {
      return NextResponse.json({ error: "Colección no permitida" }, { status: 400 });
    }

    const collection = db.collection(collectionName);
    const matchFilter = buildMatchFilter(url.searchParams, collectionName);

    // Proyección para limitar los campos
    const projection: any = {};
    projection[xField] = 1;
    projection[yField] = 1;

    const results = await collection
      .find(matchFilter, { projection })
      .limit(1000)
      .toArray();

    const data = results
      .filter(doc => typeof doc[xField] === "number" && typeof doc[yField] === "number")
      .map(doc => ({
        x: doc[xField],
        y: doc[yField],
      }));

    return NextResponse.json({ data });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Error del servidor", detail: error.message || error.toString() },
      { status: 500 }
    );
  }
}