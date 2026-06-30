import re
import json

sfd_path = "/Users/wasimaster/Work/wm_font/WmFont.sfd"
output_path = "/Users/wasimaster/Work/wm_font/website/glyphs.js"

glyphs = []

# Map glyph names to readable names if possible, otherwise construct a nice label
friendly_names = {
    "exclam": "Exclamation Mark",
    "quotedbl": "Quotation Mark",
    "numbersign": "Number Sign",
    "dollar": "Dollar Sign",
    "percent": "Percent Sign",
    "ampersand": "Ampersand",
    "quotesingle": "Apostrophe / Single Quote",
    "parenleft": "Left Parenthesis",
    "parenright": "Right Parenthesis",
    "asterisk": "Asterisk",
    "plus": "Plus Sign",
    "comma": "Comma",
    "hyphen": "Hyphen / Minus",
    "period": "Period",
    "slash": "Slash",
    "colon": "Colon",
    "semicolon": "Semicolon",
    "less": "Less-Than Sign",
    "equal": "Equal Sign",
    "greater": "Greater-Than Sign",
    "question": "Question Mark",
    "at": "At Sign",
    "bracketleft": "Left Square Bracket",
    "bracketright": "Right Square Bracket",
    "asciicircum": "Caret / Circumflex",
    "underscore": "Underscore",
    "grave": "Grave Accent",
    "braceleft": "Left Curly Brace",
    "bar": "Vertical Bar",
    "braceright": "Right Curly Brace",
    "asciitilde": "Tilde",
    "backslash": "Backslash",
    "sterling": "Pound Sign",
    "cent": "Cent Sign",
    "yen": "Yen Sign",
    "Euro": "Euro Sign",
    "uni20b9": "Indian Rupee Sign",
    "uni09f3": "Bengali Rupee / Taka Sign",
    "section": "Section Sign",
    "degree": "Degree Sign",
    "paragraph": "Pilcrow / Paragraph Sign",
    "copyright": "Copyright Sign",
    "registered": "Registered Trademark",
    "trademark": "Trademark Sign",
    "ellipsis": "Ellipsis",
    "quoteleft": "Left Single Quote",
    "quoteright": "Right Single Quote",
    "quotedblleft": "Left Double Quote",
    "quotedblright": "Right Double Quote",
    "endash": "En Dash",
    "emdash": "Em Dash",
    "notequal": "Not Equal To",
    "plusminus": "Plus-Minus Sign",
    "multiply": "Multiplication Sign",
    "divide": "Division Sign",
    "lessequal": "Less-Than or Equal To",
    "greaterequal": "Greater-Than or Equal To",
    "summation": "N-Ary Summation",
    "Omega": "Greek Capital Letter Omega",
    "rho": "Greek Small Letter Rho",
    "tau": "Greek Small Letter Tau",
    "omega": "Greek Small Letter Omega",
    "uni03BC": "Greek Small Letter Mu",
    "lambda": "Greek Small Letter Lambda",
    "eta": "Greek Small Letter Eta",
    "phi": "Greek Small Letter Phi",
    "sigma": "Greek Small Letter Sigma",
    "pi": "Greek Small Letter Pi",
    "gamma": "Greek Small Letter Gamma",
    "alpha": "Greek Small Letter Alpha",
    "beta": "Greek Small Letter Beta",
    "Theta": "Greek Capital Letter Theta",
    "Sigma": "Greek Capital Letter Sigma",
    "Phi": "Greek Capital Letter Phi",
    "epsilon": "Greek Capital Letter Epsilon",
    "theta": "Greek Small Letter Theta",
    "uni0394": "Greek Capital Letter Delta",
    "uni2206": "Increment / Delta Symbol",
    "bullet": "Bullet",
    "arrowleft": "Left Arrow",
    "arrowup": "Up Arrow",
    "arrowright": "Right Arrow",
    "arrowdown": "Down Arrow",
    "arrowboth": "Left Right Arrow",
    "carriagereturn": "Carriage Return",
    "arrowdblleft": "Double Left Arrow",
    "arrowdblup": "Double Up Arrow",
    "arrowdblright": "Double Right Arrow",
    "arrowdbldown": "Double Down Arrow",
    "arrowdblboth": "Double Left Right Arrow",
    "partialdiff": "Partial Differential",
    "gradient": "Gradient",
    "infinity": "Infinity",
    "integral": "Integral",
    "equivalence": "Equivalent To",
    "onethird": "Fraction One Third",
    "onequarter": "Fraction One Quarter",
    "onehalf": "Fraction One Half",
    "threequarters": "Fraction Three Quarters",
    "twothirds": "Fraction Two Thirds",
    "oneeighth": "Fraction One Eighth",
    "threeeighths": "Fraction Three Eighths",
    "fiveeighths": "Fraction Five Eighths",
    "seveneighths": "Fraction Seven Eighths",
    "fraction": "Fraction Slash",
    "uni2102": "Double-Struck Capital C",
    "uni2115": "Double-Struck Capital N",
    "uni2119": "Double-Struck Capital P",
    "uni211a": "Double-Struck Capital Q",
    "uni211d": "Double-Struck Capital R",
    "uni2124": "Double-Struck Capital Z",
    "uni1d538": "Double-Struck Capital A",
    "uni1d540": "Double-Struck Capital I",
    "uni1d54e": "Double-Struck Capital W"
}

