import { Link } from "react-router-dom";
import { href, type Lang } from "../lib/i18n";
import { startProductJourney } from "../site/ProductJourney";
import GradientText from "./GradientText";
import "./investorTeaser.css";

export default function InvestorTeaser({ lang }: { lang: Lang }) {
  return (
    <section className="investor-teaser section-dark" aria-labelledby="investor-teaser-title">
      <div className="investor-teaser__inner" data-reveal>
        <div className="investor-teaser__overview">
          <div className="investor-teaser__copy">
            <p className="section-index investor-teaser__eyebrow">Uma empresa. Todos os mercados.</p>
            <h2 id="investor-teaser-title">Conheça a SigmaCX<br /><GradientText className="home-gradient-text" colors={["#b9ff9b", "#5da6ff", "#00a9a9", "#b9ff9b"]} animationSpeed={7}>além do produto.</GradientText></h2>
            <p className="investor-teaser__description">Estratégia, crescimento e nossa visão de futuro.</p>
          </div>
          <div className="investor-teaser__evidence">
            <dl className="investor-teaser__metrics">
              <div>
                <dt>Clientes ativos</dt>
                <dd>40<span>+</span></dd>
              </div>
              <div>
                <dt>Receita <span>2025 vs. 2024</span></dt>
                <dd>4<span>×</span></dd>
              </div>
              <div>
                <dt>Continentes <span>com operação</span></dt>
                <dd>3</dd>
              </div>
            </dl>
            <p className="investor-teaser__source">Indicadores do pitch deck · set. 2026</p>
          </div>
          <div className="investor-teaser__next">
            <p>Conheça nossa próxima etapa.</p>
            <Link className="pill pill--primary" to={href("/investidores", lang)} onClick={(event) => {
              if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              startProductJourney(href("/investidores", lang), lang, "Área de investidores");
            }}>
              Área de investidores <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
