import Link from "next/link";

interface BrandProps {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  color?: "default" | "light";
  hideWord?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { box: "h-6 w-6 rounded-md text-[12px]", text: "text-sm" },
  md: { box: "h-7 w-7 rounded-lg text-[15px]", text: "text-base" },
  lg: { box: "h-8 w-8 rounded-lg text-[18px]", text: "text-lg" },
} as const;

export function Brand({ size = "md", href = "/", color = "default", hideWord, className = "" }: BrandProps) {
  const s = sizeStyles[size];
  const textColor = color === "light" ? "text-white" : "text-[hsl(var(--foreground))]";
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`${s.box} flex items-center justify-center text-white font-black tracking-tight shadow-sm flex-shrink-0`}
        style={{ background: "linear-gradient(135deg, #3475EF 0%, #1E5AE2 100%)" }}
        aria-hidden
      >
        R
      </span>
      {!hideWord && (
        <span className={`${s.text} font-extrabold tracking-tight ${textColor}`}>Reportly</span>
      )}
    </span>
  );
  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
