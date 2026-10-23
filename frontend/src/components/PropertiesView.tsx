import React, { useState, useMemo } from 'react';
import type { Rule, PropertyStat } from '../types';
import {
  SlidersHorizontal,
  BarChart2,
  Search,
  ArrowUpDown,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface PropertiesViewProps {
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

export const PropertiesView: React.FC<PropertiesViewProps> = ({ rules, topProperties }) => {
  const [search, setSearch] = useState('');
  const [onlyImportant, setOnlyImportant] = useState(false);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('property');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

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
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Top Properties Frequency Bar */}
      {topProperties.length > 0 && (
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-2xs border border-slate-200 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BarChart2 className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Most Frequently Utilized Properties
            </h3>
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
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedPropertyFilter === stat.property
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs mb-1">
                  <span className="font-semibold text-indigo-700 truncate">{stat.property}</span>
                  <span className="text-slate-400 text-[11px] font-sans">{stat.count}x</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.min(stat.percentage * 2.5, 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-slate-500 mt-1 block">
                  {stat.percentage}% of total
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-2xs border border-slate-200 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Properties & Declarations Telemetry</h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                {filteredDeclarations.length} declarations
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Extracted property statements preserving complex expressions, functions (calc, var, rgb, clamp), and !important flags.
            </p>
          </div>

          {selectedPropertyFilter !== 'all' && (
            <button
              onClick={() => setSelectedPropertyFilter('all')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear filter ({selectedPropertyFilter})</span>
            </button>
          )}
        </div>

        {/* Search & Checkbox Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property, value (calc, var, rgb, #hex), or selector..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={onlyImportant}
              onChange={(e) => setOnlyImportant(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="font-mono text-rose-600 font-bold">!important only</span>
          </label>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('property')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Property</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Value</th>
                <th
                  onClick={() => handleSort('selector')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Target Selector</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Important</th>
                <th
                  onClick={() => handleSort('line')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Line</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-mono text-xs">
              {filteredDeclarations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                    <p className="font-semibold text-slate-800 text-sm mb-1">No declarations found</p>
                    <p className="text-xs text-slate-400">No property-value pairs match the search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredDeclarations.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-indigo-700">
                      {item.property}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      <div className="flex items-center gap-2 group">
                        <span className="truncate" title={item.value}>
                          {item.value}
                        </span>
                        <button
                          onClick={() => handleCopy(item.value)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy value"
                          type="button"
                        >
                          {copiedValue === item.value ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-900 truncate max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate" title={item.selector}>{item.selector}</span>
                        {item.parent_at_rule && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-sans font-medium shrink-0">
                            @
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.important ? (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider font-sans">
                          !important
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
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
