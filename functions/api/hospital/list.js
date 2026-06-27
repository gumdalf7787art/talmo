export async function onRequestGet(context) {
  try {
    const { env } = context;

    const { results } = await env.DB.prepare(
      "SELECT * FROM clinics ORDER BY is_premium DESC, consults DESC"
    ).all();

    return new Response(JSON.stringify({ success: true, clinics: results }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
