import { DataTable, Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@carbon/react";
import { ReactNode } from "react";

interface Props {
  headers: { key: string; header: string }[];
  rows: { id: string; [key: string]: string | number | ReactNode }[];
}

export function EntityTable({ headers, rows }: Props) {
  return (
    <DataTable rows={rows} headers={headers}>
      {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps }) => (
        <Table {...getTableProps()}>
          <TableHead>
            <TableRow>
              {tableHeaders.map((header) => {
                const headerProps = getHeaderProps({ header }) as { key?: string } & Record<string, unknown>;
                const { key, ...rest } = headerProps;
                return (
                  <TableHeader key={key ?? header.key} {...rest}>
                    {header.header}
                  </TableHeader>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((row) => {
              const rowProps = getRowProps({ row }) as { key?: string } & Record<string, unknown>;
              const { key, ...rest } = rowProps;
              return (
                <TableRow key={key ?? row.id} {...rest}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </DataTable>
  );
}
