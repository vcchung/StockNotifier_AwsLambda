const aws = require('aws-sdk');
const ses = new aws.SES({ apiVersion: '2010-12-01' });

const getToday=()=>{
  return new Date().toISOString().slice(0, 10);
}

const emailSubject=()=>{
    return `Daily Investment Reports - ${getToday()}`
}


const renderTable=(rows)=>{
    var html = '<table>';
  html += '<tr>';
  for( var j in rows[0] ) {
  html += '<th>' + j + '</th>';
  }
  html += '</tr>';
  for( var i = 0; i < rows.length; i++) {
  html += '<tr>';
  for( var j in rows[i] ) {
    html += '<td>' + rows[i][j] + '</td>';
  }
  html += '</tr>';
  }
  html += '</table>';
  return html; 
}

const getEmailContent=(event)=>{
   let indexes=renderTable(event.indexes);
   let stocks=renderTable(event.stocks);
   return indexes +'<br><br><br>'+ stocks
}


exports.handler = function(event, context) {
    
     console.log('start sending email');
        let params = {
            Destination: {
                ToAddresses: ["vcchung@gmail.com"]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: getEmailContent(event)
                    }
                },
                Subject: {
                    Data: emailSubject()
                }
            },
            Source: "vcchung@gmail.com"
        }
        ses.sendEmail(params, function(error, data) {
            if (error) {
                console.log(`Error is ${error}`)
            }
            else {
                console.log(`Email sent with data: ${JSON.stringify(data)}`)
            }
        })

}
