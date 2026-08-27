import json

# Read the file
with open('D:/xcode/fgit/cn-primary-taxonomy/data/topics-enhanced-fields-extra.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Try to find and fix common JSON issues
# The file has entries that are not properly separated by commas in some places
# Let's try to parse it more leniently

import re

# Fix the issue where entries are not separated by commas
# Look for patterns like "}{" and replace with "},{"
content = re.sub(r'\}\s*\{', '},\n    {', content)

# Fix missing options key in quizQuestions
content = re.sub(r'"type": "choice",\s*\[', '"type": "choice",\n      "options": [', content)

# Make sure the file ends with }]
if not content.rstrip().endswith('}]'):
    # Find the last closing bracket
    last_bracket = content.rfind('}')
    if last_bracket != -1:
        # Check if we need to add ]
        remaining = content[last_bracket+1:].strip()
        if remaining and remaining != ']':
            content = content[:last_bracket+1] + '\n  ]\n}'

# Write the fixed content
with open('D:/xcode/fgit/cn-primary-taxonomy/data/topics-enhanced-fields-extra.json', 'w', encoding='utf-8') as f:
    f.write(content)

print("JSON file fixed!")
