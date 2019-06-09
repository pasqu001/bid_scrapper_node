const request = require('request-promise');
const cheerio = require('cheerio');
//const ObjectsToCsv = require('objects-to-csv');

const url = 'https://charlottenc.gov/Engineering/Bids/Pages/default.aspx';



async function scrapeMainUrl(){
    const htmlResult = await request.get(url);
    const $ = await cheerio.load(htmlResult);
    //tableText gets all the text when I use it in the browser but when I run it in my script it does not work. 
    const tableText = await $("#ctl00_SPWebPartManager1_g_414ba252_0ae4_485e_9047_62893f83fc84_csr").text();
    console.log(tableText);

    
}

scrapeMainUrl();

/* I still need to grab the URL from that first page for all the bids, then click that url and grab all the data 
from the inner pages for all the bids.*/