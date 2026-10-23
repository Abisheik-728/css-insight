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
    parse_time_ms: float
) -> AnalysisResponse:
    """
    Computes accurate, non-fabricated metrics and statistics from parsed CSS objects.
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

    # 6. Metadata summary
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
        top_properties=top_properties
    )
