/** Emenda diagonal animada entre uma seção clara e uma escura. */
export function SectionTransition({ to }: { to: "light" | "dark" }) {
  const variant = to === "light" ? "dark-light" : "light-dark";
  return (
    <div className={`section-transition section-transition--${variant}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
