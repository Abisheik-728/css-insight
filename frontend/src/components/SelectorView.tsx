import React, { useState, useMemo } from 'react';
import type { Rule } from '../types';

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
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-lg animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-xs border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[22px]">account_tree</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Selector Explorer</h2>
            <span className="font-code-sm text-code-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {filteredRules.length} of {rules.length} rules
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Search, sort, and inspect parsed CSS selectors and individual targets extracted from selector lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search selectors (e.g. .btn, h1, #app) or properties..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-body-md text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-code-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">filter_list</span>
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-body-sm text-on-surface font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Rules</option>
            <option value="top_level">Top-Level Rules Only</option>
            <option value="nested">Nested / At-Rule Rules Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-8"></th>
              <th
                onClick={() => handleSort('selector')}
                className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Selector</span>
                  <span className="material-symbols-outlined text-[15px]">swap_vert</span>
                </div>
              </th>
              <th
                onClick={() => handleSort('declarations')}
                className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Declarations</span>
                  <span className="material-symbols-outlined text-[15px]">swap_vert</span>
                </div>
              </th>
              <th className="py-3 px-4 hidden md:table-cell">Properties Used</th>
              <th
                onClick={() => handleSort('line')}
                className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Source Line</span>
                  <span className="material-symbols-outlined text-[15px]">swap_vert</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
            {filteredRules.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                  <p className="font-headline-sm text-headline-sm text-on-surface mb-1">No selectors match the filter</p>
                  <p className="font-body-sm text-body-sm">Try resetting the search query or rule filter options.</p>
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
                        isExpanded ? 'bg-secondary-container/20' : 'hover:bg-surface-container-low/70'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">
                          {isExpanded ? 'expand_more' : 'chevron_right'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-on-surface">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-primary font-bold text-body-md">
                              {rule.selector}
                            </span>
                            {rule.parent_at_rule && (
                              <span className="px-2 py-0.2 text-[11px] rounded bg-secondary-container text-on-secondary-fixed-variant font-sans font-medium">
                                {rule.parent_at_rule}
                              </span>
                            )}
                          </div>
                          {rule.selectors.length > 1 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {rule.selectors.map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-1.5 py-0.2 rounded bg-surface-container text-[11px] text-on-surface-variant border border-outline-variant/30"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-code-sm font-semibold text-primary">
                        {rule.declarations.length}
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-on-surface-variant font-code-sm text-code-sm">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {propNames.slice(0, 4).map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface"
                            >
                              {p}
                            </span>
                          ))}
                          {propNames.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                              +{propNames.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-code-sm text-on-surface-variant">
                        {rule.line ? `L${rule.line}` : '—'}
                      </td>
                    </tr>

                    {/* Expandable Declarations Drawer */}
                    {isExpanded && (
                      <tr className="bg-surface-container-low/40">
                        <td colSpan={5} className="p-space-md sm:p-space-lg border-y border-outline-variant/30">
                          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-space-md">
                            <div className="flex items-center justify-between mb-space-sm pb-space-xs border-b border-outline-variant/20">
                              <span className="font-label-sm text-label-sm font-semibold text-on-surface uppercase tracking-wider">
                                Declarations for <span className="font-code-sm text-primary">{rule.selector}</span>
                              </span>
                              <span className="font-code-sm text-code-sm text-on-surface-variant">
                                {rule.declarations.length} properties
                              </span>
                            </div>

                            {rule.declarations.length === 0 ? (
                              <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                                No declarations inside this rule block.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {rule.declarations.map((d, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 font-code-sm text-code-sm"
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                                      <span className="font-semibold text-primary shrink-0">
                                        {d.property}:
                                      </span>
                                      <span className="text-secondary truncate" title={d.value}>
                                        {d.value}
                                      </span>
                                      {d.important && (
                                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-error-container text-on-error-container uppercase tracking-wider shrink-0">
                                          !important
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-on-surface-variant text-[11px] shrink-0">
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
