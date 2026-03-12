import { typeColors } from "@/lib/constants";

export default function TypeBadge({
  type,
  size = "sm",
}: {
  type: string;
  size?: "sm" | "md";
}) {
  const c = typeColors[type] || { bg: "#999", text: "#fff", light: "#f0f0f0" };

  if (size === "md") {
    return (
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {type}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: c.light, color: c.bg }}
    >
      {type}
    </span>
  );
}
