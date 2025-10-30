"use client";
import React from "react";

export function Table<T>({
  columns,
  data,
}: {
  columns: { key: string; label: string; render?: (row: T) => React.ReactNode }[];
  data: T[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 text-sm font-medium text-muted">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-muted">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 text-sm">
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
