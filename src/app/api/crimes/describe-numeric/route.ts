import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { buildMatchFilter } from "@/utils/matchFilter";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const collectionName = url.searchParams.get("collection") || "crimes_2020";
    const variable = url.searchParams.get("variable"); // Ej. "Hour", "Radius", etc.
    const binsParam = url.searchParams.get("bins");
    const numberOfBins = binsParam ? parseInt(binsParam) : 6;

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

    // Pipeline de agregación
    const pipeline = [
      { $match: { ...matchFilter, [variable]: { $type: "number" } } },
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                mean: { $avg: `$${variable}` },
                std: { $stdDevPop: `$${variable}` },
                min: { $min: `$${variable}` },
                max: { $max: `$${variable}` },
                count: { $sum: 1 },
              },
            },
          ],
          median: [
            {
              $group: { _id: null, values: { $push: `$${variable}` } },
            },
            {
              $project: {
                median: { $arrayElemAt: [{ $sortArray: { input: "$values", sortBy: 1 } }, { $floor: { $divide: [{ $size: "$values" }, 2] } }] }
              },
            },
          ],
        },
      },
      {
        $project: {
          stats: { $arrayElemAt: ["$stats", 0] },
          median: { $arrayElemAt: ["$median.median", 0] },
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();

    if (!result?.stats) {
      return NextResponse.json({ error: "No hay datos numéricos válidos" }, { status: 400 });
    }

    const { mean, std, min, max, count } = result.stats;
    const median = result.median;
    
    const binSize = (max - min) / numberOfBins;

    const histogramPipeline = [
      { $match: { ...matchFilter, [variable]: { $type: "number" } } },
      {
        $bucket: {
          groupBy: `$${variable}`,
          boundaries: Array.from({ length: numberOfBins + 1 }, (_, i) => min + i * binSize),
          default: "outOfRange",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ];

    const histogramBuckets = await collection.aggregate(histogramPipeline).toArray();

    // Convertir a formato más usable
    const histogram = histogramBuckets
      .filter((b: any) => b._id !== "outOfRange")
      .map((b: any, i: number) => ({
        binStart: min + i * binSize,
        binEnd: min + (i + 1) * binSize,
        count: b.count,
      }));

    return NextResponse.json({
      stats: { mean, median, std },
      histogram,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error del servidor", detail: error.message || error.toString() },
      { status: 500 }
    );
  }
}
