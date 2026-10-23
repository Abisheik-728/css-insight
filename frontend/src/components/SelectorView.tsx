import React, { useState, useMemo } from 'react';
import type { Rule } from '../types';
import {
  FolderTree,
  ArrowUpDown,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface SelectorViewProps {
  rules: Rule[];
}

type SortField = 'selector' | 'declarations' | 'line';
type SortOrder = 'asc' | 'desc';

export const SelectorView: React.FC<SelectorViewProps> = ({ rules }) => {
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
        if (filterType === 'top_level' && rule.parent_at_rule) return false;
        if (filterType === 'nested' && !rule.parent_at_rule) return false;

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
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-2xs border border-slate-200 flex flex-col gap-5 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Selector Explorer</h2>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              {filteredRules.length} of {rules.length} rules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search, sort, and inspect parsed CSS selectors and individual targets extracted from selector lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            type="button"
          >
            <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Expand All</span>
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            type="button"
          >
            <Minimize2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search selectors (e.g. .btn, h1, #app) or properties..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 h-4 w-4" />
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Rules</option>
            <option value="top_level">Top-Level Rules Only</option>
            <option value="nested">Nested / At-Rule Rules Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 w-8"></th>
              <th
                onClick={() => handleSort('selector')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Selector</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('declarations')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Declarations</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 hidden md:table-cell">Properties Used</th>
              <th
                onClick={() => handleSort('line')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Source Line</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredRules.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <p className="font-semibold text-slate-800 text-sm mb-1">No selectors match the filter</p>
                  <p className="text-xs text-slate-400">Try resetting the search query or rule filter options.</p>
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
                        isExpanded ? 'bg-indigo-50/40' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-indigo-700 font-semibold text-xs sm:text-sm">
                              {rule.selector}
                            </span>
                            {rule.parent_at_rule && (
                              <span className="px-2 py-0.5 text-[10px] rounded bg-purple-50 text-purple-700 font-sans font-medium border border-purple-200">
                                {rule.parent_at_rule}
                              </span>
                            )}
                          </div>
                          {rule.selectors.length > 1 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {rule.selectors.map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200 font-mono"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-bold text-indigo-600">
                        {rule.declarations.length}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-slate-500 font-mono text-xs">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {propNames.slice(0, 4).map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]"
                            >
                              {p}
                            </span>
                          ))}
                          {propNames.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px]">
                              +{propNames.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">
                        {rule.line ? `L${rule.line}` : '—'}
                      </td>
                    </tr>

                    {/* Expandable Declarations Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={5} className="p-4 sm:p-5 border-y border-slate-200">
                          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                                Declarations for <span className="font-mono text-indigo-600 normal-case">{rule.selector}</span>
                              </span>
                              <span className="font-mono text-xs text-slate-400">
                                {rule.declarations.length} properties
                              </span>
                            </div>

                            {rule.declarations.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">
                                No declarations inside this rule block.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {rule.declarations.map((d, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs"
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                                      <span className="font-semibold text-indigo-700 shrink-0">
                                        {d.property}:
                                      </span>
                                      <span className="text-slate-700 truncate" title={d.value}>
                                        {d.value}
                                      </span>
                                      {d.important && (
                                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider shrink-0 font-sans">
                                          !important
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-slate-400 text-[10px] shrink-0 font-mono">
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
