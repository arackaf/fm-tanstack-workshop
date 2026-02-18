import dotenv from "dotenv";

import { setupIfNeeded } from "./index";

dotenv.config({ path: "../../.env" });

setupIfNeeded();
