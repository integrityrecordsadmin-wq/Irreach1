import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Music, Play, Pause, ShoppingCart, BookOpen, CalendarDays, Heart,
  Share2, Check, X, Lock, CreditCard, Sparkles, Download, Star,
  ShieldCheck, PenLine, Sunrise, Quote, ChevronRight, Menu, Trash2,
  Copy, Link as LinkIcon, User,
} from "lucide-react";import GospelConnection from "./GospelConnection";
import GospelConnectionDoor from "./GospelConnectionDoor";

/* =========================================================================
   AUDIO SOURCE CONFIG
   -------------------------------------------------------------------------
   These point to real files in /public/audio, served normally by whatever
   host this app is deployed to (Vercel, Netlify, etc). This works reliably
   once deployed -- unlike a chat preview sandbox, real hosting serves and
   plays static files with no restrictions.
   ========================================================================= */
const AUDIO_FILES = [
  "/audio/take4.mp3",
  "/audio/take6.mp3",
  "/audio/take8.mp3",
  "/audio/take9.mp3",
  "/audio/take10.mp3",
  "/audio/take11.mp3",
  "/audio/take13.mp3",
  "/audio/original.mp3",
];

function toDirectLink(url) {
  if (!url) return "";
  if (url.includes("dropbox.com")) {
    return url.replace("dl=0", "raw=1").replace("?dl=1", "?raw=1");
  }
  return url;
}

/* =========================================================================
   CATALOG DATA
   -------------------------------------------------------------------------
   Each recording is a different artist's take on "Truly Amazing." `artist`
   and `photoUrl` are still blank because no name or real photo has been
   provided yet — a stock photo of a stranger would misrepresent who
   actually sang it, so avatars below are generic (icon + color) and
   labeled with the gender/culture info given, rather than a fabricated
   photo. Swap in `artist` and `photoUrl` any time you have real ones.
   ========================================================================= */
const SONG = "Truly Amazing";

const TRACKS = [
  { take: "Take 4",   artist: "", photoUrl: "", gender: "Male",   culture: "White",    favorite: false },
  { take: "Take 6",   artist: "", photoUrl: "", gender: "Male",   culture: "White",    favorite: false },
  { take: "Take 8",   artist: "", photoUrl: "", gender: "Male",   culture: "Hispanic", favorite: false },
  { take: "Take 9",   artist: "", photoUrl: "", gender: "Female", culture: "White",    favorite: true },
  { take: "Take 10",  artist: "", photoUrl: "", gender: "Male",   culture: "Black",    favorite: true },
  { take: "Take 11",  artist: "", photoUrl: "", gender: "Male",   culture: "Black",    favorite: true },
  { take: "Take 13",  artist: "", photoUrl: "", gender: "Male",   culture: "White",    favorite: false },
  { take: "Original", artist: "", photoUrl: "", gender: "Female", culture: "White",    favorite: false },
];

const AVATAR_HUES = ["#C9A24B", "#7A2E2E", "#3B6E71", "#5A5B8C", "#9A6B3F", "#4C7A5D", "#8C4B6B", "#6B7A99"];

const RINGTONES = TRACKS.map((t, i) => ({
  id: `rt-${i}`,
  title: t.artist ? `${SONG} — ${t.artist}` : `${SONG} (${t.take})`,
  artist: t.artist || "Artist name pending",
  photoUrl: t.photoUrl,
  gender: t.gender,
  culture: t.culture,
  demographic: t.gender && t.culture ? `${t.culture} ${t.gender.toLowerCase()} vocalist` : "",
  favorite: t.favorite,
  hue: AVATAR_HUES[i % AVATAR_HUES.length],
  price: 2.0,
  url: toDirectLink(AUDIO_FILES[i]),
}));

const EBOOK = {downloadUrl: "/integrity-records-music-contract-guide.pdf",
  id: "ebook-contract",
  type: "ebook",
  title: "What to Look Out For Before Signing a Music Contract",
  blurb: "A plain-language guide to the clauses that quietly cost artists their masters, their royalties, and their voice — written so you can walk into any room and read the fine print yourself.",
  price: 8.99,
};

const PLANNER = {downloadUrl: "/integrity-records-daily-planner.pdf",
  id: "planner-daily",
  type: "planner",
  title: "Daily Planner for the Working Artist",
  blurb: "A structured daily planner built around writing sessions, releases, and rest — so your career has a rhythm instead of just a rush.",
  price: 12.99,
};

const PLANS = {
  monthly: { id: "sub-monthly", label: "Monthly", price: 4.99, cadence: "/month" },
  yearly: { id: "sub-yearly", label: "Yearly", price: 49.99, cadence: "/year" },
};

const PERKS = [
  "Download all 8 versions of every released song",
  `"${EBOOK.title}" included at no extra cost`,
  "Early access to new releases from Integrity Records artists",
  "Cancel any time — no contracts, no fine print",
];

