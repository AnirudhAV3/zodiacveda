import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { charts } from "@/db/schema";
import { computeChart, type BirthInput } from "@/lib/astro/calc";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b = (await req.json()) as Partial<BirthInput>;
    const errors: string[] = [];
    if (!b.name?.trim()) errors.push("Name is required");
    if (!b.date || !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) errors.push("Valid date is required");
    if (!b.time || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(b.time)) errors.push("Valid 24-hour time (HH:MM or HH:MM:SS) is required");
    const lat = Number(b.lat);
    const lon = Number(b.lon);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) errors.push("Valid latitude is required");
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) errors.push("Valid longitude is required");
    if (!b.tz) errors.push("Time zone is required");
    if (errors.length) return NextResponse.json({ error: errors.join(", ") }, { status: 400 });

    const input: BirthInput = {
      name: b.name!.trim().slice(0, 80),
      gender: b.gender === "female" ? "female" : "male",
      date: b.date!,
      time: b.time!.length === 5 ? `${b.time}:00` : b.time!.slice(0, 8),
      place: (b.place || `${lat.toFixed(2)}, ${lon.toFixed(2)}`).slice(0, 160),
      lat,
      lon,
      tz: b.tz!,
      style: b.style === "south" ? "south" : "north",
    };
    const data = computeChart(input);
    const s = randomUUID().replace(/-/g, "");
    await db.insert(charts).values({
      slug: s,
      name: input.name,
      gender: input.gender,
      birthDate: input.date,
      birthTime: input.time,
      place: input.place,
      latitude: lat,
      longitude: lon,
      timezone: input.tz,
      chartStyle: input.style,
      data,
    });
    return NextResponse.json({ slug: s });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not compute chart. Please verify the time zone and inputs." }, { status: 500 });
  }
}
