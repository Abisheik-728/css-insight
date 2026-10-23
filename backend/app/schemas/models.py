from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DeclarationModel(BaseModel):
    property: str = Field(..., description="CSS property name in lowercase")
    value: str = Field(..., description="CSS property value")
    important: bool = Field(default=False, description="Whether !important flag is present")
    line: Optional[int] = Field(default=None, description="Source line number if available")
    column: Optional[int] = Field(default=None, description="Source column number if available")


class RuleModel(BaseModel):
    selector: str = Field(..., description="Full selector string")
    selectors: List[str] = Field(default_factory=list, description="Individual parsed selectors from selector list")
    declarations: List[DeclarationModel] = Field(default_factory=list, description="List of declarations in this rule")
    line: Optional[int] = Field(default=None, description="Source line number of the rule")
    parent_at_rule: Optional[str] = Field(default=None, description="Enclosing at-rule prelude if nested")


class AtRuleModel(BaseModel):
    at_keyword: str = Field(..., description="At-rule identifier (e.g. media, keyframes, supports, font-face)")
    prelude: str = Field(default="", description="At-rule condition or identifier")
    line: Optional[int] = Field(default=None, description="Source line number")
    rules_count: int = Field(default=0, description="Number of nested qualified rules inside this at-rule")
    declarations_count: int = Field(default=0, description="Number of direct declarations inside this at-rule")


class WarningModel(BaseModel):
    message: str = Field(..., description="Warning or error message")
    line: Optional[int] = Field(default=None, description="Line number if available")
    column: Optional[int] = Field(default=None, description="Column number if available")
    type: str = Field(default="warning", description="Type of issue: syntax_warning, duplicate_declaration, parse_error")


class PropertyStat(BaseModel):
    property: str = Field(..., description="CSS property name")
    count: int = Field(..., description="Occurrences count")
    percentage: float = Field(..., description="Percentage of total declarations")


class MetadataModel(BaseModel):
    filename: str = Field(..., description="Name of the parsed file")
    file_size_bytes: int = Field(..., description="Size of file in bytes")
    total_rules: int = Field(..., description="Total qualified style rules")
    total_selectors: int = Field(..., description="Total individual selectors extracted")
    total_declarations: int = Field(..., description="Total property declarations")
    unique_properties: int = Field(..., description="Number of unique property names")
    unique_colors: int = Field(..., description="Number of unique detected color values")
    total_at_rules: int = Field(..., description="Total at-rules parsed")
    total_comments: int = Field(..., description="Total CSS comments parsed")
    parse_time_ms: float = Field(..., description="Parse duration in milliseconds")


class AnalysisResponse(BaseModel):
    metadata: MetadataModel
    rules: List[RuleModel] = Field(default_factory=list)
    at_rules: List[AtRuleModel] = Field(default_factory=list)
    detected_colors: List[str] = Field(default_factory=list)
    warnings: List[WarningModel] = Field(default_factory=list)
    unique_properties_list: List[str] = Field(default_factory=list)
    top_properties: List[PropertyStat] = Field(default_factory=list)
