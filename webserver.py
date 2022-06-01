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
CACHE = {}


async def get_new_ics(gid):
    async with aiohttp.ClientSession(base_url="https://dec.mgutm.ru/", raise_for_status=True) as session:
        async with session.get("/api/Rasp", params={"idGroup": gid}) as resp:
            tt = (await resp.json())["data"]
    CACHE[gid] = {"tt": dec_reader.generate_ical(tt), "when": datetime.now()}


@app.get("/group/{gid}.ics", response_class=Response(media_type="text/calendar"))
async def get_group_ics(gid: int):
    if gid not in CACHE or datetime.now() - CACHE[gid]["when"] > timedelta(days=1):
        logger.info("Timetable for %s is outdated. Updating.", gid)
        try:
            await get_new_ics(gid)
        except aiohttp.ClientError as e:
            logger.error("Failed to get new timetable for %s",
                         gid, exc_info=True)
            if gid not in CACHE:
                raise HTTPException(
                    503, "Шарага не отвечает")
    else:
        logger.info("Timetable for %s is fresh enough", gid)
    return Response(CACHE[gid]["tt"], media_type="text/calendar")


@app.get("/groups")
def get_groups():
    return GROUPS


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
    GROUPS = OrderedDict(sorted(tmpgroups.items(), key=lambda x: x[0]))
    logger.info("Started.")
app.mount("/", StaticFiles(directory="static", html=True), name="static")
