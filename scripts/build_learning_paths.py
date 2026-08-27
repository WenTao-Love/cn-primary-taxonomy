#!/usr/bin/env python3
"""
Build learning paths by subject (Math, Chinese, English) for grades 1-6.
Organizes topics by grade, term, and domain with prerequisite relationships.
"""

import json
import os

data_dir = 'D:/xcode/fgit/cn-primary-taxonomy/data'

# Load all topic files
all_topics = []
topic_files = [f for f in os.listdir(data_dir) if f.startswith('topics-') and f.endswith('.json')]
for f in topic_files:
    with open(os.path.join(data_dir, f), 'r', encoding='utf-8') as fp:
        data = json.load(fp)
        if 'topics' in data:
            all_topics.extend(data['topics'])

print(f'Total topics loaded: {len(all_topics)}')

# Load dependencies
with open(os.path.join(data_dir, 'dependencies.json'), 'r', encoding='utf-8') as fp:
    deps_data = json.load(fp)
deps = deps_data.get('dependencies', [])

# Build prerequisite map: topicId -> list of prerequisiteIds
prereq_map = {}
for d in deps:
    tid = d['topicId']
    pid = d['prerequisiteId']
    if tid not in prereq_map:
        prereq_map[tid] = []
    prereq_map[tid].append({
        'id': pid,
        'strength': d.get('strength', 'soft'),
        'reason': d.get('reason', '')
    })

# Focus on main subjects
main_subjects = ['数学', '语文', '英语']
learning_paths = {}

for subject in main_subjects:
    subj_topics = [t for t in all_topics if t.get('subject') == subject]
    
    # Group by grade and term
    grade_map = {}
    for t in subj_topics:
        grade = t.get('grade', 0)
        term = t.get('term', '上')
        key = (grade, term)
        if key not in grade_map:
            grade_map[key] = []
        grade_map[key].append(t)
    
    # Build subject path
    subject_path = {
        'subject': subject,
        'totalTopics': len(subj_topics),
        'grades': []
    }
    
    for grade in range(1, 7):
        for term in ['上', '下']:
            key = (grade, term)
            if key not in grade_map:
                continue
            
            topics = grade_map[key]
            
            # Group by domain
            domain_map = {}
            for t in topics:
                domain = t.get('domain', '其他')
                if domain not in domain_map:
                    domain_map[domain] = []
                domain_map[domain].append(t)
            
            grade_info = {
                'grade': grade,
                'term': term,
                'topicCount': len(topics),
                'domains': []
            }
            
            for domain, dtopics in sorted(domain_map.items()):
                domain_info = {
                    'domain': domain,
                    'topicCount': len(dtopics),
                    'topics': []
                }
                
                for t in sorted(dtopics, key=lambda x: x.get('id', '')):
                    topic_info = {
                        'id': t.get('id', ''),
                        'name': t.get('name', ''),
                        'type': t.get('typeLabel', ''),
                        'difficulty': t.get('difficulty', 0),
                        'description': t.get('description', ''),
                        'prerequisites': prereq_map.get(t.get('id', ''), [])
                    }
                    domain_info['topics'].append(topic_info)
                
                grade_info['domains'].append(domain_info)
            
            subject_path['grades'].append(grade_info)
    
    learning_paths[subject] = subject_path

# Save
output = {
    'version': 'v1.0-learning-paths',
    'generatedAt': '2026-08-27T00:00:00Z',
    'description': '小学教育知识图谱学习路径：数学、语文、英语三大学科，1-6年级完整知识体系',
    'totalTopics': sum(len([t for t in all_topics if t.get('subject') == s]) for s in main_subjects),
    'subjects': learning_paths
}

with open(os.path.join(data_dir, 'learning-paths.json'), 'w', encoding='utf-8') as fp:
    json.dump(output, fp, ensure_ascii=False, indent=2)

print(f'Learning paths created!')
print(f'Total topics: {output["totalTopics"]}')
for s, p in learning_paths.items():
    print(f'{s}: {p["totalTopics"]} topics, {len(p["grades"])} grade-terms')
    for g in p['grades']:
        domains_str = ', '.join([f'{d["domain"]}({d["topicCount"]})' for d in g['domains']])
        print(f'  G{g["grade"]}{g["term"]}: {g["topicCount"]} topics - {domains_str}')
