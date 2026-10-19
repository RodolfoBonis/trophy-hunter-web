/**
 * Sprite SVG com os glifos próprios do style tile (troféus, raridade, plataformas). Montado uma vez
 * no topo da árvore; os componentes referenciam via `<use href="#id">`. Mantém os troféus como SVG
 * (sinal que não depende só de cor — ver acessibilidade do style tile).
 */
export function Sprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g-bronze" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0b27a" />
          <stop offset=".55" stopColor="#cd7f32" />
          <stop offset="1" stopColor="#7a4718" />
        </linearGradient>
        <linearGradient id="g-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".5" stopColor="#c4ccd8" />
          <stop offset="1" stopColor="#6b7587" />
        </linearGradient>
        <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset=".5" stopColor="#f5c542" />
          <stop offset="1" stopColor="#a1700f" />
        </linearGradient>
        <linearGradient id="g-plat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e5f0ff" />
          <stop offset=".35" stopColor="#b8a9ff" />
          <stop offset=".65" stopColor="#7fe7ff" />
          <stop offset="1" stopColor="#ffd6f5" />
        </linearGradient>
        <linearGradient id="g-ach" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a475e" />
          <stop offset="1" stopColor="#1b2838" />
        </linearGradient>

        <symbol id="cup" viewBox="0 0 48 48">
          <path d="M13 7h22v11c0 6.6-4.9 12-11 12S13 24.6 13 18z" />
          <path
            d="M13 10H7v3c0 4.4 3 8 7 8.6M35 10h6v3c0 4.4-3 8-7 8.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path d="M21.5 30h5l1 6h-7z" />
          <path d="M14 42l2.5-6h15l2.5 6z" />
        </symbol>
        <symbol id="t-bronze" viewBox="0 0 48 48">
          <g fill="url(#g-bronze)" color="#cd7f32">
            <use href="#cup" />
          </g>
          <circle cx="24" cy="17" r="3" fill="#7a4718" opacity=".55" />
        </symbol>
        <symbol id="t-silver" viewBox="0 0 48 48">
          <g fill="url(#g-silver)" color="#c4ccd8">
            <use href="#cup" />
          </g>
          <path d="M14 13h20M14.6 19h18.8" stroke="#5b6475" strokeWidth="1.6" opacity=".6" />
        </symbol>
        <symbol id="t-gold" viewBox="0 0 48 48">
          <g fill="url(#g-gold)" color="#f5c542">
            <use href="#cup" />
          </g>
          <path d="M24 11.5l1.9 3.9 4.3.6-3.1 3 .7 4.2L24 21.2l-3.8 2 .7-4.2-3.1-3 4.3-.6z" fill="#8a5a06" opacity=".75" />
        </symbol>
        <symbol id="t-plat" viewBox="0 0 48 48">
          <g fill="url(#g-plat)" color="#b8a9ff">
            <use href="#cup" />
          </g>
          <path d="M24 11l5 6-5 7-5-7z" fill="#ffffff" opacity=".85" />
          <path d="M19 17h10" stroke="#7b6cd9" strokeWidth="1" />
          <path
            d="M5 30c2 5 6 8 11 9M43 30c-2 5-6 8-11 9"
            fill="none"
            stroke="url(#g-plat)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="t-ach" viewBox="0 0 48 48">
          <path d="M10 4h34v30l-10 10H4V10z" fill="url(#g-ach)" stroke="#66c0f4" strokeWidth="2" />
          <path d="M24 12l9 5v10l-9 5-9-5V17z" fill="none" stroke="#66c0f4" strokeWidth="2.4" />
          <circle cx="24" cy="22" r="3.4" fill="#a4d007" />
        </symbol>

        <symbol id="r-common" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="5" fill="currentColor" />
        </symbol>
        <symbol id="r-uncommon" viewBox="0 0 16 16">
          <path d="M8 1.5L14.5 8 8 14.5 1.5 8z" fill="currentColor" />
        </symbol>
        <symbol id="r-rare" viewBox="0 0 16 16">
          <path d="M8 1.8l6.8 12.2H1.2z" fill="currentColor" />
        </symbol>
        <symbol id="r-epic" viewBox="0 0 16 16">
          <path d="M8 1l6 3.5v7L8 15l-6-3.5v-7z" fill="currentColor" />
          <path d="M8 5l3 1.8v3.4L8 12l-3-1.8V6.8z" fill="#07080d" opacity=".45" />
        </symbol>
        <symbol id="r-legendary" viewBox="0 0 16 16">
          <path d="M8 .5l1.9 5.6L15.5 8l-5.6 1.9L8 15.5l-1.9-5.6L.5 8l5.6-1.9z" fill="currentColor" />
        </symbol>

        <symbol id="i-ps" viewBox="0 0 16 16">
          <path
            d="M6 2.2v10.6l2.4.8V4.7c0-.5.2-.8.6-.7.5.2.6.6.6 1.1v3.5c1.5.7 2.7 0 2.7-1.9 0-2-.7-2.8-2.7-3.5C8.6 2.7 7.2 2.3 6 2.2zM9.1 11l3.9-1.4c.4-.2.5-.4.1-.5-.4-.1-1-.1-1.4.1l-2.6.9V9l.2-.1s.7-.3 1.8-.4c1-.1 2.3 0 3.3.4 1.1.4 1.2.9.9 1.3-.3.4-1 .6-1 .6l-5.2 1.9V11zM1.9 10.8c-1.2-.3-1.4-1-.8-1.4.5-.4 1.4-.7 1.4-.7L6 7.5v1.4L3.5 9.8c-.4.2-.5.4-.1.5.4.1 1 .1 1.4-.1l1.2-.4v1.3h-.2c-1.2.2-2.5.1-3.9-.3z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-steam" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="10.6" cy="6.2" r="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="5.6" cy="10.4" r="1.5" fill="currentColor" />
          <path d="M5.6 10.4L9.6 7.4" stroke="currentColor" strokeWidth="1.3" />
        </symbol>
        <symbol id="i-lock" viewBox="0 0 16 16">
          <rect x="3" y="7" width="10" height="7.5" rx="1" fill="currentColor" />
          <path d="M5 7V5a3 3 0 016 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </symbol>
      </defs>
          {/* Ícones de interface do style tile (barra superior, botões, banners). */}
        <symbol id="i-ai" viewBox="0 0 24 24"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8zM18.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" fill="currentColor"/></symbol>
        <symbol id="i-check" viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></symbol>
        <symbol id="i-eye" viewBox="0 0 16 16"><path d="M1 8s2.6-5 7-5 7 5 7 5-2.6 5-7 5-7-5-7-5z" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="2.2" fill="currentColor"/></symbol>
        <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></symbol>
        <symbol id="i-key" viewBox="0 0 16 16"><circle cx="5" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M8 8h7M12 8v3M14 8v2" stroke="currentColor" strokeWidth="1.5"/></symbol>
        <symbol id="i-lib" viewBox="0 0 24 24"><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l3.8-1 3 15.5-3.8 1z" fill="none" stroke="currentColor" strokeWidth="1.8"/></symbol>
        <symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4.5 4.5 0 006.4 0l3.2-3.2a4.5 4.5 0 00-6.4-6.4L11.6 6M14 10a4.5 4.5 0 00-6.4 0l-3.2 3.2a4.5 4.5 0 006.4 6.4l1.6-1.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></symbol>
        <symbol id="i-play" viewBox="0 0 16 16"><path d="M4 2.5l9 5.5-9 5.5z" fill="currentColor"/></symbol>
        <symbol id="i-sync" viewBox="0 0 16 16"><path d="M13 6.5A5 5 0 003.5 5M3 9.5A5 5 0 0012.5 11" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M3 2v3.5h3.5M13 14v-3.5H9.5" fill="none" stroke="currentColor" strokeWidth="1.6"/></symbol>
        <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M4 21c1.5-4 4.4-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.8"/></symbol>
        <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="i-sound" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></symbol>
        <symbol id="i-warn" viewBox="0 0 24 24"><path d="M12 2.5l10 18H2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 9.5v5" stroke="currentColor" strokeWidth="2.2"/><circle cx="12" cy="17.6" r="1.3" fill="currentColor"/></symbol>
    </svg>
  );
}
