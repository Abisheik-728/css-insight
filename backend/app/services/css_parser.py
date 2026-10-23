import time
from typing import List, Tuple, Dict, Any, Optional
import tinycss2
from tinycss2.ast import (
    QualifiedRule,
    AtRule,
    Declaration,
    ParseError,
    Comment,
    WhitespaceToken,
    LiteralToken,
)

from ..schemas.models import (
    RuleModel,
    DeclarationModel,
    AtRuleModel,
    WarningModel,
)


def split_selector_list(prelude_tokens: list) -> List[str]:
    """
    Splits rule prelude tokens by top-level commas to extract individual selectors.
    Because tinycss2 preserves parenthesis/bracket blocks, commas inside
    functions (e.g. :is(h1, h2) or [data-val="a,b"]) are nested and not split.
    """
    selectors: List[str] = []
    current_tokens: list = []

    for token in prelude_tokens:
        if isinstance(token, LiteralToken) and token.value == ",":
            sel = tinycss2.serialize(current_tokens).strip()
            if sel:
                selectors.append(sel)
            current_tokens = []
        else:
            current_tokens.append(token)

    last_sel = tinycss2.serialize(current_tokens).strip()
    if last_sel:
        selectors.append(last_sel)

    return selectors


def parse_declaration_block(
    content_tokens: list,
    selector_name: str,
    rule_line: Optional[int],
    warnings: List[WarningModel]
) -> List[DeclarationModel]:
    """
    Parses tokens inside a rule's block {...} into DeclarationModels.
    Detects duplicate declarations within the same rule and records warnings.
    """
    declarations: List[DeclarationModel] = []
    if not content_tokens:
        return declarations

    raw_items = tinycss2.parse_declaration_list(
        content_tokens,
        skip_comments=True,
        skip_whitespace=True
    )

    seen_properties: Dict[str, int] = {}

    for item in raw_items:
        if isinstance(item, Declaration):
            prop_name = item.name.lower()
            val_str = tinycss2.serialize(item.value).strip()
            decl_line = getattr(item, "source_line", rule_line)
            decl_col = getattr(item, "source_column", None)

            # Check for duplicate declarations in same rule
            if prop_name in seen_properties:
                warnings.append(
                    WarningModel(
                        message=f"Duplicate declaration of property '{prop_name}' in selector '{selector_name}'. Previous declaration at line {seen_properties[prop_name]}.",
                        line=decl_line,
                        column=decl_col,
                        type="duplicate_declaration"
                    )
                )
            else:
                seen_properties[prop_name] = decl_line or 0

            declarations.append(
                DeclarationModel(
                    property=prop_name,
                    value=val_str,
                    important=item.important,
                    line=decl_line,
                    column=decl_col
                )
            )
        elif isinstance(item, ParseError):
            warnings.append(
                WarningModel(
                    message=f"CSS syntax error in declaration for '{selector_name}': {item.message}",
                    line=getattr(item, "source_line", rule_line),
                    column=getattr(item, "source_column", None),
                    type="parse_error"
                )
            )

    return declarations


