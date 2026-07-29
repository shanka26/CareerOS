import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

const reviewSchema = z.object({ action: z.literal("REJECT") });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
  const { id } = await params;
  const result = await prisma.memorySuggestion.updateMany({ where: { id, userId: session.user.id, status: "PENDING" }, data: { status: "REJECTED", reviewedAt: new Date() } });
  if (result.count === 0) return NextResponse.json({ error: "Suggestion not found or already reviewed." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
