import React, { useState, useMemo } from 'react';
import type { Rule, PropertyStat } from '../types';

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
    <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
      {/* Top Properties Frequency Bar */}
      {topProperties.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
          <div className="flex items-center gap-space-xs pb-space-xs border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Most Frequently Utilized Properties
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-space-sm">
            {topProperties.slice(0, 10).map((stat, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setSelectedPropertyFilter(
                    selectedPropertyFilter === stat.property ? 'all' : stat.property
                  )
                }
                className={`text-left p-space-sm rounded-lg border transition-all ${
                  selectedPropertyFilter === stat.property
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between font-code-sm text-code-sm mb-1">
                  <span className="font-semibold text-primary truncate">{stat.property}</span>
                  <span className="text-on-surface-variant text-[11px] font-sans">{stat.count}x</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(stat.percentage * 2.5, 100)}%` }}
                  />
                </div>
                <span className="font-code-sm text-[11px] text-on-surface-variant mt-1 block">
                  {stat.percentage}% of total
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-xs border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Properties & Declarations Telemetry</h2>
              <span className="font-code-sm text-code-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {filteredDeclarations.length} declarations
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Extracted property statements preserving complex expressions, functions (calc, var, rgb, clamp), and !important flags.
            </p>
          </div>

          {selectedPropertyFilter !== 'all' && (
            <button
              onClick={() => setSelectedPropertyFilter('all')}
              className="text-body-sm font-medium px-space-sm py-1 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-colors"
            >
              Clear filter ({selectedPropertyFilter})
            </button>
          )}
        </div>

        {/* Search & Checkbox Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property, value (calc, var, rgb, #hex), or selector..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-body-md text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-code-sm transition-all"
            />
          </div>

          <label className="flex items-center gap-2 text-body-sm text-on-surface cursor-pointer select-none bg-surface-container-low px-space-sm py-2 rounded-lg border border-outline-variant/30">
            <input
              type="checkbox"
              checked={onlyImportant}
              onChange={(e) => setOnlyImportant(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
            />
            <span className="font-code-sm text-error font-semibold">!important only</span>
          </label>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant/30 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container-low sticky top-0 z-10 border-b border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('property')}
                  className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Property</span>
                    <span className="material-symbols-outlined text-[15px]">swap_vert</span>
                  </div>
                </th>
                <th className="py-3 px-4">Value</th>
                <th
                  onClick={() => handleSort('selector')}
                  className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Target Selector</span>
                    <span className="material-symbols-outlined text-[15px]">swap_vert</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Important</th>
                <th
                  onClick={() => handleSort('line')}
                  className="py-3 px-4 cursor-pointer hover:text-on-surface transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Line</span>
                    <span className="material-symbols-outlined text-[15px]">swap_vert</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
              {filteredDeclarations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    <p className="font-headline-sm text-headline-sm text-on-surface mb-1">No declarations found</p>
                    <p className="font-body-sm text-body-sm">No property-value pairs match the search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredDeclarations.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/70 transition-colors">
                    <td className="py-3 px-4 font-code-sm font-semibold text-primary">
                      {item.property}
                    </td>
                    <td className="py-3 px-4 font-code-sm text-secondary max-w-md">
                      <div className="flex items-center gap-2 group">
                        <span className="truncate" title={item.value}>
                          {item.value}
                        </span>
                        <button
                          onClick={() => handleCopy(item.value)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                          title="Copy value"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedValue === item.value ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-code-sm text-on-surface truncate max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate" title={item.selector}>{item.selector}</span>
                        {item.parent_at_rule && (
                          <span className="text-[10px] px-1 rounded bg-secondary-container text-on-secondary-fixed-variant shrink-0">
                            @
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.important ? (
                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-error-container text-on-error-container uppercase tracking-wider font-code-sm">
                          !important
                        </span>
                      ) : (
                        <span className="text-outline-variant">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-code-sm text-on-surface-variant">
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
