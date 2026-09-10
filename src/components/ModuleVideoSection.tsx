import { SplitText, SuiteGlow, Vimeo } from "../site/ui";

export default function ModuleVideoSection({
  eyebrow,
  title,
  lead,
  vimeoId,
  videoTitle,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  vimeoId: string;
  videoTitle: string;
}) {
  return (
    <section className="sx-section sx-platform-video sx-module-video" data-reveal>
      <div className="sx-shell">
        <div className="sx-platform-video__intro">
          <div>
            <p className="sx-eyebrow">{eyebrow}</p>
            <h2 className="sx-h2"><SplitText text={title} /></h2>
          </div>
          <div className="sx-platform-video__copy">
            <p className="sx-lead">{lead}</p>
          </div>
        </div>
        <SuiteGlow className="sx-glow--wide" animated>
          <Vimeo id={vimeoId} className="sx-video--dark" title={videoTitle} />
        </SuiteGlow>
      </div>
    </section>
  );
}