const DEVOTIONALS = [
  { verse: "Create in me a clean heart, O God, and renew a right spirit within me.", ref: "Psalm 51:10", prompt: "What would it look like to write music today from a clean, unhurried heart?" },
  { verse: "Whatever you do, work heartily, as for the Lord and not for men.", ref: "Colossians 3:23", prompt: "Where in your music career have you been working for approval instead of for the Lord?" },
  { verse: "The Lord is near to the brokenhearted and saves the crushed in spirit.", ref: "Psalm 34:18", prompt: "Bring today's disappointments honestly before God before you bring them anywhere else." },
  { verse: "Let all that you do be done in love.", ref: "1 Corinthians 16:14", prompt: "Is there a business decision today that needs more love and less leverage?" },
  { verse: "Trust in the Lord with all your heart, and do not lean on your own understanding.", ref: "Proverbs 3:5", prompt: "What part of your career are you gripping too tightly right now?" },
  { verse: "He has made everything beautiful in its time.", ref: "Ecclesiastes 3:11", prompt: "Where do you need to trust God's timing instead of the industry's timeline?" },
  { verse: "Sing to him a new song; play skillfully on the strings, with loud shouts.", ref: "Psalm 33:3", prompt: "What's one new thing — a lyric, a chord, a habit — worth trying today?" },
  { verse: "Guard your heart above all else, for it determines the course of your life.", ref: "Proverbs 4:23", prompt: "Who or what has access to your heart right now that shouldn't?" },
];

function dayIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / 86400000);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function money(n) {
  return `$${n.toFixed(2)}`;
}

/* =========================================================================
   GLOBAL STYLE / FONTS
   ========================================================================= */
const COLORS = {
  ink: "#14161F",
  panel: "#1D2130",
  panelLight: "#262B3D",
  parchment: "#F1E9D8",
  offwhite: "#EDE7DA",
  brass: "#C9A24B",
  brassDim: "#8f7233",
  oxblood: "#7A2E2E",
  line: "#33384B",
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
      .ir-display { font-family: 'Fraunces', serif; }
      .ir-body { font-family: 'Inter', sans-serif; }
      .ir-mono { font-family: 'JetBrains Mono', monospace; }
      .ir-fade-in { animation: irFadeIn 0.5s ease both; }
      @keyframes irFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .ir-bar { display:inline-block; width:3px; margin-right:2px; background:${COLORS.brass}; border-radius:1px; animation: irBar 0.9s ease-in-out infinite; }
      @keyframes irBar { 0%,100% { height:4px; } 50% { height:16px; } }
      .ir-seal { border: 1.5px solid ${COLORS.brass}; }
      ::selection { background: ${COLORS.brass}; color: ${COLORS.ink}; }
    `}</style>
  );
}

/* =========================================================================
   SMALL SHARED COMPONENTS
   ========================================================================= */
function Seal({ size = 64 }) {
  return (
    <div
      className="ir-seal rounded-full flex flex-col items-center justify-center text-center shrink-0"
      style={{ width: size, height: size, color: COLORS.brass }}
    >
      <ShieldCheck size={size * 0.34} />
      <span className="ir-mono" style={{ fontSize: size * 0.11, letterSpacing: 0.5, marginTop: 2 }}>
        PROTECTED
      </span>
    </div>
  );
}

function LedgerRow({ label, value, dim }) {
  return (
    <div className="flex items-end gap-2 py-1.5" style={{ borderBottom: `1px dashed ${COLORS.line}` }}>
      <span className="ir-body text-sm" style={{ color: dim ? "#9aa0b4" : COLORS.offwhite }}>{label}</span>
      <span className="flex-1 border-b border-dotted" style={{ borderColor: COLORS.line, marginBottom: 4 }} />
      <span className="ir-mono text-sm font-medium" style={{ color: COLORS.brass }}>{value}</span>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span
      className="ir-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded"
      style={{ background: COLORS.panelLight, color: COLORS.brass, border: `1px solid ${COLORS.line}` }}
    >
      {children}
    </span>
  );
}

function Button({ children, onClick, variant = "primary", className = "", disabled }) {
  const base = "ir-body inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none";
  const styles = {
    primary: { background: COLORS.brass, color: COLORS.ink },
    ghost: { background: "transparent", color: COLORS.offwhite, border: `1px solid ${COLORS.line}` },
    danger: { background: "transparent", color: "#e08a8a", border: `1px solid #4a2a2a` },
  };
  return (
    <button className={`${base} ${className}`} style={styles[variant]} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

/* =========================================================================
   AUDIO PLAYER (single shared <audio>, waveform on the playing row)
   ========================================================================= */
function useAudioPlayer() {
  const audioRef = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const onTime = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnd = () => setPlayingId(null);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = useCallback((track) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!track.url) return;
    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }
    audio.src = track.url;
    audio.play().catch(() => {});
    setPlayingId(track.id);
  }, [playingId]);

  return { playingId, progress, duration, toggle };
}

function Waveform() {
  return (
    <span className="inline-flex items-end h-4">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="ir-bar" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </span>
  );
}

/* =========================================================================
   PERSISTENT STORAGE HELPERS (personal, per-browser)
   ========================================================================= */
