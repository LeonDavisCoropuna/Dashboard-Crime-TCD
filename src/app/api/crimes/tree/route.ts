import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { buildMatchFilter } from "@/utils/matchFilter";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const collectionName = url.searchParams.get("collection") || "crimes_2020";
    const selectedCrimes = url.searchParams.getAll("crimes");

    const client = await clientPromise;
    const db = client.db("crime_db");
    const collection = db.collection(collectionName);

    const matchFilter = buildMatchFilter(url.searchParams, collectionName);
    console.log(selectedCrimes)
    if (selectedCrimes.length > 0) {
      matchFilter.$or = [
        { "Category 1": { $in: selectedCrimes } },
        { "Category 2": { $in: selectedCrimes } },
        { "Category 3": { $in: selectedCrimes } },
      ];
    }

    const pipeline = [
      { $match: matchFilter },
      {
        $project: {
          matchingCategory: {
            $cond: [
              { $in: ["$Category 1", selectedCrimes] },
              "$Category 1",
              {
                $cond: [
                  { $in: ["$Category 2", selectedCrimes] },
                  "$Category 2",
                  {
                    $cond: [
                      { $in: ["$Category 3", selectedCrimes] },
                      "$Category 3",
                      null,
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      { $match: { matchingCategory: { $ne: null } } },
      {
        $group: {
          _id: "$matchingCategory",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ];

    const data = await collection.aggregate(pipeline).toArray();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error generando frecuencias", detail: error.message },
      { status: 500 }
    );
  }
}
