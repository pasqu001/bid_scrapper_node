const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
//const nightmare = require('nightmare');
const Nightmare = require('nightmare');

const nightmare = Nightmare({ show : false });

const url = "https://charlottenc.gov/Engineering/Bids/Pages/default.aspx";

async function scrapeMainUrls() {
  const htmlResult = await request.get(url);
  const $ = await cheerio.load(htmlResult);
  const allLinksWithEmptyStrings = $("table > tbody > tr > td > a")
    .map((i, element) => $(element).attr("href"))
    .get();
  //Some links are empty strings (''), filter them out:
  const allLinks = allLinksWithEmptyStrings.filter(link => link !== "");
  return allLinks;
}
/*
async function scrapeInnerPages(validUrls) {
  const allText = validUrls.map(async link => {
    const htmlResult = await request.get(link);
    const $ = await cheerio.load(htmlResult);
    await fs.writeFileSync("./test.html", htmlResult);
    const results = $("table.solicitationTable > tbody > tr").map(
      (i, element) => {
        const tdsInRow = $(element).find("td");
        //the first td is the "column name", eg. Type, Department, Bid date etc., second td is the data itself
        const columnName = tdsInRow[0];
        const data = tdsInRow[1];
        console.log(`td0: ${columnName}`);
        console.log(`td1: ${data}`);
        return { columnName: data };
      }
    );
  });
}*/

async function scrapeInnerPages(validUrls) {
  for (let i = 0; i < validUrls.length; i++) {
    const results = await nightmare.goto(validUrls[i]).evaluate(() =>
      $("table.solicitationTable > tbody > tr").map((i, element) => {
        const tdsInRow = $(element).find("td");
        //the first td is the "column name", eg. Type, Department, Bid date etc., second td is the data itself
        const columnName = tdsInRow[0];
        const data = tdsInRow[1];
        console.log(`td0: ${columnName}`);
        console.log(`td1: ${data}`);
        return { columnName: data };
      })
    );
  }
}

function createValidUrl(url) {
  return `https://charlottenc.gov/DoingBusiness/Pages/SolicitationDetails.aspx?ID=${url.substring(
    url.length - 4)}`;
}

async function grabInnerElements(){

}

async function main() {
  const allLinks = await scrapeMainUrls();
  const validUrls = allLinks.map(link => createValidUrl(link));
  //console.log(validUrls);
  await scrapeInnerPages(validUrls);
  //console.log(validUrls);
}


main();