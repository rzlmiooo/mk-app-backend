import { Elysia, t } from "elysia";
import bcrypt from "bcryptjs";
import jwtPlugin from "@elysiajs/jwt";
import { supabase } from "./lib/supabase";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(
    jwtPlugin({
      name: "jwt",
      secret: process.env.JWT_SECRET || "supersecret",
    })
  )

  // --- REGISTER ---
  .post(
    "/api/register",
    async ({ body, jwt }) => {
      const { username, email, password, role } = body;
  
      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const { data, error } = await supabase
        .from("users")
        .insert({ username, email, password: hashedPassword, role })
        .select()
        .maybeSingle();
  
      if (error) return { error: error.message };
      if (!data) return { error: "Failed to register" };
  
      const token = await jwt.sign({
        id: data.id,
        email: data.email,
        role: data.role,
      });
  
      return { token };
    },
    {
      body: t.Object({
        username: t.String(),
        email: t.String(),
        password: t.String(),
        role: t.Union([t.Literal("user"), t.Literal("admin")]),
      }),
      response: t.Union([
        t.Object({ token: t.String() }),
        t.Object({ error: t.String() }),
      ]),
    }
  )
  
  // --- LOGIN ---
  .post(
    "/api/login",
    async ({ body, jwt }) => {
      const { email, password } = body;
  
      const { data, error } = await supabase
        .from("users")
        .select()
        .eq("email", email)
        .maybeSingle();
  
      if (error) return { error: error.message };
      if (!data) return { error: "Invalid credentials" };
  
      // compare password
      const isMatch = await bcrypt.compare(password, data.password);
      if (!isMatch) return { error: "Invalid credentials" };
  
      const token = await jwt.sign({
        id: data.id,
        email: data.email,
        role: data.role,
      });
  
      return { token };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      response: t.Union([
        t.Object({ token: t.String() }),
        t.Object({ error: t.String() }),
      ]),
    }
  )
  

  // --- PUBLIC: STORES LIST ---
  .get(
    "/api/stores",
    async () => {
      const { data, error } = await supabase
        .from("stores")
        .select(
          "id, store_name, category, picture, description, review, rating, address, gmaps_link"
        );

      if (error) return { error: error.message };

      return { stores: data ?? [] };
    },
    {
      response: t.Union([
        t.Object({
          stores: t.Array(
            t.Object({
              id: t.Number(),
              store_name: t.String(),
              category: t.String(),
              picture: t.String(),
              description: t.String(),
              review: t.String(),
              rating: t.Number(),
              address: t.String(),
              gmaps_link: t.String(),
            })
          ),
        }),
        t.Object({ error: t.String() }),
      ]),
    }
  )

  // --- PUBLIC: STORE DETAIL ---
  .get(
    "/api/stores/:id",
    async ({ params }) => {
      const { id } = params;

      const { data, error } = await supabase
        .from("stores")
        .select(
          "id, store_name, category, picture, description, review, rating, address, gmaps_link"
        )
        .eq("id", id)
        .maybeSingle();

      if (error) return { error: error.message };
      if (!data) return { error: "Store not found" };

      return { store: data };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      response: t.Union([
        t.Object({
          store: t.Object({
            id: t.Number(),
            store_name: t.String(),
            category: t.String(),
            picture: t.String(),
            description: t.String(),
            review: t.String(),
            rating: t.Number(),
            address: t.String(),
            gmaps_link: t.String(),
          }),
        }),
        t.Object({ error: t.String() }),
      ]),
    }
  )

  // --- PROTECTED: UPDATE REVIEW ---
  .patch(
    "/api/stores/:id/review",
    async ({ params, body, jwt, request }) => {
      const auth = request.headers.get("authorization");
      if (!auth) return { error: "Missing authorization header" };

      const token = auth.split(" ")[1];
      if (!token) return { error: "Invalid authorization header" };

      const payload = await jwt.verify(token);
      if (!payload) return { error: "Invalid or expired token" };

      const { id } = params;
      const { review } = body;

      const { data, error } = await supabase
        .from("stores")
        .update({ review })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) return { error: error.message };
      if (!data) return { error: "Store not found" };

      return { store: data };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        review: t.String(),
      }),
      response: t.Union([
        t.Object({
          store: t.Object({
            id: t.Number(),
            store_name: t.String(),
            category: t.String(),
            picture: t.String(),
            description: t.String(),
            review: t.String(),
            rating: t.Number(),
            address: t.String(),
            gmaps_link: t.String(),
          }),
        }),
        t.Object({ error: t.String() }),
      ]),
    }
  )

  // --- PROTECTED: UPDATE RATING ---
  .patch(
    "/api/stores/:id/rating",
    async ({ params, body, jwt, request }) => {
      const auth = request.headers.get("authorization");
      if (!auth) return { error: "Missing authorization header" };

      const token = auth.split(" ")[1];
      if (!token) return { error: "Invalid authorization header" };

      const payload = await jwt.verify(token);
      if (!payload) return { error: "Invalid or expired token" };

      const { id } = params;
      const { rating } = body;

      const { data, error } = await supabase
        .from("stores")
        .update({ rating })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) return { error: error.message };
      if (!data) return { error: "Store not found" };

      return { store: data };
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        rating: t.Number(),
      }),
      response: t.Union([
        t.Object({
          store: t.Object({
            id: t.Number(),
            store_name: t.String(),
            category: t.String(),
            picture: t.String(),
            description: t.String(),
            review: t.String(),
            rating: t.Number(),
            address: t.String(),
            gmaps_link: t.String(),
          }),
        }),
        t.Object({ error: t.String() }),
      ]),
    }
  )

  .listen(3000);

console.log("🚀 Server running on http://localhost:3000");