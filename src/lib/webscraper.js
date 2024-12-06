import io from "socket.io-client"
import axios from "axios";
import { setTimeout } from "timers/promises";
import child_process from "child_process";
import path from "path";
import {fileURLToPath} from 'url';
import jsdom from "jsdom"
// import puppeteer from "puppeteer";
// import { getQueryHandlerAndSelector } from "puppeteer";



//const execFile = child_process.execFile;
const exec = child_process.exec;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//const exePath = path.join(__dirname,"/table.py");
const command = path.join(__dirname,"./table.py");


//main("climate change", "2024-01-04", "2024-05-06", "true", "true", "true", "true");
//main("climate change", "2024-01-04", "2024-05-06", "true", "false", "false", "false");

export default main

async function main(term, start_date, end_date, bbc="false", cnn="false", fox="false", kmbc="false"){
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }
    if (stderr) { 
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout:\n${stdout}`);
  });

  const socket = io("ws://localhost:3003");


  socket.on("success", (data)=>{
    console.log(data);
  })
  socket.on("info", (data)=>{
    console.log(data);
  })
  socket.on("table", (data)=>{
    html_table = data;
  })
  socket.on("error", (data)=>{
    console.log(data);
  })
  socket.on("close", (data)=>{
    console.log(data);
  })

  let html_table = '';
  await article_scraper(socket, term, start_date, end_date, bbc, cnn, fox, kmbc);

  await setTimeout(2000);

  socket.emit('shutdown');

  await setTimeout(2000);

  socket.disconnect();
  console.log("disconnected");

  html_table = html_table.replace(/\\n/g, "");
  html_table = html_table.replace(/\\"/g, "");
  await setTimeout(2000);
   
  return html_table;
  //find a way to end all processes
}


async function article_scraper(socket, term, start_date, end_date, bbc="false", cnn="false", fox="false", kmbc="false"){

  start_date = new Date(start_date);
  end_date = new Date(end_date);

  let empty_array = [];
  if(bbc==="true"){ var bbc_articles = bbc_article_scraper(term, start_date, end_date);}else{var bbc_articles = [];}
  if(cnn==="true"){ var cnn_articles = cnn_article_scraper(term, start_date, end_date);}else{var cnn_articles = [];}
  if(fox==="true"){ var fox_articles = fox_article_scraper(term, start_date, end_date);}else{var fox_articles = [];}
  if(kmbc==="true"){ var kmbc_articles = kmbc_article_scraper(term, start_date, end_date);}else{var kmbc_articles = [];}  
  var article_array = empty_array.concat(await bbc_articles, await cnn_articles, await fox_articles, await kmbc_articles);

  var articles = {article_list:article_array};

  console.log(article_array.length);

  const jsondata = JSON.stringify(articles);
  //emit uses ws which uses bufferUtil which doesnt get imported as dependency for some reason
  //this gives TypeError: bufferUtil.mask is not a function since bufferUtil actually doesn't exist
  //hence make sure to npm install bufferUtil to avoid this issue
  socket.emit('message',jsondata);
  console.log("emitted");

  //now return html table code from table.py and pass to render in ejs frontend file, return csv file to ejs
}

//if request was blocked/article object is none(catch response code), end loop and return articles

async function cnn_article_scraper(term, start_date, end_date){
  try{
    function Article(title,date,description,link){
      this.title=title;
      this.date=date;
      this.org="cnn";
      this.description=description;
      this.link=link;
    }

    let term_api_format = term.replace(" ", "%20");
    let start_num = 0;
    let new_articles = [];

    let unfinished = true;
    while(unfinished){
      let cnn_api_url = `https://search.prod.di.api.cnn.io/content?q=${term_api_format}&size=100&from=${start_num}&page=1&sort=newest&request_id=pdx-search-3a8991a1-92b1-4b1d-a31d-fefdbbc657ea`
      const response = await axios.get(cnn_api_url)
      if(response.status<200 && 299<response.status){
        console.log(`CNN request denied/postponed with response code ${response.status}. Webscraping Halted.`)
        break
      }
      let article_object = response.data.result
      if(typeof article_object === 'undefined'){
        console.log(`CNN JSON list of article objects is empty. Webscraping Halted.`)
        break
      }
      for(var i=0;i<article_object.length;i++){
        let date = new Date(article_object[i].lastModifiedDate);
        if(start_date<=date && date<=end_date){
          let article = new Article(article_object[i].headline,date,article_object[i].body,article_object[i].url);
          new_articles.push(article);
        }
        else if(date.getTime()<start_date.getTime()){unfinished=false;}
      }
      start_num+=100;
      await setTimeout(2000);
    }
    console.log("cnn finished");
    return new_articles;
  }catch(error){
    console.error("Failed to make request to CNN:", error.message);
    return [];
    //res.status(500).send("Failed to fetch query");
  }
}

