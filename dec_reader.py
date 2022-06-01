from datetime import datetime
from ics import Calendar, Event, Organizer, Attendee
import json

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


def generate_ical(tt):
    print("downloaded timetable")
    cal = Calendar()
    for lesson in tt["rasp"]:
        event = Event(
            name=lesson["дисциплина"],
            begin=datetime.fromisoformat(lesson["датаНачала"] + "+03:00"),
            end=datetime.fromisoformat(lesson["датаОкончания"] + "+03:00"),
            organizer=Organizer(
                email="hell@home.arpa",
                common_name=f'{lesson["преподаватель"]}'),
            attendees=[Attendee(
                email="hell@home.arpa",
                common_name=f'{lesson["преподаватель"]}')]
        )
        event.description = f'Препод: {lesson["должность"]} {lesson["преподаватель"]}'
        if "-" in lesson["аудитория"]:
            location_id, room = lesson["аудитория"].split("-")
            if location_id in LOCATIONS:
                location = f"{LOCATIONS[location_id]}, каб. {room}"
            else:
                location = f"Хуй знает где, каб. {room}"
        else:
            location = "Дистанционно"
        event.location = location
        cal.events.add(event)
    return str(cal)


if __name__ == "__main__":
    import asyncio
    with open("rasp.json", encoding="utf-8") as f:
        tt = json.load(f)["data"]
    ical = asyncio.run(generate_ical(tt))
    with open("test.ics", "w", newline='', encoding="utf-8") as f:
        f.write(ical)
    print(LOCATIONS)
