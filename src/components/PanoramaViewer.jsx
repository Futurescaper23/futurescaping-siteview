import { useEffect, useRef, useState } from "react";

export default function PanoramaViewer({ open, panorama, siteName, onClose }) {
  const viewerRef = useRef(null);
  const pannellumInstance = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !panorama?.file || !viewerRef.current) return undefined;

    setError("");
    viewerRef.current.innerHTML = "";

    if (!window.pannellum?.viewer) {
      setError("The 360 viewer library could not be loaded.");
      return undefined;
    }

    try {
      pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
        type: "equirectangular",
        panorama: panorama.file,
        autoLoad: true,
        showControls: true,
        showFullscreenCtrl: true,
        mouseZoom: true,
        draggable: true,
        compass: false
      });
    } catch (nextError) {
      console.error(nextError);
      setError("The 360 panorama could not be loaded.");
    }

    return () => {
      pannellumInstance.current?.destroy?.();
      pannellumInstance.current = null;
    };
  }, [open, panorama]);

  if (!open) return null;

  return (
    <div className="pano-modal" role="dialog" aria-modal="true" aria-label={panorama.label || "360 view"}>
      <div className="pano-topbar">
        <div>
          <strong>{panorama.label || "360 view"}</strong>
          <span>{siteName}</span>
        </div>
        <button type="button" onClick={onClose}>Close 360 view</button>
      </div>
      <div className="panorama-stage" ref={viewerRef}>
        {error ? <div className="pano-error">{error}</div> : null}
      </div>
    </div>
  );
}
