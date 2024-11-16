import { namespaceWrapper, app } from "@_koii/namespace-wrapper";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { findDocuments, insertDocuments } from "./deps/mongo.js";

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

  app.get('/debug/mongo', async (req, res) => {
    try {
      console.log('trying insert documents')
      let result = await insertDocuments('users', { username: 'bob', createdAt: new Date().toISOString() });
      console.log('inserted documents', result)
    } catch (error) {
      console.error("Error inserting document:", error);
    }
    res.status(200).json({ message: "MongoDB connected" });
  });

  app.post("/api/login", async (req, res) => {
    try {
      console.log("req.body", req.body);
      const { username } = req.body;

      // Validate username
      if (!username || !["bob", "alice"].includes(username.toLowerCase())) {
        return res.status(400).json({ error: "Invalid username" });
      }

      // Check if user exists in MongoDB
      const existingUsers = await findDocuments('users', { 
        username: username.toLowerCase() 
      });
      const existingUser = existingUsers[0];

      if (!existingUser) {
        // Create new user
        const newUser = {
          username: username.toLowerCase(),
          createdAt: new Date().toISOString(),
        };

        // Store in MongoDB
        await insertDocuments('users', newUser);

        return res.status(201).json({
          message: "User created successfully",
          user: newUser,
        });
      }

      // Return existing user
      return res.status(200).json({
        message: "Login successful",
        user: existingUser,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
