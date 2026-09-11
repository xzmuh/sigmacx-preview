import type { Lang } from "../lib/i18n";
import "./channelConversation.css";

const conversations = {
  pt: { label: "Uma conversa que continua entre canais", messages: ["Olá, gostaria de agendar uma consulta com a Dra. Caroline, por favor.", "Boa tarde, Ana! Claro. Qual o melhor horário para você?", "Pode ser para 16h, por favor.", "Perfeito, Ana! Consulta agendada para as 16h com a Dra. Caroline."], status: "Mesmo histórico. Qualquer canal." },
  en: { label: "One conversation across channels", messages: ["Hi, I'd like to book an appointment with Dr. Caroline, please.", "Good afternoon, Ana! Of course. What time works best for you?", "Could we make it 4 pm, please?", "Perfect, Ana! Your appointment with Dr. Caroline is booked for 4 pm."], status: "Same history. Any channel." },
  es: { label: "Una conversación que continúa entre canales", messages: ["Hola, quisiera agendar una consulta con la Dra. Caroline, por favor.", "¡Buenas tardes, Ana! Claro. ¿Qué horario te viene mejor?", "¿Puede ser a las 16 h, por favor?", "¡Perfecto, Ana! Tu consulta con la Dra. Caroline está agendada para las 16 h."], status: "El mismo historial. Cualquier canal." },
};

function ChannelBadge({ instagram }: { instagram: boolean }) {
  return <span className={`sx-channel-conversation__channel${instagram ? " is-instagram" : ""}`} role="img" aria-label={instagram ? "Instagram" : "WhatsApp"}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {instagram ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></> : <><path d="M20.5 11.5a9 9 0 0 1-13 8L3 21l1.5-4.5a9 9 0 1 1 16-5Z" /><path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 1c-1 4-9 0-10-5 0-2 1-3 1-3Z" /></>}
    </svg>
  </span>;
}

export default function ChannelConversation({ lang }: { lang: Lang }) {
  const copy = conversations[lang];
  return <div className="sx-channel-conversation" role="group" aria-label={copy.label}>
    <ol className="sx-channel-conversation__messages">
      {copy.messages.map((message, i) => <li key={i} className={`sx-channel-conversation__message${i % 2 === 0 ? " is-customer" : ""}`} style={{ ["--message-delay" as string]: `${i * 300}ms` }}>
        {i % 2 === 0 ? <ChannelBadge instagram={i === 2} /> : null}
        <p>{message}</p>
        <span className="sx-channel-conversation__time">{i < 2 ? "12:11" : "12:13"}{i % 2 === 0 ? <span aria-hidden="true"> ✓✓</span> : null}</span>
      </li>)}
    </ol>
    <p className="sx-channel-conversation__status"><span aria-hidden="true">✓</span>{copy.status}</p>
  </div>;
}
