const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");
const AdmZip = require("adm-zip");

// Extract text array from PDF or PPTX. For PDF, returns a single-element array with raw text bytes interpretation.
async function extractTextFromFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === ".pdf") {
    return [fs.readFileSync(filePath).toString("utf-8")];
  } else if (ext === ".pptx") {
    const zip = new AdmZip(filePath);
    const slides = zip
      .getEntries()
      .filter((e) => e.entryName.includes("ppt/slides/slide") && e.entryName.endsWith(".xml"));
    const parser = new XMLParser({ ignoreAttributes: true });
    const slideTexts = [];

    slides.forEach((slide) => {
      const xmlData = slide.getData().toString("utf-8");
      const jsonObj = parser.parse(xmlData);
      const texts = [];

      const traverse = (obj) => {
        if (typeof obj === "object") {
          for (let key in obj) {
            if (key === "a:t") {
              if (Array.isArray(obj[key])) {
                obj[key].forEach((t) => texts.push(t));
              } else {
                texts.push(obj[key]);
              }
            } else traverse(obj[key]);
          }
        }
      };
      traverse(jsonObj);
      slideTexts.push(texts.join(" "));
    });

    return slideTexts;
  } else {
    throw new Error("Unsupported file type");
  }
}

module.exports = { extractTextFromFile };


