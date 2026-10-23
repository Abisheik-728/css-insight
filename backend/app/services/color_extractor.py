import re
from typing import Set, List

# Standard CSS Named Colors
CSS_NAMED_COLORS = {
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black",
    "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse",
    "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue",
    "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki",
    "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon",
    "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise",
    "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick",
    "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod",
    "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo",
    "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue",
    "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
    "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray",
    "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta",
    "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
    "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise",
    "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite",
    "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod",
    "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink",
    "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue",
    "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver",
    "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue",
    "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke",
    "yellow", "yellowgreen", "transparent", "currentcolor"
}

# Regex patterns for CSS colors
HEX_COLOR_PATTERN = re.compile(r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b")
RGB_COLOR_PATTERN = re.compile(r"rgba?\s*\([^)]+\)", re.IGNORECASE)
HSL_COLOR_PATTERN = re.compile(r"hsla?\s*\([^)]+\)", re.IGNORECASE)
WORD_TOKEN_PATTERN = re.compile(r"\b[a-zA-Z-]+\b")


def extract_colors_from_value(value: str) -> List[str]:
    """
    Extracts detected CSS colors from a CSS property declaration value.
    Supports hex, rgb/rgba, hsl/hsla, and named CSS color keywords.
    """
    if not value or not isinstance(value, str):
        return []

    colors: List[str] = []

    # 1. Hex matches
    for match in HEX_COLOR_PATTERN.findall(value):
        colors.append(match.lower())

    # 2. RGB/RGBA matches
    for match in RGB_COLOR_PATTERN.findall(value):
        # Normalize whitespace inside function
        normalized = re.sub(r"\s+", " ", match.strip()).lower()
        colors.append(normalized)

    # 3. HSL/HSLA matches
    for match in HSL_COLOR_PATTERN.findall(value):
        normalized = re.sub(r"\s+", " ", match.strip()).lower()
        colors.append(normalized)

    # 4. Named colors (only match standalone tokens, not parts of urls, var(--), calc, etc.)
    # Remove strings inside url(...) or var(...) to prevent false positives
    scrubbed = re.sub(r"url\([^)]*\)", "", value, flags=re.IGNORECASE)
    scrubbed = re.sub(r"var\([^)]*\)", "", scrubbed, flags=re.IGNORECASE)
    scrubbed = HEX_COLOR_PATTERN.sub("", scrubbed)
    scrubbed = RGB_COLOR_PATTERN.sub("", scrubbed)
    scrubbed = HSL_COLOR_PATTERN.sub("", scrubbed)

    for word in WORD_TOKEN_PATTERN.findall(scrubbed):
        w_lower = word.lower()
        if w_lower in CSS_NAMED_COLORS:
            colors.append(w_lower)

    return colors
