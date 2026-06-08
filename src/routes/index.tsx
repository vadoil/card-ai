import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Check,
  Sparkles,
  ShieldCheck,
  Layout,
  Type,
  Ruler,
  Star,
  Wand2,
} from "lucide-react";
import "../styles/landing.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stock AI — карточки для маркетплейсов в топ-1" },
      {
        name: "description",
        content:
          "Stock AI создаёт премиум-карточки для Wildberries, Ozon, Я.Маркета и Авито: фон, инфографика, тексты, мемы, элит и примерка на модели — 4 варианта меньше чем за 5 минут.",
      },
      { property: "og:title", content: "Stock AI — карточки, которые выводят в топ-1" },
      {
        property: "og:description",
        content:
          "Загрузите фото товара — получите 4 премиум-варианта карточки для маркетплейса меньше чем за 5 минут.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: LandingPage,
});

// ---------- card data ----------
const SHIRT = "M35 22 L50 30 L65 22 L80 32 L72 46 L66 42 V80 H34 V42 L28 46 L20 32 Z";
const WATCH =
  "M34 20h32v13h-32z M30 33h40v32h-40z M34 65h32v13h-32z"; // approximation using paths
const BOTTLE =
  "M44 18 h12 v8 q8 4 8 16 v36 a6 6 0 0 1 -6 6 h-16 a6 6 0 0 1 -6 -6 v-36 q0 -12 8 -16 z";
const SHOE = "M20 64 q0 -8 8 -8 l18 -2 14 10 14 2 q8 1 8 8 v6 H20 z";
const BAG = "M30 40 h40 l-4 40 h-32 z M40 40 v-8 a10 10 0 0 1 20 0 v8";
const CREAM = "M34 30 h32 v50 h-32z M40 20 h20 v12 h-20z";
const PHONE = "M35 18 h30 v64 h-30z";
const BEAR = "M30 26 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M54 26 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M30 42 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0";

type Card = { t: string; c: string; ic: string; p: string[] };

const CARDS: Card[] = [
  { t: "РУБАШКА", c: "#d9442f", ic: SHIRT, p: ["хлопок", "42-54"] },
  { t: "ЧАСЫ", c: "#cf7a2e", ic: WATCH, p: ["14 дней", "AMOLED"] },
  { t: "ВОДА", c: "#2f8fd9", ic: BOTTLE, p: ["1.5 л", "BPA-free"] },
  { t: "КРОССОВКИ", c: "#5a4cd9", ic: SHOE, p: ["сетка", "36-45"] },
  { t: "СУМКА", c: "#b13fa0", ic: BAG, p: ["эко-кожа", "12 л"] },
  { t: "КРЕМ", c: "#2faf6a", ic: CREAM, p: ["SPF 50", "50 мл"] },
  { t: "СМАРТФОН", c: "#1f2937", ic: PHONE, p: ["128 ГБ", "5000 mAh"] },
  { t: "ИГРУШКА", c: "#e0658a", ic: BEAR, p: ["0+", "гипоалл."] },
  { t: "ПЛАТЬЕ", c: "#d94470", ic: SHIRT, p: ["вискоза", "S-XL"] },
  { t: "ТЕРМОС", c: "#3a7d44", ic: BOTTLE, p: ["12 ч", "750 мл"] },
];

