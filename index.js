const Crawler = require("crawler");
const request = require("request");
const path = require("path");
const fs = require("fs");

const hostname = "https://www.moviemania.io";
const offsetIncrease = 30;
const pages = 5;
const entrypoint = (offset = 0) =>
  "https://www.moviemania.io/desktop/movies/upcoming?offset=" + offset;
const resolution = "1920x1080";

const destinationFolder = path.join(__dirname, "downloaded_images");

const stages = {
  SPLASH: "SPLASH",
  WALLPAPER: "WALLPAPER"
};

function queue(crawler, uri, stage) {
  crawler.queue({ uri, stage });
}

function downloadImage(url, destinationFolder, callback = function() {}) {
  console.log("Downloading image", url);

  request(url, (error, res, body) => {
    if (error) {
      return callback(error);
    }

    if (!res || !res.headers["content-disposition"]) {
      return callback("No content-disposition header found");
    }

    const [, filename] = res.headers["content-disposition"].match(/"(.*)"/);
    const destination = path.join(destinationFolder, filename);

    console.log("Saving image", destination);
    fs.writeFile(destination, body, "binary", callback);
  });
}

const stageCallbacks = {
  SPLASH(crawler, { $ }, done) {
    const urls = $("a.wallpaper").each((i, anchor) => {
      const url = hostname + $(anchor).attr("href");

      queue(crawler, url, stages.WALLPAPER);
    });

    done();
  },
  WALLPAPER(crawler, { $ }, done) {
    const url = hostname + $(`a[data-resolution="${resolution}"]`).attr("href");

    downloadImage(url, destinationFolder, error => {
      if (error) {
        console.error(error);

        console.log("Will retry");

        setTimeout(); // TODO: HERE
      }
    });
  }
};

const c = new Crawler({
  maxConnections: 10,
  rateLimit: 1000,
  callback(error, res, done) {
    if (error) {
      console.log(error);
      return;
    }

    const cb = stageCallbacks[res.options.stage];

    console.log("Visited", res.request.uri.href);

    if (cb) {
      console.log("Running callback with stage", res.options.stage);
      cb(c, res, done);
    } else {
      console.log("No callback, Done.");
      done();
    }
  }
});

fs.mkdir(destinationFolder, () => {
  for (let i = 0; i < pages; i++) {
    queue(c, entrypoint(i * offsetIncrease), stages.SPLASH);
  }
});
