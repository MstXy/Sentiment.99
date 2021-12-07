import json

with open('data/cm_99.json', encoding="utf-8") as f:
    data = json.load(f)

newData = []


# filter out short
# for d in data:
#     if len(d["input"]) < 400 and d["input"][:4] != "AITA":
#         newData.append(d)
# #<400
#
# with open('cm_99_short.json', 'w') as outfile:
#     json.dump(newData, outfile)

# filter out medium (short AITA)
# for d in data:
#     if len(d["input"]) < 750 and len(d["input"])>300:
#         newData.append(d)
# #300-750
#
# with open('cm_99_med.json', 'w') as outfile:
#     json.dump(newData, outfile)


# filter out long (long AITA)
for d in data:
    if len(d["input"]) > 1000 and len(d["input"]) < 2000:
        newData.append(d)
#300-750

with open('data/cm_99_long.json', 'w') as outfile:
    json.dump(newData, outfile)
