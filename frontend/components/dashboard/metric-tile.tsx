import { Tile } from "@carbon/react";

export function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <Tile>
      <p style={{ margin: 0, color: "#6f6f6f" }}>{label}</p>
      <p style={{ margin: "0.25rem 0 0", fontSize: "2rem", fontWeight: 700 }}>{value}</p>
    </Tile>
  );
}
