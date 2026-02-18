import dotenv from "dotenv";

import { setupIfNeeded } from "./setup";

dotenv.config({ path: "../../.env" });

setupIfNeeded();
