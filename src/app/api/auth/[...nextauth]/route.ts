// This file is kept for compatibility but not used in the new authentication system
export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({ error: "This endpoint is deprecated" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST() {
  return new Response(JSON.stringify({ error: "This endpoint is deprecated" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
