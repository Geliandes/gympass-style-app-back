import { app } from "./app";
import { env } from "./env";

app
  .listen({
    host: "0.0.0.0",
    port: env.PORT,
  })
  .then(() => {
    console.log("🚀 Server is running on port 3333");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
