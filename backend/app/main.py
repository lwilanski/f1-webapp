from fastapi import FastAPI
from app.routes import drivers, teams, race, qualy, bets
from app.services.f1_api import fetch_and_store_initial_data

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await fetch_and_store_initial_data()

app.include_router(drivers.router)
app.include_router(teams.router)
app.include_router(race.router)
app.include_router(qualy.router)
app.include_router(bets.router)
