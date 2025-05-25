function convertHandshakeToRequest(socket) {
  const headers = new Headers();

  const token = socket.handshake.auth?.token;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  for (const [key, value] of Object.entries(socket.handshake.headers)) {
    if (typeof value === "string") headers.set(key, value);
  }

  return new Request("http://localhost", { method: "GET", headers });
}

module.exports = { convertHandshakeToRequest };
