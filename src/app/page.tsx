"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-[#2c3e50] text-white">
      <h1 className="text-3xl font-bold mb-8">Elige el dataset para analizar</h1>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => router.push("/crimes-chicago")}
      >
        Dataset Crimes Chicago (fuente oficial)
      </button>
      <button
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
        onClick={() => router.push("/crimes-tweets")}
      >
        Dataset Tweets (scrapeado)
      </button>
    </div>
  );
}
