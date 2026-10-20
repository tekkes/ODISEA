import sqlite3
import json
from pathlib import Path

db_path = Path("dist_portable/Odisea_Win11_Portable/odisea_data/library.odiseadb")
conn = sqlite3.connect(db_path)
c = conn.cursor()

data = {}

c.execute("SELECT * FROM projects")
cols = [d[0] for d in c.description]
data["projects"] = [dict(zip(cols, row)) for row in c.fetchall()]

c.execute("SELECT * FROM groups")
cols = [d[0] for d in c.description]
data["groups"] = [dict(zip(cols, row)) for row in c.fetchall()]

c.execute("SELECT * FROM sheets")
cols = [d[0] for d in c.description]
data["sheets"] = [dict(zip(cols, row)) for row in c.fetchall()]

c.execute("SELECT * FROM keywords")
cols = [d[0] for d in c.description]
data["keywords"] = [dict(zip(cols, row)) for row in c.fetchall()]

c.execute("SELECT * FROM sheet_keywords")
cols = [d[0] for d in c.description]
data["sheet_keywords"] = [dict(zip(cols, row)) for row in c.fetchall()]

conn.close()

out_path = Path("04.temporales.capitulos/seed_data.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Exported seed data successfully to {out_path}")
print(f"Projects: {len(data['projects'])}")
print(f"Groups: {len(data['groups'])}")
print(f"Sheets: {len(data['sheets'])}")
print(f"Keywords: {len(data['keywords'])}")
for s in data["sheets"]:
    print(f"  - {s['title']} ({len(s['content_mdxl'])} chars)")
