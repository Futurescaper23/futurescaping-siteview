import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SliderCompare from "./SliderCompare.jsx";
import TransparencyControls from "./TransparencyControls.jsx";

function buildLayerState(layers, key, fallback) {
  return Object.fromEntries(layers.map((layer) => [layer.id, layer[key] ?? fallback]));
}

function getComparePairs(layers) {
  const pairs = [];
  for (let i = 0; i < layers.length; i += 1) {
    for (let j = i + 1; j < layers.length; j += 1) {
      pairs.push({
        id: `${layers[i].id}::${layers[j].id}`,
        baseId: layers[i].id,
        compareId: layers[j].id,
        label: `${layers[i].name} vs ${layers[j].name}`
      });
    }
  }
  return pairs;
}

export default function LayerViewer({ layers }) {
  const stageRef = useRef(null);
  const [mode, setMode] = useState("slider");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [swipe, setSwipe] = useState(50);
  const [scale, setScale] = useState(1);
  const [fitMode, setFitMode] = useState("fill");
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [stageAspectRatio, setStageAspectRatio] = useState("16 / 9");
  const [interaction, setInteraction] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState(() => buildLayerState(layers, "visible", true));
  const [opacities, setOpacities] = useState(() => buildLayerState(layers, "defaultOpacity", 1));

  const comparePairs = useMemo(() => getComparePairs(layers), [layers]);
  const [compareId, setCompareId] = useState(comparePairs[0]?.id);
  const activePair = comparePairs.find((pair) => pair.id === compareId) || comparePairs[0];
  const layerById = useMemo(() => Object.fromEntries(layers.map((layer) => [layer.id, layer])), [layers]);

  useEffect(() => {
    const referenceLayer = layers[0];
    if (!referenceLayer?.file) return undefined;

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled || !image.naturalWidth || !image.naturalHeight) return;
      setStageAspectRatio(`${image.naturalWidth} / ${image.naturalHeight}`);
      setPan({ x: 0, y: 0 });
    };
    image.src = referenceLayer.file;

    return () => {
      cancelled = true;
    };
  }, [layers]);

  function clampPan(nextPan, nextScale = scale) {
    const effectiveScale = nextScale * (fitMode === "fill" ? 1.25 : 1);

    if (effectiveScale <= 1 || !stageRef.current) {
      return { x: 0, y: 0 };
    }

    const rect = stageRef.current.getBoundingClientRect();
    const maxX = ((rect.width * effectiveScale) - rect.width) / 2;
    const maxY = ((rect.height * effectiveScale) - rect.height) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, nextPan.x)),
      y: Math.max(-maxY, Math.min(maxY, nextPan.y))
    };
  }

  const updateZoom = useCallback((multiplier) => {
    setScale((current) => {
      const nextScale = Math.min(4, Math.max(1, current * multiplier));
      setPan((currentPan) => clampPan(currentPan, nextScale));
      return nextScale;
    });
  }, [clampPan]);

  function resetView() {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setSwipe(50);
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  }

  function updateSwipeFromClientX(clientX) {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nextSwipe = ((clientX - rect.left) / rect.width) * 100;
    setSwipe(Math.max(0, Math.min(100, nextSwipe)));
  }

  function beginPan(event) {
    if (scale <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setInteraction({
      type: "pan",
      startX: event.clientX,
      startY: event.clientY,
      startPan: pan
    });
  }

  function onStagePointerDown(event) {
    if (mode === "slider") {
      updateSwipeFromClientX(event.clientX);
      setInteraction({ type: "swipe" });
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    beginPan(event);
  }

  function onStagePointerMove(event) {
    if (interaction?.type === "swipe") {
      updateSwipeFromClientX(event.clientX);
      return;
    }

    if (interaction?.type !== "pan") return;
    const nextPan = {
      x: interaction.startPan.x + event.clientX - interaction.startX,
      y: interaction.startPan.y + event.clientY - interaction.startY
    };
    setPan(clampPan(nextPan));
  }

  function endInteraction() {
    setInteraction(null);
  }

  useEffect(() => {
    if (!interaction) return undefined;

    function onPointerMove(event) {
      if (interaction.type === "swipe") {
        updateSwipeFromClientX(event.clientX);
        return;
      }

      if (interaction.type !== "pan") return;
      const nextPan = {
        x: interaction.startPan.x + event.clientX - interaction.startX,
        y: interaction.startPan.y + event.clientY - interaction.startY
      };
      setPan(clampPan(nextPan));
    }

    function onPointerUp() {
      setInteraction(null);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [interaction, scale]);

  const onWheel = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    updateZoom(event.deltaY < 0 ? 1.08 : 1 / 1.08);
  }, [updateZoom]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  if (layers.length < 2) {
    return (
      <main className="viewer-empty">
        Add at least two layer images to <code>public/config/project.json</code>.
      </main>
    );
  }

  return (
    <main className="viewer-shell">
      <section className="viewer-toolbar" aria-label="Layer viewer controls">
        <div className="segmented-control" aria-label="Comparison mode">
          <button className={mode === "slider" ? "active" : ""} type="button" onClick={() => setMode("slider")}>
            Slider
          </button>
          <button
            className={mode === "transparency" ? "active" : ""}
            type="button"
            onClick={() => setMode("transparency")}
          >
            Transparency
          </button>
        </div>

        {mode === "slider" ? (
          <label className="select-control">
            <span>Compare</span>
            <select value={activePair?.id} onChange={(event) => setCompareId(event.target.value)}>
              {comparePairs.map((pair) => (
                <option key={pair.id} value={pair.id}>
                  {pair.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="toolbar-note">Blend any configured layers together.</span>
        )}

        <div className="tool-buttons">
          <button type="button" onClick={() => setFitMode((current) => (current === "fill" ? "fit" : "fill"))}>
            {fitMode === "fill" ? "Show full image" : "Fill viewer"}
          </button>
          <button type="button" onClick={() => updateZoom(1 / 1.15)}>Zoom out</button>
          <button type="button" onClick={() => updateZoom(1.15)}>Zoom in</button>
          <button type="button" onClick={() => setControlsVisible((visible) => !visible)}>
            {controlsVisible ? "Hide controls" : "Show controls"}
          </button>
          <button type="button" onClick={resetView}>Reset view</button>
          <button type="button" onClick={toggleFullscreen}>Fullscreen</button>
        </div>
      </section>

      <section className="viewer-canvas">
        <div
          ref={stageRef}
          className={`image-stage ${scale > 1 ? "is-pannable" : ""} ${interaction?.type === "pan" ? "is-panning" : ""}`}
          style={{
            "--zoom-scale": scale,
            "--fit-scale": fitMode === "fill" ? 1.25 : 1,
            "--pan-x": `${pan.x}px`,
            "--pan-y": `${pan.y}px`,
            aspectRatio: stageAspectRatio
          }}
          onPointerDown={onStagePointerDown}
          onPointerMove={onStagePointerMove}
          onPointerUp={endInteraction}
          onPointerCancel={endInteraction}
          onDoubleClick={resetView}
        >
          {mode === "slider" && activePair ? (
            <SliderCompare
              baseLayer={layerById[activePair.baseId]}
              compareLayer={layerById[activePair.compareId]}
              swipe={swipe}
              onHandlePointerDown={(event) => {
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                setInteraction({ type: "swipe" });
              }}
            />
          ) : null}

          {mode === "transparency"
            ? layers.map((layer) => (
                <div
                  className="image-layer"
                  key={layer.id}
                  style={{ opacity: visibleLayers[layer.id] ? opacities[layer.id] : 0 }}
                >
                  <img src={layer.file} alt={layer.name} draggable="false" />
                </div>
              ))
            : null}
        </div>

        {controlsVisible ? (
          <aside className="side-panel">
            {mode === "slider" ? (
              <>
                <h2>Slider mode</h2>
                <p>Pick two layers and drag the vertical handle across the image to compare them.</p>
              </>
            ) : (
              <>
                <h2>Transparency mode</h2>
                <p>Switch layers on or off and adjust how strongly each one appears.</p>
                <TransparencyControls
                  layers={layers}
                  visibleLayers={visibleLayers}
                  opacities={opacities}
                  onVisibilityChange={(layerId, checked) =>
                    setVisibleLayers((current) => ({ ...current, [layerId]: checked }))
                  }
                  onOpacityChange={(layerId, value) =>
                    setOpacities((current) => ({ ...current, [layerId]: Number(value) / 100 }))
                  }
                />
              </>
            )}
            <div className="panel-rule">
              At maximum zoom out, the view stays locked. Once zoomed in, drag the image to pan inside the bounds.
            </div>
          </aside>
        ) : null}

        {controlsVisible ? (
          <aside className="legend">
            {layers.map((layer) => (
              <div className="legend-item" key={layer.id}>
                <span className="legend-dot" style={{ background: layer.color || "#9fb5d8" }} />
                {layer.name}
              </div>
            ))}
            <p>Slider mode compares two layers. Transparency mode blends configured layers together.</p>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
