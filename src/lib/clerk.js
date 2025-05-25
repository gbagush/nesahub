const { createClerkClient } = require("@clerk/express");
const { convertHandshakeToRequest } = require("./utils");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

async function authenticateSocket(socket, next) {
  try {
    const req = convertHandshakeToRequest(socket);
    const authResult = await clerkClient.authenticateRequest(req);

    if (!authResult.isSignedIn) return next(new Error("Unauthorized"));

    socket.auth = authResult.toAuth();

    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    next(new Error("Authentication failed"));
  }
}

module.exports = authenticateSocket;
