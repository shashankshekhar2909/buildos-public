import { Breadcrumb, BreadcrumbItem, Button } from "@carbon/react";
import { Add } from "@carbon/icons-react";

interface Props {
  title: string;
  description: string;
  actionLabel?: string;
}

export function PageHeader({ title, description, actionLabel }: Props) {
  return (
    <div className="page-header">
      <Breadcrumb noTrailingSlash>
        <BreadcrumbItem href="/">BuildOS</BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>{title}</BreadcrumbItem>
      </Breadcrumb>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", marginTop: "0.75rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          <p style={{ margin: "0.35rem 0 0", color: "#525252" }}>{description}</p>
        </div>
        {actionLabel ? (
          <Button renderIcon={Add} kind="primary" size="md">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
