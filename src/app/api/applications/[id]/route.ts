import { NextResponse } from "next/server";
import { z } from "zod";
import { applicationArtifactLinksSchema } from "@/domains/applications/artifact-links";
import { applicationStatuses, applicationStatusLabel, canTransitionApplication } from "@/domains/applications/status";
import { getSession } from "@/domains/settings/auth/session";
import { prisma } from "@/shared/db/prisma";

const statusSchema = z.object({ status: z.enum(applicationStatuses) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid application status." }, { status: 400 });
  const { id } = await params;
  const application = await prisma.application.findFirst({ where: { id, userId: session.user.id } });
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  if (!canTransitionApplication(application.status, parsed.data.status)) {
    return NextResponse.json({ error: `Cannot move from ${applicationStatusLabel(application.status)} to ${applicationStatusLabel(parsed.data.status)}.` }, { status: 409 });
  }
  const links = applicationArtifactLinksSchema.safeParse({ ...application, status: parsed.data.status });
  if (!links.success) return NextResponse.json({ error: links.error.issues[0]?.message }, { status: 400 });
  const updated = await prisma.application.update({
    where: { id },
    data: {
      status: parsed.data.status,
      appliedDate: parsed.data.status === "APPLIED" && !application.appliedDate ? new Date() : application.appliedDate,
      timelineEvents: { create: { type: "STATUS", title: `Moved to ${applicationStatusLabel(parsed.data.status)}` } },
    },
  });
  return NextResponse.json({ application: updated });
}
