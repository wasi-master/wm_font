import re
import json

sfd_path = "./WmFont.sfd"
glyphs = []
with open(sfd_path, "r", encoding="utf-8") as sfd_file:
    sfd_content = sfd_file.read()

char_blocks = re.findall(r"StartChar: (.*?)\n(.*?)\nEndChar", sfd_content, re.DOTALL)
for name, details in char_blocks:
    enc_match = re.search(r"Encoding:\s+(\d+|-?\d+)\s+(-?\d+)\s+(\d+)", details)
    if enc_match:
        unicode_dec = int(enc_match.group(2))
        if unicode_dec >= 0:
            char = chr(unicode_dec)
            hex_str = f"U+{unicode_dec:04X}"
            html_entity = f"&#x{unicode_dec:04X};"
            # Category clasification
            category = "other"
            if 65 <= unicode_dec <= 90:
                category = "uppercase"
            elif 97 <= unicode_dec <= 122:
                category = "lowercase"
            elif 48 <= unicode_dec <= 57:
                category = "number"
            elif unicode_dec in [32, 9, 10, 13]:  # Space, Tab, Newline, Carriage Return
                continue # Skip space character
            elif unicode_dec in [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96, 123, 124, 125, 126]:
                category = "punctuation"
            elif unicode_dec in [163, 165, 8364, 8377, 2547]: # £, ¥, €, ₹, ৳
                category = "currency"
            elif unicode_dec in [169, 174, 8482]: # ©, ®, ™
                category = "special"
            elif (913 <= unicode_dec <= 937) or (945 <= unicode_dec <= 969) or unicode_dec in [8710, 8721, 8800, 177, 215, 247, 8804, 8805]: # Greek letters and math operators
                category = "math-greek"
            elif unicode_dec in [8531, 188, 189, 190, 8532, 8539, 8540, 8541, 8542, 47, 8528, 8529, 8530, 8533, 8534, 8535, 8536, 8537, 8538]: # fractions
                category = "fraction"
            elif (8304 <= unicode_dec <= 8335) or unicode_dec in [178, 179, 185] or (8352 <= unicode_dec <= 8383): # sub/superscripts
                category = "script"
            elif (unicode_dec in [8450, 8469, 8473, 8474, 8477, 8484]) or (120120 <= unicode_dec <= 120170): # Blackboard Bold
                category = "blackboard"
            glyphs.append({
                "char": char,
                "unicode": hex_str,
                "html": html_entity,
                "name": name,
                "category": category
            })
print(json.dumps(glyphs, ensure_ascii=False, indent=4))