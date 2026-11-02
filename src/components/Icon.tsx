/** Icônes au trait (style Lucide, 1,75 px) utilisées par la navigation. */
const PATHS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z",
  alert: "M12 3 2 20h20L12 3Z M12 10v4 M12 17h.01",
  bus: "M7 3h10a3 3 0 0 1 3 3v11H4V6a3 3 0 0 1 3-3Z M4 11h16 M8 21v-4 M16 21v-4 M8 14h.01 M16 14h.01",
  sim: "M10 3v6L4 19a1.5 1.5 0 0 0 1.3 2h13.4a1.5 1.5 0 0 0 1.3-2L14 9V3 M8 3h8 M7 15h10",
  scale: "M12 3v18 M7 21h10 M5 7h14 M5 7l-3 7a4 4 0 0 0 6 0L5 7Z M19 7l-3 7a4 4 0 0 0 6 0l-3-7Z",
  chat: "M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12Z",
  journal: "M4 6h10 M4 12h16 M4 18h7 M18 4a2 2 0 1 1 0 4a2 2 0 0 1 0-4Z M15 16a2 2 0 1 1 0 4a2 2 0 0 1 0-4Z",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z M4 19a2 2 0 0 1 2-2h13",
  users: "M9 4.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7Z M2.5 20a6.5 6.5 0 0 1 13 0 M16 4.5a3.5 3.5 0 0 1 0 7 M21.5 20a6.5 6.5 0 0 0-4-6",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
