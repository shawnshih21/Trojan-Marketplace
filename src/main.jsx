import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ArrowUpRight,
  Heart,
  Plus,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Armchair,
  ShieldCheck,
  MessageCircle,
  Bookmark,
  LayoutGrid,
  Map,
  ArrowRight,
  Send,
  CalendarDays,
  Star,
  LogOut,
  Menu,
  CheckCheck,
  Upload,
  Leaf,
} from "lucide-react";
import "./style.css";
const photo = (id) =>
  "/images/" +
  ({
    "photo-1518455027359-f3f8164ba6bd": "desk",
    "photo-1567538096630-e0c55bd6374c": "chair",
    "photo-1594620302200-9a762244a156": "storage",
    "photo-1555041469-a586c61ea9bc": "sofa",
    "photo-1505693416388-ac5ce068fe85": "accent",
    "photo-1507473885765-e6ed057f782c": "lamp",
    "photo-1616486338812-3dadae4b4ace": "hero",
  }[id] || "hero") +
  ".jpg";
const initial = [
  {
    id: 1,
    title: "The perfect study desk",
    name: "Minimal console desk",
    price: 45,
    category: "Desks",
    image: photo("photo-1518455027359-f3f8164ba6bd"),
    location: "USC Village",
    distance: "0.3 mi",
    condition: "Good",
    seller: "Alex Martinez",
    color: "White",
    size: "41 × 20 × 29 in",
    description:
      "A new home for your study setup. A slim console-style desk with room for your laptop and a few favorite things. Minor signs of use, plenty of good study sessions left.",
    tag: "POPULAR FIND",
  },
  {
    id: 2,
    title: "Your new favorite seat",
    name: "Mid-century lounge chair",
    price: 65,
    category: "Chairs",
    image: photo("photo-1567538096630-e0c55bd6374c"),
    location: "West 28th St",
    distance: "0.5 mi",
    condition: "Like new",
    seller: "Priya Shah",
    color: "Cream",
    size: "28 × 30 × 32 in",
    description:
      "The comfiest corner of my apartment. This beautiful accent chair is in excellent condition. Moving out and hoping it finds a lovely new home.",
    tag: "JUST LISTED",
  },
  {
    id: 3,
    title: "Room for a little more",
    name: "Oak media console",
    price: 25,
    category: "Storage",
    image: photo("photo-1594620302200-9a762244a156"),
    location: "North University Park",
    distance: "0.6 mi",
    condition: "Good",
    seller: "Maya Chen",
    color: "Oak",
    size: "24 × 12 × 36 in",
    description:
      "A sturdy media console with warm oak tones and a little color. A few light scuffs, plenty of storage for books, records, or everyday essentials.",
    tag: "",
  },
  {
    id: 4,
    title: "Stay in a little longer",
    name: "Cozy two-seat sofa",
    price: 120,
    category: "Sofas",
    image: photo("photo-1555041469-a586c61ea9bc"),
    location: "Ellendale Pl",
    distance: "0.7 mi",
    condition: "Good",
    seller: "Sam Rivera",
    color: "Green",
    size: "62 × 32 × 30 in",
    description:
      "A cozy sofa for movie nights and lazy Sundays. Clean, comfortable, and from a smoke-free apartment. Bring a friend to help carry!",
    tag: "GREAT DEAL",
  },
  {
    id: 5,
    title: "A softer landing",
    name: "Scandinavian accent chair",
    price: 40,
    category: "Chairs",
    image: photo("photo-1505693416388-ac5ce068fe85"),
    location: "University Park",
    distance: "0.4 mi",
    condition: "Like new",
    seller: "Elena Park",
    color: "Beige",
    size: "22 × 20 × 32 in",
    description:
      "A light, comfortable accent chair for a study corner or dining table. Clean and ready for a new home.",
    tag: "",
  },
  {
    id: 6,
    title: "Light up your space",
    name: "Adjustable desk lamp",
    price: 18,
    category: "Decor",
    image: photo("photo-1507473885765-e6ed057f782c"),
    location: "West Adams",
    distance: "0.9 mi",
    condition: "Good",
    seller: "Noah Williams",
    color: "Black",
    size: "22 in tall",
    description:
      "Warm light for your reading corner. Works perfectly and includes an LED bulb.",
    tag: "UNDER $25",
  },
];
function useStored(key, value) {
  const [v, set] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? value;
    } catch {
      return value;
    }
  });
  return [
    v,
    (n) =>
      set((old) => {
        const next = typeof n === "function" ? n(old) : n;
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      }),
  ];
}
function App() {
  const [items, setItems] = useStored("trojan-items", initial),
    [saved, setSaved] = useStored("trojan-saved", []),
    [messages, setMessages] = useStored("trojan-messages", []),
    [reserved, setReserved] = useStored("trojan-reserved", []);
  const [page, setPage] = useState("Browse"),
    [category, setCategory] = useState("All finds"),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState(null),
    [modal, setModal] = useState(null),
    [max, setMax] = useState(250),
    [condition, setCondition] = useState("Any condition"),
    [map, setMap] = useState(false),
    [toast, setToast] = useState(""),
    [chat, setChat] = useState(null),
    [text, setText] = useState(""),
    [sort, setSort] = useState("Recommended"),
    [upload, setUpload] = useState(""),
    [editing, setEditing] = useState(null);
  const notify = (t) => {
    setToast(t);
    setTimeout(() => setToast(""), 3500);
  };
  const toggle = (id) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const navigate = (p) => {
    setPage(p);
    setChat(null);
    setSearch("");
  };
  let shown = items.filter(
    (i) =>
      (category === "All finds" || i.category === category) &&
      `${i.name} ${i.location}`.toLowerCase().includes(search.toLowerCase()) &&
      i.price <= max &&
      (condition === "Any condition" || i.condition === condition),
  );
  if (sort === "Price: low to high") shown.sort((a, b) => a.price - b.price);
  if (sort === "Price: high to low") shown.sort((a, b) => b.price - a.price);
  if (sort === "Newest first") shown.reverse();
  const openChat = (i) => {
    setSelected(null);
    setChat(i);
    setPage("Inbox");
  };
  function card(i) {
    return (
      <article className="product" key={i.id}>
        <div className="product-image" onClick={() => setSelected(i)}>
          <img src={i.image} alt={i.name} />
          {i.tag && <span className="image-tag">{i.tag}</span>}
          <button
            aria-label={saved.includes(i.id) ? "Unsave item" : "Save item"}
            className={"heart " + (saved.includes(i.id) ? "saved" : "")}
            onClick={(e) => {
              e.stopPropagation();
              toggle(i.id);
            }}
          >
            <Heart
              size={18}
              fill={saved.includes(i.id) ? "currentColor" : "none"}
            />
          </button>
          <span className="view-item">
            Take a closer look <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="product-info" onClick={() => setSelected(i)}>
          <div className="product-line">
            <h3>{i.name}</h3>
            <strong>${i.price}</strong>
          </div>
          <p>
            <MapPin size={13} />
            {i.location}
            <span>· {i.distance}</span>
          </p>
          <div className="card-bottom">
            <span className="condition">{i.condition} condition</span>
            <span>
              <ShieldCheck size={12} /> USC verified
            </span>
          </div>
        </div>
      </article>
    );
  }
  return (
    <>
      <header>
        <div className="header-inner">
          <a className="brand" onClick={() => navigate("Browse")}>
            <span className="brand-icon">
              <Armchair size={25} />
            </span>
            <span>
              Trojan
              <span className="brand-second">
                Marketplace<span className="brand-dot">.</span>
              </span>
            </span>
          </a>
          <nav>
            {["Browse", "Activity", "Inbox"].map((p) => (
              <button
                className={page === p ? "active" : ""}
                onClick={() => navigate(p)}
                key={p}
              >
                {p}
                {p === "Inbox" && <span className="nav-dot" />}
              </button>
            ))}
          </nav>
          <div className="header-right">
            <span className="campus">
              <MapPin size={14} /> USC, Los Angeles
            </span>
            <button
              className="sell-button"
              onClick={() => {
                setEditing(null);
                setUpload("");
                setModal("listing");
              }}
            >
              <Plus size={17} /> Sell an item
            </button>
            <button
              className="avatar"
              aria-label="Open profile"
              onClick={() => navigate("Profile")}
            >
              MC
            </button>
          </div>
        </div>
      </header>
      <main>
        {page === "Browse" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span /> MADE FOR THE TROJAN COMMUNITY
                </div>
                <h1>
                  Good furniture.
                  <br />
                  Even better <span>neighbors.</span>
                </h1>
                <p>
                  Secondhand finds. Fresh starts. Buy and sell furniture
                  <br className="desktop" /> with verified USC students, right
                  around campus.
                </p>
                <div className="hero-actions">
                  <button
                    onClick={() =>
                      document
                        .getElementById("finds")
                        .scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Find your next favorite <ArrowRight size={17} />
                  </button>
                  <div className="student-proof">
                    <div className="mini-avatars">
                      <span>MC</span>
                      <span>AM</span>
                      <span>PS</span>
                    </div>
                    <span>
                      From one Trojan
                      <br />
                      <b>to another.</b>
                    </span>
                  </div>
                </div>
              </div>
              <div className="hero-art">
                <img
                  src={photo("photo-1616486338812-3dadae4b4ace")}
                  alt="Sunlit apartment with comfortable secondhand furniture"
                />
                <div className="hero-shade" />
                <span className="floating-badge">
                  <ShieldCheck size={17} /> Verified students. Real connections.
                </span>
                <div className="hero-caption">
                  <span>A LITTLE PRE-LOVED. A LOT TO LOVE.</span>
                  <h3>Your space, your next chapter.</h3>
                </div>
                <div className="price-sticker">
                  <span>
                    New home.
                    <br />
                    Less spending.
                  </span>
                  <Leaf size={22} />
                </div>
              </div>
            </section>
            <div className="trust-strip">
              <span>
                <ShieldCheck /> Exclusively for USC students
              </span>
              <i />
              <span>
                <MapPin /> Good finds, close to campus
              </span>
              <i />
              <span>
                <Leaf /> Less waste. More possibility.
              </span>
            </div>
            <section className="market" id="finds">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">THE CAMPUS EDIT</div>
                  <h2>
                    A new home starts here<span>.</span>
                  </h2>
                  <p>Great pieces, student prices. All a short walk away.</p>
                </div>
                <span className="live">
                  <span /> Fresh finds added daily
                </span>
              </div>
              <div className="search-row">
                <div className="search-box">
                  <Search size={19} />
                  <input
                    placeholder="Search for a desk, a cozy sofa, your next find…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch("")}>
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  className={
                    "filter-button " +
                    (max < 250 || condition !== "Any condition"
                      ? "filtered"
                      : "")
                  }
                  onClick={() => setModal("filters")}
                >
                  <SlidersHorizontal size={17} />
                  Filters{(max < 250 || condition !== "Any condition") && " •"}
                </button>
              </div>
              <div className="category-row">
                <div className="categories">
                  {[
                    "All finds",
                    "Desks",
                    "Chairs",
                    "Sofas",
                    "Beds",
                    "Storage",
                    "Decor",
                  ].map((c) => (
                    <button
                      className={category === c ? "chosen" : ""}
                      onClick={() => setCategory(c)}
                      key={c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="view-toggle">
                  <button
                    className={!map ? "chosen" : ""}
                    onClick={() => setMap(false)}
                  >
                    <LayoutGrid size={15} /> List
                  </button>
                  <button
                    className={map ? "chosen" : ""}
                    onClick={() => setMap(true)}
                  >
                    <Map size={15} /> Map
                  </button>
                </div>
              </div>
              <div className="results-line">
                <span>
                  <b>{shown.length} finds</b> near campus{" "}
                  <span className="subtle">· within 1 mile of USC</span>
                </span>
                <label>
                  Sort by:{" "}
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    {[
                      "Recommended",
                      "Newest first",
                      "Price: low to high",
                      "Price: high to low",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              {map ? (
                <div className="campus-map">
                  <div className="map-road r1" />
                  <div className="map-road r2" />
                  <div className="map-road r3" />
                  <div className="campus-block">
                    UNIVERSITY OF
                    <br />
                    SOUTHERN CALIFORNIA
                  </div>
                  <span className="map-village">USC Village</span>
                  {shown.map((i, n) => (
                    <button
                      className="map-pin"
                      style={{
                        left: `${18 + ((n * 13) % 65)}%`,
                        top: `${15 + ((n * 19) % 64)}%`,
                      }}
                      onClick={() => setSelected(i)}
                      key={i.id}
                    >
                      ${i.price}
                    </button>
                  ))}
                  <span className="map-note">
                    <ShieldCheck size={14} /> Approximate locations only. Exact
                    pickup shared after confirmation.
                  </span>
                </div>
              ) : (
                <div className="product-grid">{shown.map(card)}</div>
              )}
              {shown.length === 0 && (
                <div className="empty">
                  <Search size={32} />
                  <h3>No finds just yet</h3>
                  <p>Try another search or widen your filters.</p>
                  <button
                    className="primary"
                    onClick={() => {
                      setSearch("");
                      setCategory("All finds");
                      setMax(250);
                      setCondition("Any condition");
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              )}
              <div className="community-banner">
                <span className="banner-icon">
                  <Armchair size={33} />
                </span>
                <div>
                  <h3>Moving out? Pass the good stuff on.</h3>
                  <p>
                    Your old favorite could be another Trojan’s new beginning.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditing(null);
                    setUpload("");
                    setModal("listing");
                  }}
                >
                  List your furniture <ArrowUpRight size={17} />
                </button>
              </div>
            </section>
          </>
        ) : page === "Inbox" ? (
          <section className="inner-page">
            <div className="eyebrow">A CONVERSATION BETWEEN TROJANS</div>
            <h1>
              Your inbox<span>.</span>
            </h1>
            <div className="inbox-layout">
              <aside>
                {items.slice(0, 3).map((i, n) => (
                  <button
                    className={chat?.id === i.id ? "selected-chat" : ""}
                    onClick={() => setChat(i)}
                    key={i.id}
                  >
                    <img src={i.image} />
                    <div>
                      <b>{i.seller}</b>
                      <span>
                        {i.name} · ${i.price}
                      </span>
                      <p>
                        {n === 0
                          ? "Happy to help with pickup!"
                          : "Is this still available?"}
                      </p>
                    </div>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </aside>
              <div className="chat-panel">
                {chat ? (
                  <>
                    <div className="chat-heading">
                      <div className="avatar">
                        {chat.seller
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <b>{chat.seller}</b>
                        <span>
                          <ShieldCheck size={12} /> USC verified student
                        </span>
                      </div>
                      <button onClick={() => setSelected(chat)}>
                        {chat.name} <ChevronRight size={15} />
                      </button>
                    </div>
                    <div className="chat-messages">
                      <span className="chat-date">Today</span>
                      <p className="bubble">
                        Hi! Yes, the {chat.name} is still available. When would
                        you like to pick it up?
                      </p>
                      {messages
                        .filter((m) => m.item === chat.id)
                        .map((m, n) => (
                          <p key={n} className="bubble mine">
                            {m.text}
                            <CheckCheck size={13} />
                          </p>
                        ))}
                      {reserved.includes(chat.id) && (
                        <div className="pickup-chat">
                          <CalendarDays size={20} />
                          <b>Pickup requested</b>
                          <span>Friday, October 23 · 4:00–6:00 PM</span>
                          <button
                            onClick={() => {
                              setSelected(chat);
                              setModal("pickup");
                            }}
                          >
                            View pickup details →
                          </button>
                        </div>
                      )}
                    </div>
                    <form
                      className="message-input"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (text.trim()) {
                          setMessages((m) => [
                            ...m,
                            { item: chat.id, text: text.trim() },
                          ]);
                          setText("");
                        }
                      }}
                    >
                      <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a message…"
                      />
                      <button className="primary" aria-label="Send message">
                        <Send size={19} />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="empty">
                    <MessageCircle size={38} />
                    <h3>Good finds start with a hello.</h3>
                    <p>Select a conversation to coordinate your next find.</p>
                  </div>
                )}
              </div>
            </div>
            <p className="demo-note">
              Local prototype · Messages are saved on this device and are not
              sent to other users.
            </p>
          </section>
        ) : page === "Activity" ? (
          <section className="inner-page">
            <div className="eyebrow">YOUR NEXT CHAPTER, ORGANIZED</div>
            <h1>
              My activity<span>.</span>
            </h1>
            <div className="activity-grid">
              <div>
                <h2>
                  Upcoming pickups{" "}
                  <span className="count">{reserved.length}</span>
                </h2>
                {reserved.length ? (
                  items
                    .filter((i) => reserved.includes(i.id))
                    .map((i) => (
                      <div className="activity-card" key={i.id}>
                        <div className="activity-item">
                          <img src={i.image} />
                          <div>
                            <h3>{i.name}</h3>
                            <p>{i.seller} · USC verified</p>
                            <span className="pill yellow">
                              Awaiting seller confirmation
                            </span>
                          </div>
                          <strong>${i.price}</strong>
                        </div>
                        <p className="pickup-time">
                          <CalendarDays size={19} /> Fri, Oct 23 · 4:00–6:00 PM
                        </p>
                        <button
                          className="primary full"
                          onClick={() => {
                            setSelected(i);
                            setModal("pickup");
                          }}
                        >
                          View pickup details
                        </button>
                      </div>
                    ))
                ) : (
                  <div className="empty small">
                    <CalendarDays size={30} />
                    <h3>Your next find is waiting</h3>
                    <p>Reserve a listing to arrange a pickup.</p>
                    <button
                      className="text-button"
                      onClick={() => navigate("Browse")}
                    >
                      Explore campus finds →
                    </button>
                  </div>
                )}
                <h2>My listings</h2>
                {items
                  .filter((i) => i.seller === "Maya Chen")
                  .map((i) => (
                    <div
                      className="compact-item"
                      key={i.id}
                      onClick={() => setSelected(i)}
                    >
                      <img src={i.image} />
                      <div>
                        <h3>{i.name}</h3>
                        <p>{i.location}</p>
                        <span className="pill green">Active listing</span>
                      </div>
                      <strong>${i.price}</strong>
                    </div>
                  ))}
              </div>
              <div>
                <h2>
                  Saved for your space{" "}
                  <span className="count">{saved.length}</span>
                </h2>
                {saved.length ? (
                  items.filter((i) => saved.includes(i.id)).map(card)
                ) : (
                  <div className="empty small">
                    <Heart size={30} />
                    <h3>Keep your favorites close</h3>
                    <p>Tap the heart on a listing to save it here.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="inner-page profile-page">
            <div className="eyebrow">A FAMILIAR FACE AROUND CAMPUS</div>
            <h1>
              Your profile<span>.</span>
            </h1>
            <div className="profile-top">
              <div className="profile-avatar">MC</div>
              <div>
                <h2>
                  Maya Chen <ShieldCheck size={23} />
                </h2>
                <p>maya.chen@usc.edu</p>
                <span className="pill red">
                  <ShieldCheck size={13} /> USC ’27 · Demo student profile
                </span>
              </div>
              <button
                className="filter-button"
                onClick={() => setModal("profile")}
              >
                Edit profile
              </button>
            </div>
            <div className="stats">
              {[
                ["3", "Items bought"],
                ["2", "Items sold"],
                ["5.0", "Seller rating"],
              ].map(([n, t]) => (
                <div key={t}>
                  <strong>{n}</strong>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <h2>Your listings</h2>
            <div className="product-grid profile-grid">
              {items.filter((i) => i.seller === "Maya Chen").map(card)}
            </div>
            <h2>Kind words from fellow Trojans</h2>
            <div className="reviews">
              {["Elena Park", "Noah Williams"].map((n) => (
                <div className="review" key={n}>
                  <div>
                    <b>{n} · USC ’26</b>
                    <span>★★★★★</span>
                  </div>
                  <p>
                    Exactly as described and so easy to coordinate pickup.
                    Thanks for helping my new place feel like home!
                  </p>
                </div>
              ))}
            </div>
            <p className="demo-note">
              <ShieldCheck size={14} /> Prototype profile · Member since August
              2025
            </p>
          </section>
        )}
      </main>
      <footer>
        <a className="footer-brand" onClick={() => navigate("Browse")}>
          <Armchair size={20} /> Trojan Marketplace.
        </a>
        <span>Secondhand finds. Fellow Trojans.</span>
        <span>
          Made for a little more community.{" "}
          <span className="footer-heart">♡</span>
        </span>
      </footer>
      <div className="mobile-nav">
        {[
          ["Browse", LayoutGrid],
          ["Activity", Bookmark],
          ["Sell", Plus],
          ["Inbox", MessageCircle],
          ["Profile", ShieldCheck],
        ].map(([p, Icon]) => (
          <button
            key={p}
            className={page === p ? "active" : ""}
            onClick={() => (p === "Sell" ? setModal("listing") : navigate(p))}
          >
            <Icon size={21} />
            <span>{p}</span>
          </button>
        ))}
      </div>
      {selected && !modal && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              aria-label="Close details"
              onClick={() => setSelected(null)}
            >
              <X size={21} />
            </button>
            <div className="detail-photo">
              <img src={selected.image} alt={selected.name} />
              <button className="heart" onClick={() => toggle(selected.id)}>
                <Heart
                  size={20}
                  fill={saved.includes(selected.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
            <div className="detail-content">
              <span className="eyebrow">A NEW HOME FOR YOUR SPACE</span>
              <div className="detail-title">
                <h2>{selected.name}</h2>
                <strong>${selected.price}</strong>
              </div>
              <p className="location">
                <MapPin size={15} />
                {selected.location} · {selected.distance} from campus
              </p>
              <div className="pills">
                <span className="pill green">
                  {reserved.includes(selected.id)
                    ? "Reservation requested"
                    : "Available"}
                </span>
                <span className="pill red">{selected.condition} condition</span>
                <span className="pill">{selected.color}</span>
              </div>
              <div className="seller">
                <div className="avatar">
                  {selected.seller
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <b>{selected.seller}</b>
                  <p>USC ’26 · Verified student</p>
                </div>
                <ShieldCheck size={23} />
                <span className="seller-rating">
                  ★ 4.9 <small>· 12 reviews</small>
                </span>
              </div>
              <h3>Condition & description</h3>
              <p className="description">{selected.description}</p>
              <div className="spec-row">
                <div>
                  <span>Dimensions</span>
                  <b>{selected.size}</b>
                </div>
                <div>
                  <span>Pickup</span>
                  <b>Bring a friend to help carry</b>
                </div>
              </div>
              <h3>Pickup availability</h3>
              <div className="availability">
                <CalendarDays size={22} />
                <div>
                  <b>{selected.availability || "Fri, Oct 23 · 4:00–6:00 PM"}</b>
                  <span>Pickup only · Near {selected.location}</span>
                </div>
              </div>
              <p className="privacy-note">
                <ShieldCheck size={14} /> Exact meeting point is shared after
                both students confirm.
              </p>
              {selected.seller === "Maya Chen" && (
                <button
                  className="secondary full"
                  onClick={() => {
                    setEditing(selected);
                    setUpload(selected.image);
                    setModal("listing");
                  }}
                >
                  Edit your listing
                </button>
              )}
              <div className="detail-buttons">
                <button
                  className="secondary"
                  onClick={() => openChat(selected)}
                >
                  <MessageCircle size={17} /> Message seller
                </button>
                <button className="primary" onClick={() => setModal("reserve")}>
                  {reserved.includes(selected.id)
                    ? "View reservation"
                    : "Request to reserve"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div
            className={"modal " + (modal === "listing" ? "listing-modal" : "")}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X size={21} />
            </button>
            {modal === "filters" ? (
              <>
                <span className="eyebrow">FIND YOUR PERFECT FIT</span>
                <h2>A little more specific.</h2>
                <label className="field">
                  Maximum price <b>${max}</b>
                  <input
                    type="range"
                    min="10"
                    max="250"
                    step="5"
                    value={max}
                    onChange={(e) => setMax(+e.target.value)}
                  />
                </label>
                <label className="field">
                  Condition
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    <option>Any condition</option>
                    <option>Like new</option>
                    <option>Good</option>
                  </select>
                </label>
                <div className="modal-actions">
                  <button
                    className="secondary"
                    onClick={() => {
                      setMax(250);
                      setCondition("Any condition");
                    }}
                  >
                    Reset
                  </button>
                  <button className="primary" onClick={() => setModal(null)}>
                    Show finds <ArrowRight size={17} />
                  </button>
                </div>
              </>
            ) : modal === "listing" ? (
              <>
                <span className="eyebrow">PASS THE GOOD STUFF ON</span>
                <h2>
                  {editing
                    ? "Give your listing a refresh."
                    : "Make room for what's next."}
                </h2>
                <p className="subtle">
                  Give your furniture a new home with a fellow Trojan.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.target);
                    const item = {
                      id: editing?.id || Date.now(),
                      name: f.get("title"),
                      price: +f.get("price"),
                      category: f.get("category"),
                      condition: f.get("condition"),
                      location: f.get("location"),
                      description: f.get("description"),
                      size: f.get("dimensions"),
                      availability: f.get("availability"),
                      seller: "Maya Chen",
                      distance: "Near campus",
                      color: "",
                      tag: "JUST LISTED",
                      image: upload || initial[2].image,
                    };
                    setItems((i) =>
                      editing
                        ? i.map((x) => (x.id === editing.id ? item : x))
                        : [item, ...i],
                    );
                    setModal(null);
                    setSelected(null);
                    setPage("Profile");
                    notify(
                      editing
                        ? "Listing updated."
                        : "Your listing is live on this device. Welcome to its next chapter!",
                    );
                    setEditing(null);
                  }}
                >
                  <label className="upload-box">
                    {upload ? (
                      <img src={upload} />
                    ) : (
                      <>
                        <Upload size={25} />
                        <b>Add a photo</b>
                        <span>Choose a photo of your furniture</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2500000) {
                            notify("Please choose an image under 2.5 MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => setUpload(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <label className="field">
                    Listing title
                    <input
                      name="title"
                      defaultValue={editing?.name}
                      placeholder="e.g. Oak media console"
                      required
                      maxLength="80"
                    />
                  </label>
                  <div className="form-row">
                    <label className="field">
                      Price ($)
                      <input
                        name="price"
                        defaultValue={editing?.price}
                        type="number"
                        min="0"
                        max="10000"
                        required
                        placeholder="25"
                      />
                    </label>
                    <label className="field">
                      Category
                      <select name="category" defaultValue={editing?.category}>
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
                        name="condition"
                        defaultValue={editing?.condition}
                      >
                        <option>Good</option>
                        <option>Like new</option>
                      </select>
                    </label>
                    <label className="field">
                      Dimensions
                      <input
                        name="dimensions"
                        defaultValue={editing?.size}
                        placeholder="24 × 12 × 36 in"
                        required
                      />
                    </label>
                  </div>
                  <label className="field">
                    Description
                    <textarea
                      name="description"
                      defaultValue={editing?.description}
                      required
                      placeholder="What makes this piece a great find? Mention any wear."
                    />
                  </label>
                  <label className="field">
                    Approximate pickup area
                    <input
                      name="location"
                      defaultValue={editing?.location}
                      required
                      placeholder="e.g. West 28th St · Near campus"
                    />
                  </label>
                  <p className="privacy-note">
                    <ShieldCheck size={14} /> Share an approximate area, never
                    your exact address.
                  </p>
                  <label className="field">
                    Pickup availability
                    <input
                      name="availability"
                      defaultValue={
                        editing?.availability || "Fri, Oct 23 · 4:00–6:00 PM"
                      }
                      required
                      placeholder="Day and available time window"
                    />
                  </label>
                  <button className="primary full">
                    {editing ? "Save changes" : "Publish listing"}{" "}
                    <ArrowUpRight size={17} />
                  </button>
                  <p className="demo-note">
                    Listings are saved locally in this prototype.
                  </p>
                </form>
              </>
            ) : modal === "profile" ? (
              <>
                <h2>Your student profile</h2>
                <p>
                  This prototype uses Maya’s sample profile. Real USC email
                  verification and account editing require an authentication
                  service.
                </p>
                <button className="primary full" onClick={() => setModal(null)}>
                  Got it
                </button>
              </>
            ) : (
              <>
                <span className="eyebrow">ONE STEP CLOSER TO HOME</span>
                <h2>
                  {modal === "pickup"
                    ? "Your pickup details."
                    : "Make it your next find."}
                </h2>
                <div className="compact-item">
                  <img src={selected?.image} />
                  <div>
                    <h3>{selected?.name}</h3>
                    <p>{selected?.seller}</p>
                  </div>
                  <strong>${selected?.price}</strong>
                </div>
                {reserved.includes(selected?.id) ? (
                  <>
                    <div className="reservation-status">
                      <CalendarDays size={27} />
                      <h3>Pickup request sent</h3>
                      <p>Friday, October 23 · 4:00–6:00 PM</p>
                      <span className="pill yellow">
                        Awaiting seller confirmation
                      </span>
                    </div>
                    <p className="description">
                      Approximate area: {selected?.location}. The exact meeting
                      point will be shared once both students confirm.
                    </p>
                    <div className="modal-actions">
                      <button
                        className="secondary"
                        onClick={() => {
                          setReserved((r) =>
                            r.filter((id) => id !== selected.id),
                          );
                          setModal(null);
                          notify("Reservation canceled");
                        }}
                      >
                        Cancel request
                      </button>
                      <button
                        className="primary"
                        onClick={() => {
                          setModal(null);
                          openChat(selected);
                        }}
                      >
                        Message seller
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="description">
                      Request this pickup window from{" "}
                      {selected?.seller.split(" ")[0]}. They’ll confirm the time
                      and meeting point in your conversation.
                    </p>
                    <div className="availability">
                      <CalendarDays size={23} />
                      <div>
                        <b>Friday, October 23, 2026</b>
                        <span>4:00–6:00 PM · {selected?.location}</span>
                      </div>
                    </div>
                    <p className="privacy-note">
                      <ShieldCheck size={15} /> No payment is collected.
                      Coordinate payment and pickup directly.
                    </p>
                    <button
                      className="primary full"
                      onClick={() => {
                        setReserved((r) => [...r, selected.id]);
                        notify("Pickup requested. Track it in My Activity.");
                      }}
                    >
                      Send pickup request <ArrowRight size={17} />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {toast && (
        <div className="toast">
          <Check size={19} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
