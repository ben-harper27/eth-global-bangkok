import { namespaceWrapper, app } from "@_koii/namespace-wrapper";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { findDocuments, insertDocuments } from "./deps/mongo.js";
import { Wallet } from "@coinbase/coinbase-sdk";
import coinbase from "./deps/coinbase.js";
import { v4 as uuidv4 } from "uuid";
import { storeSecret } from "./deps/nillion.js";

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
        const uuid = uuidv4();
        const wallet = await Wallet.create();
        console.log('TEST', "wallet created");
        console.log('TEST', "wallet", wallet);
        const walletAddress = (await wallet.getDefaultAddress()).toString();
        console.log('TEST', "wallet address", walletAddress);
        const faucetTransaction = await wallet.faucet();
        console.log('TEST', "faucet transaction", faucetTransaction);
        await faucetTransaction.wait();
        const data = wallet.export();
        console.log('TEST', "wallet data", data);
        const base64Data = Buffer.from(JSON.stringify(data)).toString('base64');
        console.log('TEST', "base64Data", base64Data);
        // TODO: BROKEN NILLION CODE
        // await storeSecret(uuid, "walletPrivateKey", base64Data);
        const newUser = {
          id: uuid,
          username: username.toLowerCase(),
          walletAddress,
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
