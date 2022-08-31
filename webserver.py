import os
import aioredis
from typing import OrderedDict
import aiohttp
from fastapi import FastAPI, HTTPException, Response
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timedelta
import logging
import dec_reader
logger = logging.getLogger("main")
app = FastAPI()
GROUPS = {}
GROUPS_INV = {}

CACHE = {}
redis = aioredis.from_url(os.environ.get(
    "REDIS", "redis://localhost:6379/0"), decode_responses=True)


async def get_new_ics(gid):
    async with aiohttp.ClientSession(base_url="https://dec.mgutm.ru/", raise_for_status=True) as session:
        async with session.get("/api/Rasp", params={"idGroup": gid}) as resp:
            tt = (await resp.json())["data"]
    tt = dec_reader.generate_ical(tt)
    await redis.hset(f"group:{gid}", "tt", tt)
    await redis.hset(f"group:{gid}", "when", datetime.now().isoformat())
    await redis.hset(f"group:{gid}", "ver", dec_reader.__version__)
    return tt


@app.get("/group/{gid}.ics", response_class=Response(media_type="text/calendar"))
async def get_group_ics(gid: int):
    if str(gid) not in GROUPS_INV:
        return Response(dec_reader.INVALID_GROUP, media_type="text/calendar")
    cached = await redis.hgetall(f"group:{gid}")
    if cached == {} or datetime.now() - datetime.fromisoformat(cached["when"]) > timedelta(days=1) or cached.get("ver", "0.1") != dec_reader.__version__:
        logger.info("Timetable for %s is outdated. Updating.", gid)
        try:
            tt = await get_new_ics(gid)
            logger.info("Updated timetable for %s.", gid)
        except aiohttp.ClientError as e:
            logger.error("Failed to get new timetable for %s",
                         gid, exc_info=True)
            if cached == {}:
                raise HTTPException(
                    503, "Шарага не отвечает")
    else:
        tt = cached["tt"]
        logger.info("Timetable for %s is fresh enough", gid)
    await redis.hincrby("stats", gid)
    return Response(tt, media_type="text/calendar")


@app.get("/groups")
def get_groups():
    return GROUPS


@app.get("/stats")
async def get_stats():
    a = {}
    for key, value in list((await redis.hgetall("stats")).items())[:10]:
        a[GROUPS_INV.get(key, key)] = value
    return {"groups": {k: v for k, v in sorted(a.items(), key=lambda item: int(item[1]), reverse=True)}, "system": {"parser_ver": dec_reader.__version__}}


@app.on_event("startup")
async def startup():
    global GROUPS
    console_handler = logging.StreamHandler()
    console_formatter = logging.Formatter("[%(asctime)s] %(levelname)-5.5s: %(message)s",
                                          "%Y-%m-%d %H:%M:%S")
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    logger.setLevel(logging.DEBUG)
    logger.info("Downloading group list...")
    tmpgroups = {}
    async with aiohttp.ClientSession(base_url="https://dec.mgutm.ru/", raise_for_status=True) as session:
        async with session.get("/api/Groups") as resp:
            groupdata = await resp.json()
            for group in groupdata["data"]["groups"]:
                tmpgroups[group["groupName"]] = str(group["groupID"])
                GROUPS_INV[str(group["groupID"])] = group["groupName"]
    GROUPS = OrderedDict(sorted(tmpgroups.items(), key=lambda x: x[0]))
    logger.info("Downloading MSTeams URLs...")
    await dec_reader.get_teams_urls()
    logger.info("Started.")
app.mount("/", StaticFiles(directory="static", html=True), name="static")
