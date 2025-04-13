import httpx
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from app.services.db import db

async def fetch_from_api(url: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return JSONResponse(content=response.json())
    except httpx.HTTPStatusError as e:
        return JSONResponse(content={"error": f"API error: {e.response.status_code}"}, status_code=e.response.status_code)
    except httpx.RequestError as e:
        return JSONResponse(content={"error": f"Request failed: {str(e)}"}, status_code=500)
    except Exception as e:
        return JSONResponse(content={"error": f"Unexpected error: {str(e)}"}, status_code=500)

async def fetch_and_store_drivers():
    url = "https://f1api.dev/api/current/drivers"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        drivers = response.json().get("drivers", [])

        parsed = [
            {
                "_id": d["driverId"],
                "teamId": d["teamId"],
                "name": d["name"],
                "surname": d["surname"],
                "nationality": d["nationality"],
                "number": d["number"],
            }
            for d in drivers
        ]

        await db["drivers"].delete_many({})
        await db["drivers"].insert_many(parsed)


async def fetch_and_store_teams():
    url = "https://f1api.dev/api/current/teams"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        teams = response.json().get("teams", [])

        parsed = [
            {
                "_id": t["teamId"],
                "teamName": t["teamName"],
                "teamNationality": t["teamNationality"],
                "firstAppeareance": t["firstAppeareance"],
                "constructorsChampionships": t["constructorsChampionships"],
                "driversChampionships": t["driversChampionships"],
            }
            for t in teams
        ]

        await db["teams"].delete_many({})
        await db["teams"].insert_many(parsed)

async def fetch_and_store_latest_qualy():
    url = "https://f1api.dev/api/current/last/qualy"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError as e:
            print(f"Failed to fetch qualy data: {e}")
            return

    race = data["races"]
    qualy_results = race["qualyResults"]

    meta = {
        "_id": "latest",
        "date": race["qualyDate"],
        "raceName": race["raceName"],
        "circuitName": race["circuit"]["circuitName"],
        "city": race["circuit"]["city"]
    }
    await db["latest_qualy_info"].delete_many({})
    await db["latest_qualy_info"].insert_one(meta)

    parsed = [
        {
            "_id": r["classificationId"],
            "driverId": r["driverId"],
            "teamId": r["teamId"],
            "q1": r.get("q1"),
            "q2": r.get("q2"),
            "q3": r.get("q3"),
            "grid_position": r["gridPosition"],
        }
        for r in qualy_results
    ]

    await db["latest_qualy"].delete_many({})
    await db["latest_qualy"].insert_many(parsed)

async def fetch_and_store_latest_race():
    url = "https://f1api.dev/api/current/last/race"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code == 404:
                return
            response.raise_for_status()
            data = response.json()
        except (httpx.HTTPStatusError, httpx.RequestError):
            return

    race_data = data["races"]
    race_results = race_data["results"]

    meta = {
        "_id": "latest",
        "raceName": race_data["raceName"],
        "date": race_data["date"],
        "circuitName": race_data["circuit"]["circuitName"],
        "city": race_data["circuit"]["city"]
    }
    await db["latest_race_info"].delete_many({})
    await db["latest_race_info"].insert_one(meta)    

    parsed_results = [
        {
            "_id": r["position"],
            "driverId": r["driver"]["driverId"],
            "teamId": r["team"]["teamId"],
            "grid": r["grid"],
            "time": r["time"],
            "points": r["points"],
            "fastLap": r.get("fastLap"),
        }
        for r in race_results
    ]

    await db["latest_race"].delete_many({})
    await db["latest_race"].insert_many(parsed_results)

async def fetch_and_store_next_race():
    url = "https://f1api.dev/api/current/next"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()

    race_data = data["race"][0]

    parsed_data = {
        "_id": race_data["raceId"],
        "raceName": race_data["raceName"],
        "date": race_data["schedule"]["race"]["date"],
        "time": race_data["schedule"]["race"]["time"][:-1],
        "circuitName": race_data["circuit"]["circuitName"],
        "circuitLocation": race_data["circuit"]["country"] + ", " + race_data["circuit"]["city"]
        }

    await db["next_race"].delete_many({})
    await db["next_race"].insert_one(parsed_data)

async def fetch_and_store_initial_data():
    await fetch_and_store_drivers()
    await fetch_and_store_teams()
    await fetch_and_store_latest_qualy()
    await fetch_and_store_latest_race()
    await fetch_and_store_next_race()
