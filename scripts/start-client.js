// Run the React dev server on port 3004.
// The backend server will be proxied via the 'proxy' field in client/package.json.
const args = ["start"];
const env = { ...process.env, PORT: "3004" };
const opts = { stdio: "inherit", cwd: "client", shell: true, env };
require("child_process").spawn("npm", args, opts);
