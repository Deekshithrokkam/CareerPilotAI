import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`CareerPilot AI server listening on http://localhost:${env.port}`);
});
