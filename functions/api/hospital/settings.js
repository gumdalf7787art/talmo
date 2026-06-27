export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: "Missing userId" }), { status: 400 });
    }

    const { results } = await env.DB.prepare(
      "SELECT * FROM clinics WHERE id = ?"
    ).bind(userId).all();

    if (results.length === 0) {
      return new Response(JSON.stringify({ success: true, data: null }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: true, data: results[0] }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { userId, name, category, description, detail_description, address, contact, image_url } = body;

    if (!userId || !name || !category) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), { status: 400 });
    }

    // Upsert logic (insert or update)
    const sql = `
      INSERT INTO clinics (id, name, category, description, detail_description, address, contact, image_url, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        category=excluded.category,
        description=excluded.description,
        detail_description=excluded.detail_description,
        address=excluded.address,
        contact=excluded.contact,
        image_url=excluded.image_url,
        updated_at=CURRENT_TIMESTAMP
    `;

    await env.DB.prepare(sql).bind(
      userId, name, category, description || "", detail_description || "", address || "", contact || "", image_url || ""
    ).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
