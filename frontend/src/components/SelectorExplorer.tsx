import React, { useState, useMemo } from 'react';
import type { Rule } from '../types';
import { Search, ChevronDown, ChevronRight, Filter, ArrowUpDown, Tag } from 'lucide-react';

interface SelectorExplorerProps {
  rules: Rule[];
}

type SortField = 'selector' | 'declarations' | 'line';
type SortOrder = 'asc' | 'desc';

export const SelectorExplorer: React.FC<SelectorExplorerProps> = ({ rules }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'top_level' | 'nested'>('all');
  const [sortField, setSortField] = useState<SortField>('declarations');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (idx: number) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    filteredRules.forEach((_, idx) => {
      all[idx] = true;
    });
    setExpandedRows(all);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'declarations' ? 'desc' : 'asc');
    }
  };

  const filteredRules = useMemo(() => {
    return rules
      .filter(rule => {
        // Filter by type
        if (filterType === 'top_level' && rule.parent_at_rule) return false;
        if (filterType === 'nested' && !rule.parent_at_rule) return false;

        // Search in selector or property names
        if (!search) return true;
        const q = search.toLowerCase();
        const matchesSelector = rule.selector.toLowerCase().includes(q);
        const matchesIndividual = rule.selectors.some(s => s.toLowerCase().includes(q));
        const matchesProps = rule.declarations.some(d => d.property.toLowerCase().includes(q));
        return matchesSelector || matchesIndividual || matchesProps;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'declarations') {
          valA = a.declarations.length;
          valB = b.declarations.length;
        } else if (sortField === 'line') {
          valA = a.line || 0;
          valB = b.line || 0;
        } else {
          valA = a.selector.toLowerCase();
          valB = b.selector.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [rules, search, filterType, sortField, sortOrder]);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c1222]/90 shadow-xl overflow-hidden">
      {/* Header with Search and Controls */}
      <div className="p-4 sm:p-6 border-b border-white/[0.06] bg-white/[0.01]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-cyan-400" />
              Selector Explorer
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                {filteredRules.length} of {rules.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore parsed rule blocks, individual selector targets, and associated styling properties.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs px-2.5 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs px-2.5 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by selector (e.g. .btn, h1) or property..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.1] text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e: any) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#0f172a] border border-white/[0.1] text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Rules</option>
              <option value="top_level">Top-level Rules Only</option>
              <option value="nested">Nested / At-Rule Rules Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 uppercase font-mono tracking-wider">
            <tr>
              <th className="py-3 px-4 w-8"></th>
              <th
                onClick={() => handleSort('selector')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Selector</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('declarations')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Declarations</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4 hidden md:table-cell">Properties Used</th>
              <th
                onClick={() => handleSort('line')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Source Line</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredRules.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <p className="text-sm font-medium">No selectors match the current search filter.</p>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the search query or changing rule filters.</p>
                </td>
              </tr>
            ) : (
              filteredRules.map((rule, idx) => {
                const isExpanded = expandedRows[idx];
                const propNames = Array.from(new Set(rule.declarations.map(d => d.property)));

                return (
                  <React.Fragment key={idx}>
                    <tr
                      onClick={() => toggleRow(idx)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-cyan-500/[0.04]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-cyan-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-100">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-cyan-300 font-semibold text-xs sm:text-sm">
                              {rule.selector}
                            </span>
                            {rule.parent_at_rule && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-sans">
                                {rule.parent_at_rule}
                              </span>
                            )}
                          </div>
                          {rule.selectors.length > 1 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {rule.selectors.map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-1.5 py-0.2 rounded bg-white/[0.04] text-[10px] text-slate-400 border border-white/[0.06]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-violet-300">
                        {rule.declarations.length}
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-400 font-mono text-[11px]">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {propNames.slice(0, 4).map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-300 border border-white/[0.06]"
                            >
                              {p}
                            </span>
                          ))}
                          {propNames.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-500">
                              +{propNames.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {rule.line ? `L${rule.line}` : '—'}
                      </td>
                    </tr>

                    {/* Expandable Declarations Drawer */}
                    {isExpanded && (
                      <tr className="bg-cyan-500/[0.02]">
                        <td colSpan={5} className="p-4 sm:p-6 border-y border-cyan-500/20">
                          <div className="rounded-xl border border-white/[0.08] bg-[#090d16] p-4">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
                              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Declarations for <span className="font-mono text-cyan-300">{rule.selector}</span>
                              </span>
                              <span className="text-xs font-mono text-slate-400">
                                {rule.declarations.length} properties
                              </span>
                            </div>

                            {rule.declarations.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">No declarations in this rule block.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {rule.declarations.map((d, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs font-mono"
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                                      <span className="text-violet-400 font-medium shrink-0">
                                        {d.property}:
                                      </span>
                                      <span className="text-emerald-300 truncate" title={d.value}>
                                        {d.value}
                                      </span>
                                      {d.important && (
                                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider shrink-0">
                                          !important
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-slate-500 text-[11px] shrink-0">
                                      {d.line ? `L${d.line}` : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