def parse_css_stylesheet(
    css_content: str,
    filename: str = "stylesheet.css"
) -> Tuple[List[RuleModel], List[AtRuleModel], List[WarningModel], int, float]:
    """
    Parses a CSS string using tinycss2.
    Returns:
      (rules, at_rules, warnings, comments_count, parse_time_ms)
    """
    start_time = time.perf_counter()

    rules: List[RuleModel] = []
    at_rules: List[AtRuleModel] = []
    warnings: List[WarningModel] = []
    comments_count = 0

    # 1. Parse top-level stylesheet nodes
    try:
        top_level_nodes = tinycss2.parse_stylesheet(
            css_content,
            skip_comments=False,
            skip_whitespace=True
        )
    except Exception as exc:
        warnings.append(
            WarningModel(
                message=f"Fatal parser exception: {str(exc)}",
                type="fatal_parse_error"
            )
        )
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return rules, at_rules, warnings, 0, elapsed_ms

    # 2. Process nodes
    for node in top_level_nodes:
        if isinstance(node, Comment):
            comments_count += 1
            continue

        if isinstance(node, ParseError):
            warnings.append(
                WarningModel(
                    message=f"Syntax parse error: {node.message}",
                    line=getattr(node, "source_line", None),
                    column=getattr(node, "source_column", None),
                    type="parse_error"
                )
            )
            continue

        if isinstance(node, QualifiedRule):
            full_selector = tinycss2.serialize(node.prelude).strip()
            individual_selectors = split_selector_list(node.prelude)
            rule_line = getattr(node, "source_line", None)

            decls = parse_declaration_block(
                node.content,
                selector_name=full_selector,
                rule_line=rule_line,
                warnings=warnings
            )

            rules.append(
                RuleModel(
                    selector=full_selector if full_selector else "[empty-selector]",
                    selectors=individual_selectors if individual_selectors else [full_selector],
                    declarations=decls,
                    line=rule_line,
                    parent_at_rule=None
                )
            )

        elif isinstance(node, AtRule):
            keyword = node.at_keyword.lower()
            prelude_str = tinycss2.serialize(node.prelude).strip()
            at_line = getattr(node, "source_line", None)
            nested_rules_count = 0
            nested_decls_count = 0

            # Inspect content inside block
            if node.content is not None:
                # Conditional/Grouping rules that contain standard qualified rules
                if keyword in ["media", "supports", "document", "layer", "scope", "container"]:
                    nested_nodes = tinycss2.parse_rule_list(
                        node.content,
                        skip_comments=True,
                        skip_whitespace=True
                    )
                    parent_label = f"@{keyword} {prelude_str}".strip()

                    for nested_node in nested_nodes:
                        if isinstance(nested_node, QualifiedRule):
                            nested_rules_count += 1
                            sel_full = tinycss2.serialize(nested_node.prelude).strip()
                            sel_list = split_selector_list(nested_node.prelude)
                            n_line = getattr(nested_node, "source_line", at_line)

                            decls = parse_declaration_block(
                                nested_node.content,
                                selector_name=sel_full,
                                rule_line=n_line,
                                warnings=warnings
                            )

                            rules.append(
                                RuleModel(
                                    selector=sel_full,
                                    selectors=sel_list if sel_list else [sel_full],
                                    declarations=decls,
                                    line=n_line,
                                    parent_at_rule=parent_label
                                )
                            )
                        elif isinstance(nested_node, ParseError):
                            warnings.append(
                                WarningModel(
                                    message=f"Parse error inside @{keyword}: {nested_node.message}",
                                    line=getattr(nested_node, "source_line", at_line),
                                    column=getattr(nested_node, "source_column", None),
                                    type="parse_error"
                                )
                            )

                elif keyword in ["font-face", "page"]:
                    # These at-rules contain declarations directly
                    decls = parse_declaration_block(
                        node.content,
                        selector_name=f"@{keyword}",
                        rule_line=at_line,
                        warnings=warnings
                    )
                    nested_decls_count = len(decls)
                    rules.append(
                        RuleModel(
                            selector=f"@{keyword}",
                            selectors=[f"@{keyword}"],
                            declarations=decls,
                            line=at_line,
                            parent_at_rule=None
                        )
                    )

                elif keyword in ["keyframes", "-webkit-keyframes"]:
                    # Keyframe rules contain keyframe blocks (e.g. 0%, 100%, from, to)
                    kf_nodes = tinycss2.parse_rule_list(
                        node.content,
                        skip_comments=True,
                        skip_whitespace=True
                    )
                    parent_label = f"@{keyword} {prelude_str}".strip()

                    for kf_node in kf_nodes:
                        if isinstance(kf_node, QualifiedRule):
                            nested_rules_count += 1
                            kf_step = tinycss2.serialize(kf_node.prelude).strip()
                            k_line = getattr(kf_node, "source_line", at_line)

                            decls = parse_declaration_block(
                                kf_node.content,
                                selector_name=kf_step,
                                rule_line=k_line,
                                warnings=warnings
                            )

                            rules.append(
                                RuleModel(
                                    selector=kf_step,
                                    selectors=[kf_step],
                                    declarations=decls,
                                    line=k_line,
                                    parent_at_rule=parent_label
                                )
                            )

            at_rules.append(
                AtRuleModel(
                    at_keyword=keyword,
                    prelude=prelude_str,
                    line=at_line,
                    rules_count=nested_rules_count,
                    declarations_count=nested_decls_count
                )
            )

    elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
    return rules, at_rules, warnings, comments_count, elapsed_ms
