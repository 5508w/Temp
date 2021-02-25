var util = require('../../utils/utils.js'); 
var amapFile = require('../../libs/amap-wx.130');
const wxApi = require('../../utils/auth.js')
const app = getApp()
var markersData = {
 latitude: '',//纬度
 longitude: '',//经度
 key: "6411cf967a0dd7c225b8393cb3874896"//申请的高德地图key
};

 Page({
  //初始化数据
  data: {
    id:"",
    temp: "",
    region:"",
    Date:"",
    time:"",
    openid:""
  },
  onLoad: function () { 
    var that = this
    wx.login({
      success (res) {
        if (res.code) {
          //发起网络请求
            data: {
              code: res.code
            }
            // console.log("!!!"+res.code);
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
      
    }),
    // wx.login({
    //   success: function(data) {
    //     console.log('获取登录 Code：' + data.code)
    //     var postData = {
    //       code: data.code
    //     };
    //     wx.request({
    //       url: 'http://www.localhost:8080/TempServlet',//注意改成自己的服务器请求地址哦！
    //       data: postData,
    //       method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    //       header: {
    //         'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    //       },
    //       success: function(res) {
    //         //回调处理
    //         console.log('getOpenID-OK!');
    //         console.log(res.data);
    //       },
    //       fail: function(error) {
    //         console.log(error);
    //       }
    //     })
    //   },
    //   fail: function() {
    //     console('登录获取Code失败！');
    //   }
    // }),
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
    var latitude
    var longitude
    wxApi.getWxSetting('userLocation').then(()=>{
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: function (res) {
          latitude = res.latitude,//维度
          longitude = res.longitude,//经度
            // console.log(res);
          
          that.loadCity(latitude,longitude);
        },
        fail: err => {
          wx.showToast({
            title: '检查手机定位权限',
            icon: 'none',
            duration: 2000
          })
        }
      })
    })
   },
   //把当前位置的经纬度传给高德地图，调用高德API获取当前地理位置，天气情况等信息
   loadCity: function (latitude, longitude){
    var that=this;
    var myAmapFun = new amapFile.AMapWX({ key: markersData.key });
    
    myAmapFun.getRegeo({
     location: '' + longitude + ',' + latitude + '',//location的格式为'经度,纬度'
     success: function (data) {
      // console.log(data);
      that.setData({
        region: data[0].name,
      });
     },
     fail: function (info) {
      wx.showToast({
        title: info[0]+"！",
        icon: 'none',
        duration: 2000
      })
      that.setData({
        region: info,
      });
      }
    });
   },
  //表单提交按钮
  formSubmit: function(e) {
    var that=this;
    console.log('form发生了submit事件，携带数据为：',this.data.temp)
    if(this.data.id!=""){
      if(this.data.temp!=""){
        const db = wx.cloud.database()
        db.collection('Temp').add({ //插入报名信息
          data: {
            id: this.data.id,
            temp: this.data.temp,
            region:this.data.region,
            Date:this.data.Date,
            time:this.data.time,
            code:this.data.code,
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
              url: '/pages/lookform/lookform?form_id=' + that.data.id+'&&form_Date=' + that.data.Date
              +'&&form_time=' + that.data.time,
            })
          },
          fail: console.error
        })
      }else{
        wx.showToast({
          title: '操作失败！体温为空', // 标题
          icon: 'none',  // 图标类型，默认success
          duration: 1500  // 提示窗停留时间，默认1500ms
        })
      }
    }else{
      wx.showToast({
        title: '提交失败！工号为空', // 标题
        icon: 'none',  // 图标类型，默认success
        duration: 1500  // 提示窗停留时间，默认1500ms
      })
    }
    
    
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
  idinput: function(e) {
    console.log(e.detail.value)
    this.setData({
      id: e.detail.value //待插入的id字段
    })
  },
  tempinput: function(e) {
    console.log(e.detail.value)
    this.setData({
      temp: e.detail.value //待插入的体温字段
    })
  },
  onGetopenid: function(e) {
    this.loadInfo();
    
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        this.setData({
          openid: res.result.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
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