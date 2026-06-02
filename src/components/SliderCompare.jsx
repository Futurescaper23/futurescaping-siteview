export default function SliderCompare({ baseLayer, compareLayer, swipe, onHandlePointerDown }) {
  if (!baseLayer || !compareLayer) return null;

  return (
    <>
      <div className="image-layer">
        <img src={baseLayer.file} alt={baseLayer.name} draggable="false" />
      </div>
      <div className="swipe-layer" style={{ clipPath: `inset(0 ${100 - swipe}% 0 0)` }}>
        <img src={compareLayer.file} alt={compareLayer.name} draggable="false" />
      </div>
      <div
        className="swipe-handle"
        style={{ left: `${swipe}%` }}
        onPointerDown={onHandlePointerDown}
        role="separator"
        aria-orientation="vertical"
        aria-label={`${baseLayer.name} and ${compareLayer.name} comparison handle`}
      >
        <span aria-hidden="true">&harr;</span>
      </div>
    </>
  );
}
