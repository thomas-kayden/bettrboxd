import { useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import { Eye, FilmSlate, House, Plus, Users } from "@phosphor-icons/react";

type TabId = "home" | "reviews" | "watchlist" | "friends";
type Selection = TabId | "add";

const tabs: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "reviews", label: "Reviews" },
  { id: "watchlist", label: "Watchlist" },
  { id: "friends", label: "Friends" },
];

function iconFor(tab: TabId, active: boolean) {
  const weight = active ? ("fill" as const) : ("bold" as const);
  const props = { size: 22, weight };
  if (tab === "home") return <House {...props} />;
  if (tab === "reviews") return <FilmSlate {...props} />;
  if (tab === "watchlist") return <Eye {...props} />;
  return <Users {...props} />;
}

function currentTab(): TabId {
  const active = document.querySelector(".mobile-primary-nav button.active");
  const label = active?.textContent?.trim().toLowerCase();
  return tabs.find((tab) => tab.label.toLowerCase() === label)?.id ?? "home";
}

function activateTab(tab: TabId) {
  const button = [...document.querySelectorAll(".primary-nav-cluster button")].find(
    (candidate) => candidate.textContent?.trim().toLowerCase() === tab,
  );
  button instanceof HTMLElement && button.click();
}

function MobileNavigation() {
  const [active, setActive] = useState<Selection>(currentTab);

  return (
    <div className="mobile-react-nav-overlay">
      <div className="mobile-react-nav-dock">
        <nav className="mobile-react-nav-pill" aria-label="Primary navigation">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                className={`mobile-react-nav-tab ${isActive ? "is-active" : ""}`}
                key={tab.id}
                type="button"
                onClick={() => {
                  setActive(tab.id);
                  activateTab(tab.id);
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavigationPill"
                    className="mobile-react-nav-active-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.9 }}
                  />
                )}
                {iconFor(tab.id, isActive)}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          aria-label="Add review"
          className={`mobile-react-nav-add ${active === "add" ? "is-active" : ""}`}
          onClick={() => {
            setActive("add");
            const opener = (window as any).bettrboxdOpenComposer;
            if (typeof opener === "function") opener();
            else document.querySelector<HTMLButtonElement>(".mobile-nav-search.mobile-nav-add")?.click();
          }}
        >
          <Plus weight="bold" size={24} />
        </button>
      </div>
    </div>
  );
}

let root: HTMLElement | null = null;
let navRoot: ReturnType<typeof createRoot> | null = null;

function mount() {
  if (root || document.querySelector(".mobile-react-nav-overlay")) return;
  root = document.createElement("div");
  root.id = "mobile-react-nav-root";
  document.body.append(root);
  navRoot = createRoot(root);
  navRoot.render(<MobileNavigation />);
}

function unmount() {
  if (!root) return;
  navRoot?.unmount();
  navRoot = null;
  root.remove();
  root = null;
}

function sync() {
  const onAuthGate = !!document.querySelector("main.auth-gate");
  const appShell = !!document.querySelector(".page.top-nav-layout");
  if (onAuthGate || !appShell) unmount();
  else mount();
}

function init() {
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();