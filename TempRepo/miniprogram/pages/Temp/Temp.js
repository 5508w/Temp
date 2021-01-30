var util = require('../../utils/utils.js'); 
var amapFile = require('../../libs/amap-wx.130');
var markersData = {
 latitude: '',//纬度
 longitude: '',//经度
 key: "6411cf967a0dd7c225b8393cb3874896"//申请的高德地图key
};

 Page({
  //初始化数据
  data: {
    temp: "",
    region:"正在读取中",
    Date:"",
    time:"",
  },
  onLoad: function () {  
    this.loadInfo();
    var date = formatDate(new Date());
    var time = formatTime(new Date());
    this.setData({  
      Date: date,  
      time:time
    });  
  },  
  //定位提交按钮
  loadInfo: function(){
    var that=this;
    wx.getLocation({
     type: 'gcj02', //返回可以用于wx.openLocation的经纬度
     success: function (res) {
      var latitude = res.latitude//维度
      var longitude = res.longitude//经度
      console.log(res);
      that.loadCity(latitude,longitude);
     }
    })
   },
   //把当前位置的经纬度传给高德地图，调用高德API获取当前地理位置，天气情况等信息
   loadCity: function (latitude, longitude){
    var that=this;
    var myAmapFun = new amapFile.AMapWX({ key: markersData.key });
    myAmapFun.getRegeo({
     location: '' + longitude + ',' + latitude + '',//location的格式为'经度,纬度'
     success: function (data) {
      console.log(data);
      that.setData({
        region: data[0].name,
      });
     },
     fail: function (info) { }
    });
   },
  //表单提交按钮
  formSubmit: function(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    const db = wx.cloud.database()
    db.collection('form').add({ //插入报名信息
      data: {
        temp: this.data.temp,
        region:this.data.region,
        Date:this.data.Date,
        time:this.data.time,
      },
      success: function(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log("插入成功" + res)
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
        wx.navigateTo({
          url: '/pages/lookform/lookform?form_name=' + that.data.name,
        })
      },
      fail: console.error
    })
  },
  //表单重置按钮
  formReset: function(e) {
    console.log('form发生了reset事件，携带数据为：', e.detail.value)
    this.setData({
      temp:'',
      region:'正在读取中',
      Date:'正在读取中',
      time:'正在读取中'
    })
    this.loadInfo();
    var date = formatDate(new Date());
    var time = formatTime(new Date());
    this.setData({  
      Date: date,  
      time:time
    });  
  },
  //日期选择
  bindDateChange: function(e) {
    this.setData({
      Date: e.detail.value
    })
  },
  //时间选择
  bindTimeChange: function(e) {
    var timestamp = Date.parse(new Date());
    this.setData({
      time: e.detail.value
    })
  },
})
//日期格式
function formatDate(date) {  
  var year = date.getFullYear()  
  var month = date.getMonth() + 1  
  var day = date.getDate()  
  return [year, month, day].map(formatNumber).join('/')
}  
function formatTime(date) {  
  var hour = date.getHours()  
  var minute = date.getMinutes()  
  var second = date.getSeconds()  
  return  [hour, minute, second].map(formatNumber).join(':')  
}  
function formatNumber(n) {  
  n = n.toString()  
  return n[1] ? n : '0' + n  
} 