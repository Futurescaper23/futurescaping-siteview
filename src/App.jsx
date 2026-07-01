import { useEffect, useMemo, useRef, useState } from "react";
import LayerViewer from "./components/LayerViewer.jsx";
import PanoramaViewer from "./components/PanoramaViewer.jsx";
import DownloadsPanel from "./components/DownloadsPanel.jsx";
import HelpPanel from "./components/HelpPanel.jsx";

const workspaceTabs = [
  { id: "viewer", label: "Layer Viewer" },
  { id: "downloads", label: "Drawings & Downloads" },
  { id: "help", label: "Help" }
];

const heroNavItems = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "viewpoints", label: "Viewpoints", icon: "marker" },
  { id: "viewer", label: "Viewer", icon: "scene" },
  { id: "panorama", label: "Panoramas", icon: "lens" },
  { id: "downloads", label: "Outputs", icon: "map" }
];

function HeroRailIcon({ icon }) {
  switch (icon) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path d="M4.5 10.5 12 4l7.5 6.5"></path>
          <path d="M6.5 9.5v9h11v-9"></path>
          <path d="M10 18.5v-5h4v5"></path>
        </svg>
      );
    case "scene":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path d="M5 7.5h14"></path>
          <path d="M5 16.5h14"></path>
          <path d="M8 7.5v9"></path>
          <path d="M16 7.5v9"></path>
        </svg>
      );
    case "lens":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2.2"></circle>
        </svg>
      );
    case "map":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path d="M7.5 5 3.5 7v12l4-2 4.5 2 4-2 4 2V7l-4-2-4 2z"></path>
          <path d="M7.5 5v12"></path>
          <path d="M12 7v12"></path>
          <path d="M16 5v12"></path>
        </svg>
      );
    case "marker":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path d="M12 20s5-5.6 5-10a5 5 0 1 0-10 0c0 4.4 5 10 5 10Z"></path>
          <circle cx="12" cy="10" r="1.8"></circle>
        </svg>
      );
    default:
      return null;
  }
}

function defaultViewpoints() {
  return [
    {
      id: 1,
      title: "Access View",
      label: "Arrival access",
      x: "14%",
      y: "68%"
    },
    {
      id: 2,
      title: "Central View",
      label: "Core context",
      x: "39%",
      y: "55%"
    },
    {
      id: 3,
      title: "Amenity View",
      label: "Amenity zone",
      x: "57%",
      y: "44%"
    },
    {
      id: 4,
      title: "Boundary View",
      label: "Boundary extent",
      x: "76%",
      y: "18%"
    }
  ];
}

