function convertHandshakeToRequest(socket) {
  const headers = new Headers();

  const token = socket.handshake.auth?.token;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  for (const [key, value] of Object.entries(socket.handshake.headers)) {
    if (typeof value === "string") headers.set(key, value);
  }

  return new Request("http://localhost", { method: "GET", headers });
}

function log(message) {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  const second = pad(now.getSeconds());

  const timestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  console.log(`[${timestamp}] ${message}`);
}

module.exports = { log, convertHandshakeToRequest };
