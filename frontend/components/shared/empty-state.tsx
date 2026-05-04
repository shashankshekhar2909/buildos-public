import { Tile, Button } from "@carbon/react";

export function EmptyState({ title, description, actionLabel }: { title: string; description: string; actionLabel: string }) {
  return (
    <Tile>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ color: "#525252" }}>{description}</p>
      <Button kind="tertiary">{actionLabel}</Button>
    </Tile>
  );
}
