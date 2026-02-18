import dotenv from "dotenv";

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { setupIfNeeded } from "./setup";

const thisFileDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(thisFileDir, "../../.env") });

setupIfNeeded();