export default function App() {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState("loading");
  const [activeTab, setActiveTab] = useState("viewer");
  const [panoramaOpen, setPanoramaOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedViewpoint, setSelectedViewpoint] = useState(1);

  const overviewRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/config/project.json", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Config request failed with ${response.status}`);
        }

        const nextConfig = await response.json();
        if (!cancelled) {
          setConfig(nextConfig);
          setStatus("ready");
          document.title = nextConfig.projectTitle || "SiteView";
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function syncFullscreen() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const modelLink = useMemo(() => {
    return config?.externalLinks?.find((link) => link.type === "model" && link.url);
  }, [config]);

  if (status === "loading") {
    return <main className="status-screen">Loading SiteView...</main>;
  }

  if (status === "error" || !config) {
    return (
      <main className="status-screen status-screen--error">
        Project config could not be loaded from <code>/config/project.json</code>.
      </main>
    );
  }

  const hasPanorama = Boolean(config.panorama?.file);
  const mainLayer = config.layerImages?.[0];
  const heroImage = config.heroImage || mainLayer?.file;
  const viewpoints = config.viewpoints?.length ? config.viewpoints : defaultViewpoints();
  const activeViewpoint = viewpoints.find((item) => item.id === selectedViewpoint) || viewpoints[0];
  const heroMeta = config.heroMeta || {
    label: "SiteView",
    title: config.siteName || "Site survey",
    detail: config.subtitle || "Interactive site survey workspace"
  };
  const brandName = config.clientName || "FutureScaping Labs";
  const projectTitle = config.projectTitle || "SiteView";
  const siteName = config.siteName || "Site survey";
  const subtitle = config.subtitle || "Interactive drone-based site visualisation.";
  const footerLink = config.footerLink || "https://futurescaping.co.uk";
  const copyrightYear = new Date().getFullYear();

  function scrollToRef(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openWorkspace(tabId = "viewer") {
    setActiveTab(tabId);
    window.setTimeout(() => scrollToRef(workspaceRef), 40);
  }

  function handleFeatureAction(actionId) {
    if (actionId === "model" && modelLink?.url) {
      window.open(modelLink.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (actionId === "panorama" && hasPanorama) {
      setPanoramaOpen(true);
      return;
    }

    openWorkspace("viewer");
  }

  return (
    <div className={`app-shell dashboard-shell ${isFullscreen ? "is-fullscreen" : ""}`}>
      <main className="page-stack">
        <section className="hero-shell" id="overview" ref={overviewRef}>
          {heroImage ? <img className="hero-stage-image hero-stage-image--shell" src={heroImage} alt="Anonymised site model" /> : null}
          <div className="hero-shell__veil" aria-hidden="true"></div>

          <aside className="hero-rail" aria-label="Section shortcuts">
            {heroNavItems.map((item, index) => (
              <button
                key={item.id}
                className={`hero-rail__item ${index === 0 ? "hero-rail__item--active" : ""}`}
                type="button"
                onClick={() => {
                  if (item.id === "overview") {
                    scrollToRef(overviewRef);
                    return;
                  }
                  if (item.id === "viewpoints") {
                    openWorkspace("viewer");
                    return;
                  }
                  if (item.id === "viewer") {
                    handleFeatureAction("model");
                    return;
                  }
                  if (item.id === "panorama") {
                    if (hasPanorama) {
                      setPanoramaOpen(true);
                    }
                    return;
                  }
                  if (item.id === "downloads") {
                    openWorkspace("downloads");
                    return;
                  }
                }}
              >
                <span className="hero-rail__icon" aria-hidden="true">
                  <HeroRailIcon icon={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </aside>

          <div className="hero-copy">
            <div className="hero-brand">
              <div className="hero-brand__mark" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div>
                <p className="hero-brand__name">{brandName}</p>
              </div>
            </div>

            <h2 className="hero-title">{projectTitle}</h2>
            <p className="hero-summary">{siteName}</p>
            <p className="hero-support">{subtitle}</p>
          </div>

          <aside className="hero-meta-card">
            <p className="hero-meta-card__label">{heroMeta.label}</p>
            <strong>{heroMeta.title}</strong>
            <span>{heroMeta.detail}</span>
          </aside>

          <aside className="hero-action-dock">
            <div className="hero-action-dock__buttons">
              <button className="hero-action-dock__primary" type="button" onClick={() => openWorkspace("viewer")}>
                Open Layer Viewer
              </button>
              {modelLink ? (
                <a className="button-link" href={modelLink.url} target="_blank" rel="noreferrer">
                  Open 3D Scene
                </a>
              ) : null}
              {hasPanorama ? (
                <button type="button" onClick={() => setPanoramaOpen(true)}>
                  Open Panorama
                </button>
              ) : null}
            </div>
          </aside>
        </section>

        <section className="workspace-section" id="viewer" ref={workspaceRef}>
          <div className="section-heading">
            <span className="eyebrow">Primary workspace</span>
            <h2>Layer viewer, drawings and support files</h2>
            <p>
              Start with the main technical viewer. Compare layers, inspect the ortho closely, open the panorama,
              and download deliverables from one place.
            </p>
          </div>

          <div className="workspace-tabs" role="tablist" aria-label="Workspace panels">
            {workspaceTabs.map((tab) => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                type="button"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {config.desktopNote ? <div className="desktop-note">{config.desktopNote}</div> : null}

          {activeTab === "viewer" ? <LayerViewer layers={config.layerImages || []} /> : null}
          {activeTab === "downloads" ? <DownloadsPanel downloads={config.downloads || []} /> : null}
          {activeTab === "help" ? <HelpPanel layers={config.layerImages || []} /> : null}
        </section>

        <section className="insight-grid">
          <article className="glass-panel panorama-panel">
            <div className="panel-heading">
              <span className="eyebrow">Viewpoint preview</span>
              <h3>{activeViewpoint.title}</h3>
            </div>
            {mainLayer ? <img className="panorama-preview-image" src={mainLayer.file} alt={`${activeViewpoint.title} preview`} /> : null}
            <div className="panorama-panel__footer">
              <div>
                <strong>{activeViewpoint.label}</strong>
                <p>Structured viewpoint sequence for site explanation and review.</p>
              </div>
              <button type="button" onClick={() => hasPanorama ? setPanoramaOpen(true) : openWorkspace("viewer")}>
                {hasPanorama ? "Open Panorama" : "Open Viewer"}
              </button>
            </div>
          </article>

          <article className="glass-panel benefits-panel">
            <div className="panel-heading">
              <span className="eyebrow">Survey summary</span>
              <h3>Key reading points for this site pack</h3>
            </div>
            <div className="benefits-grid">
              <article>
                <strong>Clean Ortho Base</strong>
                <p>Review the uncluttered orthomosaic first, then bring the other layers in only when they add value.</p>
              </article>
              <article>
                <strong>Level Comparison</strong>
                <p>Switch between ortho, DSM and contour overlay views to read terrain changes with more confidence.</p>
              </article>
              <article>
                <strong>Viewpoint Context</strong>
                <p>Use the panorama and preview panel together to anchor the survey outputs in real on-site context.</p>
              </article>
              <article>
                <strong>Download Ready</strong>
                <p>Keep the viewer for exploration, then pull the exact exported files you need from the outputs tab.</p>
              </article>
            </div>
          </article>
        </section>

        <footer className="site-footer">
          <div className="site-footer__legal">
            <span>Cookies</span>
            <span>Privacy</span>
            <span>Copyright {copyrightYear}</span>
          </div>
          <div className="site-footer__credit">
            <span>Created by</span>
            <a href={footerLink} target="_blank" rel="noreferrer">
              Futurescaping
            </a>
            <span>All rights reserved.</span>
          </div>
        </footer>

      </main>

      {hasPanorama ? (
        <PanoramaViewer
          open={panoramaOpen}
          panorama={config.panorama}
          siteName={config.siteName}
          onClose={() => setPanoramaOpen(false)}
        />
      ) : null}
    </div>
  );
}
