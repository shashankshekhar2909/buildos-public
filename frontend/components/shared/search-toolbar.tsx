import { TableToolbarContent, TableToolbarSearch, Select, SelectItem } from "@carbon/react";

interface FilterConfig {
  id: string;
  label: string;
  items: string[];
  value: string;
  onChange: (value: string) => void;
}

interface Props {
  searchLabel?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filterA?: FilterConfig;
  filterB?: FilterConfig;
}

export function SearchToolbar({
  searchLabel = "Search",
  searchValue = "",
  onSearch,
  filterA,
  filterB,
}: Props) {
  return (
    <TableToolbarContent>
      <TableToolbarSearch
        id="search"
        persistent
        placeholder={searchLabel}
        value={searchValue}
        // Carbon passes (event, { value, type }) — read from event.target.value
        onChange={(e: unknown) => {
          const event = e as { target?: { value?: string } };
          onSearch?.(event?.target?.value ?? "");
        }}
      />
      {filterA ? (
        <Select
          id={filterA.id}
          labelText={filterA.label}
          value={filterA.value}
          onChange={(e) => filterA.onChange(e.target.value)}
        >
          <SelectItem text={`All ${filterA.label}`} value="all" />
          {filterA.items.map((item) => (
            <SelectItem key={item} text={item} value={item} />
          ))}
        </Select>
      ) : null}
      {filterB ? (
        <Select
          id={filterB.id}
          labelText={filterB.label}
          value={filterB.value}
          onChange={(e) => filterB.onChange(e.target.value)}
        >
          <SelectItem text={`All ${filterB.label}`} value="all" />
          {filterB.items.map((item) => (
            <SelectItem key={item} text={item} value={item} />
          ))}
        </Select>
      ) : null}
    </TableToolbarContent>
  );
}
