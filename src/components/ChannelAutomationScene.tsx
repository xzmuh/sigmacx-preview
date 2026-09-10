type AutomationCopy = {
  package: string;
  order: string;
  messages: string;
  schedule: string;
  action: string;
};

function Envelope() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m5 7 7 5.5L19 7" />
    </svg>
  );
}

function Chat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5.5h14v10H9l-4 3v-13Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </svg>
  );
}

function SkeletonLines({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`sx-auto-ui__lines${compact ? " is-compact" : ""}`} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

export default function ChannelAutomationScene({
  copy,
  cancelLabel,
  confirmLabel,
}: {
  copy: AutomationCopy;
  cancelLabel: string;
  confirmLabel: string;
}) {
  return (
    <div className="sx-automation-scene" role="img" aria-label={copy.action}>
      <span className="sx-automation-scene__halo" aria-hidden="true" />

      <article className="sx-auto-ui sx-auto-ui--package">
        <span className="sx-auto-ui__window-dots" aria-hidden="true"><i /><i /><i /></span>
        <strong>{copy.package}</strong>
        <small>{copy.order}</small>
        <SkeletonLines />
        <span className="sx-auto-ui__channel sx-auto-ui__channel--package" aria-hidden="true">
          <Envelope />
          <b>1</b>
        </span>
      </article>

      <article className="sx-auto-ui sx-auto-ui--messages">
        <span className="sx-auto-ui__channel" aria-hidden="true"><Chat /></span>
        <div>
          <strong>{copy.messages}</strong>
          <SkeletonLines compact />
        </div>
      </article>

      <article className="sx-auto-ui sx-auto-ui--schedule">
        <span className="sx-auto-ui__channel" aria-hidden="true"><Envelope /></span>
        <strong>{copy.schedule}</strong>
        <SkeletonLines />
        <div className="sx-auto-ui__actions" aria-hidden="true">
          <span>{cancelLabel}</span>
          <span>{confirmLabel}</span>
        </div>
      </article>
    </div>
  );
}
