"""WebSocket Manager for SENTINEL real-time broadcasts."""

from typing import List, Dict, Any
from fastapi import WebSocket
from datetime import datetime, timezone
import json
from app.core.logging import logger

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Any):
        if not self.active_connections:
            return

        payload = {
            "event": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data
        }
        message_text = json.dumps(payload, default=str)

        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message_text)
            except Exception as e:
                logger.warning(f"Error sending message to WebSocket client: {e}")
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

    @property
    def client_count(self) -> int:
        return len(self.active_connections)

ws_manager = WebSocketManager()
