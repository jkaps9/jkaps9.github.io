import path from "node:path";
import * as sass from "sass";
import { DateTime } from "luxon";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import fs from "fs";

export default function (config) {
  // add SCSS template format
  config.addTemplateFormats("scss");

  config.addPassthroughCopy("./src/main.js");

  // Set directories to pass through to the dist folder
  config.addPassthroughCopy("./src/assets");
  config.addPassthroughCopy("./src/scripts");
  config.addPassthroughCopy("./src/admin");

  // Configure SCSS files
  config.addExtension("scss", {
    outputFileExtension: "css",

    // opt-out of Eleventy Layouts
    useLayouts: false,

    compile: async function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      // Don’t compile file names that start with an underscore
      if (parsed.name.startsWith("_")) {
        return;
      }

      let result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || ".", this.config.dir.includes],
      });

      // Map dependencies for incremental builds
      this.addDependencies(inputPath, result.loadedUrls);

      return async (data) => {
        return result.css;
      };
    },
  });

  config.addPlugin(eleventyImageTransformPlugin);

  config.addWatchTarget("./src/scss/");

  // add collections
  config.addCollection("sortedRepos", function (collectionApi) {
    const data = collectionApi.getAll()[0].data.repos;

    return data
      .filter((item) => item.has_pages === true)
      .sort((a, b) => {
        // Convert ISO strings to Luxon objects and get the millisecond value
        const dateA = DateTime.fromISO(a.pushed_at).toMillis();
        const dateB = DateTime.fromISO(b.pushed_at).toMillis();

        return dateB - dateA;
      });
  });

  // add date filter
  config.addFilter("readableDate", (dateObj) => {
    return DateTime.fromISO(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  // check if file exists
  config.addFilter("fileExists", function (filepath) {
    try {
      return fs.existsSync(filepath);
    } catch (err) {
      console.log(`${filepath} does not exist`);
      return false;
    }
  });

  return {
    pathPrefix: process.env.NODE_ENV === "production" ? "/" : "/",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist",
    },
  };
}
