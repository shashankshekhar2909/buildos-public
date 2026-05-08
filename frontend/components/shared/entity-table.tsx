import {
  DataTable,
  DataTableSkeleton,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
} from "@carbon/react";
import { ReactNode } from "react";

interface Props {
  headers: { key: string; header: string }[];
  rows: { id: string; [key: string]: string | number | ReactNode }[];
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  /** When true, renders a DataTableSkeleton instead of the table. */
  loading?: boolean;
}

export function EntityTable({ headers, rows, title, description, toolbar, loading }: Props) {
  if (loading) {
    return (
      <DataTableSkeleton
        headers={headers.map((h) => ({ header: h.header }))}
        columnCount={headers.length}
        rowCount={6}
        zebra
        showToolbar={Boolean(toolbar)}
        showHeader={Boolean(title)}
      />
    );
  }

  return (
    // Wrap in a scrollable container so wide tables don't overflow the viewport.
    <div style={{ overflowX: "auto", width: "100%" }}>
      <DataTable rows={rows} headers={headers}>
        {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer title={title} description={description}>
            {toolbar && (
              <TableToolbar aria-label="table toolbar">
                {toolbar}
              </TableToolbar>
            )}
            <Table {...getTableProps()} size="lg">
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
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
}
