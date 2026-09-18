import asyncio
import json
from typing import Set

class SSEManager:
    def __init__(self):
        self._queues: Set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self._queues.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        self._queues.discard(q)

    async def broadcast(self, event_type: str, data: dict):
        if not self._queues:
            return
        payload = {
            "event": event_type,
            "data": data
        }
        raw_message = f"event: {event_type}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
        for q in list(self._queues):
            try:
                q.put_nowait(raw_message)
            except Exception:
                self._queues.discard(q)

sse_manager = SSEManager()
