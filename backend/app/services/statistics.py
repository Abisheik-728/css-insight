from collections import Counter
from typing import List, Set, Tuple

from ..schemas.models import (
    RuleModel,
    AtRuleModel,
    WarningModel,
    PropertyStat,
    MetadataModel,
    AnalysisResponse,
)
from .color_extractor import extract_colors_from_value


def calculate_css_statistics(
    filename: str,
    file_size_bytes: int,
    rules: List[RuleModel],
    at_rules: List[AtRuleModel],
    warnings: List[WarningModel],
    comments_count: int,
    parse_time_ms: float,
    css_content: str = "",
) -> AnalysisResponse:
    """
    Computes accurate, non-fabricated metrics and statistics from parsed CSS objects.
    Classifies empty stylesheets, valid rule sets, and plain text uploads.
    """
    total_rules = len(rules)

    # 1. Total individual selectors
    total_selectors = sum(len(r.selectors) for r in rules)

    # 2. Total declarations and property frequencies
    property_counter: Counter = Counter()
    detected_colors_set: Set[str] = set()
    total_declarations = 0

    for rule in rules:
        for decl in rule.declarations:
            total_declarations += 1
            property_counter[decl.property] += 1

            # Extract detectable colors from property value
            colors_in_val = extract_colors_from_value(decl.value)
            for c in colors_in_val:
                detected_colors_set.add(c)

    # 3. Unique properties
    unique_properties_list = sorted(list(property_counter.keys()))
    unique_properties_count = len(unique_properties_list)

    # 4. Top property breakdown
    top_properties: List[PropertyStat] = []
    for prop, count in property_counter.most_common(15):
        pct = round((count / total_declarations * 100.0), 1) if total_declarations > 0 else 0.0
        top_properties.append(
            PropertyStat(
                property=prop,
                count=count,
                percentage=pct
            )
        )

    # 5. Detected colors sorted
    sorted_colors = sorted(list(detected_colors_set))

    # 6. Content classification: empty vs. plain-text vs. valid CSS
    if css_content:
        stripped_text = css_content.strip()
        is_whitespace_or_empty = (stripped_text == "")
        is_comment_only = False
        if not is_whitespace_or_empty and total_rules == 0 and len(at_rules) == 0:
            import re
            no_comments = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL).strip()
            if not no_comments and len(warnings) == 0:
                is_comment_only = True
    else:
        is_whitespace_or_empty = (file_size_bytes == 0) or (total_rules == 0 and len(at_rules) == 0 and len(warnings) == 0)
        is_comment_only = False

    if is_whitespace_or_empty or is_comment_only:
        is_empty = True
        has_valid_rules = False
        validation_notice = "Your stylesheet is empty. Add some CSS rules or upload another file."
    elif total_rules == 0 and len(at_rules) == 0:
        is_empty = False
        has_valid_rules = False
        validation_notice = "No valid CSS rules found. Please upload a valid CSS stylesheet."
    else:
        is_empty = False
        has_valid_rules = True
        validation_notice = None

    # 7. Metadata summary
    metadata = MetadataModel(
        filename=filename,
        file_size_bytes=file_size_bytes,
        total_rules=total_rules,
        total_selectors=total_selectors,
        total_declarations=total_declarations,
        unique_properties=unique_properties_count,
        unique_colors=len(sorted_colors),
        total_at_rules=len(at_rules),
        total_comments=comments_count,
        parse_time_ms=parse_time_ms
    )

    return AnalysisResponse(
        metadata=metadata,
        rules=rules,
        at_rules=at_rules,
        detected_colors=sorted_colors,
        warnings=warnings,
        unique_properties_list=unique_properties_list,
        top_properties=top_properties,
        validation_notice=validation_notice,
        is_empty=is_empty,
        has_valid_rules=has_valid_rules
    )
