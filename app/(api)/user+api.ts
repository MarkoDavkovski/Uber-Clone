import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  try {
    const { name, email, clerkId } = await request.json();
    if (!name || !email || !clerkId)
      return Response.json(
        { error: "Missing required field" },
        { status: 400 }
      );

    const response = await sql`
    INSERT INTO users (name, email, clerk_id)
    VALUES (${name}, ${email}, ${clerkId})
    `;
    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "An error occurred while creating the user" }),
      { status: 500 }
    );
  }
}
