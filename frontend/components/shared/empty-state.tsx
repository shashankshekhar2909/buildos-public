import { Tile, Button } from "@carbon/react";

interface Props {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: React.ComponentType<{ size?: number }>;
}

export function EmptyState({ title, description, actionLabel, icon: Icon }: Props) {
  return (
    <Tile className="empty-state">
      {Icon && (
        <div className="empty-state__icon">
          <Icon size={32} />
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {actionLabel && (
        <Button kind="ghost" size="sm">
          {actionLabel}
        </Button>
      )}
    </Tile>
  );
}