function fmtRu(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

function MiniCard({ d, big = false }: { d: Card; big?: boolean }) {
  return (
    <div className={`sa-mp ${big ? "" : "sa-mq"}`}>
      <div className="sa-ph">
        <div className="sa-ttl">{d.t}</div>
        <div className="sa-pills">
          {d.p.map((x, i) => (
            <span className="sa-pill" key={i}>
              {x}
            </span>
          ))}
        </div>
        <svg viewBox="0 0 100 100" fill="none" stroke={d.c} strokeWidth="3" strokeLinejoin="round">
          <path d={d.ic} />
        </svg>
      </div>
      {big && (
        <div className="sa-foot">
          <div className="sa-name">{d.t.charAt(0) + d.t.slice(1).toLowerCase()}</div>
          <div className="sa-meta">4 варианта · 30–60 сек</div>
        </div>
      )}
    </div>
  );
}

// ---------- hooks ----------
function useReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".sa-root");
    if (root) root.classList.add("sa-js");
    const els = Array.from(document.querySelectorAll<HTMLElement>(".sa-reveal"));
    els.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 6) * 0.05}s`;
    });
    const reveal = (el: Element) => {
      el.classList.add("sa-in");
      el.querySelectorAll<HTMLElement>(".sa-count:not(.sa-done)").forEach((c) => {
        c.classList.add("sa-done");
        runCount(c);
      });
    };
    if (typeof IntersectionObserver === "undefined") {
      els.forEach(reveal);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    els.forEach((el) => io.observe(el));
    // Safety: if observer never fires (e.g. layout in a non-scrolling container), force reveal.
    const safety = window.setTimeout(() => els.forEach(reveal), 1200);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);
}

function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function runCount(el: HTMLElement) {
  const target = Number(el.dataset.target || "0");
  const suf = el.dataset.suffix || "";
  const dur = 1500;
  const start = performance.now();
  function step(now: number) {
    const p = Math.min((now - start) / dur, 1);
    const v = Math.floor(ease(p) * target);
    el.textContent = v.toLocaleString("ru-RU") + suf;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function useParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const blobs = document.querySelectorAll<HTMLElement>(".sa-blob");
    function onMove(e: MouseEvent) {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      blobs.forEach((b) => {
        const p = Number(b.dataset.par || "0");
        b.style.transform = `translate(${x * p}px, ${y * p}px)`;
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
}

// ---------- page ----------
function LandingPage() {
  useReveal();
  useParallax();

  // FAQ state
  const [openQ, setOpenQ] = useState<number | null>(null);
  const faqs = [
    {
      q: "Это просто ChatGPT?",
      a: "Нет. Stock AI заточен именно под карточки маркетплейсов: под каждый тип товара — свой подход к фону, инфографике и текстам, чтобы карточка продавала, а не просто красиво выглядела.",
    },
    {
      q: "Какие типы карточек вы делаете?",
      a: "Инфографика, мемные, элитные и с примеркой одежды на ИИ-модели. Stock AI подбирает стиль под товар и аудиторию — или вы выбираете сами.",
    },
    {
      q: "Какие площадки поддерживаются?",
      a: "Wildberries и Ozon — в приоритете, с нужными размерами под каждую. Яндекс Маркет и Авито добавляем поэтапно.",
    },
    {
      q: "Можно попробовать бесплатно?",
      a: "Да. На бесплатном тарифе можно собрать карточку без оплаты и понять, подходит ли сервис под ваши задачи.",
    },
    {
      q: "Что с моими фотографиями?",
      a: "Фото используются только для генерации ваших карточек и хранятся в вашем аккаунте. Их можно удалить в любой момент.",
    },
  ];
  const ansRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculator
  const [cards, setCards] = useState(20);
  const [price, setPrice] = useState(2000);
  const designer = cards * price;
  const saved = Math.max(0, designer - 1990);

  const mqA = useMemo(() => [...CARDS, ...CARDS], []);
  const mqB = useMemo(() => {
    const r = [...CARDS].reverse();
    return [...r, ...r];
  }, []);

  return (
    <div className="sa-root">
      <div className="sa-bg-fx">
        <div className="sa-blob a" data-par="20" />
        <div className="sa-blob b" data-par="-26" />
      </div>
      <div className="sa-wrap">
        <header className="sa-header">
          <div className="sa-container">
            <nav className="sa-nav">
              <a href="#" className="sa-logo">
                <span className="sa-mark">S</span>
                Stock<span style={{ color: "var(--sa-accent)" }}>&nbsp;AI</span>
              </a>
              <div className="sa-nav-links">
                <a href="#how">Как работает</a>
                <a href="#types">Типы карточек</a>
                <a href="#pricing">Тарифы</a>
                <Link to="/studio">Студия</Link>
                <a href="#faq">FAQ</a>
              </div>
              <div className="sa-nav-cta">
                <a href="#" className="sa-login">
                  Войти
                </a>
                <a href="#pricing" className="sa-btn sa-btn-primary">
                  Начать бесплатно
                </a>
              </div>
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section className="sa-hero">
          <div className="sa-hero-glow" aria-hidden="true" />
          <div className="sa-container">
            <div className="sa-hero-grid">
              {/* LEFT */}
              <div className="sa-hero-left">
                <span className="sa-eyebrow sa-reveal">
                  <span className="sa-dot" />
                  AI-студия карточек для WB · Ozon · Я.Маркет
                </span>
                <h1 className="sa-reveal">
                  Создавайте карточки маркетплейсов, которые выглядят{" "}
                  <span className="sa-grad">дороже конкурентов</span>
                </h1>
                <p className="sa-lead sa-reveal">
                  Загрузите фото товара — Stock AI соберёт обложку, инфографику, УТП, SEO-текст и
                  4 варианта дизайна под вашу нишу. Без дизайнера, фотостудии и долгих правок.
                </p>
                <div className="sa-bullets sa-reveal">
                  <span className="sa-b"><Layout strokeWidth={2.2} />Фон и инфографика</span>
                  <span className="sa-b"><Type strokeWidth={2.2} />Тексты и УТП</span>
                  <span className="sa-b"><Ruler strokeWidth={2.2} />Размеры под WB/Ozon</span>
                </div>
                <div className="sa-hero-cta sa-reveal">
                  <a href="#pricing" className="sa-btn sa-btn-primary">
                    Создать карточку бесплатно →
                  </a>
                  <a href="#examples" className="sa-btn sa-btn-ghost">
                    Посмотреть примеры
                  </a>
                </div>
                <div className="sa-trust sa-reveal">
                  <ShieldCheck strokeWidth={2.2} />
                  Первые генерации бесплатно · оплата не нужна · результат за несколько минут
                </div>
              </div>

              {/* RIGHT — product mockup */}
              <div className="sa-hero-right">
                <div className="sa-mock-wrap">
                  <div className="sa-mock">
                    <div className="sa-mock-top">
                      <span className="sa-mock-dot r" />
                      <span className="sa-mock-dot y" />
                      <span className="sa-mock-dot g" />
                      <span className="sa-mock-url">app.stock-ai · карточка</span>
                    </div>
                    <div className="sa-mock-body">
                      {/* left panel */}
                      <aside className="sa-mside">
                        <div className="sa-mtitle">Загрузить фото</div>
                        <div className="sa-drop">
                          <Upload strokeWidth={2} />
                          Перетащите файл
                        </div>
                        <div className="sa-thumb">
                          <div className="sa-thb">
                            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"><path d={SHIRT} /></svg>
                          </div>
                          <div>
                            <div className="sa-tn">shirt-01.jpg</div>
                            <div className="sa-tm">2.4 MB · обработано</div>
                          </div>
                        </div>
                        <span className="sa-status"><Check strokeWidth={3} />Фон удалён</span>
                      </aside>

                      {/* center — product card */}
                      <div className="sa-mcenter">
                        <div className="sa-pcard">
                          <span className="sa-pbadge"><Check strokeWidth={3} />Готово для WB</span>
                          <div className="sa-pttl">РУБАШКА</div>
                          <div className="sa-pinfo">
                            <span className="sa-pill"><span className="sa-ic">✦</span>100% хлопок</span>
                            <span className="sa-pill"><span className="sa-ic">↔</span>Размеры 42–54</span>
                            <span className="sa-pill"><span className="sa-ic">▣</span>Офис и casual</span>
                          </div>
                          <svg className="sa-pim" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"><path d={SHIRT} /></svg>
                          <div className="sa-pfoot">
                            <span>2 490 ₽</span>
                            <span className="sa-rt"><Star fill="currentColor" strokeWidth={0} />4.9 · 2 480</span>
                          </div>
                        </div>
                      </div>

                      {/* right panel */}
                      <aside className="sa-mside right">
                        <div className="sa-mtitle">Стиль карточки</div>
                        <div className="sa-styles">
                          <div className="sa-style s1 on"><span className="sa-sw" />Инфографика</div>
                          <div className="sa-style s2"><span className="sa-sw" />Premium</div>
                          <div className="sa-style s3"><span className="sa-sw" />Мемная</div>
                          <div className="sa-style s4"><span className="sa-sw" />На модели</div>
                        </div>
                        <span className="sa-status warm"><Sparkles strokeWidth={2.4} />AI подбирает УТП…</span>
                        <button className="sa-mbtn"><Wand2 strokeWidth={2.2} />Сгенерировать ещё 4 варианта</button>
                      </aside>
                    </div>
                  </div>

                  {/* 4 variants under */}
                  <div className="sa-variants" aria-label="Варианты карточек">
                    <div className="sa-var v1"><span className="sa-vlab">ИНФО</span><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"><path d={SHIRT} /></svg></div>
                    <div className="sa-var v2"><span className="sa-vlab">PREMIUM</span><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"><path d={SHIRT} /></svg></div>
                    <div className="sa-var v3"><span className="sa-vlab">LIFESTYLE</span><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"><path d={SHIRT} /></svg></div>
                    <div className="sa-var v4"><span className="sa-vlab">НА МОДЕЛИ</span><svg viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"><circle cx="50" cy="22" r="11" /><path d="M50 33 L50 40 M34 52 q16 -14 32 0 L70 86 L60 86 L58 60 M30 86 L40 86 L42 60 M58 86 L60 110 M42 86 L40 110 M34 52 L24 70 M66 52 L76 70" /></svg></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* MARQUEE */}
        <div className="sa-marquee">
          <p
            style={{
              textAlign: "center",
              color: "var(--sa-dim-2)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 22,
            }}
          >
            Тысячи карточек уже в топе выдачи
          </p>
          <div className="sa-mq-track">
            <div className="sa-mq-row r1">
              {mqA.map((d, i) => (
                <MiniCard d={d} key={`a${i}`} />
              ))}
            </div>
          </div>
          <div className="sa-mq-track">
            <div className="sa-mq-row r2">
              {mqB.map((d, i) => (
                <MiniCard d={d} key={`b${i}`} />
              ))}
            </div>
          </div>
        </div>

        {/* PAIN */}
        <section id="pain" className="sa-section">
          <div className="sa-container">
            <div className="sa-sec-head sa-reveal">
              <div className="sa-kicker">Знакомо?</div>
              <h2>Почему карточка не продаёт</h2>
            </div>
            <p className="sa-pain-intro sa-reveal">
              Старый путь — фотограф, дизайнер, маркетолог. Долго, дорого и без гарантий, что клик
              вообще будет.
            </p>
            <div className="sa-grid-4">
              {[
                {
                  i: "💸",
                  h: "Дорого",
                  p: "Дизайнер инфографики — 1 500–5 000 ₽ за карточку. Не зашло — платишь снова.",
                },
                {
                  i: "🐌",
                  h: "Долго",
                  p: "Неделя переписок и правок ради одной обложки. Конкурент за это время сменил фото трижды.",
                },
                {
                  i: "🫥",
                  h: "Неубедительно",
                  p: "Фон кривой, инфографики нет, текст «на коленке». Кликают редко — покупают ещё реже.",
                },
                {
                  i: "🥈",
                  h: "Не как у топов",
                  p: "Карточка конкурента выглядит дороже — и забирает ваш клик в выдаче.",
                },
              ].map((p, i) => (
                <div className="sa-pain sa-reveal" key={i}>
                  <div className="sa-pi">{p.i}</div>
                  <h3>{p.h}</h3>
                  <p>{p.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="sa-section">
          <div className="sa-container">
            <div className="sa-sec-head sa-reveal">
              <div className="sa-kicker">Как это работает</div>
              <h2>Три шага вместо недели согласований</h2>
              <p>Без брифа, дизайнеров и переписок. Только вы, фото товара и Stock AI.</p>
            </div>
            <div className="sa-steps">
              <div className="sa-step sa-reveal">
                <div className="sa-num">1</div>
                <h3>Загрузите фото товара</h3>
                <p>Подойдёт любое чёткое фото — даже с телефона. Остальное Stock AI берёт на себя.</p>
                <div className="sa-tags">
                  <span className="sa-tag">JPG / PNG</span>
                  <span className="sa-tag">фон не важен</span>
                </div>
              </div>
              <div className="sa-step sa-reveal">
                <div className="sa-num">2</div>
                <h3>Выберите тип и опишите товар</h3>
                <p>
                  Инфографика, мемная, элитная или с примеркой на модели. Опишите товар сами — или
                  пусть Stock AI напишет тексты и УТП.
                </p>
                <div className="sa-tags">
                  <span className="sa-tag">Фон и подложка</span>
                  <span className="sa-tag">Тексты и USP</span>
                  <span className="sa-tag">Инфографика</span>
                </div>
              </div>
              <div className="sa-step sa-reveal">
                <div className="sa-soon">Видео — скоро</div>
                <div className="sa-num">3</div>
                <h3>Получите 4 варианта</h3>
                <p>Готовые к загрузке на маркетплейс в нужных размерах. Меньше чем за 5 минут.</p>
                <div className="sa-tags">
                  <span className="sa-tag">Готово к WB и Ozon</span>
                  <span className="sa-tag">4 версии на тест</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TOP OF SEARCH */}
        <section id="top" className="sa-section">
          <div className="sa-container">
            <div className="sa-top-grid">
              <div className="sa-top-copy sa-reveal">
                <div
                  className="sa-kicker"
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "var(--sa-accent)",
                    marginBottom: 14,
                  }}
                >
                  Топ выдачи
                </div>
                <h2>
                  Созданы, чтобы попадать в <span className="sa-grad">топ</span>
                </h2>
                <p>
                  Сильная обложка, понятная инфографика и SEO-текст поднимают карточку выше в поиске
                  — туда, где больше показов, кликов и заказов. Stock AI собирает карточку именно
                  под алгоритмы площадок.
                </p>
                <ul className="sa-checklist">
                  <li>
                    <span className="sa-ck">✓</span>Обложка, по которой кликают чаще конкурентов
                  </li>
                  <li>
                    <span className="sa-ck">✓</span>Заголовок и описание под поисковые запросы
                  </li>
                  <li>
                    <span className="sa-ck">✓</span>4 варианта, чтобы протестировать и выбрать топ
                  </li>
                </ul>
              </div>
              <div className="sa-serp sa-reveal">
                <div className="sa-bar">
                  <span className="sa-mag">⌕</span> рубашка женская оверсайз
                </div>
                <div className="sa-serp-cards">
                  <div className="sa-sc sa-win">
                    <span className="sa-top1">ТОП-1 · ВЫ</span>
                    <div className="sa-scph">
                      <div className="sa-sct">РУБАШКА</div>
                      <svg
                        viewBox="0 0 100 100"
                        fill="none"
                        stroke="#d9442f"
                        strokeWidth="3"
                        strokeLinejoin="round"
                      >
                        <path d={SHIRT} />
                      </svg>
                    </div>
                    <div className="sa-scf">★ 4.9 · 2 480 заказов</div>
                  </div>
                  {[
                    { r: "★ 4.4 · 310" },
                    { r: "★ 4.1 · 96" },
                    { r: "★ 4.3 · 142" },
                    { r: "★ 3.9 · 51" },
                    { r: "★ 4.0 · 88" },
                  ].map((x, i) => (
                    <div className="sa-sc" key={i}>
                      <div className="sa-scph">
                        <svg
                          viewBox="0 0 100 100"
                          fill="none"
                          stroke="#b3a99d"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        >
                          <path d={SHIRT} />
                        </svg>
                      </div>
                      <div className="sa-scf">{x.r}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TYPES */}
        <section id="types" className="sa-section">
          <div className="sa-container">
            <div className="sa-sec-head sa-reveal">
              <div className="sa-kicker">Типы карточек</div>
              <h2>Любой стиль под вашу нишу</h2>
              <p>От строгой инфографики до мемов и люкса — Stock AI подбирает подачу под товар и аудиторию.</p>
            </div>
            <div className="sa-types">
              <div className="sa-type sa-reveal">
                <div className="sa-tp info">
                  <span className="sa-lab">ИНФОГРАФИКА</span>
                  <div className="sa-ttl" style={{ top: "14%", fontSize: 18 }}>
                    РУБАШКА
                  </div>
                  <div className="sa-pills" style={{ top: "34%" }}>
                    <span className="sa-pill">хлопок</span>
                    <span className="sa-pill">42–54</span>
                  </div>
                  <svg viewBox="0 0 100 100" fill="none" stroke="#d9442f" strokeWidth="3" strokeLinejoin="round">
                    <path d={SHIRT} />
                  </svg>
                </div>
                <div className="sa-cap">
                  <h3>Инфографика</h3>
                  <p>Чёткие УТП, размеры и преимущества — как у топовых селлеров.</p>
                </div>
              </div>
              <div className="sa-type sa-reveal">
                <div className="sa-tp meme">
                  <span className="sa-lab">МЕМ</span>
                  <svg viewBox="0 0 100 100" fill="none" stroke="#1a120c" strokeWidth="3">
                    <circle cx="50" cy="44" r="22" />
                    <circle cx="42" cy="40" r="3" fill="#1a120c" stroke="none" />
                    <circle cx="58" cy="40" r="3" fill="#1a120c" stroke="none" />
                    <path d="M38 52 q12 12 24 0" />
                  </svg>
                  <div className="sa-memeword">КУПИЛ — НЕ ПОЖАЛЕЛ</div>
                </div>
                <div className="sa-cap">
                  <h3>Мемные</h3>
                  <p>Цепляют внимание в ленте и выделяются в выдаче среди скучных карточек.</p>
                </div>
              </div>
              <div className="sa-type sa-reveal">
                <div className="sa-tp elite">
                  <div className="sa-eframe" />
                  <span className="sa-lab">PREMIUM</span>
                  <svg viewBox="0 0 100 100" fill="none" stroke="#bd8b3c" strokeWidth="2.4" strokeLinejoin="round">
                    <rect x="34" y="20" width="32" height="13" rx="3" />
                    <rect x="30" y="33" width="40" height="32" rx="9" />
                    <rect x="34" y="65" width="32" height="13" rx="3" />
                    <circle cx="50" cy="49" r="9" />
                  </svg>
                  <div className="sa-eliteword">LUXURY</div>
                </div>
                <div className="sa-cap">
                  <h3>Элитные</h3>
                  <p>Премиальный минимализм с акцентами для дорогих товаров и брендов.</p>
                </div>
              </div>
              <div className="sa-type sa-reveal">
                <div className="sa-tp model">
                  <span className="sa-lab">НА МОДЕЛИ</span>
                  <svg
                    viewBox="0 0 100 120"
                    fill="none"
                    stroke="#d6557d"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  >
                    <circle cx="50" cy="22" r="11" />
                    <path d="M50 33 L50 40" />
                    <path
                      d="M34 52 q16 -14 32 0 L70 86 L60 86 L58 60 M30 86 L40 86 L42 60"
                      fill="rgba(255,45,104,.10)"
                    />
                    <path d="M58 86 L60 110 M42 86 L40 110" />
                    <path d="M34 52 L24 70 M66 52 L76 70" />
                  </svg>
                </div>
                <div className="sa-cap">
                  <h3>Примерка на модели</h3>
                  <p>Одежда на ИИ-модели — без съёмки, фотографа и студии.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXAMPLES */}
        <section id="examples" className="sa-section">
          <div className="sa-container">
            <div className="sa-sec-head sa-reveal">
              <div className="sa-kicker">Примеры</div>
              <h2>Карточки уровня топ-1 в любой категории</h2>
              <p>Заготовки схематичные — позже подставим реальные карточки ваших товаров.</p>
            </div>
            <div className="sa-examples">
              {CARDS.slice(0, 8).map((d, i) => (
                <div className="sa-ex sa-reveal" key={i}>
                  <MiniCard d={d} big />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="sa-section">
          <div className="sa-container">
            <div className="sa-sec-head sa-reveal">
              <div className="sa-kicker">Возможности</div>
              <h2>Всё для карточки — в одном окне</h2>
            </div>
            <div className="sa-grid-3">
              {[
                { i: "✦", h: "Премиум-инфографика", p: "Иконки, УТП, размеры и преимущества — как у топовых селлеров в вашей нише." },
                { i: "⎙", h: "Чистый фон за секунды", p: "Аккуратное вырезание товара и стильная подложка без графического редактора." },
                { i: "✎", h: "Продающие тексты", p: "Заголовки и описания под вашу категорию — или впишите свои, Stock AI красиво разложит." },
                { i: "👗", h: "Примерка на модели", p: "Покажите одежду на ИИ-модели — реалистично и без фотосессии." },
                { i: "►", h: "Видео-карточки", p: "Оживите товар короткими роликами под главную и Reels — без съёмки.", soon: true },
                { i: "▢", h: "Под все площадки", p: "Готовые размеры для Wildberries, Ozon, Яндекс Маркета и Авито — без ручной подгонки." },
              ].map((f, i) => (
                <div className="sa-feat sa-reveal" key={i}>
                  <div className="sa-fi">{f.i}</div>
                  <h3>
                    {f.h}
                    {f.soon && (
                      <span className="sa-tag" style={{ marginLeft: 6 }}>
                        скоро
                      </span>
                    )}
                  </h3>
                  <p>{f.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section id="compare" className="sa-section">
          <div className="sa-container">
            <div className="sa-sec-head sa-reveal">
              <div className="sa-kicker">Сравнение</div>
              <h2>Почему Stock AI, а не дизайнер</h2>
            </div>
            <div className="sa-cmp-wrap sa-reveal">
              <table className="sa-cmp">
                <thead>
                  <tr>
                    <th>Что нужно селлеру</th>
                    <th>Дизайнер / фрилансер</th>
                    <th>Шаблонные редакторы</th>
                    <th className="us">Stock AI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Цена за карточку</td>
                    <td>1 500–5 000 ₽</td>
                    <td>от 500 ₽</td>
                    <td className="us">от 0 ₽</td>
                  </tr>
                  <tr>
                    <td>Срок</td>
                    <td>3–7 дней</td>
                    <td>1–2 часа вручную</td>
                    <td className="us">&lt; 5 минут</td>
                  </tr>
                  <tr>
                    <td>Премиум-инфографика</td>
                    <td className="sa-v">да</td>
                    <td className="sa-x">шаблоны</td>
                    <td className="us sa-v">да, под нишу</td>
                  </tr>
                  <tr>
                    <td>Мемные / элитные стили</td>
                    <td className="sa-x">отдельно</td>
                    <td className="sa-x">нет</td>
                    <td className="us sa-v">в один клик</td>
                  </tr>
                  <tr>
                    <td>Примерка на модели</td>
                    <td className="sa-x">фотосессия</td>
                    <td className="sa-x">нет</td>
                    <td className="us sa-v">ИИ-модель</td>
                  </tr>
                  <tr>
                    <td>Варианты для теста</td>
                    <td className="sa-x">+ оплата</td>
                    <td className="sa-x">вручную</td>
                    <td className="us sa-v">4 сразу</td>
                  </tr>
                  <tr>
                    <td>Размеры под все площадки</td>
                    <td className="sa-x">вручную</td>
                    <td className="sa-x">частично</td>
                    <td className="us sa-v">автоматически</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* BAND */}
        <section className="sa-section">
          <div className="sa-container">
            <div className="sa-band sa-reveal">
              <div className="sa-band-in">
                <h2>
                  Stock AI — выбор <span className="sa-grad">№1</span> у селлеров
                </h2>
                <div className="sa-band-stats">
                  <div className="sa-bs">
                    <b>
                      <span className="sa-count" data-target="47" data-suffix="%">
                        0
                      </span>
                    </b>
                    <span>средний рост CTR карточки</span>
                  </div>
                  <div className="sa-bs">
                    <b>
                      <span className="sa-count" data-target="10000" data-suffix="+">
                        0
                      </span>
                    </b>
                    <span>созданных карточек</span>
                  </div>
                  <div className="sa-bs">
                    <b>
                      <span className="sa-count" data-target="98" data-suffix="%">
                        0
                      </span>
                    </b>
                    <span>довольны результатом</span>
                  </div>
                  <div className="sa-bs">
                    <b>
                      <span className="sa-lt">до</span>{" "}
                      <span className="sa-count" data-target="5">5</span>
                    </b>
                    <span>минут на карточку</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALCULATOR */}
        <section id="calc" className="sa-section">
          <div className="sa-container">
            <div className="sa-calc sa-reveal">
              <div>
                <h3>Сколько вы переплачиваете дизайнеру</h3>
                <p style={{ color: "var(--sa-dim)", marginBottom: 24 }}>
                  Прикиньте экономию за месяц на ваших объёмах.
                </p>
                <div className="sa-ci">
                  <div className="sa-rowv">
                    <label>Карточек в месяц</label>
                    <b>{cards}</b>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={cards}
                    onChange={(e) => setCards(Number(e.target.value))}
                  />
                </div>
                <div className="sa-ci">
                  <div className="sa-rowv">
                    <label>Цена за карточку у дизайнера</label>
                    <b>{fmtRu(price)}</b>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={100}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="sa-calc-out">
                <div className="sa-line">
                  <span>У дизайнера в месяц</span>
                  <b>{fmtRu(designer)}</b>
                </div>
                <div className="sa-line">
                  <span>На Stock AI (тариф «Бейсик»)</span>
                  <b style={{ color: "var(--sa-accent)" }}>1 990 ₽</b>
                </div>
                <div className="sa-save">
                  <div className="sa-big">{fmtRu(saved)}</div>
                  <small>экономии в месяц со Stock AI</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="sa-section">
          <div className="sa-container">
            <div className="sa-sec-head sa-reveal">
              <div className="sa-kicker">Тарифы</div>
              <h2>Начните бесплатно — платите, когда зайдёт</h2>
              <p>Можно стартовать без оплаты. Лимиты растут вместе с вашим магазином.</p>
            </div>
            <div className="sa-plans">
              <div className="sa-plan sa-reveal">
                <h3>Бесплатно</h3>
                <div className="sa-price">0 ₽</div>
                <div className="sa-ptag">чтобы попробовать</div>
                <ul>
                  <li><span className="sa-ck">✓</span>Базовая карточка</li>
                  <li><span className="sa-ck">✓</span>Своё изображение и фон</li>
                  <li><span className="sa-ck">✓</span>Несколько карточек в месяц</li>
                </ul>
                <a href="#" className="sa-btn sa-btn-ghost">Начать</a>
              </div>
              <div className="sa-plan sa-reveal">
                <h3>Бейсик</h3>
                <div className="sa-price">1 990<small> ₽/мес</small></div>
                <div className="sa-ptag">для первых продаж</div>
                <ul>
                  <li><span className="sa-ck">✓</span>До 30 карточек в месяц</li>
                  <li><span className="sa-ck">✓</span>Премиум-инфографика</li>
                  <li><span className="sa-ck">✓</span>Продающие тексты и УТП</li>
                  <li><span className="sa-ck">✓</span>SEO-описание под WB / Ozon</li>
                </ul>
                <a href="#" className="sa-btn sa-btn-ghost">Выбрать</a>
              </div>
              <div className="sa-plan sa-reveal">
                <h3>Стандарт</h3>
                <div className="sa-price">2 990<small> ₽/мес</small></div>
                <div className="sa-ptag">для роста магазина</div>
                <ul>
                  <li><span className="sa-ck">✓</span>До 100 карточек в месяц</li>
                  <li><span className="sa-ck">✓</span>Все типы: мем / элит / инфографика</li>
                  <li><span className="sa-ck">✓</span>4 варианта на A/B-тест</li>
                  <li><span className="sa-ck">✓</span>До 5 видео-карточек</li>
                  <li><span className="sa-ck">✓</span>Приоритетная генерация</li>
                </ul>
                <a href="#" className="sa-btn sa-btn-ghost">Выбрать</a>
              </div>
              <div className="sa-plan sa-best sa-reveal">
                <span className="sa-ribbon">Топ</span>
                <h3>Топ</h3>
                <div className="sa-price">4 990<small> ₽/мес</small></div>
                <div className="sa-ptag">всё для выручки в топ-1</div>
                <ul>
                  <li><span className="sa-ck">✓</span>Всё из Стандарта</li>
                  <li><span className="sa-ck">✓</span><b>Примерка на AI-моделях</b></li>
                  <li><span className="sa-ck">✓</span><b>Анализ ниши</b> и конкурентов по API</li>
                  <li><span className="sa-ck">✓</span><b>Контент-план</b> для карточек под нишу</li>
                  <li><span className="sa-ck">✓</span>Текущие и будущие <b>акции</b> WB / Ozon / Я.Маркет — в каких участвовать</li>
                  <li><span className="sa-ck">✓</span>Сценарий «как сделать топ выручки» — что улучшить в карточке</li>
                  <li><span className="sa-ck">✓</span>До <b>50 000</b> карточек в месяц по всем маркетплейсам</li>
                  <li><span className="sa-ck">✓</span>API-интеграция отдельно с WB · Ozon · Я.Маркет · Мегамаркет</li>
                </ul>
                <a href="#" className="sa-btn sa-btn-primary">Выбрать Топ</a>
              </div>
            </div>
            <div className="sa-corp sa-reveal">
              <div className="sa-ct">
                <h3>Конструктор · Публикатор · Анализатор — отдельный тариф</h3>
                <p>Визуальный конструктор карточек, автопубликация на маркетплейсы и сквозная аналитика продаж. Сейчас в демо — попробуйте интерфейс уже сегодня.</p>
              </div>
              <Link to="/studio" className="sa-btn sa-btn-ghost">Открыть демо →</Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="sa-section">
          <div className="sa-container">
            <div className="sa-sec-head sa-reveal">
              <div className="sa-kicker">FAQ</div>
              <h2>Частые вопросы</h2>
            </div>
            <div className="sa-faq">
              {faqs.map((f, i) => {
                const open = openQ === i;
                return (
                  <div className={`sa-q sa-reveal ${open ? "sa-open" : ""}`} key={i}>
                    <button onClick={() => setOpenQ(open ? null : i)} aria-expanded={open}>
                      {f.q}
                      <span className="sa-pls">+</span>
                    </button>
                    <div
                      className="sa-ans"
                      ref={(el) => {
                        ansRefs.current[i] = el;
                      }}
                      style={{
                        maxHeight: open ? `${ansRefs.current[i]?.scrollHeight || 200}px` : 0,
                      }}
                    >
                      <p>{f.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL */}
        <section className="sa-section">
          <div className="sa-final sa-reveal">
            <h2>
              Попробуйте собрать первую карточку <span className="sa-grad">бесплатно</span>
            </h2>
            <p>Проверьте, как ваш товар может выглядеть на уровне топовых продавцов.</p>
            <a href="#pricing" className="sa-btn sa-btn-primary">
              Создать карточку бесплатно →
            </a>
          </div>
        </section>

        <footer className="sa-footer">
          <div className="sa-container">
            <div className="sa-fcols">
              <div className="sa-about">
                <a href="#" className="sa-logo">
                  <span className="sa-mark">S</span>
                  Stock<span style={{ color: "var(--sa-accent)" }}>&nbsp;AI</span>
                </a>
                <p>
                  Нейросеть для карточек на маркетплейсах: фон, инфографика, мемы, элит, примерка
                  на модели и видео — за минуты, без дизайнера.
                </p>
              </div>
              <div className="sa-fcol">
                <h4>Продукт</h4>
                <a href="#how">Как работает</a>
                <a href="#types">Типы карточек</a>
                <a href="#pricing">Тарифы</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className="sa-fcol">
                <h4>Аккаунт</h4>
                <a href="#">Войти</a>
                <a href="#">Регистрация</a>
              </div>
              <div className="sa-fcol">
                <h4>Связь</h4>
                <a href="#">Telegram</a>
                <a href="#">Поддержка</a>
              </div>
            </div>
            <div className="sa-fbottom">© 2026 Stock AI · Сервис создания карточек для маркетплейсов</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
