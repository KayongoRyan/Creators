import { cn } from "@/lib/utils/cn";

type LogoId = "primus" | "iwacu" | "kcb" | "mtn" | "sulfo" | "inzozi";

export function BrandCampaignLogo({
  id,
  className,
}: {
  id: LogoId;
  className?: string;
}) {
  const shared = cn("h-auto w-full max-w-[7.5rem]", className);

  switch (id) {
    case "primus":
      return (
        <svg viewBox="0 0 140 56" className={shared} aria-hidden="true">
          <rect x="4" y="8" width="48" height="40" rx="4" fill="#C8102E" />
          <text
            x="28"
            y="36"
            textAnchor="middle"
            fill="#fff"
            fontSize="11"
            fontWeight="700"
            fontFamily="system-ui,sans-serif"
          >
            P
          </text>
          <text
            x="62"
            y="34"
            fill="#111"
            fontSize="18"
            fontWeight="800"
            fontFamily="system-ui,sans-serif"
            letterSpacing="0.06em"
          >
            PRIMUS
          </text>
        </svg>
      );
    case "iwacu":
      return (
        <svg viewBox="0 0 140 56" className={shared} aria-hidden="true">
          <circle cx="28" cy="28" r="22" fill="#111" />
          <text
            x="28"
            y="33"
            textAnchor="middle"
            fill="#fff"
            fontSize="14"
            fontWeight="700"
            fontFamily="system-ui,sans-serif"
          >
            I
          </text>
          <text
            x="58"
            y="26"
            fill="#111"
            fontSize="16"
            fontWeight="700"
            fontFamily="system-ui,sans-serif"
          >
            IWACU
          </text>
          <text
            x="58"
            y="42"
            fill="#525252"
            fontSize="10"
            fontWeight="600"
            fontFamily="system-ui,sans-serif"
            letterSpacing="0.2em"
          >
            MUSIC
          </text>
        </svg>
      );
    case "kcb":
      return (
        <svg viewBox="0 0 140 56" className={shared} aria-hidden="true">
          <rect x="6" y="10" width="44" height="36" rx="6" fill="#006633" />
          <text
            x="28"
            y="34"
            textAnchor="middle"
            fill="#fff"
            fontSize="13"
            fontWeight="800"
            fontFamily="system-ui,sans-serif"
          >
            KCB
          </text>
          <text
            x="58"
            y="34"
            fill="#006633"
            fontSize="15"
            fontWeight="700"
            fontFamily="system-ui,sans-serif"
          >
            KCB Rwanda
          </text>
        </svg>
      );
    case "mtn":
      return (
        <svg viewBox="0 0 140 56" className={shared} aria-hidden="true">
          <ellipse cx="28" cy="28" rx="24" ry="22" fill="#FFCC00" />
          <text
            x="28"
            y="33"
            textAnchor="middle"
            fill="#111"
            fontSize="12"
            fontWeight="800"
            fontFamily="system-ui,sans-serif"
          >
            MTN
          </text>
          <text
            x="58"
            y="34"
            fill="#111"
            fontSize="14"
            fontWeight="700"
            fontFamily="system-ui,sans-serif"
          >
            MoMo
          </text>
        </svg>
      );
    case "sulfo":
      return (
        <svg viewBox="0 0 140 56" className={shared} aria-hidden="true">
          <rect x="8" y="14" width="40" height="28" rx="2" fill="none" stroke="#111" strokeWidth="2.5" />
          <text
            x="28"
            y="33"
            textAnchor="middle"
            fill="#111"
            fontSize="11"
            fontWeight="800"
            fontFamily="system-ui,sans-serif"
          >
            S
          </text>
          <text
            x="56"
            y="26"
            fill="#111"
            fontSize="13"
            fontWeight="700"
            fontFamily="system-ui,sans-serif"
          >
            SULFO
          </text>
          <text
            x="56"
            y="40"
            fill="#737373"
            fontSize="9"
            fontWeight="600"
            fontFamily="system-ui,sans-serif"
            letterSpacing="0.12em"
          >
            INDUSTRIES
          </text>
        </svg>
      );
    case "inzozi":
      return (
        <svg viewBox="0 0 140 56" className={shared} aria-hidden="true">
          <path
            d="M12 40c8-18 20-28 32-28s24 10 32 28"
            fill="none"
            stroke="#111"
            strokeWidth="2"
          />
          <text
            x="70"
            y="38"
            textAnchor="middle"
            fill="#111"
            fontSize="14"
            fontWeight="600"
            fontStyle="italic"
            fontFamily="Georgia,serif"
          >
            Inzozi
          </text>
        </svg>
      );
    default:
      return null;
  }
}
