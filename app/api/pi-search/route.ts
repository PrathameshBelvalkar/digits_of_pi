import { ANGIO_DEPTH, searchAngio } from "@/lib/angio-search";
import { PISEARCH_DEPTH, searchPisearch } from "@/lib/pisearch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let query = "";
  try {
    const body = (await request.json()) as { query?: string };
    query = String(body.query ?? "").replace(/\D/g, "");
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (query.length < 5 || query.length > 8) {
    return Response.json({ error: "Query must be 5 to 8 digits" }, { status: 400 });
  }

  try {
    const angio = await searchAngio(query);
    if (angio) {
      return Response.json({ found: true, result: angio });
    }
  } catch {
    /* fall through to PiSearch */
  }

  try {
    const remote = await searchPisearch(query);
    if (remote) {
      return Response.json({ found: true, result: remote });
    }
    return Response.json({ found: false, depth: PISEARCH_DEPTH });
  } catch {
    return Response.json({
      found: false,
      depth: ANGIO_DEPTH,
      remoteError: true,
    });
  }
}