async function fox_article_scraper(term, start_date, end_date){
  try{
    function Article(title,date,description,link){
      this.title=title;
      this.date=date;
      this.org="fox";
      this.description=description;
      this.link=link;
    }

    let term_api_format = term.replace(" ", "%20");
    let fox_start_date = date_format(start_date, "fox");
    let fox_end_date = date_format(end_date, "fox");
    let start_num = 1;
    let new_articles = [];

    let unfinished = true;
    while(unfinished){
      let fox_api_url = `https://api.foxnews.com/search/web?q=${term_api_format}+-filetype:amp+-filetype:xml+more:pagemap:metatags-prism.section&siteSearch=foxnews.com&siteSearchFilter=i&sort=date:r:${fox_start_date}:${fox_end_date}&start=${start_num}&num=10&callback=__jp3`
      const response = await axios.get(fox_api_url)
      if(response.status<200 && 299<response.status){
        console.log(`Fox News request denied/postponed with response code ${response.status}. Halting Webscraping.`)
        break
      }
      let object = JSON.parse(response.data.substring(22,response.data.length-3));
      let article_object = object.items;
      if(typeof article_object === 'undefined'){
        console.log(`Fox News JSON list of article objects is empty. Halting Webscraping.`)
        break
      }
      for(var i=0;i<article_object.length;i++){
        let date = new Date(article_object[i].pagemap.metatags[0]['dc.date']);
        if(start_date<=date && date<=end_date){
          let article = new Article(article_object[i].pagemap.metatags[0]['dc.title'],date,article_object[i].pagemap.metatags[0]['og:description'],article_object[i].pagemap.metatags[0]['og:url']);
          new_articles.push(article);
        }
      }
      start_num+=10;
      if(start_num>object.queries.request[0].totalResults*0.01){unfinished=false;}
      await setTimeout(2000);
    }
    console.log("fox finished");
    return new_articles;
  }catch(error){
    console.error("Failed to make request to Fox News:", error.message);
    return [];
    //res.status(500).send("Failed to fetch query");
  }
}

async function bbc_article_scraper(term, start_date, end_date){
  try{
    function Article(title,date,description,link){
      this.title=title;
      this.date=date;
      this.org="bbc";
      this.description=description;
      this.link=link;
    }

    let term_api_format = term.replace(" ", "+");
    let page_num = 1;
    let size = 500;
    let ctr = 0;
    let new_articles = [];

    let unfinished = true;
    while(unfinished){
      let bbc_api_url = `https://web-cdn.api.bbci.co.uk/xd/search?terms=${term_api_format}&page=${page_num}&pageSize=${size}`
      const response = await axios.get(bbc_api_url)
      if(response.status<200 && 299<response.status){
        console.log(`BBC request denied/postponed with response code ${response.status}. Halting Webscraping.`)
        break
      }
      let article_object = response.data.data
      if(typeof article_object === 'undefined'){
        console.log(`BBC JSON list of article objects is empty. Halting Webscraping.`)
        break
      }
      for(var i=0;i<article_object.length;i++){
        let date = new Date(article_object[i].lastPublishedAt);
        if(start_date<=date && date<=end_date){
          let article = new Article(article_object[i].title,date,article_object[i].summary,`https://www.bbc.com${article_object[i].path}`);
          new_articles.push(article);
        }
      }
      ctr+=size;
      if(ctr>response.data.total*0.1){unfinished=false;}
      page_num+=1;
      await setTimeout(2000);
    }
    console.log("bbc finished");
    return new_articles;
  }catch(error){
    console.error("Failed to make request to BBC:", error.message);
    return [];
    //res.status(500).send("Failed to fetch query");
  }
}

