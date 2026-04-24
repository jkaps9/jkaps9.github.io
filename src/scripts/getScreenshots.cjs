const fs = require("fs");
const https = require("https");

const manualUrls = [
  {
    name: "product-preview-card-component-main",
    url: "https://raw.githubusercontent.com/jkaps9/product-preview-card-component-main/main/images/screenshot.png",
  },
  {
    name: "testimonials-grid-section-main",
    url: "https://raw.githubusercontent.com/jkaps9/testimonials-grid-section-main/main/images/screenshot.png",
  },
  {
    name: "four-card-feature-section-master",
    url: "https://raw.githubusercontent.com/jkaps9/four-card-feature-section-master/main/images/screenshot.png",
  },
  {
    name: "social-links-profile-main",
    url: "https://raw.githubusercontent.com/jkaps9/social-links-profile-main/main/images/screenshot.png",
  },
  {
    name: "qr-code-component-main",
    url: "https://raw.githubusercontent.com/jkaps9/qr-code-component-main/main/images/screenshot.png",
  },
];

function getUrls() {
  let urls = [];
  // Read the JSON file synchronously
  try {
    const data = fs.readFileSync("./src/_data/repos.json", "utf8");
    const items = JSON.parse(data);

    const url =
      // Loop through the array to find the URLs
      items.forEach((item) => {
        urls.push({
          name: item.name,
          url:
            "https://raw.githubusercontent.com/" +
            item.full_name +
            "/main/screenshot.png",
        });
      });
  } catch (err) {
    console.error("Error reading or parsing file:", err);
  }
  return urls;
}

function downloadFromUrl(url, name) {
  const filepath = `./src/assets/images/screenshots/${name}_screenshot.png`;
  const file = fs.createWriteStream(filepath, { flags: "wx" });
  https
    .get(url, (response) => {
      if (response.statusCode === 404) {
        console.error(response.statusCode + ": " + response.statusMessage);
        fs.unlink(
          `./src/assets/images/screenshots/${name}_screenshot.png`,
          () => {},
        );
        response.on("data", (d) => {
          /* process data */
        });
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        console.log("Downloaded successfully");
        file.close();
      });
    })
    .on("error", (err) => {
      fs.unlink(
        `./src/assets/images/screenshots/${name}_screenshot.png`,
        () => {},
      );
      console.error(err.message);
    });

  file.on("error", (err) => {
    if (err.code === "EEXIST") {
      console.log("File already exists");
    } else {
      console.error(`Error: ${err.message}`);
    }
  });
}

const dynamicUrls = getUrls();
const namesToRemove = new Set(manualUrls.map((item) => item.name));

const filteredArray = dynamicUrls.filter(
  (item) => !namesToRemove.has(item.name),
);
const urls = filteredArray.concat(manualUrls);
if (urls.length > 0) {
  urls.forEach((item) => {
    console.log(`Attempting to download ${item.url}`);
    downloadFromUrl(item.url, item.name);
  });
}
