const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const cheerio = require('cheerio');

// 解析HTML获取想要的分类部分
function resolveHtml(txt) {
  let arr = [];
  let $ = cheerio.load(txt);
  let sons = $('.right .sons');
  sons.each(function (i, elem) {
    // 获取title 去掉多余换号和空格
    let title = $(this).find('.title').text().replace(/\ +|[\r\n]/g, "");
    let contArr = $(this).find('.cont a');
    let cont = [];
    contArr.each(function (t, cdom) {
      cont.push({
        title: $(this).text(),
        url: $(this).attr('href')
      })
    });
    arr.push({
      title: title,
      cont: cont
    });
  });
  return JSON.stringify(arr);
}

function takeContTxtRes (obj, res) {
  // console.log(`状态码: ${res.statusCode}`);
  // 返回数据需要拼接
  let contentTxt = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    contentTxt += chunk; // 返回数据拼接
  });
  res.on('end', () => {
    saveTxt(obj, obj.resolveHtml(contentTxt));
    contentTxt = '';
    // console.log('响应中已无数据。');
  });
}

function takeContTxt(obj) {
  // 入参 基本信息
  const postData = '';
  const options = {
    hostname: obj.hostname,
    port: 80,
    path: obj.path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  // 建立请求
  const req = http.request(options, takeContTxtRes.bind(this, obj)); 
  req.on('error', (e) => {
    console.error(`请求遇到问题: ${e.message}`);
  });
  req.write(postData);
  req.end(); 
}

// 返回数据结束写入本地
function saveTxt(obj, contentTxt) {
  var dist = `./txt/${obj.dist}`;
  // 诗文中的类型
  // var file = (`./txt/${obj.dist}.json`).replace(/[>]/g, "");
  // 遍历所有 类型文件夹中的文件
  var file = (`./txt/${obj.dist}/${obj.title}.json`).replace(/[>]/g, "");

  if (!fs.existsSync(dist)) {
      fs.mkdirSync(dist);
  }
  // 诗文中的类型
  // fs.writeFileSync(file, contentTxt);
  // 遍历所有 类型文件夹中的文件
  var contentTxt = {
    title: obj.title,
    cont: JSON.parse(contentTxt)
  };
  if (fs.existsSync(file)) {
    var oldtxt = fs.readFileSync(file, 'utf-8');
  } else {
    var oldtxt = '[]';
  }
  oldtxt = JSON.parse(oldtxt);
  oldtxt.push(contentTxt);
  contentTxt = JSON.stringify(oldtxt);
  fs.writeFileSync(file, contentTxt);
  // fs.appendFileSync(file, contentTxt);
}

// 二级分类 解析
function resolveNavChildHtml (txt) {
  let arr = [];
  let $ = cheerio.load(txt);
  var sons = $('.left .sons .typecont');
  sons.length ? sons : (sons = $('.left .sons .bookcont'));
  
  sons.each(function (i, elem) {
    // 获取title 去掉多余换号和空格
    let title = $(this).find('.bookMl strong').text().replace(/\ +|[\r\n]/g, "");
    let contArr = $(this).find('span');
    let cont = [];
    contArr.each(function (t, cdom) {
      var url = $(this).find('a').attr('href') || '';
      arr.push({
        title: $(this).find('a').text(),
        author: $(this).text(),
        url: url
      })
    });
  });
  return JSON.stringify(arr);
}

// 首页获取的数据 二级分类
function takeNavChild(navArr) {
  navArr = JSON.parse(navArr);
  // // 遍历所有 诗文文件夹中的文件
  // navArr.map(function (item, i) {
  // });
  // // 遍历所有 类型文件夹中的文件
  // item = navArr[0];
  // item.cont.map(function (t, j) {
  //   // 'so.gushiwen.org'
  //   var url = t.url.replace('http://', '');
  //   var hostname = url.split('/')[0];
  //   var path = url.replace(hostname, '');
  //   takeContTxt({
  //     hostname: hostname,
  //     path: path,
  //     dist: item.title,
  //     title: t.title,
  //     resolveHtml: resolveNavChildHtml
  //   });
  // });
  takeLxTangshi(navArr);
}

// 读取 类型-古诗文件
function fsLx (fileName, cont) {
  // var file = fs.readFileSync(`./txt/类型/${fileName}.json`, 'utf-8');
  takeLxTangshiView(fileName, cont);
}

// 类型 - 获取古诗文件名
function takeLxTangshi (arr) {
  // 遍历所有 类型文件夹中的文件
  arr.map(function (item, t) {
    fsLx(item.title.replace(/\ +|[\r\n]/g, ""), item);
  })
  // fsLx('唐诗三百');
}

function resolveLxTangshiHtml(txt) {
  let $ = cheerio.load(txt);
  var cont = $('.left .sons .cont').eq(0);
  var contyishang = $('.left .sons .contyishang').eq(0).find('p');
  var arr = {
    title: cont.find('h1').text(),
    nian: cont.find('.source a').eq(0).text(),
    author: cont.find('.source a').eq(1).text(),
    contson: cont.find('.contson').text(),
    contyishang: []
  };
  for (var t = 0; t < contyishang.length; t++) {
    arr.contyishang.push(contyishang.eq(t).text());
  }
  return JSON.stringify(arr);
}

function takeLxTangshiView(fileName, navArr) {
  // navArr = JSON.parse(navArr);
  navArr.cont.map(function (item, i) {
    var hostname = 'so.gushiwen.org';
    var path = item.url;
    if (fileName == '词牌大全') { hostname = 'www.gushiwen.org'; }
    takeContTxt({
      hostname: hostname,
      path: path,
      dist: `古诗文`,
      title: fileName,
      resolveHtml: resolveLxTangshiHtml
    });
  });
}


// 首页的分类数据获取
// takeContTxt({
//   hostname: 'www.gushiwen.org',
//   path: '',
//   dist: '',
//   title: 'nav',
//   resolveHtml: resolveHtml
// });

// 首页的分类数据获取
// var nav = [{
//   hostname: 'www.gushiwen.org',
//   title: '诗文',
//   path: '/shiwen/'
// }, {
//   hostname: 'so.gushiwen.org',
//   title: '名句',
//   path: '/mingju/'
// }, {
//   hostname: 'so.gushiwen.org',
//   title: '作者',
//   path: '/authors/'
// }, {
//   hostname: 'so.gushiwen.org',
//   title: '古籍',
//   path: '/guwen/'
// }]

// nav.map(function (n, v) {
//   takeContTxt({
//     hostname: n.hostname,
//     path: n.path,
//     dist: '',
//     title: n.title,
//     resolveHtml: resolveHtml
//   });
// });

// 诗文数据 二级分类
// var swData = fs.readFileSync('./txt/诗文.json', 'utf-8');
// takeNavChild(swData.toString());

// 读取类型
var swData = fs.readFileSync('./txt/类型.json', 'utf-8');
takeNavChild(swData.toString());
