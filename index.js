const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');
const ipArrays = fs.readFileSync('ip.json', 'utf-8').split(',');


// 统计去除重复
function handleData(ipArrays) {
  var result = _.map(ipArrays, function(ip){
    var length = _.reject(ipArrays, function(item){
      return (item.indexOf(ip) < 0);
    }).length;
    return {ip: ip, count: length};
  });

  var newResult = _.uniqBy(result, function(e){
    return e.ip;
  });
  // console.log(newResult);
  return newResult;
}

// 等待
var sleep = function (time) {
  return new Promise(function (resolve, reject) {
      setTimeout(function () {
          resolve();
      }, time);
  })
};


var handledIPArrays = handleData(ipArrays);
// 通过IP地址获取用户地理位置信息
var getLocation = (ip) => axios.get(`http://192.168.56.101:8080/json/${ip}`).then(response => Promise.resolve(response.data)).catch(e => Promise.reject(e));

async function getFinalData(ipDataArray) {
  var dataArray = [];
  console.log(`----------  需要获取的IP地址数量是： ${ipDataArray.length}-------`);
  for(let i=0; i < ipDataArray.length; i++) {
    await sleep(0);
    console.log(`开始获取第${i}个IP的地理位置信息`);
    var location = await getLocation(ipDataArray[i].ip);
    ipDataArray[i].location = location;
    dataArray.push(ipDataArray[i]);
    console.log(`结束获取第${i}个IP的地理位置信息`);
  }
  var writeResult = fs.writeFileSync('location.json', JSON.stringify(dataArray), 'utf-8');
  console.log("成功！");
}

getFinalData(handledIPArrays);

// getLocation('27.115.86.98').then(function(data){
//   console.log(data);
// });
// console.log(ipArrays);

// function resolveAfter2Seconds(x) {
//   return new Promise((resolve, reject) => {
//     setTimeout(()=>{
//       resolve(x);
//     }, 1000);
//   });
// }

// async function add1(x) {
//   const a = await resolveAfter2Seconds(20);
//   const b = await resolveAfter2Seconds(10);
//   return x + a + b;
// }

// add1(10).then(v => {
//   console.log(v);
// })