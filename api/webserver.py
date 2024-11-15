from ics import Calendar, Event
from ics.grammar.parse import ContentLine
import os
import aiohttp
from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from traceback import print_exc
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
import logging
from . import dec_reader, debug_source, classes
from urllib.parse import urlparse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    console_handler = logging.StreamHandler()
    console_formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)-5.5s: %(message)s", "%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    logger.setLevel(logging.DEBUG)
    for source in SOURCES.values():
        await source.init()
    logger.info("Started.")
    yield


app = FastAPI(lifespan=lifespan)
GROUPS = {}
TEACHERS = {}
GROUP_IDS = {}
TEACHER_IDS = {}
DEVGROUPS = {}
CACHE = {}
SOURCES = {"mgutm": dec_reader.MgutmParser(), "debug": debug_source.DebugSource()}
SOURCES_DESC = {"mgutm": "МГУТУ им. К.Г. Разумовского", "debug": "Отладка"}
origins = [
    "http://8am.octonezd.me",
    "https://8am.octonezd.me",
    "http://localhost:5173",
    "http://localhost",
    "capacitor://localhost",
    "http://*.8am.pages.dev",
    "https://*.8am.pages.dev",
    "https://8am.pages.dev",
    "http://8am.pages.dev",
]
origins = origins if not os.environ.get("DEBUG", False) else ["*"]
print("CORS", origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.environ.get("ANALYTICS_API_KEY", False):
    from api_analytics.fastapi import Analytics

    app.add_middleware(Analytics, api_key=os.environ["ANALYTICS_API_KEY"])


def init_sentry():
    sentry_dsn = os.environ.get("SENTRY_DSN", False)
    if sentry_dsn:
        logger.info("Initializing sentry")
        import sentry_sdk

        sentry_sdk.init(
            dsn=sentry_dsn,  # type: ignore
            # Set traces_sample_rate to 1.0 to capture 100%
            # of transactions for performance monitoring.
            # We recommend adjusting this value in production.
            traces_sample_rate=1.0,
            # Set profiles_sample_rate to 1.0 to profile 100%
            # of sampled transactions.
            # We recommend adjusting this value in production.
            profiles_sample_rate=1.0,
        )
    else:
        logger.error("Sentry DSN is not set.")
    return


init_sentry()


@app.get("/sentry-debug")
async def trigger_error():
    division_by_zero = 1 / 0


def get_redis():
    redis_url = os.environ.get("REDIS_URL", os.environ.get("REDIS", None))
    if redis_url is not None:
        import redis.asyncio as aioredis

        if "vercel-storage" in redis_url:
            redis_url = redis_url.replace("redis://", "rediss://")
        redis = aioredis.from_url(redis_url, decode_responses=True)
    else:
        from fakeredis import aioredis

        logger.critical("ERROR: Redis is not available, using fakeredis")
        redis = aioredis.FakeRedis(decode_responses=True)
    return redis


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
            ContentLine(name, value=f"Устаревшее расписание (8am.octonezd.me)")
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


@app.exception_handler(500)
async def internal_exception_handler(request: Request, exc: Exception):
    logger.error("Error!", exc_info=True)
    print_exc()
    return JSONResponse(
        status_code=500,
        content=jsonable_encoder({"code": 500, "msg": "Internal Server Error"}),
    )


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
    group_cache_id = f"group:{source_name}/{gid}"
    redis = get_redis()
    cached = await redis.hgetall(group_cache_id)
    if (
        cached == {}
        or datetime.now() - datetime.fromisoformat(cached["when"]) > timedelta(hours=1)
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
                raise HTTPException(503, "Универ не отвечает")
            else:
                tt = cached["tt"]
    else:
        tt = cached["tt"]
        logger.info("Timetable for %s is fresh enough", gid)
    return Response(tt, media_type="text/calendar")


@app.get("/groups")
async def get_groups(search_string="", source="mgutm"):
    if source in SOURCES:
        return await SOURCES[source].get_groups(search_string)
    raise HTTPException(404, "No source found")


@app.get("/teachers")
async def get_teachers(search_string="", source="mgutm"):
    if source in SOURCES:
        return await SOURCES[source].get_teachers(search_string)
    raise HTTPException(404, "No source found")


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


if os.path.exists("web/dist"):
    app.mount("/", StaticFiles(directory="web/dist", html=True), name="web")
else:
    logger.error("Web dist is not available. Please check your configuration.")
