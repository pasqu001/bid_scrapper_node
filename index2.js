const request = require("request-promise");
const cheerio = require("cheerio");
//const ObjectsToCsv = require('objects-to-csv');

const url = "https://charlottenc.gov/Engineering/Bids/Pages/default.aspx";

/**
 * Kasey:
 * I just want to grab the *href* for the *titles* of all the bids on the page,
 *  then I need to click(*open*) that *link* and *grab all the info* on the inner page.
 */

/**
 * This means it's not really relevant for us to use .text() on the table,
 * since we are looking for the href attribute. It's all we need.
 */

/**
 * If we use Google Chromes element selector, click on the *title links*,
 * and right click -> Copy selector, we get this selector:
 * #ctl00_SPWebPartManager1_g_414ba252_0ae4_485e_9047_62893f83fc84_csr > table > tbody > tr:nth-child(2) > td:nth-child(1) > a
 * This only selects 1 a element, let's try and modify it to select all a elements:
 * table > tbody > tr > td > a
 * Since there's only 1 table on the page, I can removed the #id selector.
 * Then we remove the "nth-child" selectors, so all the table rows gets selected!
 */

/**
 * Then we can write a .each loop, and test it out in our Chrome browser to see if it gets the links:
 *  $("table > tbody > tr > td > a").each((i,element) => console.log($(element).attr("href")))
 *  Seems to do the trick!
 */

/* Then we make a list of all these href links,
 * and we can then scrape those pages again using Request!
 */

async function scrapeMainUrls() {
  const htmlResult = await request.get(url);
  const $ = await cheerio.load(htmlResult);
  const allLinksWithEmptyStrings = $("table > tbody > tr > td > a")
    .map((i, element) => $(element).attr("href"))
    .get();
  //Some links are empty strings (''), but we seem to get all links anyway, so no worries, we just filter them off
  const allLinks = allLinksWithEmptyStrings.filter(link => link !== "");
  return allLinks;
}
let row1 = [];
let row2 = [];

async function scrapeInnerPages(validUrls) {
  const allText = validUrls.map(async link => {
    const htmlResult = await request.get(link);
    const $ = await cheerio.load(htmlResult);
    /*$("table > tbody > tr").each((i, element) => {
      const tdsInRow = $(element).find("td");
      console.log($(tdsInRow[0]).text());
      console.log($(tdsInRow[1]).text());
    });*/
    $("table > tbody > tr").each((i, element) => {
        const tdsInRow = $(element).find("td");
        row1.push($(tdsInRow[0]).text());
        row2.push($(tdsInRow[1]).text());
        //console.log(row1, row2);
      });
  });
  console.log(row1.length);
  console.log(row2.length);
}
//console.log(row1);
//console.log(row2);

/**
 * I notice the URL's we scrape looks like this:
 * https://charlottenc.gov/DoingBusiness/Lists/Solicitations/DispForm.aspx?ID=1033' (gives 401)
 * This is probably due to us using Request, so the website delivers different content than on Chrome browser.
 * But that is fine, because we can just take the ID and construct a valid URL anyway:
 * https://charlottenc.gov/DoingBusiness/Pages/SolicitationDetails.aspx?ID=1033 (works!)
 */
function createValidUrl(url) {
  //I'm lazy and just assuming ID's are going to be 4 last numbers always
  return `https://charlottenc.gov/DoingBusiness/Pages/SolicitationDetails.aspx?ID=${url.substring(
    url.length - 4
  )}`;
}

async function main() {
  const allLinks = await scrapeMainUrls();
  const validUrls = allLinks.map(link => createValidUrl(link));
  //console.log(validUrls);
  await scrapeInnerPages(validUrls);
}

main();