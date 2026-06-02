import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "public", "config", "project.json");
const assetFolders = [
  path.join(root, "public", "assets", "images"),
  path.join(root, "public", "assets", "panoramas"),
  path.join(root, "public", "assets", "drawings"),
  path.join(root, "public", "assets", "downloads")
];

const rl = createInterface({ input, output });

async function ask(question, fallback = "") {
  const suffix = fallback ? ` (${fallback})` : "";
  const answer = await rl.question(`${question}${suffix}: `);
  return answer.trim() || fallback;
}

async function yesNo(question, fallback = false) {
  const hint = fallback ? "Y/n" : "y/N";
  const answer = (await rl.question(`${question} (${hint}): `)).trim().toLowerCase();
  if (!answer) return fallback;
  return answer === "y" || answer === "yes";
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function assetPath(folder, filename) {
  if (!filename) return "";
  return `/assets/${folder}/${filename.replaceAll("\\", "/").replace(/^\/+/, "")}`;
}

function downloadItem(label, description, file, type, extra = {}) {
  return {
    label,
    description,
    file,
    type,
    ...Object.fromEntries(Object.entries(extra).filter(([, value]) => Boolean(value)))
  };
}

async function main() {
  console.log("\nFutureScaping SiteView project setup\n");
  console.log("Put your exported files into public/assets first, then answer these prompts.");
  console.log("Leave optional fields blank if the project does not have them.\n");

  for (const folder of assetFolders) {
    await mkdir(folder, { recursive: true });
  }

  if (await fileExists(configPath)) {
    const overwrite = await yesNo("public/config/project.json already exists. Overwrite it?", false);
    if (!overwrite) {
      console.log("\nNo changes made.");
      rl.close();
      return;
    }
  }

  const clientName = await ask("Client name", "Client Name");
  const siteName = await ask("Site or property name", "Site or Property Name");
  const projectTitle = await ask("Project title", "FutureScaping SiteView");
  const subtitle = await ask("Subtitle", "Drone survey layer viewer and site visualisation");

  console.log("\nLayer image filenames should already be in public/assets/images.");
  const mainImage = await ask("Main image filename", "main-image.jpg");
  const heightImage = await ask("Height colours filename", "height-colours.png");
  const contourImage = await ask("Contour lines filename", "contour-lines.png");

  console.log("\nOptional extras");
  const panoramaFile = await ask("360 panorama filename in public/assets/panoramas", "");
  const modelUrl = await ask("3D model URL", "");

  const addScaledDrawing = await yesNo("\nAdd a scaled drawing PDF download now?", false);
  let scaledDrawing = null;

  if (addScaledDrawing) {
    const label = await ask("Drawing label", "Scaled drawing");
    const description = await ask("Drawing description", "Original exported PDF drawing.");
    const fileName = await ask("Drawing PDF filename in public/assets/drawings", "scaled-drawing.pdf");
    const paperSize = await ask("Paper size", "A1");
    const scale = await ask("Scale", "1:100");
    scaledDrawing = downloadItem(
      label,
      description,
      assetPath("drawings", fileName),
      "pdf",
      { paperSize, scale }
    );
  }

  const config = {
    projectTitle,
    clientName,
    siteName,
    subtitle,
    desktopNote:
      "This viewer is best experienced on a laptop or desktop, especially when comparing layers or reviewing scaled drawings.",
    layerImages: [
      {
        id: "main",
        name: "Main image",
        description: "Current orthomosaic site image.",
        file: assetPath("images", mainImage),
        color: "#d9dee8",
        defaultOpacity: 1
      },
      {
        id: "height",
        name: "Height colours",
        description: "Height-coloured surface layer for reading changes in level.",
        file: assetPath("images", heightImage),
        color: "#70b8ff",
        defaultOpacity: 0.7
      },
      {
        id: "contours",
        name: "Contour lines",
        description: "Contour line overlay for understanding gradients and levels.",
        file: assetPath("images", contourImage),
        color: "#ffd36a",
        defaultOpacity: 0.85
      }
    ],
    ...(panoramaFile
      ? {
          panorama: {
            label: "360 Property View",
            file: assetPath("panoramas", panoramaFile)
          }
        }
      : {}),
    externalLinks: modelUrl
      ? [
          {
            label: "Open 3D model",
            type: "model",
            provider: "Model viewer",
            url: modelUrl
          }
        ]
      : [],
    downloads: [
      downloadItem("Main image", "High-resolution orthomosaic image for the current survey.", assetPath("images", mainImage), "image"),
      downloadItem("Height colours image", "Height-coloured layer as exported from the survey workflow.", assetPath("images", heightImage), "image"),
      downloadItem("Contour lines image", "Contour overlay image for quick visual reference.", assetPath("images", contourImage), "image"),
      ...(scaledDrawing ? [scaledDrawing] : [])
    ]
  };

  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

  console.log("\nProject config written to public/config/project.json");
  console.log("Next steps:");
  console.log("1. Check that the referenced files exist in public/assets.");
  console.log("2. Run npm run dev to preview.");
  console.log("3. Run npm run build for Netlify.");
  rl.close();
}

main().catch((error) => {
  console.error(error);
  rl.close();
  process.exitCode = 1;
});
