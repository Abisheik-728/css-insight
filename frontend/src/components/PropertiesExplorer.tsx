import React, { useState, useMemo } from 'react';
import type { Rule, PropertyStat } from '../types';
import { Search, SlidersHorizontal, ArrowUpDown, Flame, Check, Copy } from 'lucide-react';

interface PropertiesExplorerProps {
  rules: Rule[];
  topProperties: PropertyStat[];
}

type SortField = 'property' | 'selector' | 'line';
type SortOrder = 'asc' | 'desc';

interface FlattenedDeclaration {
  selector: string;
  property: string;
  value: string;
  important: boolean;
  line?: number | null;
  parent_at_rule?: string | null;
}

export const PropertiesExplorer: React.FC<PropertiesExplorerProps> = ({ rules, topProperties }) => {
  const [search, setSearch] = useState('');
  const [onlyImportant, setOnlyImportant] = useState(false);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('property');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // Flatten declarations across all rules
  const allDeclarations = useMemo(() => {
    const list: FlattenedDeclaration[] = [];
    rules.forEach(rule => {
      rule.declarations.forEach(decl => {
        list.push({
          selector: rule.selector,
          property: decl.property,
          value: decl.value,
          important: decl.important,
          line: decl.line,
          parent_at_rule: rule.parent_at_rule,
        });
      });
    });
    return list;
  }, [rules]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredDeclarations = useMemo(() => {
    return allDeclarations
      .filter(item => {
        if (onlyImportant && !item.important) return false;
        if (selectedPropertyFilter !== 'all' && item.property !== selectedPropertyFilter) return false;

        if (!search) return true;
        const q = search.toLowerCase();
        return (
          item.property.toLowerCase().includes(q) ||
          item.value.toLowerCase().includes(q) ||
          item.selector.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'line') {
          valA = a.line || 0;
          valB = b.line || 0;
        } else {
          valA = (valA || '').toLowerCase();
          valB = (valB || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [allDeclarations, search, onlyImportant, selectedPropertyFilter, sortField, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Top Properties Frequency Bar */}
      {topProperties.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1222]/90 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Most Frequently Utilized Properties
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {topProperties.slice(0, 10).map((stat, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setSelectedPropertyFilter(
                    selectedPropertyFilter === stat.property ? 'all' : stat.property
                  )
                }
                className={`text-left p-2.5 rounded-lg border transition-all ${
                  selectedPropertyFilter === stat.property
                    ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-md'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-violet-300 truncate">{stat.property}</span>
                  <span className="text-[10px] text-slate-400 font-sans">{stat.count}x</span>
                </div>
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                    style={{ width: `${Math.min(stat.percentage * 2, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                  {stat.percentage}% of total
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c1222]/90 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/[0.06] bg-white/[0.01]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-violet-400" />
                Properties & Values Telemetry
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-mono">
                  {filteredDeclarations.length} declarations
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every extracted declaration with preservation of complex CSS expressions, functions, and flags.
              </p>
            </div>

            {selectedPropertyFilter !== 'all' && (
              <button
                onClick={() => setSelectedPropertyFilter('all')}
                className="text-xs px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
              >
                Reset property filter ({selectedPropertyFilter})
              </button>
            )}
          </div>

          {/* Search & Checkbox Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by property, value (calc, rgb, var), or selector..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.1] text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 font-mono"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-white/[0.03] px-3 py-2 rounded-lg border border-white/[0.06]">
              <input
                type="checkbox"
                checked={onlyImportant}
                onChange={(e) => setOnlyImportant(e.target.checked)}
                className="rounded border-white/20 text-violet-600 focus:ring-violet-500 h-3.5 w-3.5 bg-slate-900"
              />
              <span className="font-mono text-amber-300 font-semibold">!important only</span>
            </label>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090d16] sticky top-0 z-10 border-b border-white/[0.06] text-slate-400 uppercase font-mono tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('property')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Property</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Value</th>
                <th
                  onClick={() => handleSort('selector')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Target Selector</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Important</th>
                <th
                  onClick={() => handleSort('line')}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Line</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredDeclarations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No property declarations match the query.</p>
                  </td>
                </tr>
              ) : (
                filteredDeclarations.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-violet-300">
                      {item.property}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-300 max-w-md">
                      <div className="flex items-center gap-2 group">
                        <span className="truncate" title={item.value}>
                          {item.value}
                        </span>
                        <button
                          onClick={() => handleCopy(item.value)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/[0.1] text-slate-400 hover:text-white"
                          title="Copy value"
                        >
                          {copiedValue === item.value ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300 truncate max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate" title={item.selector}>{item.selector}</span>
                        {item.parent_at_rule && (
                          <span className="text-[10px] px-1 rounded bg-purple-500/10 text-purple-300 shrink-0">
                            @
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.important ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider font-mono">
                          !important
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {item.line ? `L${item.line}` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
