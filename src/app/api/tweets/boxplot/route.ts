// app/api/tweets/boxplot/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const variable = url.searchParams.get("variable") || "likeCount";
    const limit = parseInt(url.searchParams.get("limit") || "1000");

    const client = await clientPromise;
    const db = client.db("crime_db");
    const collection = db.collection("tweets_2020");

    // Obtener los datos para la variable seleccionada
    const results = await collection
      .find({ [variable]: { $exists: true } }, { projection: { [variable]: 1, _id: 0 } })
      .limit(limit)
      .toArray();

    // Filtrar y convertir a números
    const values = results
      .map(doc => {
        const value = doc[variable];
        return typeof value === 'number' ? value : 
               typeof value === 'string' ? parseFloat(value) || 0 : 0;
      })
      .filter(v => !isNaN(v));

    if (values.length === 0) {
      return NextResponse.json(
        { error: "No hay datos válidos para la variable seleccionada" },
        { status: 404 }
      );
    }

    // Calcular estadísticas para el boxplot
    const sorted = values.sort((a, b) => a - b);
    const q1 = d3.quantile(sorted, 0.25) || 0;
    const median = d3.quantile(sorted, 0.5) || 0;
    const q3 = d3.quantile(sorted, 0.75) || 0;
    const iqr = q3 - q1;
    const min = Math.max(sorted[0], q1 - 1.5 * iqr);
    const max = Math.min(sorted[sorted.length - 1], q3 + 1.5 * iqr);
    const outliers = sorted.filter(v => v < min || v > max);

    return NextResponse.json({
      data: {
        variable,
        count: values.length,
        min: sorted[0],
        q1,
        median,
        q3,
        max: sorted[sorted.length - 1],
        iqr,
        outliers,
        values: sorted // Todos los valores ordenados (opcional, para visualización)
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Error del servidor", detail: error.message },
      { status: 500 }
    );
  }
}

// Helper function (simula d3.quantile si no tienes d3 en el backend)
namespace d3 {
  export function quantile(sorted: number[], p: number): number {
    const n = sorted.length;
    if (n === 0) return 0;
    const i = (n - 1) * p;
    const i0 = Math.floor(i);
    const v0 = sorted[i0];
    const v1 = sorted[Math.min(i0 + 1, n - 1)];
    return v0 + (v1 - v0) * (i - i0);
  }
}