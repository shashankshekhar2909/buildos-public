import { Breadcrumb, BreadcrumbItem, Button } from "@carbon/react";
import { Add } from "@carbon/icons-react";

interface Props {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, actionLabel, onAction, breadcrumbs }: Props) {
  return (
    <div className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb noTrailingSlash>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <BreadcrumbItem
                key={crumb.label}
                href={crumb.href}
                isCurrentPage={isLast}
              >
                {crumb.label}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
      )}
      <div className="page-header__row">
        <div>
          <h1 className="page-header__title">{title}</h1>
          <p className="page-header__description">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <Button renderIcon={Add} kind="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
