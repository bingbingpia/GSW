const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
// const postData = querystring.stringify({
//   key: '85db46ca63674ac6a787f6d11372875f',
//   keyWord: '秋兴'
// });
const postData = '';
const options = {
  // hostname: 'api.avatardata.cn',
  // port: 80,
  // path: '/TangShiSongCi/Search',
  hostname: 'www.gushiwen.org',
  port: 80,
  path: '/',
  method: 'GET',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};
var contentTxt = '';
const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    contentTxt += chunk;
    console.log(`响应主体：message.txt`);
  });
  res.on('end', () => {
    fs.writeFile('message.txt', contentTxt, (err) => {
      contentTxt = '';
      if (err) throw err;
      console.log('The file has been saved!');
    });
    console.log('响应中已无数据。');
  });
});
req.on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
});
req.write(postData);
req.end();