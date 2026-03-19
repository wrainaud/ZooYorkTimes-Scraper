// Build the React app instead of running the old dev server to avoid Node 20+ http_parser removal issues
// The Express server serves the built assets from client/build.
// If you want to use the dev server instead, run `cd client && npm start`.
const args = ["run", "build"];
const env = { ...process.env, PORT: "3004" };
const opts = { stdio: "inherit", cwd: "client", shell: true, env };
require("child_process").spawn("npm", args, opts);
