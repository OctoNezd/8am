import json
from datetime import datetime, timedelta
import aiohttp
from ics import Attendee, Calendar, Event, Organizer
from ics.parse import ContentLine

LOCATIONS = """
1 	г. Москва, ул. Земляной Вал, д.73
2 	г. Москва, ул. Земляной Вал, д.71
5 	г. Москва, ул.Народного Ополчения, д.38, корп.2
8 	г.Москва, ул.Шаболовка, д.14, стр.9
9 	г.Москва, ул.Талалихина, д.31
10 	г.Москва, пр.3-й Хорошевский, д.1, к.3
11 	г.Москва, ул. Костомаровская набережная, д.29, корп.1
12 	г.Москва, ул. Костомаровская набережная, д.29, корп.2
13 	г. Москва, ул. Земляной Вал, д.71, к.2 (Университетский бассейн)
""".strip().split("\n")
LOCATIONS = {placeId: address for placeId,
             address in [location.split(" \t") for location in LOCATIONS]}

TEAMS_URLS = {}


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
        cal.extra.append(ContentLine(
            name, value=f"Устаревшее расписание (sharaga.octonezd.me)"))
    cal.extra.append(ContentLine("X-PUBLISHED-TTL", value="PT12Y"))
    for date in gen_days(datetime.now().year):
        event = Event(
            name="Неверный ID расписания. Переустановите календарь",
            begin=date,
        )
        cal.events.add(event)
    return str(cal)


INVALID_GROUP = generate_invalid_group_ical()

__version__ = "0.2.2"


async def get_teams_urls():
    global TEAMS_URLS
    async with aiohttp.ClientSession(base_url="https://mgutm.ru/", raise_for_status=True) as session:
        async with session.get("/wp-json/prepods/v1/info") as resp:
            TEAMS_URLS = {link["name"]: link["url"] for link in await resp.json()}


def generate_ical(tt):
    print("downloaded timetable")
    cal = Calendar()
    for name in ["NAME", "X-WR-CALNAME"]:
        cal.extra.append(ContentLine(
            name, value=f"Расписание {tt['info']['group']['name']} (sharaga.octonezd.me)"))
    cal.extra.append(ContentLine("X-PUBLISHED-TTL", value="PT12H"))
    cal.extra.append(ContentLine(
        "URL", value=f"webcal://sharaga.octonezd.me/group/{tt['info']['group']['groupID']}.ics"))
    debug_info = Event(name="Отладочная информация",
                       begin=datetime(1970, 1, 1), end=datetime(1970, 1, 1))
    debug_info.description = f"Сгенерировано: {datetime.now()}\nВерсия генератора: {__version__}\ngid:{tt['info']['group']['groupID']}"
    cal.events.add(debug_info)
    for lesson in tt["rasp"]:
        event = Event(
            name=lesson["дисциплина"],
            begin=datetime.fromisoformat(lesson["датаНачала"] + "+03:00"),
            end=datetime.fromisoformat(lesson["датаОкончания"] + "+03:00"),
            # organizer=Organizer(
            #     email="hell@home.arpa",
            #     common_name=f'{lesson["преподаватель"]}'),
            # attendees=[Attendee(
            #     email="hell@home.arpa",
            #     common_name=f'{lesson["преподаватель"]}')]
        )
        event.description = f'Препод: {lesson["должность"]} {lesson["преподаватель"]}'
        if "-" in lesson["аудитория"]:
            location_id, room = lesson["аудитория"].split("-")
            if location_id in LOCATIONS:
                location = f"{LOCATIONS[location_id]}, каб. {room}"
            else:
                location = f"Хуй знает где, каб. {room}"
        else:
            location = TEAMS_URLS.get(
                lesson["преподаватель"], "Дистанционно, ссылка не найдена.")
            if "Дистанционно" not in location:
                event.extra.append(ContentLine(
                    "X-GOOGLE-CONFERENCE", value=location))
        event.location = location
        cal.events.add(event)
    return str(cal)


if __name__ == "__main__":
    import asyncio
    asyncio.run(get_teams_urls())
    with open("rasp.json", encoding="utf-8") as f:
        tt = json.load(f)["data"]
    ical = generate_ical(tt)
    with open("test.ics", "w", newline='', encoding="utf-8") as f:
        f.write(ical)
    print(LOCATIONS, TEAMS_URLS)
