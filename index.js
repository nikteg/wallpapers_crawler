const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const bent = require("bent");
const async = require("async");

async function fetchLinks(offset) {
  const get = bent("https://www.moviemania.io", "GET", "string");
  const body = await get("/desktop/movies/upcoming?offset=" + offset);
  const { document } = new JSDOM(body).window;

  const links = Array.from(
    document.querySelectorAll("a.wallpaper")
  ).map(anchor => anchor.getAttribute("href"));

  return links;
}

const concurrency = 10;
const resolution = "1920x1080";
let offset = 0;
let result = [];

const queue = async.queue(async (task, callback) => {
  const links = await fetchLinks(task.offset);

  if (links.length > 0) {
    result.push(...links);

    offset += 30;
    queue.push({ offset });
  }

  callback();
}, concurrency);

for (let i = 0; i < concurrency; i++) {
  offset += 30;
  queue.push({ offset });
}

queue.drain(() => {
  result.forEach(link => {
    const [, id] = link.match(/\/wallpaper\/([^-]+)/);

    console.log(`https://www.moviemania.io/download/${id}/${resolution}`);
  });
});
