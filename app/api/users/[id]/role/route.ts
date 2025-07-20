// app/api/users/[id]/role/route.ts

export async function GET(req, { params }) {
  console.log("🔥 This route was hit! From:", req.headers.get("referer"));
  return Response.json({ error: "This route is gone" }, { status: 410 });
}
