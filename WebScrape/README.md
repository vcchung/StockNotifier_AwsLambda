# Web Scrape
* Require NodeJs version 8.1 in AWS lambda environment
* depends on chrome-aws-lambda, puppeteer-core

# Web Scrape for stock index
Get **HSI, Dow Jones and SP500** valuation (PE and Div ratio) and changes from  
* https://www.analystz.hk/options/hsi-pe-dividend-valuation.php, 
* https://www.reuters.com/finance/stocks/overview/.DJI, 
* https://www.reuters.com/finance/stocks/overview/.SPX

# Web Scrape for individual stocks
Given the input stock ticker list, fetch the stock name, RSI, Div ratio, 52W high low, current price from http://www.aastocks.com/en/stocks/quote/detail-quote.aspx
