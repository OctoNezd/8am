from ics import Calendar, Event
from ics.grammar.parse import ContentLine
import os
import aiohttp
from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
import logging
from . import dec_reader, debug_source, classes
from urllib.parse import urlparse
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger("main")
app = FastAPI()
GROUPS = {}
TEACHERS = {}
GROUP_IDS = {}
TEACHER_IDS = {}
DEVGROUPS = {}
CACHE = {}
SOURCES = {"mgutm": dec_reader.MgutmParser(), "debug": debug_source.DebugSource()}
SOURCES_DESC = {"mgutm": "МГУТУ им. К.Г. Разумовского", "debug": "Отладка"}
origins = [
    "http://sharaga.octonezd.me",
    "https://sharaga.octonezd.me",
    "http://localhost:5173",
    "http://localhost",
    "capacitor://localhost",
    "http://*.sharaga.pages.dev",
    "https://*.sharaga.pages.dev",
    "https://sharaga.pages.dev",
    "http://sharaga.pages.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_url = os.environ.get("REDIS_URL", os.environ.get("REDIS", None))
if redis_url is not None:
    import redis.asyncio as aioredis

    redis = aioredis.from_url(redis_url, decode_responses=True)
    DEVMODE = False
else:
    from fakeredis import aioredis

    DEVMODE = True
    logger.critical("ERROR: Redis is not available, using fakeredis")
    redis = aioredis.FakeRedis(decode_responses=True)


@app.get("/group/{gid}.ics", response_class=Response(media_type="text/calendar"))
def get_group_ics_legacy(gid):
    return RedirectResponse(f"/group/mgutm/{gid}.ics", status_code=308)


def gen_days(year):
    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31)
    d = start_date
    dates = [start_date]
    while d < end_date:
        d += timedelta(days=1)
        dates.append(d)
    return dates


def generate_invalid_group_ical():
    cal = Calendar()
    for name in ["NAME", "X-WR-CALNAME"]:
        cal.extra.append(
            ContentLine(name, value=f"Устаревшее расписание (sharaga.octonezd.me)")
        )
    cal.extra.append(ContentLine("X-PUBLISHED-TTL", value="PT12Y"))
    for date in gen_days(datetime.now().year):
        event = Event(
            name="Неверный ID расписания. Переустановите календарь",
            begin=date,
        )
        cal.events.add(event)
    return str(cal)


INVALID_GROUP = generate_invalid_group_ical()


@app.get(
    "/{ics_type}/{source_name}/{gid}.ics",
    response_class=Response(media_type="text/calendar"),
)
async def get_ics(ics_type: str, source_name: str, gid: int):
    if ics_type not in ("group", "teacher"):
        return Response(INVALID_GROUP, media_type="text/calendar")
    if source_name not in SOURCES:
        return Response(INVALID_GROUP, media_type="text/calendar")
    source: classes.TimetableSource = SOURCES[source_name]
    if str(gid) not in GROUP_IDS[source_name]:
        return Response(INVALID_GROUP, media_type="text/calendar")
    group_cache_id = f"group:{source_name}/{gid}"
    cached = await redis.hgetall(group_cache_id)
    if (
        cached == {}
        or datetime.now() - datetime.fromisoformat(cached["when"]) > timedelta(days=1)
        or cached.get("ver", "0") != source.__version__
    ):
        logger.info("Timetable for %s is outdated. Updating.", gid)
        try:
            tt = await source.get_new_ics(ics_type, gid)
            await redis.hset(group_cache_id, "tt", tt)
            await redis.hset(group_cache_id, "when", datetime.now().isoformat())
            await redis.hset(group_cache_id, "ver", source.__version__)
            logger.info("Updated timetable for %s.", group_cache_id)
        except aiohttp.ClientError as e:
            logger.error(
                "Failed to get new timetable for %s, type: %s",
                gid,
                ics_type,
                exc_info=True,
            )
            if cached == {}:
                raise HTTPException(503, "Шарага не отвечает")
    else:
        tt = cached["tt"]
        logger.info("Timetable for %s is fresh enough", gid)
    return Response(tt, media_type="text/calendar")


@app.get("/groups")
async def get_groups():
    if len(GROUPS) == 0:
        await populate_stores()
    return GROUPS


@app.get("/teachers")
async def get_teachers():
    if len(TEACHERS) == 0:
        await populate_stores()
    return TEACHERS


@app.get("/sources")
def get_sources():
    return SOURCES_DESC


@app.middleware("http")
async def add_my_headers(request: Request, call_next):
    response = await call_next(request)
    if ".ics" in str(request.url):
        response.headers["Cache-Control"] = "max-age=43200, stale-if-error=43200"
    if response.status_code in range(200, 400) and urlparse(
        str(request.url)
    ).path.endswith(".js"):
        response.media_type = "text/javascript"
        response.headers["Content-Type"] = "application/javascript"
        logger.info("set text/javascript for %s", request.url)
    return response

async def populate_stores():
    global GROUPS, TEACHERS
    GROUPS = {}
    TEACHERS = {}
    for source_name, source in SOURCES.items():
        logger.info("Downloading group list for %s...", source_name)
        GROUPS[source_name] = await source.get_groups()
        TEACHERS[source_name] = await source.get_teachers()
        GROUP_IDS[source_name] = []
        TEACHER_IDS[source_name] = []
        for group in GROUPS[source_name].values():
            GROUP_IDS[source_name].append(str(group))
        for teacher in TEACHERS[source_name].values():
            GROUP_IDS[source_name].append(str(teacher))
        logger.info("%s: %s groups", source_name, len(GROUPS[source_name]))

@app.on_event("startup")
async def startup():
    console_handler = logging.StreamHandler()
    console_formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)-5.5s: %(message)s", "%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    logger.setLevel(logging.DEBUG)
    await populate_stores()
    logger.info("Downloading MSTeams URLs...")
    await dec_reader.get_teams_urls()
    logger.info("Started.")
