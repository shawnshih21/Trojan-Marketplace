import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Armchair,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  MapPin,
  Map as MapIcon,
  List,
  Home,
  Bookmark,
  Plus,
  MessageCircle,
  User,
  ShieldCheck,
  Check,
  CheckCheck,
  X,
  Mail,
  CalendarDays,
  Clock,
  Camera,
  Heart,
  Star,
  BadgeCheck,
  Settings,
  Info,
  SquarePen,
  Send,
  HelpCircle,
  Bell,
  Trash2,
  LogOut,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Wifi,
  Signal,
  BatteryFull,
  GripVertical,
  Flag,
  MoreHorizontal,
} from "lucide-react";
import {
  DEMO_CODE,
  DEFAULT_PROFILE,
  INITIAL_ITEMS,
  PEOPLE,
  INITIAL_CHATS,
  INITIAL_PICKUPS,
  REVIEWS,
} from "./data";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "./style.css";
const KEY = "trojan-prototype-v2";
const defaults = {
  profile: DEFAULT_PROFILE,
  items: INITIAL_ITEMS,
  chats: INITIAL_CHATS,
  pickups: INITIAL_PICKUPS,
  saved: ["chair", "loveseat"],
  reviews: REVIEWS,
  notifications: [
    { id: 1, text: "Alex confirmed your Friday pickup.", read: false },
    { id: 2, text: "Priya sent a message about your bookshelf.", read: false },
  ],
  reminders: true,
};
function load() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaults;
  }
}
const shortDate = (d) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
const longDate = (d) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
const time = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  return `${+h % 12 || 12}:${m} ${+h >= 12 ? "PM" : "AM"}`;
};
const measurement = (value) => {
  const text = String(value).trim();
  if (/^\d+(?:\.\d+)?$/.test(text)) return Number(text);
  const parts = text.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  return parts && Number(parts[3]) > 0
    ? Number(parts[1] || 0) + Number(parts[2]) / Number(parts[3])
    : NaN;
};
const stamp = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
function Avatar({ id = "maya", profile, size = "", onClick }) {
  const p = PEOPLE[id] || PEOPLE.maya;
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`avatar ${p.tone} ${size} ${["maya", "alex"].includes(id) && !(id === "maya" && profile?.avatar) ? "portrait portrait-" + id : ""}`}
      aria-label={id === "maya" ? "Maya profile" : `${p.name} profile`}
    >
      {id === "maya" && profile?.avatar ? (
        <img src={profile.avatar} alt="Your profile" />
      ) : (
        <span>
          {id === "maya" && profile?.name
            ? profile.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
            : p.initials}
        </span>
      )}
      {size !== "tiny" && (
        <i>
          <Check size={8} />
        </i>
      )}
    </Tag>
  );
}
function Photo({ item, index = 0, className = "", onClick }) {
  if (!item) return null;
  const photo = item.photos?.length
    ? item.photos[index % item.photos.length]
    : null;
  const isSample = typeof photo === "string" && photo.startsWith("demo:");
  const uploaded = isSample ? null : photo;
  const viewIndex = isSample ? Number(photo.split(":")[2]) : index;
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : "img"}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && e.key === "Enter") onClick();
      }}
      className={`photo ${className} ${item.image || uploaded ? "" : "tile tile-" + item.tile} ${viewIndex > 0 && !uploaded ? "zoom-" + viewIndex : ""}`}
      aria-label={`${item.name} photo ${index + 1}`}
      style={
        uploaded || item.image
          ? { backgroundImage: `url("${uploaded || item.image}")` }
          : undefined
      }
    />
  );
}
function Pill({ children, tone = "" }) {
  return <span className={"pill " + tone}>{children}</span>;
}
function App() {
  const [state, setState] = useState(load);
  const [screen, setScreen] = useState(
    state.profile.verified ? "browse" : "verify",
  );
  const [history, setHistory] = useState([]);
  const [itemId, setItemId] = useState("desk");
  const [chatId, setChatId] = useState("alex");
  const [pickupId, setPickupId] = useState("pickup-desk");
  const [sellerId, setSellerId] = useState("alex");
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState("");
  const [email, setEmail] = useState(state.profile.email);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    max: 250,
    condition: "All",
    distance: 2,
    width: "",
    sort: "Recommended",
  });
  const [mapView, setMapView] = useState(false);
  const [inboxQuery, setInboxQuery] = useState("");
  const [message, setMessage] = useState("");
  const [activityTab, setActivityTab] = useState("buying");
  const [draft, setDraft] = useState(null);
  const [preview, setPreview] = useState(false);
  const [gallery, setGallery] = useState(0);
  const [chatAttachment, setChatAttachment] = useState("");
  const fileRef = useRef(null);
  const chatBottom = useRef(null);
  const toastRef = useRef(null);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      notify(
        "Device storage is full. Try smaller photos or remove an old listing.",
      );
    }
  }, [state]);
  useEffect(() => {
    if (!sheet) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSheet(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [sheet]);
  useEffect(() => {
    document.querySelector(".phone-scroll")?.scrollTo(0, 0);
  }, [screen, itemId]);
  useEffect(() => {
    chatBottom.current?.scrollIntoView({ block: "nearest" });
  }, [state.chats, screen]);
  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  const notify = (t) => {
    setToast(t);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 3800);
  };
  const go = (next, opts = {}) => {
    if (opts.item) setItemId(opts.item);
    if (opts.chat) setChatId(opts.chat);
    if (opts.pickup) setPickupId(opts.pickup);
    if (opts.seller) setSellerId(opts.seller);
    if (opts.tab) setActivityTab(opts.tab);
    if (opts.root) setHistory([]);
    else setHistory((h) => [...h, screen]);
    setGallery(0);
    setPreview(false);
    setScreen(next);
    setSheet(null);
  };
  const back = () => {
    setSheet(null);
    setPreview(false);
    if (history.length) {
      setScreen(history[history.length - 1]);
      setHistory((h) => h.slice(0, -1));
    } else setScreen("browse");
  };
  const items = state.items;
  const selected =
    preview && draft ? draft : items.find((i) => i.id === itemId) || items[0];
  const person = PEOPLE[sellerId] || PEOPLE.alex;
  const pickup = state.pickups.find((p) => p.id === pickupId);
  const pickupItem = items.find((i) => i.id === pickup?.item);
  const ownConfirmed =
    pickup?.role === "selling"
      ? pickup?.sellerConfirmed
      : pickup?.buyerConfirmed;
  const otherConfirmed =
    pickup?.role === "selling"
      ? pickup?.buyerConfirmed
      : pickup?.sellerConfirmed;
  const ownConfirmKey =
    pickup?.role === "selling" ? "sellerConfirmed" : "buyerConfirmed";
  const otherConfirmKey =
    pickup?.role === "selling" ? "buyerConfirmed" : "sellerConfirmed";
  const otherRole = pickup?.role === "selling" ? "buyer" : "seller";
  const chat = state.chats.find((c) => c.id === chatId);
  const chatItem = items.find((i) => i.id === chat?.item);
  const chatPerson = PEOPLE[chat?.person] || PEOPLE.alex;
  const toggleSaved = (id) =>
    update({
      saved: state.saved.includes(id)
        ? state.saved.filter((x) => x !== id)
        : [...state.saved, id],
    });
  const openChat = (id, personId) => {
    let c = state.chats.find(
      (c) => c.item === id && (!personId || c.person === personId),
    );
    if (!c) {
      const i = items.find((x) => x.id === id);
      const pid = personId || (i.seller === "maya" ? "priya" : i.seller);
      c = {
        id: "chat-" + Date.now(),
        person: pid,
        item: id,
        unread: false,
        time: "Now",
        messages: [],
      };
      update({ chats: [c, ...state.chats] });
    } else
      update({
        chats: state.chats.map((x) =>
          x.id === c.id ? { ...x, unread: false } : x,
        ),
      });
    go("chat", { chat: c.id });
  };
  const editListing = (item = null) => {
    setDraft(
      item
        ? {
            ...structuredClone(item),
            photos: item.photos?.length
              ? [...item.photos]
              : Array.from(
                  { length: item.views || 0 },
                  (_, index) => `demo:${item.tile}:${index}`,
                ),
          }
        : {
            id: "listing-" + Date.now(),
            name: "",
            price: "",
            category: "Storage",
            condition: "Good",
            color: "",
            photos: [],
            views: 0,
            tile: 2,
            location: "",
            distance: 0.4,
            width: "",
            depth: "",
            height: "",
            seller: "maya",
            description: "",
            date: "2026-10-24",
            start: "10:00",
            end: "14:00",
            status: "available",
          },
    );
    go("edit");
  };
  const pickupFor = (id) =>
    state.pickups.find(
      (p) => p.item === id && !["canceled", "completed"].includes(p.status),
    );
  const createPickup = (item) => {
    const existing = pickupFor(item.id);
    if (existing) {
      go("pickup", { pickup: existing.id });
      return;
    }
    const p = {
      id: "pickup-" + Date.now(),
      item: item.id,
      person: item.seller === "maya" ? "priya" : item.seller,
      date: item.date,
      start: item.start,
      end: item.end,
      buyerConfirmed: item.seller !== "maya",
      sellerConfirmed: item.seller === "maya",
      meeting: "",
      status: "requested",
      role: item.seller === "maya" ? "selling" : "buying",
      reminder: state.reminders,
    };
    update({ pickups: [p, ...state.pickups] });
    go("pickup", { pickup: p.id });
    notify(
      `Reservation requested in this demo. ${item.seller === "maya" ? "Buyer" : "Seller"} confirmation is pending.`,
    );
  };
  const changePickup = (changes) => {
    const next = { ...pickup, ...changes };
    if (next.status !== "completed" && next.status !== "canceled")
      next.status =
        next.buyerConfirmed && next.sellerConfirmed ? "confirmed" : "requested";
    update({
      pickups: state.pickups.map((p) => (p.id === pickup.id ? next : p)),
    });
    return next;
  };
  const uploadPhotos = async (files) => {
    const pics = [];
    for (const file of [...files].slice(0, 6)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5e6) {
        notify("Choose images under 5 MB.");
        continue;
      }
      pics.push(
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const ratio = Math.min(1, 1100 / img.width);
              canvas.width = img.width * ratio;
              canvas.height = img.height * ratio;
              canvas
                .getContext("2d")
                .drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL("image/jpeg", 0.8));
            };
            img.src = reader.result;
          };
          reader.readAsDataURL(file);
        }),
      );
    }
    return pics;
  };
  const sendMessage = () => {
    if (!message.trim() && !chatAttachment) return;
    update({
      chats: state.chats.map((c) =>
        c.id === chat.id
          ? {
              ...c,
              time: stamp(),
              messages: [
                ...c.messages,
                {
                  id: Date.now(),
                  from: "me",
                  text: message.trim(),
                  image: chatAttachment,
                  time: stamp(),
                },
              ],
            }
          : c,
      ),
    });
    setMessage("");
    setChatAttachment("");
  };
  const calendar = () => {
    const clean = (t) => t.replace(/[-:]/g, "");
    const dt = (d, t) => clean(d) + "T" + clean(t) + "00";
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Trojan Marketplace//Pickup//EN",
      "BEGIN:VEVENT",
      `UID:${pickup.id}@trojan-marketplace.demo`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;TZID=America/Los_Angeles:${dt(pickup.date, pickup.start)}`,
      `DTEND;TZID=America/Los_Angeles:${dt(pickup.date, pickup.end)}`,
      `SUMMARY:Pickup - ${pickupItem.name}`,
      `LOCATION:${(pickup.buyerConfirmed && pickup.sellerConfirmed ? pickup.meeting : pickupItem.location).replace(/[,;]/g, " ")}`,
      "DESCRIPTION:Coordinate with your fellow Trojan in the demo app.",
      ...(pickup.reminder
        ? [
            "BEGIN:VALARM",
            "TRIGGER:-PT30M",
            "ACTION:DISPLAY",
            "DESCRIPTION:Trojan Marketplace furniture pickup in 30 minutes",
            "END:VALARM",
          ]
        : []),
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "trojan-pickup.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Calendar file downloaded. Open it to add your pickup.");
  };
  const top = (title, right) => (
    <div className="page-top">
      <button className="back" aria-label="Go back" onClick={back}>
        <ChevronLeft size={21} />
      </button>
      <h1>{title}</h1>
      {right && <div className="top-action">{right}</div>}
    </div>
  );
  const compact = (i, { label, tone = "yellow", onClick, right } = {}) => (
    <button
      className="compact-card"
      key={i.id}
      onClick={onClick || (() => go("detail", { item: i.id }))}
    >
      <Photo item={i} />
      <span className="compact-copy">
        <b>{i.name}</b>
        <span>
          {i.seller === "maya" ? "Your listing" : PEOPLE[i.seller]?.name} ·{" "}
          {i.location}
        </span>
        {label ? (
          <Pill tone={tone}>{label}</Pill>
        ) : (
          <small className="verified-line">
            <Check size={10} /> USC student seller
          </small>
        )}
      </span>
      {right || <strong>${i.price}</strong>}
    </button>
  );
  const map = (item = selected, big = false) => (
    <div className={"mini-map " + (big ? "big" : "")}>
      <div className="map-green" />
      <div className="map-tan" />
      <div className="map-street horizontal">W Jefferson Blvd</div>
      <div className="map-street vertical" />
      <span className="map-campus">USC campus</span>
      <button
        className="map-label"
        onClick={() => setSheet({ type: "location", item })}
      >
        <MapPin size={13} />
        {item.location} area
      </button>
      <span className="map-legend">Approximate area · Not to scale</span>
    </div>
  );
  const bottomNav = ["browse", "activity", "create", "inbox", "profile"];
  const navIcons = [Home, Bookmark, Plus, MessageCircle, User];
  const showNav = [
    "browse",
    "activity",
    "inbox",
    "profile",
    "saved",
    "history",
    "listings",
  ].includes(screen);
  const filtered = items
    .filter(
      (i) =>
        i.status === "available" &&
        (category === "All" || i.category === category) &&
        `${i.name} ${i.location}`.toLowerCase().includes(query.toLowerCase()) &&
        i.price <= filters.max &&
        (filters.condition === "All" || i.condition === filters.condition) &&
        i.distance <= filters.distance &&
        (!filters.width || measurement(i.width) <= +filters.width),
    )
    .sort((a, b) =>
      filters.sort === "Price: low to high"
        ? a.price - b.price
        : filters.sort === "Price: high to low"
          ? b.price - a.price
          : 0,
    );
  function product(i) {
    return (
      <article className="product-card" key={i.id}>
        <div className="product-cover">
          <Photo item={i} onClick={() => go("detail", { item: i.id })} />
          <button
            className={
              "save-heart " + (state.saved.includes(i.id) ? "is-saved" : "")
            }
            aria-label={`${state.saved.includes(i.id) ? "Unsave" : "Save"} ${i.name}`}
            onClick={() => toggleSaved(i.id)}
          >
            <Heart
              size={17}
              fill={state.saved.includes(i.id) ? "currentColor" : "none"}
            />
          </button>
        </div>
        <button
          className="product-copy"
          onClick={() => go("detail", { item: i.id })}
        >
          <b>{i.name}</b>
          <span className="price-location">
            <strong>${i.price}</strong>
            <small>{i.location}</small>
          </span>
          <small>{i.condition} condition · USC verified</small>
        </button>
      </article>
    );
  }
  return (
    <div className="stage">
      <div className={"phone " + (screen === "verify" ? "verification" : "")}>
        <div className="status-bar">
          <b>9:41</b>
          <span>
            <Signal size={15} fill="currentColor" />
            <Wifi size={15} />
            <BatteryFull size={22} fill="currentColor" />
          </span>
        </div>
        <div className={"phone-scroll " + (showNav ? "has-nav" : "")}>
          {screen === "verify" && (
            <div className="verification-page">
              <div className="verification-brand">
                <span className="logo-mark">
                  <Armchair size={28} />
                </span>
                <h1>
                  Trojan
                  <br />
                  Marketplace
                </h1>
                <p>Secondhand finds. Fellow Trojans.</p>
              </div>
              <div className="verification-panel">
                <h2>Welcome, Trojan</h2>
                <p>
                  Buy and sell furniture with USC students. Use your
                  <br />
                  @usc.edu email to get started.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!/^[^\s@]+@usc\.edu$/i.test(email.trim())) {
                      setVerifyError(
                        "Please use a valid @usc.edu student email.",
                      );
                      return;
                    }
                    setCodeSent(true);
                    setEmailVerified(false);
                    setCode("");
                    setVerifyError("");
                    notify("Demo code ready: 248613. No email was sent.");
                  }}
                >
                  <label className="email-field">
                    <span>USC student email</span>
                    <span>
                      <Mail size={18} />
                      <input
                        type="email"
                        aria-label="USC student email"
                        placeholder="maya.chen@usc.edu"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailVerified(false);
                          setCodeSent(false);
                        }}
                        required
                      />
                    </span>
                    <span className="email-hint">
                      A 6-digit code, no password.
                      <button type="submit">
                        {codeSent ? "Resend code" : "Send code"}{" "}
                        <ArrowRight size={12} />
                      </button>
                    </span>
                  </label>
                </form>
                <div className="code-heading">
                  <b>Email verification code</b>
                  <span>{codeSent ? "Demo code: 248613" : "Sample state"}</span>
                </div>
                <div className="code-inputs">
                  {Array.from({ length: 6 }, (_, n) => (
                    <input
                      key={n}
                      aria-label={`Verification digit ${n + 1}`}
                      inputMode="numeric"
                      maxLength={1}
                      value={code[n] || ""}
                      placeholder={DEMO_CODE[n]}
                      onPaste={(e) => {
                        const v = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        if (v) {
                          e.preventDefault();
                          setCode(v);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !code[n])
                          document.getElementById("code-" + (n - 1))?.focus();
                      }}
                      id={"code-" + n}
                      onChange={(e) => {
                        setCode((old) => {
                          const a = old.padEnd(6, " ").split("");
                          a[n] = e.target.value.replace(/\D/g, "");
                          return a.join("").trimEnd();
                        });
                        if (e.target.value)
                          document.getElementById("code-" + (n + 1))?.focus();
                        setVerifyError("");
                      }}
                    />
                  ))}
                </div>
                {verifyError && (
                  <p className="error" role="alert">
                    {verifyError}
                  </p>
                )}
                <Pill tone="green">
                  <ShieldCheck size={12} />
                  {emailVerified
                    ? "USC email verified · prototype preview"
                    : "USC email verification · demo preview"}
                </Pill>
                <button
                  className="primary full continue"
                  onClick={() => {
                    if (!codeSent) {
                      setVerifyError(
                        "Select Send code first. This demo uses code 248613.",
                      );
                      return;
                    }
                    if (code !== DEMO_CODE) {
                      setVerifyError(
                        "Enter all 6 digits of the demo code: 248613.",
                      );
                      return;
                    }
                    if (!/^[^\s@]+@usc\.edu$/i.test(email.trim())) {
                      setVerifyError("Please enter a USC student email.");
                      return;
                    }
                    setEmailVerified(true);
                    update({
                      profile: {
                        ...state.profile,
                        email: email.trim(),
                        verified: true,
                      },
                    });
                    go("browse", { root: true });
                    notify("Welcome, Trojan! You’re exploring a local demo.");
                  }}
                >
                  <ArrowRight size={18} /> Continue to marketplace
                </button>
                <p className="prototype-note">
                  Student-only access · Static case competition prototype.
                  <br />
                  No live authentication or email is sent.
                </p>
              </div>
            </div>
          )}
          {screen === "browse" && (
            <div className="screen browse-screen">
              <div className="browse-header">
                <div>
                  <p>Hello, {state.profile.name.split(" ")[0]}!</p>
                  <h1>Trojan Marketplace</h1>
                </div>
                <Avatar profile={state.profile} onClick={() => go("profile")} />
              </div>
              <div className="search-row">
                <label className="search-field">
                  <Search size={20} />
                  <input
                    aria-label="Search furniture"
                    placeholder="Search furniture..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      aria-label="Clear search"
                      onClick={() => setQuery("")}
                    >
                      <X size={13} />
                    </button>
                  )}
                </label>
                <button
                  className="primary filter"
                  onClick={() =>
                    setSheet({ type: "filters", values: { ...filters } })
                  }
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {(filters.max < 250 ||
                    filters.condition !== "All" ||
                    filters.width ||
                    filters.distance < 2) &&
                    " •"}
                </button>
              </div>
              <div className="categories">
                {[
                  "All",
                  "Desks",
                  "Chairs",
                  "Sofas",
                  "Beds",
                  "Storage",
                  "Decor",
                ].map((c) => (
                  <button
                    key={c}
                    className={category === c ? "active" : ""}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="section-title">
                <div>
                  <h2>Campus finds</h2>
                  <p>Near University Park Campus</p>
                </div>
                <div className="view-toggle">
                  <button
                    className={!mapView ? "active" : ""}
                    onClick={() => setMapView(false)}
                  >
                    <List size={12} /> List
                  </button>
                  <button
                    className={mapView ? "active" : ""}
                    onClick={() => setMapView(true)}
                  >
                    <MapIcon size={12} /> Map
                  </button>
                </div>
              </div>
              {mapView ? (
                <>
                  <div className="browse-map">
                    {map(filtered[0] || items[0], true)}
                    {filtered.slice(0, 5).map((i, n) => (
                      <button
                        className="map-price"
                        key={i.id}
                        style={{
                          left: 12 + n * 16 + "%",
                          top: 20 + ((n * 23) % 58) + "%",
                        }}
                        onClick={() => go("detail", { item: i.id })}
                      >
                        ${i.price}
                      </button>
                    ))}
                  </div>
                  <p className="muted fine">
                    {filtered.length} finds · Approximate locations only
                  </p>
                </>
              ) : (
                <div className="product-grid">
                  {filtered.slice(0, 2).map(product)}
                </div>
              )}
              {!filtered.length && (
                <div className="empty">
                  <Search />
                  <h3>No furniture found</h3>
                  <p>Try another search or clear your filters.</p>
                  <button
                    className="text-button"
                    onClick={() => {
                      setQuery("");
                      setCategory("All");
                      setFilters({
                        max: 250,
                        condition: "All",
                        distance: 2,
                        width: "",
                        sort: "Recommended",
                      });
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
              <div className="section-title more-title">
                <h2>
                  {query || category !== "All"
                    ? "More campus finds"
                    : "More near you"}
                </h2>
                <button onClick={() => go("all")}>
                  See all <ChevronRight size={12} />
                </button>
              </div>
              <div className="compact-list">
                {(query || category !== "All"
                  ? filtered.slice(2)
                  : [
                      items.find((i) => i.id === "loveseat"),
                      items.find((i) => i.id === "bed"),
                      ...filtered.slice(4),
                    ].filter(Boolean)
                )
                  .slice(0, 2)
                  .map((i) => compact(i))}
              </div>
            </div>
          )}
          {screen === "all" && (
            <div className="screen">
              {top("Campus finds")}
              <label className="search-field">
                <Search size={19} />
                <input
                  aria-label="Search all furniture"
                  placeholder="Search furniture..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="product-grid spaced">{filtered.map(product)}</div>
              {!filtered.length && (
                <div className="empty">No items match your search.</div>
              )}
            </div>
          )}
          {screen === "detail" && (
            <div className="screen detail-screen">
              {top(
                preview ? "Listing Preview" : "Item Details",
                <button
                  className={
                    "icon-button " +
                    (state.saved.includes(selected.id) ? "selected" : "")
                  }
                  aria-label="Save listing"
                  onClick={() => toggleSaved(selected.id)}
                >
                  <Bookmark
                    size={19}
                    fill={
                      state.saved.includes(selected.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>,
              )}
              <h2 className="detail-subtitle">
                {selected.id === "desk"
                  ? "A new home for your study setup"
                  : selected.name}
              </h2>
              <div className="white-card main-item">
                <div className="gallery">
                  <Photo
                    item={selected}
                    index={gallery}
                    onClick={() =>
                      setSheet({
                        type: "gallery",
                        index: gallery,
                        item: selected,
                      })
                    }
                  />
                  {gallery > 0 && (
                    <button
                      className="gallery-prev"
                      aria-label="Previous photo"
                      onClick={() => setGallery((g) => g - 1)}
                    >
                      <ChevronLeft size={19} />
                    </button>
                  )}
                  <button
                    className="photo-count"
                    aria-label="Next photo"
                    onClick={() =>
                      setGallery(
                        (g) =>
                          (g + 1) %
                          Math.max(
                            1,
                            selected.photos?.length || selected.views,
                          ),
                      )
                    }
                  >
                    <Camera size={12} />
                    {gallery + 1}/
                    {Math.max(1, selected.photos?.length || selected.views)}
                  </button>
                </div>
                <div className="detail-name">
                  <h2>{selected.name || "Untitled listing"}</h2>
                  <strong>${selected.price || 0}</strong>
                </div>
                <p className="location">
                  <MapPin size={13} /> Near {selected.location || "campus"} · A
                  short walk from campus
                </p>
                <div className="pill-row">
                  <Pill tone={selected.status === "sold" ? "neutral" : "green"}>
                    {selected.status === "sold" ? "Sold" : "Available"}
                  </Pill>
                  <Pill tone="rose">{selected.condition} condition</Pill>
                  <Pill>{selected.color || "Furniture"}</Pill>
                </div>
              </div>
              <div className="white-card seller-card">
                <button
                  className="seller-identity"
                  onClick={() =>
                    selected.seller === "maya"
                      ? go("profile")
                      : go("seller", { seller: selected.seller })
                  }
                >
                  <Avatar id={selected.seller} profile={state.profile} />
                  <span>
                    <b>
                      {selected.seller === "maya"
                        ? state.profile.name
                        : PEOPLE[selected.seller]?.name}
                    </b>
                    <small>
                      USC ’{PEOPLE[selected.seller]?.year} · Student seller
                    </small>
                  </span>
                  <BadgeCheck size={22} />
                </button>
                <button
                  className="seller-rating"
                  onClick={() =>
                    go(selected.seller === "maya" ? "profile" : "seller", {
                      seller: selected.seller,
                    })
                  }
                >
                  <Star size={15} />
                  {PEOPLE[selected.seller]?.rating}{" "}
                  <span>
                    | {PEOPLE[selected.seller]?.reviews} reviews · USC verified
                  </span>
                </button>
                <p>
                  “Exactly as described and super easy to coordinate pickup!” —
                  Priya S., USC ’27
                </p>
              </div>
              <h2 className="block-heading">Condition & description</h2>
              <p className="body-copy">
                {selected.description ||
                  "Add a description to help your fellow Trojans."}
              </p>
              <h2 className="block-heading">Dimensions · inches</h2>
              <div className="dimensions">
                {[
                  ["Width", selected.width],
                  ["Depth", selected.depth],
                  ["Height", selected.height],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <b>{value || "—"}″</b>
                  </div>
                ))}
              </div>
              <h2 className="block-heading">Pickup availability</h2>
              <div className="availability">
                <CalendarDays size={23} />
                <div>
                  <b>
                    {shortDate(selected.date)} · {time(selected.start)}–
                    {time(selected.end)}
                  </b>
                  <span>Pickup only · Bring a friend to help carry</span>
                </div>
              </div>
              <h2 className="block-heading">Location & pickup</h2>
              {map(selected)}
              <p className="fine muted map-help">
                Approximate {selected.location} area. Coordinate a public
                meeting point with{" "}
                {selected.seller === "maya"
                  ? "your buyer"
                  : PEOPLE[selected.seller]?.name.split(" ")[0]}{" "}
                in chat.
              </p>
              {preview ? (
                <button
                  className="primary full"
                  onClick={() => {
                    setPreview(false);
                    setScreen("edit");
                  }}
                >
                  Back to editing
                </button>
              ) : selected.seller === "maya" ? (
                <button
                  className="primary full"
                  onClick={() => editListing(selected)}
                >
                  Edit listing
                </button>
              ) : selected.status === "sold" ? (
                <button
                  className="secondary full"
                  onClick={() => openChat(selected.id)}
                >
                  Message seller about this item
                </button>
              ) : (
                <div className="action-row">
                  <button
                    className="secondary"
                    onClick={() => openChat(selected.id)}
                  >
                    Message {PEOPLE[selected.seller]?.name.split(" ")[0]}
                  </button>
                  <button
                    className="primary"
                    onClick={() => createPickup(selected)}
                  >
                    {pickupFor(selected.id)
                      ? "View reservation"
                      : "Request to reserve"}
                  </button>
                </div>
              )}
            </div>
          )}
          {screen === "edit" && draft && (
            <div className="screen edit-screen">
              {top(
                items.some((i) => i.id === draft.id)
                  ? "Edit Listing"
                  : "Create Listing",
                <button
                  className="icon-button"
                  aria-label="Listing help"
                  onClick={() => setSheet({ type: "help" })}
                >
                  <HelpCircle size={21} />
                </button>,
              )}
              <div className="listing-status">
                <span>Your listing · {state.profile.name}</span>
                <Pill tone="green">
                  {draft.status === "sold" ? "Sold" : "Active"}
                </Pill>
              </div>
              <div className="field-title">
                <b>Photos</b>
                <span>
                  {draft.photos?.length || draft.views || 0} of 6 · First photo
                  is the cover
                </span>
              </div>
              <div className="photo-editor">
                {(draft.photos?.length
                  ? draft.photos
                  : Array.from({ length: draft.views || 0 }, (_, n) => n)
                ).map((p, n) => (
                  <div className="edit-photo" key={n}>
                    <Photo item={draft} index={n} />
                    <span>{n === 0 ? "Cover" : n + 1}</span>
                    <button
                      aria-label={`Remove photo ${n + 1}`}
                      onClick={() =>
                        setDraft((d) =>
                          d.photos?.length
                            ? {
                                ...d,
                                photos: d.photos.filter((_, x) => x !== n),
                                views: 0,
                              }
                            : { ...d, views: Math.max(0, d.views - 1) },
                        )
                      }
                    >
                      <X size={11} />
                    </button>
                    {n > 0 && (
                      <button
                        className="cover-button"
                        aria-label={`Make photo ${n + 1} cover`}
                        onClick={() => {
                          if (draft.photos?.length)
                            setDraft((d) => ({
                              ...d,
                              photos: [
                                d.photos[n],
                                ...d.photos.filter((_, j) => j !== n),
                              ],
                            }));
                          else
                            notify(
                              "The first demo photo is the cover. Upload photos to reorder them.",
                            );
                        }}
                      >
                        Cover
                      </button>
                    )}
                  </div>
                ))}
                {(draft.photos?.length || draft.views || 0) < 6 && (
                  <label className="add-photo">
                    <Camera size={23} />
                    <span>Add photo</span>
                    <input
                      aria-label="Upload furniture photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const pics = await uploadPhotos(e.target.files);
                        setDraft((d) => ({
                          ...d,
                          photos: [...(d.photos || []), ...pics].slice(0, 6),
                          views: 0,
                        }));
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.photos.length && !draft.views) {
                    notify("Add at least one photo before publishing.");
                    return;
                  }
                  if (
                    [draft.width, draft.depth, draft.height].some(
                      (value) =>
                        !Number.isFinite(measurement(value)) ||
                        measurement(value) <= 0,
                    )
                  ) {
                    notify(
                      "Enter positive dimensions, such as 24, 19.5, or 41 3/8.",
                    );
                    return;
                  }
                  if (draft.end <= draft.start) {
                    notify("Pickup end time must be after the start time.");
                    return;
                  }
                  update({
                    items: items.some((i) => i.id === draft.id)
                      ? items.map((i) =>
                          i.id === draft.id
                            ? { ...draft, price: +draft.price }
                            : i,
                        )
                      : [{ ...draft, price: +draft.price }, ...items],
                  });
                  go("detail", { item: draft.id });
                  notify("Listing saved on this device.");
                }}
              >
                <label className="field">
                  Listing title
                  <input
                    required
                    maxLength={80}
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </label>
                <div className="form-row">
                  <label className="field">
                    Price
                    <input
                      required
                      type="number"
                      min="0"
                      max="10000"
                      value={draft.price}
                      onChange={(e) =>
                        setDraft({ ...draft, price: e.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    Category
                    <select
                      value={draft.category}
                      onChange={(e) =>
                        setDraft({ ...draft, category: e.target.value })
                      }
                    >
                      {[
                        "Desks",
                        "Chairs",
                        "Sofas",
                        "Beds",
                        "Storage",
                        "Decor",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="form-row">
                  <label className="field">
                    Condition
                    <select
                      value={draft.condition}
                      onChange={(e) =>
                        setDraft({ ...draft, condition: e.target.value })
                      }
                    >
                      {["Like new", "Good", "Fair"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <fieldset className="field dimension-input">
                    <legend>Dimensions · W × D × H (in)</legend>
                    <div>
                      {["width", "depth", "height"].map((k) => (
                        <input
                          key={k}
                          aria-label={k}
                          required
                          placeholder={k[0].toUpperCase()}
                          value={draft[k]}
                          onChange={(e) =>
                            setDraft({ ...draft, [k]: e.target.value })
                          }
                        />
                      ))}
                    </div>
                  </fieldset>
                </div>
                <label className="field">
                  Color
                  <input
                    value={draft.color}
                    placeholder="e.g. White"
                    onChange={(e) =>
                      setDraft({ ...draft, color: e.target.value })
                    }
                  />
                </label>
                <label className="field">
                  Description
                  <textarea
                    required
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </label>
                <label className="field">
                  Approximate pickup area
                  <span className="input-icon">
                    <input
                      required
                      value={draft.location}
                      placeholder="e.g. West 28th St · Near campus"
                      onChange={(e) =>
                        setDraft({ ...draft, location: e.target.value })
                      }
                    />
                    <MapPin size={17} />
                  </span>
                </label>
                <label className="field">
                  Pickup availability
                  <span className="input-icon">
                    <input
                      required
                      type="date"
                      value={draft.date}
                      onChange={(e) =>
                        setDraft({ ...draft, date: e.target.value })
                      }
                    />
                    <CalendarDays size={17} />
                  </span>
                </label>
                <div className="form-row">
                  <label className="field">
                    Start time
                    <input
                      required
                      type="time"
                      value={draft.start}
                      onChange={(e) =>
                        setDraft({ ...draft, start: e.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    End time
                    <input
                      required
                      type="time"
                      value={draft.end}
                      onChange={(e) =>
                        setDraft({ ...draft, end: e.target.value })
                      }
                    />
                  </label>
                </div>
                <p className="privacy-note">
                  <ShieldCheck size={15} />
                  Only share your approximate area in public. Share the exact
                  meeting point in chat.
                </p>
                <button className="primary full" type="submit">
                  {items.some((i) => i.id === draft.id)
                    ? "Save changes"
                    : "Publish listing"}
                </button>
                <button
                  className="text-button full"
                  type="button"
                  onClick={() => {
                    setPreview(true);
                    setGallery(0);
                    setScreen("detail");
                  }}
                >
                  Preview listing
                </button>
                {items.some((i) => i.id === draft.id) && (
                  <button
                    className="text-button danger full"
                    type="button"
                    onClick={() =>
                      setSheet({ type: "delete-listing", item: draft })
                    }
                  >
                    <Trash2 size={13} />
                    Delete listing
                  </button>
                )}
              </form>
            </div>
          )}
          {screen === "inbox" && (
            <div className="screen inbox-screen">
              {top(
                "Inbox",
                <button
                  className="icon-button"
                  aria-label="New conversation"
                  onClick={() => setSheet({ type: "compose" })}
                >
                  <SquarePen size={21} />
                </button>,
              )}
              <label className="search-field">
                <Search size={20} />
                <input
                  aria-label="Search messages"
                  placeholder="Search messages..."
                  value={inboxQuery}
                  onChange={(e) => setInboxQuery(e.target.value)}
                />
              </label>
              <div className="section-title inbox-title">
                <b>All messages</b>
                <span>{state.chats.filter((c) => c.unread).length} unread</span>
              </div>
              <div className="conversations">
                {state.chats
                  .filter((c) =>
                    `${PEOPLE[c.person]?.name} ${items.find((i) => i.id === c.item)?.name} ${c.messages.at(-1)?.text}`
                      .toLowerCase()
                      .includes(inboxQuery.toLowerCase()),
                  )
                  .map((c) => {
                    const i = items.find((i) => i.id === c.item);
                    const p = PEOPLE[c.person];
                    return (
                      <button
                        key={c.id}
                        className="conversation"
                        onClick={() => {
                          update({
                            chats: state.chats.map((x) =>
                              x.id === c.id ? { ...x, unread: false } : x,
                            ),
                          });
                          go("chat", { chat: c.id });
                        }}
                      >
                        <Avatar id={c.person} />
                        <span className="conversation-copy">
                          <b>{p?.name}</b>
                          <strong>
                            {i?.name || "Removed listing"} · ${i?.price || 0}
                          </strong>
                          <span>
                            {c.messages.at(-1)?.text || "Start a conversation"}
                          </span>
                        </span>
                        <span className="conversation-meta">
                          <small>{c.time}</small>
                          {c.unread && <i />}
                        </span>
                      </button>
                    );
                  })}
              </div>
              <p className="privacy-note center">
                <ShieldCheck size={14} />A conversation between fellow Trojans.
              </p>
            </div>
          )}
          {screen === "chat" && chat && (
            <div className="chat-screen">
              <div className="chat-top">
                <button className="back" aria-label="Go back" onClick={back}>
                  <ChevronLeft size={21} />
                </button>
                <Avatar
                  id={chat.person}
                  onClick={() => go("seller", { seller: chat.person })}
                />
                <button
                  className="chat-person"
                  onClick={() => go("seller", { seller: chat.person })}
                >
                  <b>{chatPerson.name}</b>
                  <span>
                    <Check size={10} /> USC ’{chatPerson.year} · Verified
                    student
                  </span>
                </button>
                <button
                  className="plain-icon"
                  aria-label="Conversation information"
                  onClick={() =>
                    setSheet({ type: "chat-info", person: chatPerson })
                  }
                >
                  <Info size={20} />
                </button>
              </div>
              {chatItem && (
                <button
                  className="chat-item"
                  onClick={() => go("detail", { item: chatItem.id })}
                >
                  <Photo item={chatItem} />
                  <span>
                    <b>
                      {chatItem.name} · ${chatItem.price}
                    </b>
                    <Pill tone="yellow">
                      {pickupFor(chatItem.id)
                        ? "Reserved for you"
                        : "View listing"}
                    </Pill>
                  </span>
                  <ChevronRight size={18} />
                </button>
              )}
              <div className="message-thread">
                <span className="thread-date">Today · Thu, Oct 22</span>
                {chat.messages.map((m) => (
                  <div
                    className={
                      "message-wrap " + (m.from === "me" ? "outgoing" : "")
                    }
                    key={m.id}
                  >
                    <div className="message-bubble">
                      {m.image && <img src={m.image} alt="Shared in chat" />}
                      {m.text}
                    </div>
                    <span className="message-time">
                      {m.time}
                      {m.from === "me" && <CheckCheck size={13} />}
                    </span>
                  </div>
                ))}
                {chatItem && pickupFor(chatItem.id) && (
                  <button
                    className="pickup-message"
                    onClick={() =>
                      go("pickup", { pickup: pickupFor(chatItem.id).id })
                    }
                  >
                    <span>
                      <CalendarDays size={19} />
                      <b>
                        {pickupFor(chatItem.id).status === "confirmed"
                          ? "Pickup confirmed"
                          : "Pickup proposed"}
                      </b>
                    </span>
                    <small>
                      {shortDate(pickupFor(chatItem.id).date)},{" "}
                      {time(pickupFor(chatItem.id).start)}–
                      {time(pickupFor(chatItem.id).end)}
                    </small>
                    <strong>
                      View pickup details <ArrowRight size={12} />
                    </strong>
                  </button>
                )}
                <p className="chat-demo-note">
                  Local demo · Messages stay on this device.
                </p>
                <div ref={chatBottom} />
              </div>
              {chatAttachment && (
                <div className="attachment-preview">
                  <img src={chatAttachment} />
                  <button
                    aria-label="Remove attachment"
                    onClick={() => setChatAttachment("")}
                  >
                    <X size={17} />
                  </button>
                </div>
              )}
              <form
                className="chat-input"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  aria-label="Message"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  type="button"
                  aria-label="Chat actions"
                  onClick={() => setSheet({ type: "chat-actions" })}
                >
                  <Plus size={21} />
                </button>
                <button
                  className="send"
                  type="submit"
                  aria-label="Send message"
                >
                  <Send size={22} />
                </button>
              </form>
              <input
                ref={fileRef}
                className="hidden"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const pics = await uploadPhotos(e.target.files);
                  if (pics[0]) setChatAttachment(pics[0]);
                  e.target.value = "";
                }}
              />
            </div>
          )}
          {screen === "pickup" && pickup && pickupItem && (
            <div className="screen pickup-screen">
              {top(
                "Pickup Details",
                <button
                  className="icon-button"
                  aria-label="Save pickup item"
                  onClick={() => toggleSaved(pickupItem.id)}
                >
                  <Bookmark
                    size={20}
                    fill={
                      state.saved.includes(pickupItem.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>,
              )}
              <div className="white-card pickup-item-card">
                <Photo
                  item={pickupItem}
                  onClick={() => go("detail", { item: pickupItem.id })}
                />
                <div className="detail-name">
                  <h2>{pickupItem.name}</h2>
                  <strong>${pickupItem.price}</strong>
                </div>
                <p className="muted fine">
                  {pickup.status === "completed"
                    ? "Purchased by"
                    : "Reserved for"}{" "}
                  {state.profile.name}
                </p>
              </div>
              <div className="pickup-panel">
                <span className="drag-handle" />
                <div className="section-title">
                  <h2>Your pickup</h2>
                  <Pill tone={pickup.status === "canceled" ? "rose" : "green"}>
                    <Check size={11} />
                    {pickup.status === "confirmed"
                      ? "Confirmed"
                      : pickup.status === "completed"
                        ? "Completed"
                        : pickup.status === "canceled"
                          ? "Canceled"
                          : "Pending"}
                  </Pill>
                </div>
                <div className="confirmation-box">
                  <div>
                    <b>
                      {pickup.status === "confirmed"
                        ? "Pickup confirmed"
                        : pickup.status === "completed"
                          ? "Pickup completed"
                          : pickup.status === "canceled"
                            ? "Pickup canceled"
                            : "Pickup requested"}
                    </b>
                    <CalendarDays size={20} />
                  </div>
                  <p>Meeting point shared after both students confirm.</p>
                  <div className="confirmation-person">
                    <span className="initials pink">MC</span>
                    <span>
                      <b>
                        {state.profile.name.split(" ")[0]}{" "}
                        {ownConfirmed ? "confirmed" : "has not confirmed"}
                      </b>
                      <small>
                        {pickup.role === "selling" ? "Seller" : "Buyer"}{" "}
                        {ownConfirmed
                          ? "confirmed pickup details"
                          : "confirmation pending"}
                      </small>
                    </span>
                    {ownConfirmed && <Check size={13} />}
                  </div>
                  <div className="confirmation-person">
                    <span className="initials green">
                      {PEOPLE[pickup.person]?.initials}
                    </span>
                    <span>
                      <b>
                        {PEOPLE[pickup.person]?.name.split(" ")[0]}{" "}
                        {otherConfirmed ? "confirmed" : "has not confirmed"}
                      </b>
                      <small>
                        {pickup.role === "selling" ? "Buyer" : "Seller"}{" "}
                        {otherConfirmed
                          ? "confirmed pickup details"
                          : "confirmation pending"}
                      </small>
                    </span>
                    {otherConfirmed && <Check size={13} />}
                  </div>
                </div>
                <label className="field">
                  Pickup date
                  <span className="readonly-field">
                    {longDate(pickup.date)}
                    <CalendarDays size={17} />
                  </span>
                </label>
                <div className="form-row">
                  <label className="field">
                    Start time
                    <span className="readonly-field">
                      {time(pickup.start)}
                      <Clock size={17} />
                    </span>
                  </label>
                  <label className="field">
                    End time
                    <span className="readonly-field">
                      {time(pickup.end)}
                      <Clock size={17} />
                    </span>
                  </label>
                </div>
                <div className="meeting-card">
                  <div className="section-title">
                    <b>Meeting place</b>
                    <Pill
                      tone={
                        pickup.buyerConfirmed && pickup.sellerConfirmed
                          ? "green"
                          : ""
                      }
                    >
                      {pickup.buyerConfirmed && pickup.sellerConfirmed ? (
                        <>
                          <Check size={10} />
                          Shared
                        </>
                      ) : (
                        "Private"
                      )}
                    </Pill>
                  </div>
                  <div className="meeting-body">
                    <MapPin size={20} />
                    <div>
                      <span>Approximate area</span>
                      <b>{pickupItem.location}</b>
                      <p>Meeting point shared after both students confirm.</p>
                      {pickup.buyerConfirmed && pickup.sellerConfirmed ? (
                        <p className="exact-meeting">
                          {pickup.meeting ||
                            "Coordinate an exact public meeting point in chat."}
                        </p>
                      ) : (
                        <p className="exact-meeting">
                          Exact meeting point is hidden until confirmation.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {!["completed", "canceled"].includes(pickup.status) && (
                  <>
                    <div className="pickup-seller">
                      <Avatar id={pickup.person} />
                      <div>
                        <b>
                          {PEOPLE[pickup.person]?.name} · USC ’
                          {PEOPLE[pickup.person]?.year}
                        </b>
                        <span className="verified-line">
                          <Check size={11} />
                          Verified USC student
                        </span>
                      </div>
                      <button
                        className="text-button"
                        onClick={() =>
                          setSheet({
                            type: "reschedule",
                            date: pickup.date,
                            start: pickup.start,
                            end: pickup.end,
                            meeting: pickup.meeting,
                          })
                        }
                      >
                        Reschedule
                      </button>
                    </div>
                    {!ownConfirmed && (
                      <button
                        className="primary full"
                        onClick={() => {
                          changePickup({ [ownConfirmKey]: true });
                          notify("Your pickup details are confirmed.");
                        }}
                      >
                        Confirm pickup
                      </button>
                    )}
                    {!otherConfirmed && (
                      <button
                        className="secondary full demo-confirm"
                        onClick={() => {
                          changePickup({
                            [otherConfirmKey]: true,
                            meeting:
                              pickup.meeting ||
                              (pickupItem.location === "USC Village"
                                ? "Hoover St entrance to USC Village, beside the outdoor seating"
                                : `Public entrance near ${pickupItem.location}. Confirm the exact spot in chat.`),
                          });
                          notify(
                            `${otherRole === "seller" ? "Seller" : "Buyer"} confirmation simulated. Meeting point is now shared.`,
                          );
                        }}
                      >
                        Demo: simulate {otherRole} confirmation
                      </button>
                    )}
                    <button
                      className="primary full"
                      onClick={() => openChat(pickupItem.id, pickup.person)}
                    >
                      <MessageCircle size={18} />
                      Message {PEOPLE[pickup.person]?.name.split(" ")[0]}
                    </button>
                    <div className="pickup-tools">
                      <button onClick={calendar}>
                        <CalendarDays size={15} />
                        Add to calendar
                      </button>
                      <button
                        onClick={() => {
                          changePickup({ reminder: !pickup.reminder });
                          notify(
                            pickup.reminder
                              ? "Pickup reminder turned off."
                              : "Reminder saved in the demo app.",
                          );
                        }}
                      >
                        <Bell size={15} />
                        {pickup.reminder ? "Reminder on" : "Remind me"}
                      </button>
                    </div>
                    <a
                      className="calendar-link"
                      target="_blank"
                      rel="noreferrer"
                      href={
                        "https://calendar.google.com/calendar/render?" +
                        new URLSearchParams({
                          action: "TEMPLATE",
                          text: "Pickup — " + pickupItem.name,
                          dates:
                            pickup.date.replaceAll("-", "") +
                            "T" +
                            pickup.start.replace(":", "") +
                            "00/" +
                            pickup.date.replaceAll("-", "") +
                            "T" +
                            pickup.end.replace(":", "") +
                            "00",
                          ctz: "America/Los_Angeles",
                          location:
                            pickup.buyerConfirmed && pickup.sellerConfirmed
                              ? pickup.meeting
                              : pickupItem.location,
                          details:
                            "Furniture pickup coordinated through the Trojan Marketplace demo.",
                        })
                      }
                    >
                      <ExternalLink size={13} />
                      Open in Google Calendar
                    </a>
                    <button
                      className="text-button full"
                      onClick={() => setSheet({ type: "complete" })}
                    >
                      Mark as picked up
                    </button>
                    <button
                      className="text-button danger full"
                      onClick={() => setSheet({ type: "cancel-pickup" })}
                    >
                      Cancel pickup
                    </button>
                  </>
                )}
                {pickup.status === "completed" && (
                  <button
                    className="primary full"
                    onClick={() =>
                      setSheet({ type: "review", stars: 5, text: "" })
                    }
                  >
                    {pickup.reviewed ? "View your review" : "Leave a review"}
                  </button>
                )}
                {pickup.status === "canceled" && (
                  <button
                    className="primary full"
                    onClick={() => createPickup(pickupItem)}
                  >
                    Request a new pickup
                  </button>
                )}
              </div>
            </div>
          )}
          {screen === "activity" && (
            <div className="screen activity-screen">
              {top(
                "My Activity",
                <button
                  className="icon-button notification"
                  aria-label="Notifications"
                  onClick={() => setSheet({ type: "notifications" })}
                >
                  <Bell size={20} />
                  {state.notifications.some((n) => !n.read) && <i />}
                </button>,
              )}
              <div className="segmented activity-tabs">
                <button
                  className={activityTab === "buying" ? "active" : ""}
                  onClick={() => setActivityTab("buying")}
                >
                  Buying
                </button>
                <button
                  className={activityTab === "selling" ? "active" : ""}
                  onClick={() => setActivityTab("selling")}
                >
                  Selling
                </button>
              </div>
              <h2 className="block-heading">
                {activityTab === "buying"
                  ? "Purchase Activity"
                  : "Selling Activity"}
              </h2>
              {state.pickups
                .filter(
                  (p) =>
                    p.role === activityTab &&
                    !["completed", "canceled"].includes(p.status),
                )
                .map((p) => {
                  const i = items.find((i) => i.id === p.item);
                  if (!i) return null;
                  return (
                    <div className="white-card purchase-card" key={p.id}>
                      {compact(i, {
                        label:
                          p.status === "confirmed"
                            ? "Pickup confirmed"
                            : "Pickup requested",
                        onClick: () => go("pickup", { pickup: p.id }),
                      })}
                      <button
                        className="purchase-date"
                        onClick={() => go("pickup", { pickup: p.id })}
                      >
                        <CalendarDays size={21} />
                        <span>
                          <b>
                            {shortDate(p.date)} · {time(p.start)}–{time(p.end)}
                          </b>
                          <small>
                            {p.status === "confirmed"
                              ? "Confirmed"
                              : "Awaiting confirmation"}{" "}
                            · Near {i.location}
                          </small>
                        </span>
                      </button>
                      <button
                        className="primary full"
                        onClick={() => go("pickup", { pickup: p.id })}
                      >
                        View pickup details
                      </button>
                    </div>
                  );
                })}
              {!state.pickups.some(
                (p) =>
                  p.role === activityTab &&
                  !["completed", "canceled"].includes(p.status),
              ) && (
                <div className="empty small">
                  <CalendarDays size={26} />
                  <h3>No upcoming pickups</h3>
                  <button
                    className="text-button"
                    onClick={() => go("browse", { root: true })}
                  >
                    Browse campus finds
                  </button>
                </div>
              )}
              <div className="section-title">
                <h2>
                  Completed {activityTab === "buying" ? "purchases" : "sales"}
                </h2>
                <button onClick={() => go("history")}>
                  View history <ChevronRight size={12} />
                </button>
              </div>
              {state.pickups
                .filter(
                  (p) => p.status === "completed" && p.role === activityTab,
                )
                .map((p) => {
                  const i = items.find((i) => i.id === p.item);
                  return (
                    i &&
                    compact(i, {
                      label: "Completed",
                      tone: "green",
                      onClick: () => go("pickup", { pickup: p.id }),
                    })
                  );
                })}
              <div className="section-title">
                <h2>My Listings</h2>
                <button onClick={() => go("listings")}>
                  Manage <ChevronRight size={12} />
                </button>
              </div>
              {items
                .filter((i) => i.seller === "maya" && i.status !== "deleted")
                .slice(0, 2)
                .map((i) =>
                  compact(i, {
                    label:
                      i.status === "sold" ? "Sold" : "Active · 1 new message",
                    tone: i.status === "sold" ? "neutral" : "yellow",
                    onClick: () => editListing(i),
                  }),
                )}
              <div className="section-title">
                <h2>Saved Items</h2>
                <button onClick={() => go("saved")}>
                  View all <ChevronRight size={12} />
                </button>
              </div>
              {items
                .filter((i) => state.saved.includes(i.id))
                .slice(0, 2)
                .map((i) => compact(i, { label: "Saved", tone: "rose" }))}
              {!state.saved.length && (
                <p className="muted fine">
                  Tap a heart on a listing to save it here.
                </p>
              )}
            </div>
          )}
          {["saved", "listings", "history"].includes(screen) && (
            <div className="screen">
              {top(
                screen === "saved"
                  ? "Saved Items"
                  : screen === "listings"
                    ? "My Listings"
                    : "Transaction History",
                screen === "listings" && (
                  <button
                    aria-label="Create listing"
                    className="icon-button"
                    onClick={() => editListing()}
                  >
                    <Plus size={20} />
                  </button>
                ),
              )}
              {screen === "saved" &&
                items
                  .filter((i) => state.saved.includes(i.id))
                  .map((i) => (
                    <div className="saved-row" key={i.id}>
                      {compact(i)}
                      <button
                        className="plain-icon"
                        aria-label={`Remove saved ${i.name}`}
                        onClick={() => toggleSaved(i.id)}
                      >
                        <Bookmark fill="currentColor" size={18} />
                      </button>
                    </div>
                  ))}
              {screen === "saved" && !state.saved.length && (
                <div className="empty">
                  <Bookmark />
                  <h3>No saved items</h3>
                  <p>Save the pieces you love while browsing.</p>
                </div>
              )}
              {screen === "listings" && (
                <>
                  {items
                    .filter(
                      (i) => i.seller === "maya" && i.status !== "deleted",
                    )
                    .map((i) => (
                      <div key={i.id} className="managed-listing">
                        {compact(i, {
                          label: i.status === "sold" ? "Sold" : "Active",
                          tone: i.status === "sold" ? "neutral" : "green",
                          onClick: () => editListing(i),
                        })}
                        <div className="manage-actions">
                          <button onClick={() => editListing(i)}>
                            Edit listing
                          </button>
                          <button
                            onClick={() => {
                              update({
                                items: items.map((x) =>
                                  x.id === i.id
                                    ? {
                                        ...x,
                                        status:
                                          x.status === "sold"
                                            ? "available"
                                            : "sold",
                                      }
                                    : x,
                                ),
                              });
                              notify(
                                i.status === "sold"
                                  ? "Listing marked available."
                                  : "Listing marked sold.",
                              );
                            }}
                          >
                            {i.status === "sold"
                              ? "Mark available"
                              : "Mark sold"}
                          </button>
                          <button
                            aria-label={`Delete ${i.name}`}
                            onClick={() =>
                              setSheet({ type: "delete-listing", item: i })
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  <button
                    className="primary full spaced"
                    onClick={() => editListing()}
                  >
                    <Plus size={16} />
                    Create a listing
                  </button>
                </>
              )}
              {screen === "history" && (
                <>
                  {state.pickups
                    .filter((p) => ["completed", "canceled"].includes(p.status))
                    .map((p) => {
                      const i = items.find((i) => i.id === p.item);
                      return (
                        i &&
                        compact(i, {
                          label:
                            p.status === "completed" ? "Completed" : "Canceled",
                          tone: p.status === "completed" ? "green" : "rose",
                          onClick: () => go("pickup", { pickup: p.id }),
                        })
                      );
                    })}
                  {!state.pickups.some((p) =>
                    ["completed", "canceled"].includes(p.status),
                  ) && <div className="empty">No transaction history yet.</div>}
                </>
              )}
            </div>
          )}
          {(screen === "profile" || screen === "seller") && (
            <div className="screen profile-screen">
              {top(
                screen === "profile"
                  ? "Profile & Reviews"
                  : `${person.name.split(" ")[0]}’s Profile`,
                screen === "profile" ? (
                  <button
                    className="icon-button"
                    aria-label="Settings"
                    onClick={() => setSheet({ type: "settings" })}
                  >
                    <Settings size={20} />
                  </button>
                ) : (
                  <button
                    className="plain-icon"
                    aria-label="Report seller"
                    onClick={() =>
                      setSheet({ type: "report", reason: "", person })
                    }
                  >
                    <Flag size={18} />
                  </button>
                ),
              )}
              <div className="profile-intro">
                <Avatar
                  id={screen === "profile" ? "maya" : sellerId}
                  profile={state.profile}
                  size="large"
                />
                <div>
                  <h2>
                    {screen === "profile" ? state.profile.name : person.name}
                    <BadgeCheck size={20} />
                  </h2>
                  {screen === "profile" && <p>{state.profile.email}</p>}
                  <Pill tone="rose">
                    <ShieldCheck size={12} />
                    USC ’
                    {screen === "profile"
                      ? state.profile.year.slice(-2)
                      : person.year}{" "}
                    · Verified student
                  </Pill>
                </div>
              </div>
              <div className="stats">
                <div>
                  <b>
                    {screen === "profile"
                      ? 3 +
                        state.pickups.filter(
                          (p) =>
                            p.status === "completed" &&
                            p.id !== "pickup-bedside" &&
                            p.role === "buying",
                        ).length
                      : 5}
                  </b>
                  <span>Items bought</span>
                </div>
                <div>
                  <b>{screen === "profile" ? 2 : 8}</b>
                  <span>Items sold</span>
                </div>
                <div>
                  <b>{screen === "profile" ? "5.0" : person.rating}</b>
                  <span>Seller rating</span>
                </div>
              </div>
              <div className="section-title">
                <h2>{screen === "profile" ? "Your listings" : "Listings"}</h2>
                {screen === "profile" && (
                  <button
                    onClick={() =>
                      setSheet({
                        type: "edit-profile",
                        name: state.profile.name,
                        year: state.profile.year,
                        bio: state.profile.bio,
                        avatar: state.profile.avatar,
                      })
                    }
                  >
                    Edit profile <ChevronRight size={12} />
                  </button>
                )}
              </div>
              {items
                .filter(
                  (i) =>
                    i.seller === (screen === "profile" ? "maya" : sellerId) &&
                    i.status === "available",
                )
                .map((i) =>
                  compact(i, {
                    label: "Active listing",
                    onClick: () =>
                      screen === "profile"
                        ? editListing(i)
                        : go("detail", { item: i.id }),
                  }),
                )}
              <div className="section-title">
                <h2>Seller reviews</h2>
                <button
                  onClick={() =>
                    setSheet({
                      type: "reviews",
                      person: screen === "profile" ? "maya" : sellerId,
                    })
                  }
                >
                  See all{" "}
                  {screen === "profile" ? state.reviews.length : person.reviews}{" "}
                  <ChevronRight size={12} />
                </button>
              </div>
              {(screen === "profile"
                ? state.reviews.slice(0, 2)
                : [
                    {
                      id: 1,
                      name: "Priya Shah",
                      year: "27",
                      item: "IKEA MICKE desk",
                      date: "Oct 12",
                      stars: 5,
                      text: "Exactly as described and super easy to coordinate pickup!",
                    },
                  ]
              ).map((r) => (
                <div className="review-card" key={r.id}>
                  <div>
                    <b>
                      {r.name} · USC ’{r.year}
                    </b>
                    <span>{"★".repeat(r.stars)}</span>
                  </div>
                  <small>
                    Buyer review · {r.item} · {r.date}
                  </small>
                  <p>{r.text}</p>
                </div>
              ))}
              <p className="privacy-note center">
                <ShieldCheck size={14} />
                USC email verified · Member since {state.profile.joined}
              </p>
              {screen === "seller" && (
                <p className="prototype-note">
                  Sample seller profile · Reviews are demo content.
                </p>
              )}
            </div>
          )}
        </div>
        {showNav && (
          <nav className="bottom-nav" aria-label="Main navigation">
            {bottomNav.map((p, n) => {
              const Icon = navIcons[n];
              const active =
                screen === p ||
                (p === "activity" &&
                  ["saved", "listings", "history"].includes(screen));
              return (
                <button
                  key={p}
                  className={
                    (active ? "active " : "") +
                    (p === "create" ? "create-tab" : "")
                  }
                  onClick={() =>
                    p === "create" ? editListing() : go(p, { root: true })
                  }
                  aria-label={
                    p === "create"
                      ? "Create listing"
                      : p[0].toUpperCase() + p.slice(1)
                  }
                >
                  <span>
                    <Icon size={22} />
                  </span>
                  {p !== "create" && (
                    <small>
                      {["Browse", "Activity", "", "Inbox", "Profile"][n]}
                    </small>
                  )}
                </button>
              );
            })}
          </nav>
        )}
        <div className="home-indicator">
          <span />
        </div>
        {toast && (
          <div className="toast" role="status">
            <Check size={16} />
            {toast}
          </div>
        )}
        {sheet && (
          <div className="sheet-overlay" onClick={() => setSheet(null)}>
            <section
              className={
                "sheet " + (sheet.type === "gallery" ? "gallery-sheet" : "")
              }
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={sheet.type}
            >
              <button
                className="sheet-close"
                aria-label="Close dialog"
                onClick={() => setSheet(null)}
              >
                <X size={20} />
              </button>
              {sheet.type === "filters" && (
                <>
                  <h2>Filters</h2>
                  <label className="field">
                    Maximum price · ${sheet.values.max}
                    <input
                      aria-label="Maximum price"
                      type="range"
                      min="0"
                      max="250"
                      step="5"
                      value={sheet.values.max}
                      onChange={(e) =>
                        setSheet({
                          ...sheet,
                          values: { ...sheet.values, max: +e.target.value },
                        })
                      }
                    />
                  </label>
                  <label className="field">
                    Condition
                    <select
                      value={sheet.values.condition}
                      onChange={(e) =>
                        setSheet({
                          ...sheet,
                          values: {
                            ...sheet.values,
                            condition: e.target.value,
                          },
                        })
                      }
                    >
                      {["All", "Like new", "Good", "Fair"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Pickup distance
                    <select
                      value={sheet.values.distance}
                      onChange={(e) =>
                        setSheet({
                          ...sheet,
                          values: {
                            ...sheet.values,
                            distance: +e.target.value,
                          },
                        })
                      }
                    >
                      <option value="0.5">Within 0.5 miles</option>
                      <option value="1">Within 1 mile</option>
                      <option value="2">Within 2 miles</option>
                    </select>
                  </label>
                  <label className="field">
                    Maximum width (inches)
                    <input
                      type="number"
                      min="1"
                      placeholder="Any width"
                      value={sheet.values.width}
                      onChange={(e) =>
                        setSheet({
                          ...sheet,
                          values: { ...sheet.values, width: e.target.value },
                        })
                      }
                    />
                  </label>
                  <label className="field">
                    Sort by
                    <select
                      value={sheet.values.sort}
                      onChange={(e) =>
                        setSheet({
                          ...sheet,
                          values: { ...sheet.values, sort: e.target.value },
                        })
                      }
                    >
                      {[
                        "Recommended",
                        "Price: low to high",
                        "Price: high to low",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <div className="action-row">
                    <button
                      className="secondary"
                      onClick={() =>
                        setSheet({
                          ...sheet,
                          values: {
                            max: 250,
                            condition: "All",
                            distance: 2,
                            width: "",
                            sort: "Recommended",
                          },
                        })
                      }
                    >
                      Reset
                    </button>
                    <button
                      className="primary"
                      onClick={() => {
                        setFilters(sheet.values);
                        setSheet(null);
                      }}
                    >
                      Show results
                    </button>
                  </div>
                </>
              )}
              {sheet.type === "gallery" && (
                <>
                  <h2>{sheet.item.name}</h2>
                  <Photo item={sheet.item} index={sheet.index} />
                  <div className="gallery-controls">
                    <button
                      aria-label="Previous gallery photo"
                      onClick={() =>
                        setSheet({
                          ...sheet,
                          index:
                            (sheet.index -
                              1 +
                              Math.max(
                                1,
                                sheet.item.photos.length || sheet.item.views,
                              )) %
                            Math.max(
                              1,
                              sheet.item.photos.length || sheet.item.views,
                            ),
                        })
                      }
                    >
                      <ChevronLeft />
                    </button>
                    <span>
                      {sheet.index + 1} /{" "}
                      {Math.max(
                        1,
                        sheet.item.photos.length || sheet.item.views,
                      )}
                      {sheet.index > 0 && !sheet.item.photos.length
                        ? " · Detail crop"
                        : ""}
                    </span>
                    <button
                      aria-label="Next gallery photo"
                      onClick={() =>
                        setSheet({
                          ...sheet,
                          index:
                            (sheet.index + 1) %
                            Math.max(
                              1,
                              sheet.item.photos.length || sheet.item.views,
                            ),
                        })
                      }
                    >
                      <ChevronRight />
                    </button>
                  </div>
                </>
              )}
              {sheet.type === "location" && (
                <>
                  <h2>{sheet.item.location}</h2>
                  {map(sheet.item, true)}
                  <p className="body-copy spaced">
                    This is an approximate campus area. Exact meeting points are
                    private until both students confirm. Meet in a public place
                    and coordinate in chat.
                  </p>
                  <button
                    className="primary full spaced"
                    onClick={() => {
                      setSheet(null);
                      openChat(sheet.item.id);
                    }}
                  >
                    Message seller
                  </button>
                </>
              )}
              {sheet.type === "help" && (
                <>
                  <h2>A great listing starts here</h2>
                  <p className="body-copy">
                    Add up to 6 clear photos. The first is your cover. Describe
                    any wear, include accurate dimensions, and choose a pickup
                    window. Share an approximate area publicly; keep your exact
                    address private.
                  </p>
                  <p className="prototype-note spaced">
                    Your listing is stored on this device in the demo.
                  </p>
                </>
              )}
              {sheet.type === "compose" && (
                <>
                  <h2>New conversation</h2>
                  <p className="muted fine">
                    Choose a furniture listing to contact its seller.
                  </p>
                  <div className="sheet-list">
                    {items
                      .filter(
                        (i) => i.seller !== "maya" && i.status === "available",
                      )
                      .map((i) =>
                        compact(i, { onClick: () => openChat(i.id) }),
                      )}
                  </div>
                </>
              )}
              {sheet.type === "chat-actions" && (
                <>
                  <h2>Arrange your pickup</h2>
                  <button
                    className="sheet-option"
                    onClick={() => {
                      setSheet(null);
                      fileRef.current?.click();
                    }}
                  >
                    <ImageIcon />
                    Send a photo
                    <ChevronRight size={16} />
                  </button>
                  <button
                    className="sheet-option"
                    onClick={() => {
                      setSheet(null);
                      createPickup(chatItem);
                    }}
                  >
                    <CalendarDays />
                    Schedule or view pickup
                    <ChevronRight size={16} />
                  </button>
                  <button
                    className="sheet-option"
                    onClick={() => {
                      const m = {
                        id: Date.now(),
                        from: "them",
                        text: "Thanks for checking in! The pickup time works for me. Let’s confirm the details in the pickup page.",
                        time: stamp(),
                      };
                      update({
                        chats: state.chats.map((c) =>
                          c.id === chat.id
                            ? { ...c, messages: [...c.messages, m] }
                            : c,
                        ),
                      });
                      setSheet(null);
                      notify(
                        "Demo seller reply added. No real message was received.",
                      );
                    }}
                  >
                    <MessageCircle />
                    Simulate a seller reply
                    <ChevronRight size={16} />
                  </button>
                  <p className="prototype-note">
                    Demo controls do not contact another user.
                  </p>
                </>
              )}
              {sheet.type === "chat-info" && (
                <>
                  <h2>Conversation details</h2>
                  <button
                    className="sheet-option"
                    onClick={() => go("seller", { seller: chat.person })}
                  >
                    <ShieldCheck />
                    View {chatPerson.name.split(" ")[0]}’s verification &
                    reviews
                    <ChevronRight size={16} />
                  </button>
                  <button
                    className="sheet-option"
                    onClick={() =>
                      setSheet({
                        type: "report",
                        reason: "",
                        person: chatPerson,
                      })
                    }
                  >
                    <Flag />
                    Report a concern
                    <ChevronRight size={16} />
                  </button>
                  <p className="prototype-note">
                    Local demo · Messages and reports stay on this device.
                  </p>
                </>
              )}
              {sheet.type === "reschedule" && (
                <>
                  <h2>Reschedule pickup</h2>
                  <p className="body-copy">
                    Propose a new window. Both students need to confirm the
                    updated details.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (sheet.end <= sheet.start) {
                        notify("End time must be after the start time.");
                        return;
                      }
                      changePickup({
                        date: sheet.date,
                        start: sheet.start,
                        end: sheet.end,
                        meeting: sheet.meeting,
                        [ownConfirmKey]: true,
                        [otherConfirmKey]: false,
                      });
                      setSheet(null);
                      notify(
                        `New pickup proposed. ${otherRole} confirmation is pending.`,
                      );
                    }}
                  >
                    <label className="field">
                      Pickup date
                      <input
                        required
                        type="date"
                        value={sheet.date}
                        onChange={(e) =>
                          setSheet({ ...sheet, date: e.target.value })
                        }
                      />
                    </label>
                    <div className="form-row">
                      <label className="field">
                        Start time
                        <input
                          required
                          type="time"
                          value={sheet.start}
                          onChange={(e) =>
                            setSheet({ ...sheet, start: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        End time
                        <input
                          required
                          type="time"
                          value={sheet.end}
                          onChange={(e) =>
                            setSheet({ ...sheet, end: e.target.value })
                          }
                        />
                      </label>
                    </div>
                    <label className="field">
                      Proposed public meeting point
                      <input
                        required
                        value={sheet.meeting}
                        onChange={(e) =>
                          setSheet({ ...sheet, meeting: e.target.value })
                        }
                        placeholder="e.g. USC Village outdoor seating"
                      />
                    </label>
                    <button className="primary full">Propose new pickup</button>
                  </form>
                </>
              )}
              {sheet.type === "cancel-pickup" && (
                <>
                  <h2>Cancel this pickup?</h2>
                  <p className="body-copy">
                    This reservation will move to your transaction history. You
                    can request another pickup later.
                  </p>
                  <div className="action-row spaced">
                    <button
                      className="secondary"
                      onClick={() => setSheet(null)}
                    >
                      Keep pickup
                    </button>
                    <button
                      className="primary"
                      onClick={() => {
                        changePickup({ status: "canceled" });
                        setSheet(null);
                        notify("Pickup canceled.");
                      }}
                    >
                      Cancel pickup
                    </button>
                  </div>
                </>
              )}
              {sheet.type === "complete" && (
                <>
                  <h2>All picked up?</h2>
                  <p className="body-copy">
                    Confirm that you received the {pickupItem.name}. The
                    purchase will move to completed history.
                  </p>
                  <button
                    className="primary full spaced"
                    onClick={() => {
                      changePickup({ status: "completed" });
                      update({
                        items: items.map((i) =>
                          i.id === pickupItem.id ? { ...i, status: "sold" } : i,
                        ),
                      });
                      setSheet({ type: "review", stars: 5, text: "" });
                      notify(
                        "Pickup marked complete. Thanks for keeping it in the Trojan community!",
                      );
                    }}
                  >
                    Confirm pickup completed
                  </button>
                </>
              )}
              {sheet.type === "review" && (
                <>
                  <h2>
                    {pickup?.reviewed ? "Your review" : "How was your pickup?"}
                  </h2>
                  {pickup?.reviewed ? (
                    <>
                      <div className="review-stars">
                        {"★".repeat(pickup.review.stars)}
                      </div>
                      <p className="body-copy">{pickup.review.text}</p>
                    </>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        changePickup({
                          reviewed: true,
                          review: { stars: sheet.stars, text: sheet.text },
                        });
                        setSheet(null);
                        notify("Your review was saved in the demo.");
                      }}
                    >
                      <div className="star-picker">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            type="button"
                            key={n}
                            aria-label={`${n} stars`}
                            onClick={() => setSheet({ ...sheet, stars: n })}
                          >
                            <Star
                              fill={n <= sheet.stars ? "currentColor" : "none"}
                            />
                          </button>
                        ))}
                      </div>
                      <label className="field">
                        Your review
                        <textarea
                          required
                          maxLength={500}
                          value={sheet.text}
                          onChange={(e) =>
                            setSheet({ ...sheet, text: e.target.value })
                          }
                          placeholder="Share your experience with this Trojan."
                        />
                      </label>
                      <button className="primary full">Submit review</button>
                    </form>
                  )}
                </>
              )}
              {sheet.type === "delete-listing" && (
                <>
                  <h2>Delete this listing?</h2>
                  <p className="body-copy">
                    {sheet.item.name} will be removed from your listings.
                    Existing messages and pickup records will be kept.
                  </p>
                  {state.pickups.some(
                    (p) =>
                      p.item === sheet.item.id &&
                      !["canceled", "completed"].includes(p.status),
                  ) ? (
                    <>
                      <p className="error">
                        Cancel the active pickup before deleting this listing.
                      </p>
                      <button
                        className="primary full spaced"
                        onClick={() =>
                          go("pickup", {
                            pickup: state.pickups.find(
                              (p) =>
                                p.item === sheet.item.id &&
                                !["canceled", "completed"].includes(p.status),
                            ).id,
                          })
                        }
                      >
                        View active pickup
                      </button>
                    </>
                  ) : (
                    <div className="action-row spaced">
                      <button
                        className="secondary"
                        onClick={() => setSheet(null)}
                      >
                        Keep listing
                      </button>
                      <button
                        className="primary"
                        onClick={() => {
                          update({
                            items: items.map((i) =>
                              i.id === sheet.item.id
                                ? { ...i, status: "deleted" }
                                : i,
                            ),
                            saved: state.saved.filter(
                              (id) => id !== sheet.item.id,
                            ),
                          });
                          go("listings", { root: true });
                          notify("Listing deleted.");
                        }}
                      >
                        Delete listing
                      </button>
                    </div>
                  )}
                </>
              )}
              {sheet.type === "notifications" && (
                <>
                  <h2>Notifications</h2>
                  {state.notifications.map((n) => (
                    <button
                      className={
                        "notification-row " + (!n.read ? "unread" : "")
                      }
                      key={n.id}
                      onClick={() => {
                        update({
                          notifications: state.notifications.map((x) =>
                            x.id === n.id ? { ...x, read: true } : x,
                          ),
                        });
                        if (n.id === 1) go("pickup", { pickup: "pickup-desk" });
                        else openChat("bookshelf", "priya");
                      }}
                    >
                      <Bell size={19} />
                      <span>{n.text}</span>
                      {!n.read && <i />}
                    </button>
                  ))}
                  <button
                    className="text-button full spaced"
                    onClick={() => {
                      update({
                        notifications: state.notifications.map((n) => ({
                          ...n,
                          read: true,
                        })),
                      });
                      notify("All notifications marked read.");
                    }}
                  >
                    Mark all as read
                  </button>
                </>
              )}
              {sheet.type === "edit-profile" && (
                <>
                  <h2>Edit profile</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      update({
                        profile: {
                          ...state.profile,
                          name: sheet.name,
                          year: sheet.year,
                          bio: sheet.bio,
                          avatar: sheet.avatar,
                        },
                      });
                      setSheet(null);
                      notify("Profile updated.");
                    }}
                  >
                    <label className="profile-photo-upload">
                      {sheet.avatar ? (
                        <img src={sheet.avatar} />
                      ) : (
                        <Camera size={26} />
                      )}
                      <span>Change photo</span>
                      <input
                        aria-label="Upload profile photo"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const pics = await uploadPhotos(e.target.files);
                          if (pics[0])
                            setSheet((s) => ({ ...s, avatar: pics[0] }));
                        }}
                      />
                    </label>
                    <label className="field">
                      Name
                      <input
                        required
                        maxLength={60}
                        value={sheet.name}
                        onChange={(e) =>
                          setSheet({ ...sheet, name: e.target.value })
                        }
                      />
                    </label>
                    <label className="field">
                      USC email
                      <input disabled value={state.profile.email} />
                    </label>
                    <label className="field">
                      Graduation year
                      <select
                        value={sheet.year}
                        onChange={(e) =>
                          setSheet({ ...sheet, year: e.target.value })
                        }
                      >
                        {["2026", "2027", "2028", "2029", "2030"].map((y) => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      About you
                      <textarea
                        maxLength={250}
                        value={sheet.bio}
                        onChange={(e) =>
                          setSheet({ ...sheet, bio: e.target.value })
                        }
                      />
                    </label>
                    <button className="primary full">Save profile</button>
                  </form>
                </>
              )}
              {sheet.type === "settings" && (
                <>
                  <h2>Settings</h2>
                  <button
                    className="sheet-option"
                    onClick={() => {
                      update({ reminders: !state.reminders });
                      notify(
                        state.reminders
                          ? "Default reminders off."
                          : "Default reminders on for new pickups.",
                      );
                    }}
                  >
                    <Bell />
                    Pickup reminders
                    <span>{state.reminders ? "On" : "Off"}</span>
                  </button>
                  <button
                    className="sheet-option"
                    onClick={() => setSheet({ type: "about" })}
                  >
                    <Info />
                    About this prototype
                    <ChevronRight size={16} />
                  </button>
                  <button
                    className="sheet-option"
                    onClick={() => {
                      update({
                        profile: { ...state.profile, verified: false },
                      });
                      setEmailVerified(false);
                      setCodeSent(false);
                      setCode("");
                      setHistory([]);
                      setSheet(null);
                      setScreen("verify");
                    }}
                  >
                    <LogOut />
                    Sign out
                    <ChevronRight size={16} />
                  </button>
                  <button
                    className="sheet-option danger"
                    onClick={() => setSheet({ type: "reset" })}
                  >
                    <Trash2 />
                    Reset demo data
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              {sheet.type === "about" && (
                <>
                  <h2>Trojan Marketplace</h2>
                  <p className="body-copy">Secondhand finds. Fellow Trojans.</p>
                  <p className="body-copy spaced">
                    A local, interactive case competition prototype.
                    Verification codes, student identities, reviews,
                    conversations, and seller confirmations are simulated. Your
                    edits stay in this browser. No live emails, messages,
                    payments, or notifications are sent. Calendar export
                    downloads a real .ics file.
                  </p>
                  <p className="body-copy spaced">
                    Approximate maps protect location privacy. Always choose a
                    public meeting point for pickup.
                  </p>
                </>
              )}
              {sheet.type === "reset" && (
                <>
                  <h2>Start the demo over?</h2>
                  <p className="body-copy">
                    This removes your local listings, chats, photos, reviews,
                    and reservations, then restores the sample screens.
                  </p>
                  <div className="action-row spaced">
                    <button
                      className="secondary"
                      onClick={() => setSheet(null)}
                    >
                      Keep my data
                    </button>
                    <button
                      className="primary"
                      onClick={() => {
                        setState(structuredClone(defaults));
                        setScreen("verify");
                        setSheet(null);
                        setHistory([]);
                        setEmail(DEFAULT_PROFILE.email);
                        setCode("");
                        setCodeSent(false);
                        setVerifyError("");
                        setEmailVerified(false);
                        notify("Demo reset.");
                      }}
                    >
                      Reset demo
                    </button>
                  </div>
                </>
              )}
              {sheet.type === "reviews" && (
                <>
                  <h2>Seller reviews</h2>
                  {(sheet.person === "maya"
                    ? state.reviews
                    : [
                        {
                          id: 1,
                          name: "Priya Shah",
                          year: "27",
                          stars: 5,
                          item: "IKEA MICKE desk",
                          date: "Oct 12",
                          text: "Exactly as described and super easy to coordinate pickup!",
                        },
                      ]
                  ).map((r) => (
                    <div className="review-card" key={r.id}>
                      <div>
                        <b>
                          {r.name} · USC ’{r.year}
                        </b>
                        <span>{"★".repeat(r.stars)}</span>
                      </div>
                      <small>
                        Buyer review · {r.item} · {r.date}
                      </small>
                      <p>{r.text}</p>
                    </div>
                  ))}
                  <p className="prototype-note">
                    Sample review content for this demo.
                  </p>
                </>
              )}
              {sheet.type === "report" && (
                <>
                  <h2>Report a concern</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      update({
                        reports: [
                          ...(state.reports || []),
                          {
                            person: sheet.person.name,
                            reason: sheet.reason,
                            date: new Date().toISOString(),
                          },
                        ],
                      });
                      setSheet(null);
                      notify(
                        "Report saved locally. This demo has no moderation service.",
                      );
                    }}
                  >
                    <label className="field">
                      What happened?
                      <textarea
                        required
                        value={sheet.reason}
                        onChange={(e) =>
                          setSheet({ ...sheet, reason: e.target.value })
                        }
                        placeholder="Tell us about the issue."
                      />
                    </label>
                    <p className="prototype-note">
                      Reports are only saved on this device in the prototype.
                    </p>
                    <button className="primary full spaced">Save report</button>
                  </form>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
