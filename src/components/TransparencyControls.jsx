export default function TransparencyControls({
  layers,
  visibleLayers,
  opacities,
  onVisibilityChange,
  onOpacityChange
}) {
  return (
    <div className="transparency-controls">
      <div className="check-list">
        {layers.map((layer) => (
          <label className="check-row" key={layer.id}>
            <input
              checked={Boolean(visibleLayers[layer.id])}
              type="checkbox"
              onChange={(event) => onVisibilityChange(layer.id, event.target.checked)}
            />
            <span>{layer.name}</span>
          </label>
        ))}
      </div>

      <div className="range-list">
        {layers.map((layer) => {
          const value = Math.round((opacities[layer.id] ?? 1) * 100);
          return (
            <label className="range-row" key={layer.id}>
              <span>
                {layer.name} strength <strong>{value}%</strong>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(event) => onOpacityChange(layer.id, event.target.value)}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