async function loadLibrary() {
  try {
    const res = await window.storage.get("ir:library", false);
    return res ? JSON.parse(res.value) : { ringtones: [], ebook: false, planner: false, subscription: null };
  } catch {
    return { ringtones: [], ebook: false, planner: false, subscription: null };
  }
}
async function saveLibrary(lib) {
  try { await window.storage.set("ir:library", JSON.stringify(lib), false); } catch {}
}
async function loadJournal(key) {
  try {
    const res = await window.storage.get(`ir:journal:${key}`, false);
    return res ? JSON.parse(res.value) : { prayer: false, worship: false, entry: "" };
  } catch {
    return { prayer: false, worship: false, entry: "" };
  }
}
async function saveJournalEntry(key, data) {
  try { await window.storage.set(`ir:journal:${key}`, JSON.stringify(data), false); } catch {}
}

/* =========================================================================
   PAGES
   ========================================================================= */
function Home({ go }) {
  return (
    <div className="ir-fade-in space-y-14 pb-10">
      <section className="pt-6 md:pt-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <Pill>Artist workspace</Pill>
            <h1 className="ir-display mt-4 text-4xl md:text-5xl leading-tight" style={{ color: COLORS.parchment }}>
              Integrity Records was born from watching artists get taken advantage of.
            </h1>
            <p className="ir-body mt-5 text-base leading-relaxed" style={{ color: "#b7bccc" }}>
              Greed and dishonesty pushed talented Christian artists out of rooms they belonged in.
              This label exists to do the opposite: fair pricing, no hidden fine print, and music
              that leads people back to God.
            </p>
            <div className="mt-7 flex gap-3 flex-wrap">
              <Button onClick={() => go("ringtones")}><Music size={16}/> Hear the ringtones</Button>
              <Button variant="ghost" onClick={() => go("subscription")}>See subscription perks</Button>
            </div>
          </div>
          <Seal size={92} />
        </div>
      </section><div className="mt-10"><GospelConnectionDoor onEnter={() => go("gospel-connection")} /></div>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          { icon: <Music size={18} />, label: "8 ringtones", desc: `Eight artists, one song — "${SONG}." $2 each.` , page: "ringtones"},
          { icon: <BookOpen size={18} />, label: "Digital products", desc: "The contract guide and the daily planner.", page: "shop" },
          { icon: <CalendarDays size={18} />, label: "Daily Journey", desc: "Prayer, worship, then your journal — every day.", page: "journal" },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => go(c.page)}
            className="text-left rounded-lg p-5 transition-colors hover:brightness-110"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}
          >
            <div style={{ color: COLORS.brass }}>{c.icon}</div>
            <div className="ir-display text-lg mt-3" style={{ color: COLORS.parchment }}>{c.label}</div>
            <div className="ir-body text-sm mt-1" style={{ color: "#9aa0b4" }}>{c.desc}</div>
            <div className="mt-3 flex items-center gap-1 text-xs ir-mono" style={{ color: COLORS.brass }}>
              Open <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </section>

      <section className="rounded-lg p-6" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-2 mb-3" style={{ color: COLORS.brass }}>
          <Quote size={16} />
          <span className="ir-mono text-xs uppercase tracking-wider">Today's word</span>
        </div>
        <p className="ir-display text-xl" style={{ color: COLORS.parchment }}>
          "{DEVOTIONALS[dayIndex() % DEVOTIONALS.length].verse}"
        </p>
        <p className="ir-mono text-xs mt-2" style={{ color: "#9aa0b4" }}>
          {DEVOTIONALS[dayIndex() % DEVOTIONALS.length].ref}
        </p>
      </section>
    </div>
  );
}

