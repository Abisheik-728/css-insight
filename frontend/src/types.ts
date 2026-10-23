export interface Declaration {
  property: string;
  value: string;
  important: boolean;
  line?: number | null;
  column?: number | null;
}

export interface Rule {
  selector: string;
  selectors: string[];
  declarations: Declaration[];
  line?: number | null;
  parent_at_rule?: string | null;
}

export interface AtRule {
  at_keyword: string;
  prelude: string;
  line?: number | null;
  rules_count: number;
  declarations_count: number;
}

export interface Warning {
  message: string;
  line?: number | null;
  column?: number | null;
  type: string;
}

export interface PropertyStat {
  property: string;
  count: number;
  percentage: number;
}

export interface Metadata {
  filename: string;
  file_size_bytes: number;
  total_rules: number;
  total_selectors: number;
  total_declarations: number;
  unique_properties: number;
  unique_colors: number;
  total_at_rules: number;
  total_comments: number;
  parse_time_ms: number;
}

export interface AnalysisResult {
  metadata: Metadata;
  rules: Rule[];
  at_rules: AtRule[];
  detected_colors: string[];
  warnings: Warning[];
  unique_properties_list: string[];
  top_properties: PropertyStat[];
}
