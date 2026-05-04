import { Search, Select, SelectItem } from "@carbon/react";

interface Props {
  searchLabel?: string;
  filterA?: { id: string; label: string; items: string[] };
  filterB?: { id: string; label: string; items: string[] };
}

export function SearchToolbar({ searchLabel = "Search", filterA, filterB }: Props) {
  return (
    <div className="toolbar">
      <Search id="search" labelText={searchLabel} placeholder={searchLabel} size="lg" />
      {filterA ? (
        <Select id={filterA.id} labelText={filterA.label} defaultValue="all" size="lg">
          <SelectItem text={`All ${filterA.label}`} value="all" />
          {filterA.items.map((item) => (
            <SelectItem key={item} text={item} value={item} />
          ))}
        </Select>
      ) : null}
      {filterB ? (
        <Select id={filterB.id} labelText={filterB.label} defaultValue="all" size="lg">
          <SelectItem text={`All ${filterB.label}`} value="all" />
          {filterB.items.map((item) => (
            <SelectItem key={item} text={item} value={item} />
          ))}
        </Select>
      ) : null}
    </div>
  );
}