function Ringtones({ player, cart, addToCart, library }) {
  const { playingId, progress, duration, toggle } = player;
  const missingLinks = RINGTONES.every((r) => !r.url);

  return (
    <div className="ir-fade-in space-y-6 pb-10">
      <div>
        <h2 className="ir-display text-3xl" style={{ color: COLORS.parchment }}>Ringtones</h2>
        <p className="ir-body text-sm mt-1" style={{ color: "#9aa0b4" }}>
          {SONG} — eight artists, eight takes. $2.00 each, one-time payment.
        </p>
      </div>

      {RINGTONES.some((r) => r.artist === "Artist name pending") && (
        <div className="rounded-md p-4 text-sm ir-body flex gap-3" style={{ background: "#241f14", border: `1px solid #4a3d1f`, color: "#e0cf9d" }}>
          <Lock size={16} className="shrink-0 mt-0.5" />
          <span>
            All 8 tracks are connected and playable. Names and real photos aren't in yet, so avatars
            show a colored icon labeled with the vocalist's gender and background instead. Tell me
            each artist's name (and a real photo, if you have one) and I'll swap it in.
          </span>
        </div>
      )}

      <div className="rounded-md p-4 text-sm ir-body flex items-start gap-3" style={{ background: "#1c2a20", border: `1px solid #2f4a37`, color: "#c9e0d0" }}>
        <Star size={16} className="shrink-0 mt-0.5" style={{ color: COLORS.brass }} />
        <span>
          Fan favorites, marked below: the White female vocalist take is the top pick, with both
          Black male vocalist takes as the runner-up recommendation.
        </span>
      </div>

      <div className="space-y-2">
        {RINGTONES.map((rt, i) => {
          const owned = library.ringtones.includes(rt.id) || library.subscription;
          const inCart = cart.some((c) => c.id === rt.id);
          const isPlaying = playingId === rt.id;
          return (
            <div
              key={rt.id}
              className="flex items-center gap-4 rounded-lg p-3 md:p-4"
              style={{
                background: COLORS.panel,
                border: `1px solid ${rt.favorite ? COLORS.brass : COLORS.line}`,
              }}
            >
              {rt.photoUrl ? (
                <img
                  src={rt.photoUrl}
                  alt={rt.artist}
                  className="shrink-0 w-11 h-11 rounded-full object-cover"
                  style={{ border: `1px solid ${COLORS.line}` }}
                />
              ) : (
                <div
                  className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center relative"
                  style={{ background: rt.hue, opacity: 0.85 }}
                >
                  <User size={18} style={{ color: COLORS.ink }} />
                </div>
              )}

              <button
                onClick={() => toggle(rt)}
                disabled={!rt.url}
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-30"
                style={{ background: COLORS.panelLight, color: COLORS.brass, border: `1px solid ${COLORS.line}` }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="ir-mono text-xs" style={{ color: "#7a8099" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="ir-body text-sm font-medium truncate" style={{ color: COLORS.offwhite }}>{rt.title}</span>
                  {rt.favorite && <Star size={13} style={{ color: COLORS.brass }} fill={COLORS.brass} />}
                  {isPlaying && <Waveform />}
                </div>
                <div className="ir-mono text-[11px] mt-0.5" style={{ color: rt.artist === "Artist name pending" ? "#7a8099" : "#9aa0b4" }}>
                  {rt.artist === "Artist name pending" ? rt.demographic || rt.artist : rt.artist}
                </div>
                {isPlaying && duration > 0 && (
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: COLORS.line }}>
                    <div className="h-full" style={{ width: `${(progress / duration) * 100}%`, background: COLORS.brass }} />
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {owned ? (
                  <a
                    href={rt.url || undefined}
                    download
                    className="ir-mono text-xs px-3 py-2 rounded-md flex items-center gap-1"
                    style={{ color: COLORS.brass, border: `1px solid ${COLORS.line}` }}
                  >
                    <Download size={14} /> Download
                  </a>
                ) : (
                  <Button
                    variant={inCart ? "ghost" : "primary"}
                    onClick={() => addToCart({ id: rt.id, title: rt.title, price: rt.price, type: "ringtone" })}
                  >
                    {inCart ? "In cart" : money(rt.price)}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Subscription({ addToCart, library }) {
  const [plan, setPlan] = useState("monthly");

  return (
    <div className="ir-fade-in space-y-6 pb-10 max-w-3xl">
      <div>
        <h2 className="ir-display text-3xl" style={{ color: COLORS.parchment }}>Subscription</h2>
        <p className="ir-body text-sm mt-1" style={{ color: "#9aa0b4" }}>One fair price. Everything included. Cancel any time.</p>
      </div>

      {library.subscription && (
        <div className="rounded-md p-3 text-sm ir-body flex items-center gap-2" style={{ background: "#1c2a20", border: `1px solid #2f4a37`, color: "#a9e0bb" }}>
          <Check size={16} /> You're subscribed ({library.subscription.label}).
        </div>
      )}

      <div className="flex rounded-md overflow-hidden w-fit" style={{ border: `1px solid ${COLORS.line}` }}>
        {Object.entries(PLANS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setPlan(key)}
            className="ir-mono text-xs uppercase tracking-wider px-4 py-2"
            style={{
              background: plan === key ? COLORS.brass : "transparent",
              color: plan === key ? COLORS.ink : COLORS.offwhite,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg p-6" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-baseline gap-2">
          <span className="ir-display text-4xl" style={{ color: COLORS.parchment }}>{money(PLANS[plan].price)}</span>
          <span className="ir-body text-sm" style={{ color: "#9aa0b4" }}>{PLANS[plan].cadence}</span>
        </div>

        <div className="mt-6 space-y-2">
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-start gap-2">
              <Check size={16} className="mt-0.5 shrink-0" style={{ color: COLORS.brass }} />
              <span className="ir-body text-sm" style={{ color: COLORS.offwhite }}>{perk}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            className="w-full md:w-auto"
            disabled={!!library.subscription}
            onClick={() => addToCart({ id: PLANS[plan].id, title: `Subscription — ${PLANS[plan].label}`, price: PLANS[plan].price, type: "subscription", meta: plan })}
          >
            <CreditCard size={16} /> {library.subscription ? "Already subscribed" : `Subscribe — ${money(PLANS[plan].price)}${PLANS[plan].cadence}`}
          </Button>
        </div>
      </div>

      <p className="ir-mono text-xs" style={{ color: "#7a8099" }}>
        No auto-renew surprises, no hidden processing fees folded into the sticker price.
      </p>
    </div>
  );
}

function Shop({ addToCart, cart, library }) {
  const items = [EBOOK, PLANNER];
  return (
    <div className="ir-fade-in space-y-6 pb-10">
      <div>
        <h2 className="ir-display text-3xl" style={{ color: COLORS.parchment }}>Digital products</h2>
        <p className="ir-body text-sm mt-1" style={{ color: "#9aa0b4" }}>Built for the business side of ministry through music.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => {
          const owned = item.type === "ebook" ? (library.ebook || library.subscription) : library.planner;
          const inCart = cart.some((c) => c.id === item.id);
          return (
            <div key={item.id} className="rounded-lg p-5 flex flex-col" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-start justify-between gap-3">
                <BookOpen size={22} style={{ color: COLORS.brass }} />
                {item.type === "ebook" && <Pill>Included with subscription</Pill>}
              </div>
              <h3 className="ir-display text-xl mt-3" style={{ color: COLORS.parchment }}>{item.title}</h3>
              <p className="ir-body text-sm mt-2 flex-1" style={{ color: "#9aa0b4" }}>{item.blurb}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="ir-mono text-lg" style={{ color: COLORS.brass }}>{money(item.price)}</span>
                {owned ? (
                  <span className="ir-mono text-xs px-3 py-2 rounded-md flex items-center gap-1" style={{ color: "#a9e0bb", border: `1px solid #2f4a37` }}>
                    <Check size={14} /> Owned
                  </span>
                ) : (
                  <Button
                    variant={inCart ? "ghost" : "primary"}
                    onClick={() => addToCart({ id: item.id, title: item.title, price: item.price, type: item.type })}
                  >
                    {inCart ? "In cart" : "Add to cart"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Journal() {
  const [key] = useState(todayKey());
  const [state, setState] = useState({ prayer: false, worship: false, entry: "" });
  const [loaded, setLoaded] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const devotional = DEVOTIONALS[dayIndex() % DEVOTIONALS.length];

  useEffect(() => {
    loadJournal(key).then((d) => { setState(d); setLoaded(true); });
  }, [key]);

  const persist = async (next) => {
    setState(next);
    await saveJournalEntry(key, next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  const shareText = encodeURIComponent(`Day ${dayIndex()} of my music journey with Integrity Records — walking it out one prayer at a time. 🎙️🙏`);
  const shareUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "https://integrityrecords.example");

  const shareLinks = {
    "X / Twitter": `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
    "Facebook": `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    "WhatsApp": `https://wa.me/?text=${shareText}%20${shareUrl}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(decodeURIComponent(shareUrl));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    } catch {}
  };

  if (!loaded) return null;

  return (
    <div className="ir-fade-in space-y-6 pb-10 max-w-2xl">
      <div>
        <h2 className="ir-display text-3xl" style={{ color: COLORS.parchment }}>Daily Journey</h2>
        <p className="ir-body text-sm mt-1" style={{ color: "#9aa0b4" }}>Prayer, then worship, then your journal. In that order.</p>
      </div>

      <div className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.brass }}>
          <span className="ir-mono text-xs">01</span>
          <span className="ir-mono text-xs uppercase tracking-wider">Prayer</span>
        </div>
        <p className="ir-body text-sm mb-3" style={{ color: COLORS.offwhite }}>
          Before anything else, bring your day to God — the sessions, the meetings, the waiting.
        </p>
        <button
          onClick={() => persist({ ...state, prayer: !state.prayer })}
          className="ir-mono text-xs px-3 py-2 rounded-md flex items-center gap-2"
          style={{ color: state.prayer ? "#a9e0bb" : COLORS.offwhite, border: `1px solid ${state.prayer ? "#2f4a37" : COLORS.line}` }}
        >
          {state.prayer ? <Check size={14} /> : null} {state.prayer ? "Prayed today" : "Mark as prayed"}
        </button>
      </div>

      <div className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.brass }}>
          <Sunrise size={14} />
          <span className="ir-mono text-xs uppercase tracking-wider">02 — Worship</span>
        </div>
        <p className="ir-display text-lg" style={{ color: COLORS.parchment }}>"{devotional.verse}"</p>
        <p className="ir-mono text-xs mt-1 mb-3" style={{ color: "#9aa0b4" }}>{devotional.ref}</p>
        <p className="ir-body text-sm mb-3" style={{ color: COLORS.offwhite }}>{devotional.prompt}</p>
        <button
          onClick={() => persist({ ...state, worship: !state.worship })}
          className="ir-mono text-xs px-3 py-2 rounded-md flex items-center gap-2"
          style={{ color: state.worship ? "#a9e0bb" : COLORS.offwhite, border: `1px solid ${state.worship ? "#2f4a37" : COLORS.line}` }}
        >
          {state.worship ? <Check size={14} /> : null} {state.worship ? "Worshiped today" : "Mark as worshiped"}
        </button>
      </div>

      <div className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-2 mb-2" style={{ color: COLORS.brass }}>
          <PenLine size={14} />
          <span className="ir-mono text-xs uppercase tracking-wider">03 — Your music journey</span>
        </div>
        <textarea
          value={state.entry}
          onChange={(e) => setState({ ...state, entry: e.target.value })}
          onBlur={() => persist(state)}
          placeholder="What happened in your music journey today? A session, a setback, a small win worth remembering..."
          rows={6}
          className="ir-body w-full rounded-md p-3 text-sm resize-none outline-none"
          style={{ background: COLORS.ink, color: COLORS.offwhite, border: `1px solid ${COLORS.line}` }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="ir-mono text-xs" style={{ color: savedFlash ? "#a9e0bb" : "#7a8099" }}>
            {savedFlash ? "Saved" : "Saves automatically"}
          </span>
          <Button variant="ghost" onClick={() => persist(state)}>Save entry</Button>
        </div>
      </div>

      <div className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-2 mb-3" style={{ color: COLORS.brass }}>
          <Share2 size={14} />
          <span className="ir-mono text-xs uppercase tracking-wider">Share your journey</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(shareLinks).map(([label, url]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer">
              <Button variant="ghost">{label}</Button>
            </a>
          ))}
          <Button variant="ghost" onClick={copyLink}><Copy size={14} /> Copy link</Button>
        </div>
      </div>
    </div>
  );
}

const CONTACT_EMAIL = "Integrityrecordsadmin@gmail.com";

function About() {
  return (
    <div className="ir-fade-in space-y-8 pb-10 max-w-2xl">
      <div>
        <h2 className="ir-display text-3xl" style={{ color: COLORS.parchment }}>About Integrity Records</h2>
        <p className="ir-body text-sm mt-1" style={{ color: "#9aa0b4" }}>Who we are, what we sell, and how to reach us.</p>
      </div>

      <section className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <h3 className="ir-display text-lg mb-2" style={{ color: COLORS.parchment }}>Our story</h3>
        <p className="ir-body text-sm leading-relaxed" style={{ color: COLORS.offwhite }}>
          Integrity Records was born from watching artists get taken advantage of — greed and
          dishonesty pushed talented Christian artists out of rooms they belonged in. We exist to do
          the opposite: fair pricing, no hidden fine print, and music that leads people back to God.
        </p>
      </section>

      <section className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <h3 className="ir-display text-lg mb-3" style={{ color: COLORS.parchment }}>What we sell</h3>
        <div className="space-y-2">
          <LedgerRow label="Ringtones (8 available)" value="$2.00 each, one-time" dim />
          <LedgerRow label="Monthly subscription" value="$4.99/month" dim />
          <LedgerRow label="Yearly subscription" value="$49.99/year" dim />
          <LedgerRow label={EBOOK.title} value={money(EBOOK.price)} dim />
          <LedgerRow label={PLANNER.title} value={money(PLANNER.price)} dim />
        </div>
      </section>

      <section className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <h3 className="ir-display text-lg mb-2" style={{ color: COLORS.parchment }}>Contact us</h3>
        <p className="ir-body text-sm" style={{ color: COLORS.offwhite }}>
          Questions about an order, a subscription, or anything else — reach us at:
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="ir-mono text-sm inline-block mt-2"
          style={{ color: COLORS.brass }}
        >
          {CONTACT_EMAIL}
        </a>
      </section>

      <section className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <h3 className="ir-display text-lg mb-2" style={{ color: COLORS.parchment }}>Refund policy</h3>
        <p className="ir-body text-sm leading-relaxed" style={{ color: COLORS.offwhite }}>
          Digital products (ringtones, ebook, planner) are delivered instantly, so all sales are
          final once downloaded. If a file is corrupted, missing, or otherwise doesn't work as
          described, contact us at the email above within 14 days of purchase for a replacement or
          refund. Subscriptions can be cancelled any time from your account; cancelling stops future
          billing but does not refund the current billing period already paid for.
        </p>
      </section>

      <section className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <h3 className="ir-display text-lg mb-2" style={{ color: COLORS.parchment }}>Terms of service</h3>
        <p className="ir-body text-sm leading-relaxed" style={{ color: COLORS.offwhite }}>
          By purchasing from Integrity Records, you agree that digital products are for personal use
          and may not be resold or redistributed. Subscription plans renew automatically at the
          listed price until cancelled. We reserve the right to update pricing or offerings, with
          notice provided on this site. For any dispute or question, contact us directly at the email
          above before pursuing other action — we'd rather make it right than fight about it.
        </p>
      </section>
    </div>
  );
}

function CartPage({ cart, removeFromCart, openCheckout }) {
  const total = cart.reduce((sum, c) => sum + c.price, 0);
  return (
    <div className="ir-fade-in space-y-6 pb-10 max-w-2xl">
      <h2 className="ir-display text-3xl" style={{ color: COLORS.parchment }}>Your cart</h2>

      {cart.length === 0 ? (
        <div className="rounded-lg p-8 text-center" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
          <ShoppingCart size={28} className="mx-auto mb-3" style={{ color: "#7a8099" }} />
          <p className="ir-body text-sm" style={{ color: "#9aa0b4" }}>Nothing here yet.</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg p-5" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2" style={{ borderBottom: `1px dashed ${COLORS.line}` }}>
                <span className="ir-body text-sm flex-1" style={{ color: COLORS.offwhite }}>{item.title}</span>
                <span className="ir-mono text-sm" style={{ color: COLORS.brass }}>{money(item.price)}</span>
                <button onClick={() => removeFromCart(item.id)} style={{ color: "#e08a8a" }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <span className="ir-body text-sm font-semibold" style={{ color: COLORS.parchment }}>Total</span>
              <span className="ir-mono text-lg" style={{ color: COLORS.brass }}>{money(total)}</span>
            </div>
          </div>
          <Button className="w-full md:w-auto" onClick={openCheckout}>
            <CreditCard size={16} /> Checkout
          </Button>
        </>
      )}
    </div>
  );
}

/* =========================================================================
   STRIPE CONFIG
   -------------------------------------------------------------------------
   A Stripe secret key can never live in this file — it ships to every
   visitor's browser, so anyone could read it and charge things to your
   account. Real payments need a small backend that holds the secret key
   and creates the Checkout Session; this app just calls that backend.

   Once you deploy the backend (see create-checkout-session.js provided
   alongside this file), paste its URL below. Until then, this stays
   empty and checkout runs in demo mode.
   ========================================================================= */
const STRIPE_CHECKOUT_ENDPOINT = "/api/create-checkout-session"; // e.g. "https://your-backend.example.com/create-checkout-session"

/* =========================================================================
   CHECKOUT MODAL
   -------------------------------------------------------------------------
   Demo mode (STRIPE_CHECKOUT_ENDPOINT empty): simulates a successful
   payment locally so the rest of the app can be tested end to end.

   Live mode (endpoint set): posts the cart to your backend, which creates
   a real Stripe Checkout Session and returns its URL. The browser is then
   redirected to Stripe's own hosted checkout page to collect payment.
   ========================================================================= */
function CheckoutModal({ cart, onClose, onComplete }) {
  const [step, setStep] = useState("review");
  const [error, setError] = useState("");
  const total = cart.reduce((sum, c) => sum + c.price, 0);
  const liveMode = Boolean(STRIPE_CHECKOUT_ENDPOINT);

  const pay = async () => {
    if (!liveMode) {
      setStep("processing");
      setTimeout(() => {
        setStep("success");
        onComplete();
      }, 900);
      return;
    }

    setStep("processing");
    setError("");
    try {
      const res = await fetch(STRIPE_CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({ id: c.id, title: c.title, price: c.price, type: c.type })),
        }),
      });
      if (!res.ok) throw new Error("Checkout session request failed");
      const data = await res.json();
      if (!data.url) throw new Error("No checkout URL returned");
      window.location.href = data.url; // hand off to Stripe's hosted checkout page
    } catch (err) {
      setError("Couldn't start checkout. Please try again in a moment.");
      setStep("review");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,11,16,0.7)" }}>
      <div className="w-full max-w-md rounded-lg p-6 ir-fade-in" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="ir-display text-xl" style={{ color: COLORS.parchment }}>Checkout</h3>
          <button onClick={onClose}><X size={18} style={{ color: "#9aa0b4" }} /></button>
        </div>

        {step === "review" && (
          <>
            {!liveMode && (
              <div className="rounded-md p-3 mb-4 text-xs ir-body flex gap-2" style={{ background: "#241f14", border: `1px solid #4a3d1f`, color: "#e0cf9d" }}>
                <Lock size={14} className="shrink-0 mt-0.5" />
                Stripe isn't connected yet — this is demo mode. Set <span className="ir-mono">STRIPE_CHECKOUT_ENDPOINT</span> once
                your backend is deployed, and this button will hand off to real Stripe Checkout instead.
              </div>
            )}
            {error && (
              <div className="rounded-md p-3 mb-4 text-xs ir-body" style={{ background: "#241b1b", border: `1px solid #4a2a2a`, color: "#e0b7b7" }}>
                {error}
              </div>
            )}
            {cart.map((item) => (
              <LedgerRow key={item.id} label={item.title} value={money(item.price)} dim />
            ))}
            <div className="flex items-center justify-between pt-3">
              <span className="ir-body text-sm font-semibold" style={{ color: COLORS.parchment }}>Total due</span>
              <span className="ir-mono text-lg" style={{ color: COLORS.brass }}>{money(total)}</span>
            </div>
            <Button className="w-full mt-5" onClick={pay}>
              <CreditCard size={16} /> {liveMode ? `Pay ${money(total)}` : `Pay ${money(total)} (Demo)`}
            </Button>
          </>
        )}

        {step === "processing" && (
          <div className="py-10 text-center ir-body text-sm" style={{ color: "#9aa0b4" }}>
            {liveMode ? "Connecting to Stripe…" : "Processing payment…"}
          </div>
        )}

        {step === "success" && (
          <div className="py-6 text-center">
            <Check size={32} className="mx-auto mb-3" style={{ color: "#a9e0bb" }} />
            <p className="ir-display text-lg mb-1" style={{ color: COLORS.parchment }}>Payment complete</p>
            <p className="ir-body text-sm mb-5" style={{ color: "#9aa0b4" }}>Your order has been added to your library.</p>
            <Button onClick={onClose}>Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   HEADER / NAV
   ========================================================================= */
function Header({ page, go, cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = [
    { id: "home", label: "Home" },
    { id: "ringtones", label: "Ringtones" },
    { id: "subscription", label: "Subscription" },
    { id: "shop", label: "Shop" },
    { id: "journal", label: "Daily Journey" },
    { id: "about", label: "About" },
  ];
  return (
    <header className="sticky top-0 z-40" style={{ background: COLORS.ink, borderBottom: `1px solid ${COLORS.line}` }}>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <button onClick={() => go("home")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1.5px solid ${COLORS.brass}` }}>
            <Music size={15} style={{ color: COLORS.brass }} />
          </div>
          <div className="text-left leading-none">
            <div className="ir-display text-base" style={{ color: COLORS.parchment }}>Integrity Records</div>
            <div className="ir-mono text-[10px] tracking-wider" style={{ color: "#7a8099" }}>ARTIST WORKSPACE</div>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              className="ir-body text-sm px-3 py-2 rounded-md"
              style={{ color: page === t.id ? COLORS.brass : "#9aa0b4", background: page === t.id ? COLORS.panelLight : "transparent" }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => go("cart")} className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }}>
            <ShoppingCart size={16} style={{ color: COLORS.offwhite }} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center ir-mono" style={{ background: COLORS.brass, color: COLORS.ink }}>
                {cartCount}
              </span>
            )}
          </button>
          <button className="md:hidden w-10 h-10 rounded-full flex items-center justify-center" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}` }} onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={16} style={{ color: COLORS.offwhite }} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="md:hidden px-4 pb-4 flex flex-col gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { go(t.id); setMenuOpen(false); }}
              className="ir-body text-sm px-3 py-2 rounded-md text-left"
              style={{ color: page === t.id ? COLORS.brass : "#9aa0b4", background: page === t.id ? COLORS.panelLight : "transparent" }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

/* =========================================================================
   ROOT APP
   ========================================================================= */
export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [library, setLibrary] = useState({ ringtones: [], ebook: false, planner: false, subscription: null });
  const player = useAudioPlayer();

  useEffect(() => { loadLibrary().then(setLibrary); }, []);useEffect(() => {
  const openSub = () => setPage("subscription");
  window.addEventListener("open-subscribe", openSub);
  return () => window.removeEventListener("open-subscribe", openSub);
}, []);

  const addToCart = (item) => {
    setCart((prev) => (prev.some((c) => c.id === item.id) ? prev : [...prev, item]));
  };
  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  const completeCheckout = async () => {
    const next = { ...library, ringtones: [...library.ringtones] };
    cart.forEach((item) => {
      if (item.type === "ringtone") next.ringtones.push(item.id);
      if (item.type === "ebook") next.ebook = true;
      if (item.type === "planner") next.planner = true;
      if (item.type === "subscription") {
        next.subscription = { label: PLANS[item.meta].label };
        next.ebook = true;
      }
    });
    setLibrary(next);
    await saveLibrary(next);
    setCart([]);
  };

  return (
    <div className="min-h-screen ir-body" style={{ background: COLORS.ink }}>
      <GlobalStyle />
      <Header page={page} go={setPage} cartCount={cart.length} />
      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
        {page === "home" && <Home go={setPage} />}
        {page === "ringtones" && <Ringtones player={player} cart={cart} addToCart={addToCart} library={library} />}
        {page === "subscription" && <Subscription addToCart={addToCart} library={library} />}
        {page === "shop" && <Shop addToCart={addToCart} cart={cart} library={library} />}
        {page === "journal" && <Journal />}
        {page === "cart" && <CartPage cart={cart} removeFromCart={removeFromCart} openCheckout={() => setCheckoutOpen(true)} />}
        {page === "about" && <About />}{page === "gospel-connection" && <GospelConnection isSubscriber={!!library.subscription} currentUser={{ id: "owner", name: "Integrity Records", avatarHue: "#7A2E2E" }} />}
      </main>

      <footer className="max-w-5xl mx-auto px-4 md:px-6 py-8 text-center space-y-2">
        <p className="ir-mono text-[11px] tracking-wide" style={{ color: "#5c6178" }}>
          INTEGRITY RECORDS — NO FINE PRINT, NO TAKING ADVANTAGE. JUST MUSIC MADE FOR GOD.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs ir-body">
          <button onClick={() => setPage("about")} style={{ color: "#7a8099" }}>About</button>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#7a8099" }}>Contact</a>
          <button onClick={() => setPage("about")} style={{ color: "#7a8099" }}>Refund policy</button>
          <button onClick={() => setPage("about")} style={{ color: "#7a8099" }}>Terms</button>
        </div>
      </footer>

      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          onClose={() => setCheckoutOpen(false)}
          onComplete={completeCheckout}
        />
      )}
    </div>
  );
}
