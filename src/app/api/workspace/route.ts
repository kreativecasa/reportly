import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/auth-guard";
import { ok, handleError } from "@/lib/api-response";

const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  logoUrl: z.string().url().nullable().optional(),
});

export async function GET() {
  try {
    const { workspace } = await requireWorkspace();
    return ok({ workspace });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { workspace } = await requireWorkspace();
    const input = updateSchema.parse(await req.json().catch(() => null));
    const updated = await prisma.workspace.update({ where: { id: workspace.id }, data: input });
    return ok({ workspace: updated });
  } catch (err) {
    return handleError(err);
  }
}
