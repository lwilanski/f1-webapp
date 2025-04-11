from motor.motor_asyncio import AsyncIOMotorClient
from os import getenv

client = AsyncIOMotorClient("mongodb://mongo:27017")
db = client.f1db