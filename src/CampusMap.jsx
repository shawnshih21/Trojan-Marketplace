import React, { useRef, useState } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
// An original, locally bundled street illustration based on the user's USC map.
// Points are neighborhood centers, deliberately not individual pickup addresses.
const centers = {
  "USC Village": [287, 350],
  "W 27th St": [364, 211],
  "West 28th St": [281, 251],
  "Ellendale Pl": [302, 174],
  "North University Park": [262, 294],
  "University Park": [354, 332],
  "West Adams": [120, 134],
};
const streets = [
  ["W 22nd St", 49],
  ["W 23rd St", 78],
  ["W 24th St", 106],
  ["W Adams Blvd", 139],
  ["W 27th St", 211],
  ["W 28th St", 253],
  ["W 29th St", 286],
  ["W 30th St", 321],
];
export default function CampusMap({
  items = [],
  focus = null,
  big = false,
  onItem,
  onArea,
}) {
  const [zoom, setZoom] = useState(1),
    [offset, setOffset] = useState([0, 0]);
  const drag = useRef(null);
  const moved = useRef(false);
  const w = 600 / zoom,
    h = 640 / zoom;
  const reset = () => {
    setZoom(1);
    setOffset([0, 0]);
  };
  const changeZoom = (delta) => {
    const next = Math.max(1, Math.min(2.5, zoom + delta));
    setZoom(next);
    setOffset(([x, y]) => [
      Math.min(x, 600 - 600 / next),
      Math.min(y, 640 - 640 / next),
    ]);
  };
  const point = (item) => centers[item.area || item.location] || [277, 310];
  return (
    <div
      className={"campus-map " + (big ? "large" : "compact")}
      aria-label="USC University Park area map"
    >
      <svg
        viewBox={
          focus && !big
            ? `0 ${Math.max(0, Math.min(320, point(focus)[1] - 160))} 600 320`
            : `${offset[0]} ${offset[1]} ${w} ${h}`
        }
        preserveAspectRatio="xMidYMid slice"
        aria-label="Street map around USC, with approximate listing areas"
        onPointerDown={(e) => {
          moved.current = false;
          if (!big || e.target.closest('[role="button"]')) return;
          drag.current = { x: e.clientX, y: e.clientY, offset };
          moved.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const dx = ((e.clientX - drag.current.x) * w) / rect.width,
            dy = ((e.clientY - drag.current.y) * h) / rect.height;
          if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
          setOffset([
            Math.max(0, Math.min(600 - w, drag.current.offset[0] - dx)),
            Math.max(0, Math.min(640 - h, drag.current.offset[1] - dy)),
          ]);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <defs>
          <pattern
            id="campus-blocks"
            width="32"
            height="29"
            patternUnits="userSpaceOnUse"
          >
            <rect width="32" height="29" fill="#f3f1ee" />
            <path d="M2 0V29M0 3H32" stroke="#e3e7e9" strokeWidth="2" />
          </pattern>
          <filter id="pin-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity=".13" />
          </filter>
        </defs>
        <rect width="600" height="640" fill="url(#campus-blocks)" />
        <g fill="#e7e6df" stroke="#dfe2df" strokeWidth="1">
          {[60, 98, 166, 190, 246, 286, 324, 364, 401].map((x, n) => (
            <React.Fragment key={x}>
              <rect x={x} y="159" width="17" height={n % 2 ? 29 : 42} />
              <rect x={x} y="222" width="18" height="20" />
              <rect x={x} y="263" width="19" height="13" />
              <rect x={x} y="300" width="19" height="12" />
            </React.Fragment>
          ))}
        </g>
        <path
          d="M222 362L287 353L467 448L420 553L222 553Z"
          fill="#d8ead9"
          stroke="#bedbc8"
          strokeWidth="2"
        />
        <path d="M224 580H455V640H224Z" fill="#d3e7d2" />
        <path d="M430 156L463 171L450 198L427 190Z" fill="#d8ead9" />
        <g stroke="#cdd7de" fill="none" strokeLinejoin="round">
          {streets.map(([name, y]) => (
            <path
              key={name}
              d={`M0 ${y}H421L600 ${y + 103}`}
              strokeWidth={name.includes("Adams") ? 14 : 9}
            />
          ))}
          {[14, 76, 125, 167, 218, 249, 286, 320, 400].map((x) => (
            <path
              key={x}
              d={`M${x} 25V${x >= 240 && x <= 320 ? 344 : 560}`}
              strokeWidth={x === 218 || x === 400 ? 13 : 8}
            />
          ))}
          <path d="M0 372H222L484 503" strokeWidth="17" />
          <path d="M0 557H600" strokeWidth="18" />
          <path d="M0 401H205M0 436H205M0 470H205M0 510H205" strokeWidth="8" />
        </g>
        <g stroke="#fff" fill="none" strokeLinejoin="round">
          {streets.map(([name, y]) => (
            <path
              key={name}
              d={`M0 ${y}H421L600 ${y + 103}`}
              strokeWidth={name.includes("Adams") ? 9 : 5}
            />
          ))}
          {[14, 76, 125, 167, 218, 249, 286, 320, 400].map((x) => (
            <path
              key={x}
              d={`M${x} 25V${x >= 240 && x <= 320 ? 344 : 560}`}
              strokeWidth={x === 218 || x === 400 ? 8 : 4}
            />
          ))}
          <path d="M0 372H222L484 503" strokeWidth="11" />
          <path d="M0 557H600" strokeWidth="12" />
          <path d="M0 401H205M0 436H205M0 470H205M0 510H205" strokeWidth="4" />
        </g>
        <g stroke="#f4f8f0" strokeWidth="4" fill="none">
          <path d="M240 385L426 484M237 418L411 513M239 451L393 538M250 369L243 547M289 383L268 550M333 405L302 548M375 425L340 550M419 446L378 550" />
        </g>
        <g fill="#c0dabe" stroke="#b6d2b7" strokeWidth="1">
          <path d="M253 394L285 411L273 439L245 425Z" />
          <path d="M305 435L339 454L327 482L293 465Z" />
          <path d="M356 463L391 480L376 508L343 489Z" />
          <rect x="248" y="597" width="75" height="28" rx="4" />
        </g>
        <g fill="none">
          <path
            d="M-5 18C160 15 326 25 474 10"
            stroke="#a9bfd0"
            strokeWidth="24"
          />
          <path
            d="M-5 18C160 15 326 25 474 10"
            stroke="#e2ecf2"
            strokeWidth="10"
          />
          <path d="M616 299L456 640" stroke="#b3c6d4" strokeWidth="32" />
          <path d="M616 299L456 640" stroke="#e8eff4" strokeWidth="14" />
          <path d="M569 329L449 557" stroke="#ccd8e1" strokeWidth="12" />
          <path d="M569 329L449 557" stroke="#fff" strokeWidth="7" />
        </g>
        <g
          className="street-labels"
          fill="#6f7980"
          fontFamily="DM Sans,Arial,sans-serif"
          fontSize="13"
        >
          {streets.map(([name, y]) => (
            <text key={name} x={name.includes("Adams") ? 230 : 18} y={y - 5}>
              {name}
            </text>
          ))}
          <text transform="translate(211 525) rotate(-90)" fontWeight="700">
            Vermont Ave
          </text>
          <text transform="translate(394 126) rotate(-90)">S Hoover St</text>
          <text transform="translate(119 128) rotate(-90)">Juliet St</text>
          <text transform="translate(161 521) rotate(-90)">S Catalina St</text>
          <text transform="translate(243 267) rotate(-90)">Menlo Ave</text>
          <text transform="translate(280 265) rotate(-90)">Ellendale Pl</text>
          <text transform="translate(314 265) rotate(-90)">Orchard Ave</text>
          <text x="58" y="552" fontWeight="700">
            Exposition Blvd
          </text>
          <text x="20" y="431">
            W 35th Pl
          </text>
          <text x="20" y="466">
            W 36th St
          </text>
          <text x="20" y="506">
            W 37th St
          </text>
          <text x="20" y="593">
            W 38th St
          </text>
          <text transform="translate(514 491) rotate(-63)">S Figueroa St</text>
        </g>
        <g fontFamily="DM Sans,Arial,sans-serif" textAnchor="middle">
          <text
            x="325"
            y="313"
            fontSize="12"
            fontWeight="700"
            letterSpacing="2"
            fill="#7c8284"
          >
            UNIVERSITY PARK
          </text>
          <text x="288" y="342" fontSize="11" fontWeight="700" fill="#948270">
            USC Village
          </text>
          <text x="339" y="472" fontSize="15" fill="#679377" fontWeight="700">
            <tspan x="339">University of</tspan>
            <tspan x="339" dy="19">
              Southern California
            </tspan>
          </text>
          <text x="331" y="618" fontSize="11" fill="#6d9b87">
            Exposition Park
          </text>
          <text x="471" y="223" fontSize="10" letterSpacing="1" fill="#7e8784">
            ST JAMES PARK
          </text>
          <g transform="translate(165 18)">
            <rect
              x="-12"
              y="-10"
              width="24"
              height="20"
              fill="#4983b4"
              rx="7"
              stroke="white"
              strokeWidth="2"
            />
            <text y="4" fill="white" fontSize="11" fontWeight="700">
              10
            </text>
          </g>
          <g transform="translate(543 472)">
            <rect
              x="-14"
              y="-10"
              width="28"
              height="20"
              fill="#4983b4"
              rx="7"
              stroke="white"
              strokeWidth="2"
            />
            <text y="4" fill="white" fontSize="10" fontWeight="700">
              110
            </text>
          </g>
        </g>
        {focus && (
          <g>
            <circle
              cx={point(focus)[0]}
              cy={point(focus)[1]}
              r="38"
              fill="#b0000018"
              stroke="#b0000060"
              strokeDasharray="4 5"
            />
            <g
              role="button"
              tabIndex="0"
              aria-label={`${focus.area || focus.location} approximate area`}
              onClick={() => onArea?.(focus)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onArea?.(focus);
              }}
              transform={`translate(${point(focus)[0]} ${point(focus)[1]})`}
            >
              <circle r="12" fill="#ae0000" stroke="white" strokeWidth="3" />
              <circle r="4" fill="white" />
            </g>
          </g>
        )}
        {items.map((item, n) => {
          const [x, y] = point(item);
          const peers = items.filter(
            (i) => (i.area || i.location) === (item.area || item.location),
          );
          const j = peers.findIndex((i) => i.id === item.id);
          const px = Math.min(
            557,
            Math.max(43, x + (j - (peers.length - 1) / 2) * 68),
          );
          return (
            <g
              key={item.id}
              className="map-price"
              role="button"
              tabIndex="0"
              aria-label={`$${item.price}`}
              transform={`translate(${px} ${y})`}
              onClick={(e) => {
                e.stopPropagation();
                if (!moved.current) onItem?.(item);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onItem?.(item);
                }
              }}
            >
              <title>
                {item.name} · {item.area || item.location} · {item.status} ·
                approximate area
              </title>
              <rect
                x="-27"
                y="-18"
                width="54"
                height="36"
                rx="18"
                fill="#b00000"
                stroke="white"
                strokeWidth="3"
                filter="url(#pin-shadow)"
              />
              <text
                textAnchor="middle"
                y="5"
                fill="white"
                fontFamily="DM Sans,Arial,sans-serif"
                fontSize="14"
                fontWeight="700"
              >
                ${item.price}
              </text>
              {item.status === "reserved" && (
                <circle
                  cx="22"
                  cy="-13"
                  r="5"
                  fill="#e8bd52"
                  stroke="white"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        })}
      </svg>
      <span className="map-north" aria-hidden="true">
        ↑ N
      </span>
      {big && (
        <div className="map-controls">
          <button
            aria-label="Zoom in map"
            onClick={() => changeZoom(0.5)}
            disabled={zoom >= 2.5}
          >
            <Plus size={16} />
          </button>
          <button
            aria-label="Zoom out map"
            onClick={() => changeZoom(-0.5)}
            disabled={zoom <= 1}
          >
            <Minus size={16} />
          </button>
          <button aria-label="Reset map view" onClick={reset}>
            <RotateCcw size={14} />
          </button>
        </div>
      )}
      <span className="map-disclaimer">
        Illustrated map · Approximate areas
      </span>
    </div>
  );
}
