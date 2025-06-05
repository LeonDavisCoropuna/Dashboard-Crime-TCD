import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { CrimeRecord } from "@/interface/crime_records";
import { buildMatchFilter } from "@/utils/matchFilter";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const client = await clientPromise;
    const db = client.db("crime_db");
    const collection = db.collection<CrimeRecord>("crimes_2020");

    const matchFilter = buildMatchFilter(url.searchParams);

    // Total global (sin filtro)
    const total = await collection.countDocuments();

    // Total filtrado
    const filtered = await collection.countDocuments(matchFilter);

    const percentage = total > 0 ? parseFloat(((filtered / total) * 100).toFixed(2)) : 0;
    return NextResponse.json({
      data: {
        total,
        filtered,
        percentage,
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Error del servidor", detail: error.message || error.toString() },
      { status: 500 }
    );
  }
}