with open(sfd_path, "r", encoding="utf-8") as f:
    content = f.read()

char_blocks = re.findall(r"StartChar: (.*?)\n(.*?)\nEndChar", content, re.DOTALL)

for name, details in char_blocks:
    enc_match = re.search(r"Encoding:\s+(\d+|-?\d+)\s+(-?\d+)\s+(\d+)", details)
    if enc_match:
        unicode_dec = int(enc_match.group(2))
        if unicode_dec > 0:
            char = chr(unicode_dec)
            hex_str = f"U+{unicode_dec:04X}"
            html_entity = f"&#x{unicode_dec:04X};"
            
            # Simple category classification
            category = "other"
            if 65 <= unicode_dec <= 90:
                category = "uppercase"
                label = f"Latin Capital Letter {char}"
            elif 97 <= unicode_dec <= 122:
                category = "lowercase"
                label = f"Latin Small Letter {char}"
            elif 48 <= unicode_dec <= 57:
                category = "number"
                label = f"Digit {char}"
            elif unicode_dec in [32]:
                continue # Skip space
            elif unicode_dec in [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96, 123, 124, 125, 126]:
                category = "punctuation"
                label = friendly_names.get(name, f"Punctuation {char}")
            elif unicode_dec in [163, 165, 8364, 8377, 2547]: # £, ¥, €, ₹, ৳
                category = "currency"
                label = friendly_names.get(name, f"Currency {char}")
            elif unicode_dec in [169, 174, 8482]: # ©, ®, ™
                category = "special"
                label = friendly_names.get(name, f"Special Character {char}")
            elif (913 <= unicode_dec <= 937) or (945 <= unicode_dec <= 969) or unicode_dec in [8710, 8721, 8800, 177, 215, 247, 8804, 8805, 9394, 8710, 8706, 8711, 8734, 8747, 8801, 8592, 8593, 8594, 8595, 8596, 8633, 8656, 8657, 8658, 8659, 8660, 8901]: # Greek letters and math operators
                category = "math-greek"
                label = friendly_names.get(name, f"Math/Greek {char}")
            elif unicode_dec in [8531, 188, 189, 190, 8532, 8539, 8540, 8541, 8542, 8528, 8529, 8530, 8533, 8534, 8535, 8536, 8537, 8538]: # fractions
                category = "fraction"
                label = friendly_names.get(name, f"Fraction {char}")
            elif (8304 <= unicode_dec <= 8335) or unicode_dec in [178, 179, 185] or (8352 <= unicode_dec <= 8383): # sub/superscripts
                category = "script"
                label = friendly_names.get(name, f"Script Character {char}")
            elif (unicode_dec in [8450, 8469, 8473, 8474, 8477, 8484]) or (120120 <= unicode_dec <= 120170): # Blackboard Bold
                category = "blackboard"
                label = friendly_names.get(name, f"Blackboard Bold {char}")
            else:
                label = friendly_names.get(name, f"Character {char}")
                
            glyphs.append({
                "char": char,
                "unicode": hex_str,
                "html": html_entity,
                "name": label,
                "category": category
            })

with open(output_path, "w", encoding="utf-8") as out:
    out.write("// Automatically generated list of glyphs from WmFont.sfd\n")
    out.write("const GLYPHS_DATA = ")
    json.dump(glyphs, out, indent=2, ensure_ascii=False)
    out.write(";\n")

print(f"Generated {len(glyphs)} glyph definitions in {output_path}")
