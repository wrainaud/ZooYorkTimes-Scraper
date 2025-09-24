// Build the React app instead of running the old dev server to avoid Node 20+ http_parser removal issues
// The Express server serves the built assets from client/build.
const args = ["run", "build"];
const opts = { stdio: "inherit", cwd: "client", shell: true };
require("child_process").spawn("npm", args, opts);
