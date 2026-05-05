import Link from "next/link";
import { Tile } from "@carbon/react";

export function ActionTile({ title, href, subtitle }: { title: string; href: string; subtitle: string }) {
  return (
    <Link href={href} className="tile-clickable">
      <Tile className="action-tile">
        <h4 className="action-tile__title">{title}</h4>
        <p className="action-tile__subtitle">{subtitle}</p>
      </Tile>
    </Link>
  );
}
