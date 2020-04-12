var _ = require('lodash');

function rankByField(stocks, field, reverseSorted=false){
  let size=stocks.length
  for(const stock of stocks){
    if(stock.rank==null){
      stock.rank=0
      stock.rankDetails=""
    }
    let order='asc'
    if(reverseSorted){
      order='desc'
    }
    let sorted=_.orderBy(stocks, [field], [order]);
    let rank=_.findIndex(sorted, ['ticker', stock.ticker]);
      stock.rank=stock.rank+rank
      stock.rankDetails+=`${field}:${rank},`
  }

}

function rankStocks(stocks){
    rankByField(stocks, "div", true)
    rankByField(stocks, "rsi14")
    rankByField(stocks, "rsi20")
    rankByField(stocks, "ratio52w")
    rankByField(stocks, "priceToH52w", true)
    rankByField(stocks, "priceVolatility")
    return _.sortBy(stocks, ['rank']);
}

exports.handler = async (event) => {
    // TODO implement
    let stocks=rankStocks(event.stocks)
    return _.assign(event, {stocks:stocks})
};
