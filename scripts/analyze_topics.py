import json

with open('D:/xcode/fgit/cn-primary-taxonomy/data/topics.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

topics = data['topics']
print(f"Total topics: {len(topics)}")

# Count by subject
subjects = {}
for t in topics:
    subj = t.get('subject', 'unknown')
    if subj not in subjects:
        subjects[subj] = {'count': 0, 'grades': set()}
    subjects[subj]['count'] += 1
    subjects[subj]['grades'].add(t.get('grade', 0))

print("\n=== Topics by Subject ===")
for s, info in sorted(subjects.items(), key=lambda x: -x[1]['count']):
    grades = sorted(info['grades'])
    print(f"{s}: {info['count']} topics, grades {grades}")

# Count by grade
grades = {}
for t in topics:
    g = t.get('grade', 0)
    if g not in grades:
        grades[g] = 0
    grades[g] += 1

print("\n=== Topics by Grade ===")
for g in sorted(grades.keys()):
    print(f"Grade {g}: {grades[g]} topics")

# Count by type
types = {}
for t in topics:
    tp = t.get('type', 'unknown')
    if tp not in types:
        types[tp] = 0
    types[tp] += 1

print("\n=== Topics by Type ===")
for tp, cnt in sorted(types.items(), key=lambda x: -x[1]):
    print(f"{tp}: {cnt}")
