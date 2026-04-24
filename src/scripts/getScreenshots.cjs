const fs = require("fs");
const https = require("https");

function getUrls() {
  let urls = [];
  // Read the JSON file synchronously
  try {
    const data = fs.readFileSync("./src/_data/repos.json", "utf8");
    const items = JSON.parse(data);

    const url =
      // Loop through the array to find the URLs
      items.forEach((item) => {
        if (item.name.substring(0, 1) === "p") {
          urls.push({
            name: item.name,
            url:
              "https://raw.githubusercontent.com/" +
              item.full_name +
              "/main/screenshot.png",
          });
        }
      });
  } catch (err) {
    console.error("Error reading or parsing file:", err);
  }
  return urls;
}

function downloadFromUrl(url, name) {
  const filepath = `./src/assets/images/screenshots/${name}_screenshot.png`;
  const file = fs.createWriteStream(filepath);
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
}

const urls = getUrls();
if (urls.length > 0) {
  urls.forEach((item) => {
    console.log(`Attempting to download ${item.url}`);
    downloadFromUrl(item.url, item.name);
  });
}