async function kmbc_article_scraper(term, start_date, end_date){
  try{
    function Article(title,date,description,link){
      this.title=title;
      this.date=date;
      this.org="kmbc";
      this.description=description;
      this.link=link;
    }

    let term_api_format = term.replace(" ", "+");
    let page_num = 1;
    let results_page = `https://www.kmbc.com/search?q=${term_api_format}`
    let dom_object = await axios.get(results_page);
    dom_object = new jsdom.JSDOM(dom_object.data);
    dom_object = dom_object.window.document
    let total = Number(dom_object.body.querySelector(".search-page--result-header>h2").textContent.replace(" Results",""));
    let ctr = 0;
    let new_articles = [];

    let unfinished = true;
    while(unfinished){
      let kmbc_api_url = `https://www.kmbc.com/ajax/search?params=%7B%22query%22%3A%22${term_api_format}%22%7D&page=${page_num}`
      const response = await axios.get(kmbc_api_url)
      if(response.status<200 && 299<response.status){
        console.log(`KMBC request denied/postponed with response code ${response.status}. Halting Webscraping.`)
        break
      }
      let article_object = new jsdom.JSDOM(response.data)
      article_object = article_object.window.document.querySelectorAll(".search-page--result");
      if(typeof article_object === 'undefined'){
        console.log(`KMBC HTML list of article objects is empty. Halting Webscraping.`)
        break
      }
      for(var i=0;i<article_object.length;i++){
        ctr++;
        let datestring = article_object[i].querySelector("span").textContent
        let date = new Date(datestring.substring(0, datestring.indexOf("|")));
        if(start_date<=date && date<=end_date){
          let article = new Article(article_object[i].querySelector("h2").textContent,date,article_object[i].querySelector("p").textContent, `https://www.kmbc.com${article_object[i].querySelector("a").href}`);
          new_articles.push(article);
        }
      }
      if(ctr>total*0.1){unfinished=false;}
      page_num+=1;
      await setTimeout(2000);
    }
    console.log("kmbc finished");
    return new_articles;
  }catch(error){
    console.error("Failed to make request to KMBC:", error.message);
    return [];
    //res.status(500).send("Failed to fetch query");
  }
}


function date_format(date, site){
  if(site=="fox"){
    let year = new Intl.DateTimeFormat('en', {year:'numeric'}).format(date);
    let month = new Intl.DateTimeFormat('en', {month:'2-digit'}).format(date);
    let day = new Intl.DateTimeFormat('en', {day:'2-digit'}).format(date);
    return `${year}${month}${day}`
  }
}


/* let term = "climate change"
term = term.replace(" ", "+");
let page_num = 1;
let article_num = [0,100];
let cnn_start_date = "March 28, 2023";
let cnn_end_date = "April 18, 2024";

let cnn_search_url = `https://www.cnn.com/search?q=${term}&from=${article_num[0]}&size=${article_num[1]}&page=${page_num}&sort=newest&types=all&section=`

var article_array =[]



const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: null,
});

let unfinished = true;
while(unfinished){

  cnn_search_url = `https://www.cnn.com/search?q=${term}&from=${article_num[0]}&size=${article_num[1]}&page=${page_num}&sort=newest&types=all&section=`

  const page = await browser.newPage();
  await page.goto(cnn_search_url, {
  waitUnitl: "domcontentloaded",
  });

  await page.waitForSelector('.card', {visible:true})
  var new_articles = await page.evaluate((cnn_start_date,cnn_end_date)=>{
    function Article(title,date,description,link){
      this.title=title;
      this.date=date;
      this.description=description;
      this.link=link;
    }
    start_date = new Date(cnn_start_date);
    end_date = new Date(cnn_end_date);

    var clist = Array.from(document.body.querySelectorAll('.card'));

    let articles = clist.filter((card)=>{
      let date1 = new Date(card.querySelector(".container__date").textContent.trim());
      return(start_date<=date1 && date1<=end_date)
    }).map((card)=>{
      let date1 = new Date(card.querySelector(".container__date").textContent.trim());
      let title1 = card.querySelector("span.container__headline-text").textContent.trim()
      let description1 = card.querySelector(".container__description").textContent.trim()
      let link1 = card.querySelector(".container__link").href
      let article = new Article(title1,date1,description1,link1);
      return article;
    });
    return JSON.stringify(articles);
  }, cnn_start_date, cnn_end_date);

  new_articles = JSON.parse(new_articles);
  new_articles.forEach((article)=>{
    article.date = new Date(article.date)
  })
  article_array = article_array.concat(new_articles);

  cnn_start_date = new Date(cnn_start_date);
  if(article_array[article_array.length-1].date.getTime()<=cnn_start_date.getTime()){unfinished=false;}

  await setTimeout(500);
  //page.click(".pagination-arrow-right");
  article_num[0]+=100;
}

await setTimeout(10000);
await browser.close();
 */



