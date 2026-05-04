import Link from "next/link";
import { Tile } from "@carbon/react";

export function ActionTile({ title, href, subtitle }: { title: string; href: string; subtitle: string }) {
  return (
    <Link href={href} className="tile-clickable">
      <Tile>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <p style={{ margin: "0.5rem 0 0", color: "#525252" }}>{subtitle}</p>
      </Tile>
    </Link>
  );
}
