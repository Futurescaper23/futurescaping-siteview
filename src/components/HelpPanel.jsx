export default function HelpPanel({ layers }) {
  const heightLayer = layers.find((layer) => layer.name?.toLowerCase().includes("height"));
  const contourLayer = layers.find((layer) => layer.name?.toLowerCase().includes("contour"));

  return (
    <main className="content-panel">
      <div className="content-heading">
        <span className="eyebrow">Viewer guide</span>
        <h2>Help</h2>
        <p>A quick guide to the main SiteView tools and drawing downloads.</p>
      </div>

      <div className="help-grid">
        <section>
          <h3>Slider mode</h3>
          <p>Compares two image layers with a draggable vertical handle across the main viewer.</p>
        </section>
        <section>
          <h3>Transparency mode</h3>
          <p>Blends configured layers together. Toggle layers and adjust their strength independently.</p>
        </section>
        <section>
          <h3>{heightLayer?.name || "Height colours"}</h3>
          <p>Shows relative height information with colour changes, helping make level differences easier to read.</p>
        </section>
        <section>
          <h3>{contourLayer?.name || "Contour lines"}</h3>
          <p>Shows linework for levels and gradients, useful when checking landform and proposed shaping.</p>
        </section>
        <section>
          <h3>360 view</h3>
          <p>Opens the configured panorama in an interactive viewer. The button is hidden when no panorama is provided.</p>
        </section>
        <section>
          <h3>Scaled drawing downloads</h3>
          <p>Download scaled PDFs directly and print at 100% / Actual Size. Do not use Fit to Page.</p>
        </section>
      </div>
    </main>
  );
}
