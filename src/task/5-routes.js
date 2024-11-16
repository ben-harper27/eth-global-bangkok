import { namespaceWrapper, app } from "@_koii/namespace-wrapper";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory (assuming src is one level deep from root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

export function routes() {
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
    res.sendFile(path.join(projectRoot, 'client/main.html'));
  });
}
