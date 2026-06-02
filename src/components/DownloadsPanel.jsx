function isScaledDrawing(item) {
  const type = item.type?.toLowerCase() || "";
  return type.includes("pdf") && (item.paperSize || item.scale);
}

export default function DownloadsPanel({ downloads }) {
  return (
    <main className="content-panel">
      <div className="content-heading">
        <span className="eyebrow">Client files</span>
        <h2>Drawings & Downloads</h2>
        <p>Download original exported files. Scaled PDFs are linked directly so the drawing is preserved exactly.</p>
      </div>

      {downloads.length ? (
        <div className="download-grid">
          {downloads.map((item) => (
            <article className="download-card" key={`${item.label}-${item.file}`}>
              <div>
                <span className="download-type">{item.type}</span>
                <h3>{item.label}</h3>
                {item.description ? <p>{item.description}</p> : null}
              </div>

              <dl>
                {item.paperSize ? (
                  <>
                    <dt>Paper size</dt>
                    <dd>{item.paperSize}</dd>
                  </>
                ) : null}
                {item.scale ? (
                  <>
                    <dt>Scale</dt>
                    <dd>{item.scale}</dd>
                  </>
                ) : null}
              </dl>

              {isScaledDrawing(item) ? (
                <p className="scale-note">To preserve scale, print at 100% / Actual Size. Do not use Fit to Page.</p>
              ) : null}

              <a className="button-link button-link--primary" href={item.file} download>
                Download file
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-note">No downloadable files have been added to the project config yet.</p>
      )}
    </main>
  );
}
