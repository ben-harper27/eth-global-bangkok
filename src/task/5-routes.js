import { namespaceWrapper, app } from "@_koii/namespace-wrapper";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

// Get the project root directory (assuming src is one level deep from root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

export function routes() {
  app.use(express.json());
  app.use("/static", express.static(path.join(projectRoot, "client")));
  /**
   *
   * Define all your custom routes here
   *
   */

  // Example route
  app.get("/value", async (_req, res) => {
    const value = await namespaceWrapper.storeGet("value");
    console.log("value", value);
    res.status(200).json({ value: value });
  });

  app.get("/app", (req, res) => {
    res.sendFile(path.join(projectRoot, "client/main.html"));
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username } = req.body;

      // Validate username
      if (!username || !["bob", "alice"].includes(username.toLowerCase())) {
        return res.status(400).json({ error: "Invalid username" });
      }

      // Check if user exists in NeoDB
      const existingUser = await namespaceWrapper.storeGet(`user:${username}`);

      if (!existingUser) {
        // Create new user
        const newUser = {
          username: username.toLowerCase(),
          createdAt: new Date().toISOString(),
          // Add any other user properties you need
        };

        // Store in NeoDB
        await namespaceWrapper.storeSet(
          `user:${username}`,
          JSON.stringify(newUser),
        );

        return res.status(201).json({
          message: "User created successfully",
          user: newUser,
        });
      }

      // Return existing user
      return res.status(200).json({
        message: "Login successful",
        user: JSON.parse(existingUser),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
