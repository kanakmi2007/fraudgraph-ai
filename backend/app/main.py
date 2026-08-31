import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.utils.config import settings
from app.database.mongodb import mongo_client
from app.database.neo4j import neo4j_client
from app.api import dashboard, accounts, transactions, alerts, cases, graph, simulation
from app.services.simulation_service import simulation_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect databases
    print(f"Starting {settings.PROJECT_NAME} backend...")
    mongo_client.connect()
    neo4j_client.connect()
    yield
    # Shutdown
    mongo_client.close()
    neo4j_client.close()
    print("FraudGraph AI backend shutdown cleanly.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(accounts.router, prefix=settings.API_PREFIX)
app.include_router(transactions.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(cases.router, prefix=settings.API_PREFIX)
app.include_router(graph.router, prefix=settings.API_PREFIX)
app.include_router(simulation.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "mongodb_connected": mongo_client.is_connected,
        "neo4j_connected": neo4j_client.is_connected
    }

# WebSocket Live Stream Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

# Hook simulation manager events to WebSocket broadcast
async def on_sim_event(event: dict):
    await ws_manager.broadcast(event)

simulation_manager.register_listener(on_sim_event)

@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive & handle incoming client messages
            data = await websocket.receive_text()
            if data == "STEP" or simulation_manager.is_running:
                event = await simulation_manager.step_simulation()
                await websocket.send_json(event)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
