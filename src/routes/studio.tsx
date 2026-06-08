import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid, Send, BarChart3, Sparkles, ArrowLeft } from "lucide-react";
import "../styles/landing.css";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Студия Stock AI — конструктор, публикатор, анализатор" },
      {
        name: "description",
        content:
          "Визуальный конструктор карточек, автопубликация на WB / Ozon / Я.Маркет и сквозная аналитика. Демо — скоро будет доступно как отдельный тариф.",
      },
      { property: "og:title", content: "Студия Stock AI — конструктор, публикатор, анализатор" },
      {
        property: "og:description",
        content:
          "Демо-режим. Соберите карточку в визуальном редакторе, опубликуйте в один клик и смотрите аналитику в реальном времени.",
      },
    ],
  }),
  component: StudioPage,
});

type ToolKey = "builder" | "publisher" | "analyzer";

const TOOLS: { key: ToolKey; icon: typeof LayoutGrid; title: string; tag: string; lead: string }[] = [
  {
    key: "builder",
    icon: LayoutGrid,
    title: "Конструктор",
    tag: "Drag & drop",
    lead: "Соберите карточку из готовых блоков: фон, инфографика, УТП, размеры, гарантии. Двигайте, меняйте стиль — превью обновляется на лету.",
  },
  {
    key: "publisher",
    icon: Send,
    title: "Публикатор",
    tag: "1 клик · WB / Ozon / Я.Маркет",
    lead: "Карточка собирается под требования каждой площадки и публикуется в один клик. Стандарт цветов, размеры под мобильную выдачу — учтены автоматически.",
  },
  {
    key: "analyzer",
    icon: BarChart3,
    title: "Анализатор",
    tag: "Аналитика и рост выручки",
    lead: "Сквозная аналитика по карточкам: CTR, конверсия, позиция в выдаче, динамика выручки. Подсказывает, что улучшить, чтобы попасть в топ.",
  },
];

function StudioPage() {
  return (
    <div className="sa-root">
      <div className="sa-wrap">
        <header className="sa-header">
          <div className="sa-container">
            <nav className="sa-nav">
              <Link to="/" className="sa-logo">
                <span className="sa-mark">S</span>
                Stock<span style={{ color: "var(--sa-accent)" }}>&nbsp;AI</span>
              </Link>
              <div className="sa-nav-links">
                <Link to="/">На главную</Link>
                <a href="/#pricing">Тарифы</a>
                <a href="/#faq">FAQ</a>
              </div>
              <div className="sa-nav-cta">
                <Link to="/" className="sa-login">
                  <ArrowLeft size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Назад
                </Link>
                <a href="#waitlist" className="sa-btn sa-btn-primary">
                  В лист ожидания
                </a>
              </div>
            </nav>
          </div>
        </header>

        <section className="sa-hero" style={{ paddingTop: 72, paddingBottom: 48 }}>
          <div className="sa-hero-glow" aria-hidden="true" />
          <div className="sa-container">
            <div style={{ maxWidth: 820 }}>
              <span className="sa-eyebrow">
                <span className="sa-dot" />
                Отдельный тариф · Демо · Скоро будет
              </span>
              <h1 style={{ marginTop: 18 }}>
                Студия Stock AI:{" "}
                <span className="sa-grad">конструктор, публикатор, анализатор</span>
              </h1>
              <p className="sa-lead" style={{ marginTop: 16 }}>
                Соберите карточку в визуальном редакторе, опубликуйте сразу на WB, Ozon и Я.Маркет
                и смотрите, как растёт выручка. Сейчас доступно как демо — ниже можно изучить
                интерфейс.
              </p>
              <div className="sa-hero-cta" style={{ marginTop: 22 }}>
                <a href="#waitlist" className="sa-btn sa-btn-primary">
                  Записаться в лист ожидания →
                </a>
                <Link to="/" className="sa-btn sa-btn-ghost">
                  Вернуться на главную
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="sa-section" style={{ paddingTop: 24 }}>
          <div className="sa-container">
            <div className="studio-grid">
              {TOOLS.map(({ key, icon: Icon, title, tag, lead }) => (
                <article key={key} className={`studio-card studio-${key}`}>
                  <div className="studio-card-head">
                    <div className="studio-icon">
                      <Icon strokeWidth={2.2} />
                    </div>
                    <span className="studio-soon">
                      <Sparkles size={12} strokeWidth={2.4} />
                      Скоро
                    </span>
                  </div>
                  <h3>{title}</h3>
                  <div className="studio-tag">{tag}</div>
                  <p>{lead}</p>

                  {key === "builder" && (
                    <div className="studio-mock studio-mock-builder">
                      <div className="sb-toolbar">
                        <span /> <span /> <span /> <span className="sb-spacer" />
                        <em>Превью карточки</em>
                      </div>
                      <div className="sb-canvas">
                        <div className="sb-block sb-b1">Заголовок</div>
                        <div className="sb-block sb-b2">100% хлопок</div>
                        <div className="sb-block sb-b3">42–54</div>
                        <div className="sb-block sb-b4">Гарантия</div>
                      </div>
                    </div>
                  )}

                  {key === "publisher" && (
                    <div className="studio-mock studio-mock-publisher">
                      <div className="sp-row"><span className="sp-mp">WB</span><i className="sp-ok">Готово</i></div>
                      <div className="sp-row"><span className="sp-mp sp-oz">Ozon</span><i className="sp-ok">Готово</i></div>
                      <div className="sp-row"><span className="sp-mp sp-ya">Я.Маркет</span><i className="sp-load">Публикация…</i></div>
                      <div className="sp-row"><span className="sp-mp sp-mm">Мегамаркет</span><i className="sp-load">Очередь</i></div>
                    </div>
                  )}

                  {key === "analyzer" && (
                    <div className="studio-mock studio-mock-analyzer">
                      <div className="sa-kpi-row">
                        <div className="sa-kpi"><b>+47%</b><span>CTR</span></div>
                        <div className="sa-kpi"><b>×2.1</b><span>Конверсия</span></div>
                        <div className="sa-kpi"><b>ТОП-3</b><span>Позиция</span></div>
                      </div>
                      <div className="sa-chart">
                        <div className="sa-bar" style={{ height: "30%" }} />
                        <div className="sa-bar" style={{ height: "48%" }} />
                        <div className="sa-bar" style={{ height: "62%" }} />
                        <div className="sa-bar" style={{ height: "55%" }} />
                        <div className="sa-bar" style={{ height: "78%" }} />
                        <div className="sa-bar" style={{ height: "88%" }} />
                        <div className="sa-bar sa-bar-on" style={{ height: "96%" }} />
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div id="waitlist" className="sa-corp" style={{ marginTop: 56 }}>
              <div className="sa-ct">
                <h3>Откроем Студию первыми — для вас</h3>
                <p>
                  Оставьте заявку — пришлём доступ к закрытой бете и специальную цену на отдельный
                  тариф Студии.
                </p>
              </div>
              <a href="/#pricing" className="sa-btn sa-btn-primary">
                Записаться
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
