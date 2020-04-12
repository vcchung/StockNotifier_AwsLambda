const chromium = require('chrome-aws-lambda');
var _ = require('lodash');

async function getText(page, selector){
  console.log(`start geting for selector ${selector}`)
  await page.waitForSelector(selector);
  const innerText=await page.evaluate((selector)=> {return document.querySelector(selector).innerText}, selector);
  console.log(`got text for selector ${selector}: ${innerText}`)
  return innerText;
}

function round(text){
  return parseFloat(text.trim()).toFixed(2);
}

async function getRoundedNumber(page, selector){
  let text= await getText(page, selector)
  return round(text);
}
function splitRange(text, separator){
  return text.split(separator)
}

async function getIndexDetails(){
  let browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: false,
  });

try{
    let page = await browser.newPage();
    console.log("trying to get HSI index");
    await page.goto(`https://www.analystz.hk/options/hsi-pe-dividend-valuation.php`);
    let hsi=await getRoundedNumber(page, '#tblData > tbody > tr:nth-child(1) > td:nth-child(4)')
    let hsi_pe=await getRoundedNumber(page, '#tblData > tbody > tr:nth-child(1) > td:nth-child(5)')
    let hsi_div=await getRoundedNumber(page, '#tblData > tbody > tr:nth-child(1) > td:nth-child(6)')

await page.goto('https://www.reuters.com/finance/stocks/overview/.DJI');
let dow = await getText(page, '#headerQuoteContainer > div.sectionQuote.nasdaqChange > div > span:nth-child(4)')
let dow_change= await getText(page, '#headerQuoteContainer > div.sectionQuote.priceChange > div > span.valueContent > span.pos')
let dow_change_percent= await getText(page, '  #headerQuoteContainer > div.sectionQuote.priceChange > div > span.valueContent > span.valueContentPercent > span')

await page.goto('https://www.reuters.com/finance/stocks/overview/.SPX');
let sp = await getText(page, '#headerQuoteContainer > div.sectionQuote.nasdaqChange > div > span:nth-child(4)')
let sp_change= await getText(page, '#headerQuoteContainer > div.sectionQuote.priceChange > div > span.valueContent > span.pos')
let sp_change_percent= await getText(page, '  #headerQuoteContainer > div.sectionQuote.priceChange > div > span.valueContent > span.valueContentPercent > span')

let indexes=[
  {name:'HSI', index: hsi, content:`PE:${hsi_pe}, Div:${hsi_div}`},
  {name:'DowJones', index: dow, content:`Change:${dow_change}, percent:${dow_change_percent}`},
  {name:'SP500', index: sp, content:`Change:${sp_change}, percent:${sp_change_percent}`},
]
console.log(`Index results are ${JSON.stringify(indexes)}`)
return indexes;
}catch (error) {
    console.log(`error is ${error}`)
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}

async function getStockDetails(ticker){
  let browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: false,
  });

try{
    let page = await browser.newPage();
    console.log("trying to get details for "+ticker);
    await page.goto(`http://www.aastocks.com/en/stocks/quote/detail-quote.aspx?symbol=${ticker}`);
    await page.click('#sb2-btnSubmit');
    let name=await getText(page, '#cp_ucStockBar_litInd_StockName')
    let rsi20=parseFloat(await getRoundedNumber(page, '#cp_litRSI20'))
    let rsi14=parseFloat(await getRoundedNumber(page, '#cp_litRSI14'))
    let range52w=await getText(page, '#cp_pLeft > table:nth-child(4) > tbody > tr > td:nth-child(1) > div > table > tbody > tr:nth-child(4) > td:nth-child(2)')
    let divs=await getText(page, '#tbQuote > tbody > tr:nth-child(5) > td:nth-child(1) > div > div.float_r.cls.ss2')
    let div=parseFloat(splitRange(divs, "/")[1])
    let ranges=splitRange(range52w, "-")
    let low52w=parseFloat(round(ranges[0]))
    let high52w=parseFloat(round(ranges[1]))
    let price=parseFloat(await getRoundedNumber(page, '#labelLast > b > span'))
    ratio52w=parseFloat(((price - low52w)/(high52w-low52w)*100).toFixed(2))
    priceToH52w=parseFloat(((high52w/price*100)-100).toFixed(2))
    priceVolatility= parseFloat(((high52w-low52w)/price*100).toFixed(2))
    return {
       ticker, name, div, rsi14, rsi20, ratio52w, priceToH52w,priceVolatility,price, low52w, high52w,
    }
  }catch (error) {
      console.log(`error is ${error}`)
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }
}


exports.handler = async (event, context) => {
  console.log(`event is ${JSON.stringify(event)}`)
  const tickers=event.tickers
  let stockResults=[]
  let result = null;
  let indexResults=[]

  try {
    indexResults=await getIndexDetails()
    for(const ticker of tickers) {
      let stockDetails= await getStockDetails(ticker);
      console.log(`Got stock details is ${JSON.stringify(stockDetails)}`);
      if(stockDetails!=null){
          stockResults.push(stockDetails);
      }
    }
    console.log(`Stock results is ${JSON.stringify(stockResults)}`);
  } catch (error) {
    console.log(`error is ${error}`)
  }
  let finalResults={indexes:indexResults, stocks:  stockResults }
  console.log(`Final results is ${JSON.stringify(finalResults)}`);
  return context.succeed(finalResults);
}
