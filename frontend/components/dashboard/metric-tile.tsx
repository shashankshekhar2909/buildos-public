import { Tile } from "@carbon/react";

export function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <Tile className="metric-tile">
      <p className="metric-tile__label">{label}</p>
      <p className="metric-tile__value">{value}</p>
    </Tile>
  );
}
