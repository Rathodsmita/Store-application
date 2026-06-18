import React from 'react';
export default function DataTable({ columns, rows, sortBy, sortDir, onSort, emptyMessage = 'Nothing to show yet.' }) {
  function handleHeaderClick(col) {
    if (!col.sortable || !onSort) return;
    if (sortBy === col.key) {
      onSort(col.key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(col.key, 'asc');
    }
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>
                {col.sortable ? (
                  <button type="button" onClick={() => handleHeaderClick(col)}>
                    {col.label}
                    {sortBy === col.key && (
                      <span className="sort-caret">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">{emptyMessage}</div>
              </td>
            </tr>
          )}
          {rows.map((row, idx) => (
            <tr key={row.id ?? idx}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
