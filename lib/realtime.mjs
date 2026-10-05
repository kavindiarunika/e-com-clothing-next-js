const REALTIME_SERVER = Symbol.for("velora.realtime.server");

export function registerRealtimeServer(io) {
  globalThis[REALTIME_SERVER] = io;
}

export function publishRealtime(room, event, payload) {
  const io = globalThis[REALTIME_SERVER];
  if (!io) {
    console.error(
      `Socket.IO is unavailable; could not publish "${event}" to "${room}".`
    );
    return;
  }

  io.to(room).emit(event, payload);
}
