/*
 	travelX 节日 日历
 * */

function TDate( param ){
	
	this.weeks = ["日","一","二","三","四","五","六"];
	var today = new Date();
	this.year = today.getFullYear();
	this.month = today.getMonth();
	this.day = today.getDate();
	var todayStr = this.year + '-' + (this.month+1) + '-' + this.day;
	
	var options = {
		el:"", //目标dom
		startDate: todayStr,  //日期可以选择的开始时间， 默认今天
		endDate: '',          //日期可以选择的结束时间
		default_Date: {
			isRange: false,   //是否显示日期范围效果
			d_range: [todayStr,todayStr]   //数组第一项 小日期， 第二项 大日期
		}, //日期默认时间
		isToday: true,   //今天是否可选， 默认可选
		fep: '-', //分割符
		cb: null,
		isShow: false   //初始是否显示日历， 默认不显示
	}
	this.options = this.extend( true, options, param );
	
	var dom = this.options.el;
	if( typeof dom === "string" ){
		this.tDom = document.querySelector( dom );
	}else if( !(dom instanceof Array) ){
		this.tDom = dom;
	}

	
	this.init();
	this.initEventBind(); 
}



TDate.prototype.init = function( n_data ){
	
	if( typeof n_data === 'object' ){
		
		this.extend( true, this.options, n_data );
	}
	console.log( this.options );
	//this.startDate = this.options.startDate;
	this.default_Date = this.options.default_Date;
	this.refreshDateRange();
	var def_date = this.range_s; //拿到起始日期
//	console.log( def_date );
	
	if( def_date ){
		this.targetMonth = this.str1date( def_date )[1] - 0;
		this.targetYear = this.str1date( def_date )[0] - 0;
	}else{
		this.targetMonth = this.month;
		this.targetYear = this.year;
	}
	
	
	
	if( this.wrapDom ){  //刷新日历时，把之前的日历结构删除
		this.wrapDom.parentNode.removeChild( this.wrapDom );
	}
	this.createDate();	
	
}
//刷新日期范围
TDate.prototype.refreshDateRange = function( i ){
	this.default_Date.d_range.sort(this.compareStrDate.bind(this));
	this.range_s = this.default_Date.d_range[0];
	this.range_e = this.default_Date.d_range[1];
	
	if( i ){
		if( this.compareStrDate(i, this.range_s) >= 0 ){
			this.default_Date.d_range[1] = i;
	
		}else{
			this.default_Date.d_range[1] = this.default_Date.d_range[0];
			this.default_Date.d_range[0] = i;
		}
	}
	
	this.range_s = this.default_Date.d_range[0];
	this.range_e = this.default_Date.d_range[1];
}

TDate.prototype.addText = function( val ){
	var tDom = this.tDom;
	if( tDom.nodeName == "INPUT"){
		tDom.value = val;
	}else{
		tDom.innerText = val;
	}
}

/**
 * 初始绑定一些全局事件
 */
TDate.prototype.initEventBind = function(){
	var that = this;
	this.addEvent( this.tDom, 'click', function(e){
		e.stopPropagation();
		var wrap_list = document.querySelectorAll('.tdate-wrap');
		wrap_list = Array.prototype.slice.call( wrap_list, 0 );
		wrap_list.forEach(function(item){
			item.style.display = 'none';
		});
		that.wrapDom.style.display = 'block';
	});
	
	this.addEvent( document, 'click', function(){
		that.wrapDom.style.display = 'none';
	});
}

/**
 * 月份切换 处理
 */
TDate.prototype.handleMonth = function( y, m ){
	var m_data = [];
	if( m > 11 ){
		m = 0;
		y = y + 1;
		
	}else if( m < 0 ){
		m = 11;
		y = y - 1;
	}
	this.targetMonth = m;
	this.targetYear = y;
	//console.log(this.targetMonth,this.targetYear);
	//判断左右箭头的显示
	setTimeout(function(){
		if( this.str1date( this.options.startDate )[0] < y ){
			this.wrapDom.querySelector('.left-m-btn').style.display = 'block';
		}else if( this.str1date( this.options.startDate )[1] < m ){
			this.wrapDom.querySelector('.left-m-btn').style.display = 'block';	
		}else{
			this.wrapDom.querySelector('.left-m-btn').style.display = 'none';	
		}
		
	}.bind(this),0);
	
	
	m_data.push( this.getDateInfo( y, m ) );
	var n = m + 1;
	
	if( n > 11 ){
		n = 0;
		y = y + 1;
	}else if( n < 0 ){
		n = 11;
		y = y - 1;
	}
	m_data.push( this.getDateInfo( y, n ) );
	
	
	return m_data;
}
//创建日历结构
TDate.prototype.createDate = function(){
	
	var _dom = this.tDom;
	var wrapDom = document.createElement('div');
	this.wrapDom = wrapDom;
	wrapDom.className = "tdate-wrap";
	
	if( this.options.isShow ){
		wrapDom.style.display = "block";
	}else{
		wrapDom.style.display = "none";
	}
	var tData = this.handleMonth( this.targetYear, this.targetMonth ); //拿到日期数据
//	console.log( tData );
	var headStr = '<div class="d-header"><div class="left-month month-title"><i class="left-m-btn"></i><span class="t-month">'+ tData[0][0].sy +'年'+ tData[0][0].s_m +'月</span></div><div class="right-month month-title"><i class="right-m-btn"></i><span class="t-month">'+ tData[1][0].sy +'年'+ tData[1][0].s_m +'月</span></div></div>';
	wrapDom.innerHTML = headStr;
	var contDom = document.createElement('div');
	contDom.className = "d-cont";
	
	
	this.handleDomStr( tData, contDom  );
	
	wrapDom.appendChild( contDom );

	document.body.appendChild( wrapDom );
	
	wrapDom.style.left = this.offset( _dom ).left + 'px';
	wrapDom.style.top = ( this.offset(_dom).top + _dom.offsetHeight ) + 'px';
	
	//防止点击到日历本身时，事件冒泡
	this.addEvent( wrapDom, 'click', function(e){
		e.stopPropagation();
	});
	
	//日期左右按钮 切换
	var that = this;
	function l_selMonth(){
		that.targetMonth-- ;
		var mons = that.handleMonth( that.targetYear, that.targetMonth );
		that.handleDomStr( mons, contDom  );
	}
	function r_selMonth(){
		that.targetMonth++ ;
		var mons = that.handleMonth( that.targetYear, that.targetMonth );
		that.handleDomStr( mons, contDom  );
	}
	var l_click_dom = wrapDom.querySelector('.left-m-btn');
	var r_click_dom = wrapDom.querySelector('.right-m-btn');
	this.addEvent( l_click_dom, 'click', l_selMonth );
	this.addEvent( r_click_dom, 'click', r_selMonth );
}
//算出元素在页面的位置
TDate.prototype.offset = function(dom){
	function getTop(e){ 
		var offset=e.offsetTop; 
		if(e.offsetParent!=null) offset+=getTop(e.offsetParent); 
		return offset; 
	} 
	function getLeft(e){ 
		var offset=e.offsetLeft; 
		if(e.offsetParent!=null) offset+=getLeft(e.offsetParent); 
		return offset; 
	} 
	function getStyle(obj,attr){
		var ie = !+"\v1";//简单判断ie6~8
		if(attr=="backgroundPosition"){
			if(ie){        
				return obj.currentStyle.backgroundPositionX +" "+obj.currentStyle.backgroundPositionY;
			}
		}
		if(obj.currentStyle){
			return obj.currentStyle[attr];
		}else{
			return document.defaultView.getComputedStyle(obj,null)[attr];
		}
	}
	var left = getLeft( dom );
	var sw;  //屏幕宽度
	if( window.innerWidth ){
		sw = window.innerWidth;
	}else{
		sw = document.body.offsetWidth;
	}
	var t_w = getStyle( this.wrapDom, "width" );
	var cd = left + parseInt( t_w );  //日历距屏幕左边距离 + 日历的宽度
	if( cd > sw ){  //当 日历距屏幕左边距离 + 日历的宽度  大于 屏幕宽度时，  日历从右边显示
		left = left - ( parseInt( t_w ) - dom.offsetWidth );
	}
	return{
		top: getTop( dom ),
		left: left
	}
}

/**
 * tData  两个月的时间信息
 * contDom 放日历的盒子
 */
TDate.prototype.handleDomStr = function( tData, contDom ){
	//tData 两个月的时间数据 
	this.wrapDom.querySelector('.left-month .t-month').innerHTML = tData[0][0].sy +'年'+ tData[0][0].s_m +'月';
	this.wrapDom.querySelector('.right-month .t-month').innerHTML = tData[1][0].sy +'年'+ tData[1][0].s_m +'月';
	
	contDom.innerHTML = '';
	var that = this;
	
	var click_date_arr = [];
	tData.forEach(function( obj ){
		var monthDom = document.createElement('div');
		monthDom.className = "d-month";
		var f_week = obj.firstWeek;
		var d_arr = Array.prototype.slice.call(obj,0);
		
		var bodyStr = '<table cellspacing="0" cellpadding="0"><thead><tr>';
		
		this.weeks.forEach(function( item, index ){
			if( index == 0 || index == 6 ){
				bodyStr += '<th class="restDay">'+ item +'</th>';
			}else{
				bodyStr += '<th>'+ item +'</th>';
			}
			
		});
		bodyStr += '</tr></thead><tbody><tr>';
		
	
		for( var i = 0; i < f_week; i++ ){
			bodyStr += '<td></td>';
		}
		
		d_arr.forEach(function( item, i ){
			var l = f_week + i;
			if( l % 7 === 0 ){
				bodyStr += '</tr><tr>'
			}
			
			var text = item.s_d;
			var dateStr = item.sy + '-' + item.s_m + '-' + item.s_d;
			
			
			if( that.compareStrDate( that.options.startDate, dateStr ) == 1 || that.compareStrDate( dateStr, that.options.endDate ) == 1){
				var tdClass = 'out-d';
			}else{
				var tdClass = 'cho-d';
				click_date_arr.push( item );
			}
			//添加默认时间
			
			var c1 = that.compareStrDate( that.range_s, dateStr ),
				c2 = that.compareStrDate( that.range_e, dateStr );
			if( c1 == 0 || c2 == 0 ){
				tdClass += ' active';
				that.addText( that.formatDate( dateStr, that.options.fep ) );
			}
			
			if( c1 == -1 && c2 == 1 ){
				tdClass += ' area-d';
			}
			
			
			if( item.solar_festival ){   //公历节日
				text = item.solar_festival.slice(0,2);
				tdClass += ' ' + item.color;
			}
			if( item.lunar_festival ){  //农历节日
				text = item.lunar_festival.slice(0,2);
				tdClass += ' ' + item.color;
			}
			if( item.istoday ){
				text = '今天';
				tdClass += ' d-today'; 
			}
//			if( item.solarTerms ){  //24节气
//				text = item.solarTerms.slice(0,2);
//				tdClass += ' ' + item.color;
//			}
			bodyStr += '<td id="'+ dateStr +'" class="'+ tdClass +'">'+ text +'</td>';
		});
	
		for( var i = 0; i < 7-( d_arr.length + f_week )%7; i++ ){
			bodyStr += '<td></td>';
		}
		
		
		bodyStr += '</tr></tbody></table>';
		
		monthDom.innerHTML = bodyStr;
		
		contDom.appendChild( monthDom );
	}.bind(this));
	
	//给tr绑定事件
	
	var td_list = contDom.querySelectorAll('.cho-d');
	console.log(td_list);
	td_list = Array.prototype.slice.call( td_list, 0 );
	
	function renderTr( sd, ed ){  //把两个日期之间,标成区间颜色
		td_list.forEach(function(item){
			 if( that.compareStrDate(item.id, sd) == 0 || that.compareStrDate(item.id, ed) == 0 ){
			 	that.addClass( item, 'active' );
			 }else{
			 	that.removeClass( item, 'active' );
			 }
			 if( that.default_Date.isRange ){  //需要显示范围
				 if( that.compareStrDate(item.id, sd) == 1 && that.compareStrDate(item.id, ed) == -1 ){
					that.addClass( item, 'area-d' );
				 }else{
					that.removeClass( item ,'area-d');
				 }
			}
		});
	}
	
	td_list.forEach(function( td, i ){
		(function(i){	
			that.addEvent( td, 'click', function(){
				var this_d = that.formatDate( this.id );
				that.addText( that.options.fep ? this_d.replace( /-/g, that.options.fep ) : this_d );
			
				if( that.default_Date.isRange ){  //需要显示范围
					that.refreshDateRange(this.id );
					
				}else{
					that.default_Date.d_range = [this.id,this.id];  //让时间范围，两端相同
					that.refreshDateRange();    //刷新一下，that.range_s  that.range_e
					
				}
				var sd = that.range_s;
				var ed = that.range_e;
//				console.log(sd,ed);
				
				renderTr( sd, ed );
				
				
				
				/*
				 * this_d  该天的标准日期
				 * click_date_arr[i] 该天的详情信息
				 **/
				that.options.cb && that.options.cb( this_d, click_date_arr[i] ); //回掉函数存在时，调用
				that.wrapDom.style.display = "none";
			});		
			
			if( that.default_Date.isRange ){  //需要显示范围
				that.addEvent( td, 'mouseover', function(){
					//console.log(this.id, i );
					
					var sd = that.range_s;
					var ed = this.id;
					renderTr( sd, ed );

					
				});
				that.addEvent( td, 'mouseout', function(){
	
					var sd = that.range_s;
					var ed = that.range_e;
					renderTr( sd, ed );

					
				});	
			}
		})(i);			
	});
	
	
//	return monthDom;
}

//为某个元素添加类名
TDate.prototype.addClass = function( dom, cName ){
	if( dom.length ){
		dom.forEach(function( item ){
			item.className = item.className + ' ' + cName;
		});
	}else{
		if( dom.className.indexOf( cName ) == -1 ){
			dom.className = dom.className + ' ' + cName;
		}
		
	}
	
}
//删除某个原生的类名
TDate.prototype.removeClass = function( dom, cName ){
	if( dom.length ){
		dom.forEach(function( item ){
			item.className = item.className.replace( cName, '');
		});
	}else{
		var rf = new RegExp( cName, 'g' );
		dom.className = dom.className.replace( rf, '');
	}
	
}
//绑定事件
TDate.prototype.addEvent = function (ele, type, fn, isC ){
	var isC = isC || false;
	if(ele.addEventListener){  
	    //直接调用  
	    ele.addEventListener( type, fn, isC );  
	}else if(ele.attachEvent){  
		
	    ele.attachEvent("on"+type,fn);  
	}else{  
	    //在addEventListener和attachEvent都不存在的情况下，用此代码  
		ele["on"+type] = fn;  
	}  
}
//移除事件
TDate.prototype.removeEvent = function ( ele, type, fn, isC ){  
	var isC = isC || false;
    if(ele.removeEventListener){  
        ele.removeEventListener( type, fn, isC );  
    }else if(ele.detachEvent){  
        ele.detachEvent("on"+type,fn);  
	}else{  
	    ele["on"+type] = null;  
    }  
}  




//传入 年月  得到 该月 每天的详细信息
// y 年 ， m 月
TDate.prototype.getDateInfo = function( y, m ){
	var lunarInfo=new Array(//阴历数据
	0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
	0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
	0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
	0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
	0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
	0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
	0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
	0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
	0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
	0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
	0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
	0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
	0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
	0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
	0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0)
	
	var solar_month=new Array(31,28,31,30,31,30,31,31,30,31,30,31);
	var day_gan=new Array("甲","乙","丙","丁","戊","己","庚","辛","壬","癸");
	var day_zhi=new Array("子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥");
	var Animals=new Array("鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪");
	var solar_term = new Array("小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至")
	//计算某年的第n个节气公历日期所需要的基础数据（类似于每月的多少天）
	var sterm_info = new Array(0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758)
	var n_str1= new Array('日','一','二','三','四','五','六','七','八','九','十')
	var n_str2 = new Array('初','十','廿','卅','　')
	
	//国历节日 *表示放假日
	var solar_fes = new Array(
	"0101*元旦",
	"0214 情人节",
	"0308 妇女节",
	"0312 植树节",
	"0401 愚人节",
	"0501*劳动节",
	"0504 青年节",
	"0601 儿童节",
	"0801 建军节",
	"0910 教师节",
	"1001*国庆节",
	"1225 圣诞节")
	
	//农历节日 *表示放假日
	var lunar_fes = new Array(
	"0101*春节",
	"0115 元宵节",
	"0505 端午节",
	"0707 七夕情人节",
	"0815 中秋节",
	"0909 重阳节",
	"1208 腊八节",
	"1223 小年",
	"0100*除夕");
	
	var w_fes = new Array(
	"0520 母亲节", "0630 父亲节");
	
	
	
	
//	var today = new Date();
//	var tY = today.getFullYear();
//	var tM = today.getMonth();
//	var tD = today.getDate();
	
	var tY = this.year;
    var tM = this.month;
    var tD =this.day;
	
	
	//返回农历第y年的总天数
	function lunar_day(y) {
	   var i, sum = 348
	   for(i=0x8000; i>0x8; i>>=1) sum += (lunarInfo[y-1900] & i)? 1: 0
	   return(sum+lunar_leap(y))
	}
	
	//返回农历第y年闰月的天数
	function lunar_leap(y) {
	   if(lunar_leap_m(y))  return((lunarInfo[y-1900] & 0x10000)? 30: 29)
	   else return(0)
	}
	
	//返回农历第y年闰几月（1-12月），没闰返回0
	function lunar_leap_m(y) {
	   return(lunarInfo[y-1900] & 0xf)
	}
	
	//返回农历第y年第m月的总天数
	function lunar_leap_d(y,m) {
	   return( (lunarInfo[y-1900] & (0x10000>>m))? 30: 29 )
	}
	
	//算出农历，把值传入到日期控件，返回农历日期控件
	//该农历日期对象的属性：.year,.month,.day,.isLeap,
	//.yearCyl,.monthCyl,.dayCyl
	function Lunar(objDate) {
	
	   var i, leap=0, temp=0
	   var baseDate = new Date(1900,0,31);
	   var offset   = (objDate - baseDate)/86400000
	
	   this.dayCyl = offset + 40
	   this.monCyl = 14
	
	   for(i=1900; i<2050 && offset>0; i++) {
	      temp = lunar_day(i)
	      offset -= temp
	      this.monCyl += 12
	   }
	
	   if(offset<0) {
	      offset += temp;
	      i--;
	      this.monCyl -= 12
	   }
	
	   this.year = i
	   this.yearCyl = i-1864
	
	   leap = lunar_leap_m(i)
	   this.isLeap = false
	
	   for(i=1; i<13 && offset>0; i++) {
	      if(leap>0 && i==(leap+1) && this.isLeap==false)
	         { --i; this.isLeap = true; temp = lunar_leap(this.year); }
	      else
	         { temp = lunar_leap_d(this.year, i); }
	
	      if(this.isLeap==true && i==(leap+1)) this.isLeap = false
	
	      offset -= temp
	      if(this.isLeap == false) this.monCyl ++
	   }
	
	   if(offset==0 && leap>0 && i==leap+1)
	      if(this.isLeap)
	         { this.isLeap = false; }
	      else
	         { this.isLeap = true; --i; --this.monCyl;}
	
	   if(offset<0){ offset += temp; --i; --this.monCyl; }
	
	   this.month = i
	   this.day = offset + 1
	}
	
	function solar_day(y,m) {
	   if(m==1)
	      return(((y%4 == 0) && (y%100 != 0) || (y%400 == 0))? 29: 28)
	   else
	      return(solar_month[m])
	}
	
	//传入offset 传回干支，0=甲子
	function cyclical(num) {
	   return(day_gan[num%10]+day_zhi[num%12])
	}
	
	//把农历的日期 改为大写
	function cal_d(d){
	        var s0;
	        if(d==10)     {s0 = '初十';}
	        else if(d==20){s0 = '二十';}
	        else if(d==30){s0 = '三十';}
	        else{ s0 = n_str2[Math.floor(d/10)]; s0 += n_str1[d%10];}
	        return(s0);
	}
	
	function cal_ele(sy,s_m,s_d,week,lYear,l_m,l_d,isLeap,c_y,c_m,cal_d) {
	
	      this.color      = '';
	      this.lunar_festival = '';
	      this.solar_festival = '';
	      this.solarTerms    = '';
	      this.istoday    = false;
	      this.sy         = sy;
	      this.s_m        = s_m;
	      this.s_d        = s_d;
	      this.week       = week;
	      this.lYear      = lYear;
	      this.l_m        = l_m;
	      this.l_d        = l_d;
	      this.isLeap     = isLeap;
	      this.c_y        = c_y;
	      this.c_m        = c_m;
	      this.cal_d      = cal_d;
	}
	function isLeg(fes, y){
	   y = y - 0;
	   switch(fes){
	      case "元旦":
	         if(y>1911 && y<1950){
	
	         }else if(y>1949){
	            fes = "元旦";
	         }else{
	            fes = "";
	         }
	         break;
	      case "情人节":
	         break;
	      case "妇女节":
	         if(y<1911) fes = "";
	         break;
	      case "植树节":
	         if(y<1979) fes = "";
	         break;
	      case "愚人节":
	         if(y<1564) fes = "";
	         break;
	      case "劳动节":
	         if(y<1890) fes = "";
	         break;
	      case "青年节":
	         if(y<1950) fes = "";
	         break;
	      case "护士节":
	         if(y<1912) fes = "";
	         break;
	      case "儿童节":
	         break;
	      case "建党节 香港回归纪念":
	         if(y<1911) fes = "";
	         else if(y>1920 && y<1997) fes = "建党节";
	         else fes = "中共建党纪念日/香港回归纪念日";
	         break;
	      case "建军节":
	         break;
	      case "父亲节":
	         break;
	      case "教师节":
	         if(y<1985) fes = "";
	         break;
	      case "国庆节":
	         if(y<1949) fes = "";
	         break;
	      case "圣诞节":
	         break;
	   }
	   return fes;
	}
	
	//某年的第n个节气的公历日期（从0小寒算起）；节气的公历日期的计算参考网上算法
	function sTerm(y,n) {
	   var off_date = new Date( ( 31556925974.7*(y-1900) +sterm_info[n]*60000 ) + Date.UTC(1900,0,6,2,5) )
	   return(off_date.getDate())
	}
	
	function calendar(y,m) {
	   var lunar_dpos = new Array(3)
	   var solor_dobj, lunar_dobj, lY, lM, lD=1, lL, lX=0, t_1, t_2
	  
	   var n = 0,first_lunarm = 0
	
	   solor_dobj = new Date(y,m,1)
	
	   this.length    = solar_day(y,m)
	   this.firstWeek = solor_dobj.getDay()
	   this.sx = Animals[(y-4)%12];
	
	   for(var i=0;i<this.length;i++) {
	
	      if(lD>lX) {
	         solor_dobj = new Date(y,m,i+1)
	         lunar_dobj = new Lunar(solor_dobj)
	         lY    = lunar_dobj.year
	         lM    = lunar_dobj.month
	         lD    = lunar_dobj.day
	         lL    = lunar_dobj.isLeap
	         lX    = lL? lunar_leap(lY): lunar_leap_d(lY,lM)
	
	         if(n==0) first_lunarm = lM
	         lunar_dpos[n++] = i-lD+1
	      }
	
	      this[i] = new cal_ele(y, m+1, i+1, n_str1[(i+this.firstWeek)%7],
	                               lY, lM, lD++, lL,
	                               cyclical(lunar_dobj.yearCyl) ,cyclical(lunar_dobj.monCyl), cyclical(lunar_dobj.dayCyl++) )
	
	      
	      if((i+this.firstWeek)%7==0)   this[i].color = 'restDay'  //星期日
	      if((i+this.firstWeek)%7==6) this[i].color = 'restDay' //星期六
	   }
	
	   t_1=sTerm(y,m*2  )-1
	   t_2=sTerm(y,m*2+1)-1
	   this[t_1].solarTerms = solar_term[m*2]
	   this[t_2].solarTerms = solar_term[m*2+1]
	   this[t_1].color = 'solar-terms'  //24节气
	   this[t_2].color = 'solar-terms'
	   //if(m==3) this[t_1].color = '#FF5F07-t3'
	
	
	
	   for(i in w_fes)
	      if(w_fes[i].match(/^(\d{2})(\d)(\d)([\s\*])(.+)$/))
	         if(Number(RegExp.$1)==(m+1)) {
	            t_1=Number(RegExp.$2)
	            t_2=Number(RegExp.$3)
	            this[((this.firstWeek>t_2)?7:0) + 7*(t_1-1) + t_2 - this.firstWeek].solar_festival += RegExp.$5 + ' '
	         }
	
	   for(i in lunar_fes)
	      if(lunar_fes[i].match(/^(\d{2})(.{2})([\s\*])(.+)$/)) {
	         t_1=Number(RegExp.$1)-first_lunarm
	         if(t_1==-11) t_1=1
	         if(t_1 >=0 && t_1<n) {
	            t_2 = lunar_dpos[t_1] + Number(RegExp.$2) -1
	            if( t_2 >= 0 && t_2<this.length) {
	               this[t_2].lunar_festival += RegExp.$4 + ' '
	               this[t_2].color = 'lunar-fes'  //农历节日
	               if(RegExp.$3=='*') this[t_2].color = 'lunar-fes lunar-star' //农历标星 节日
	            }
	         }
	      }
	    for(i in solar_fes)
	      if(solar_fes[i].match(/^(\d{2})(\d{2})([\s\*])(.+)$/))
	         if(Number(RegExp.$1)==(m+1)) {
	         var fes = isLeg(RegExp.$4, y);
	         if(fes == "") continue;
	            this[Number(RegExp.$2)-1].solar_festival += fes + ' '
	            this[Number(RegExp.$2)-1].color = 'solar-fes'  //公历节日
	            if(RegExp.$3=='*') this[Number(RegExp.$2)-1].color = 'solar-fes solar-star'  //公历标星 节日
	         }
	
	
	   if(y==tY && m==tM) {
	         this[tD-1].istoday = true;
	      
	   }
	
	}
	
	

	return ( new calendar(y, m) );
}




TDate.prototype.str1date = function(str) {
    var ar = str.split('-');
    // 返回日期格式
    return [ar[0], ar[1] - 1, ar[2]];
};

/**
 * @description 把时间字串转成时间格式
 * @param {String} str 时间字符串
 */ 

TDate.prototype.str2date = function(str) {
    var ar = str.split('-');
    // 返回日期格式
    return new Date(ar[0], ar[1] - 1, ar[2]);
};

/**
 * @description 比较两个时间字串的大小:1 大于; 0 等于; -1 小于
 * @param {String} b 待比较时间串1
 * @param {String} e 待比较时间串2
 */
TDate.prototype.compareStrDate = function(b, e) {
    var bDate = this.str2date(b);
    var eDate = this.str2date(e);

    // 1 大于; 0 等于; -1 小于
    if(bDate.getTime() > eDate.getTime()) {
        return 1;
    } else if(bDate.getTime() == eDate.getTime()) {
        return 0;
    } else {
        return -1;
    }
};
/**
 * @description 日期格式化，加前导零
 */ 
TDate.prototype.formatDate = function(ymd, fep ) {
	var fep = fep || '-';
    return ymd.replace(/(\d{4})\-(\d{1,2})\-(\d{1,2})/g, function(ymdFormatDate, y, m, d){
        if(m < 10){
            m = '0' + m;
        }
        if(d < 10){
            d = '0' + d;
        }
        return y + fep + m + fep + d;
    });
};

//模拟jquery.extend 方法的拷贝对象
TDate.prototype.extend = function(deep, target, options){
	var copyIsArray,  
        toString = Object.prototype.toString,  
        hasOwn = Object.prototype.hasOwnProperty;  
  
    var class2type = {  
        '[object Boolean]' : 'boolean',  
        '[object Number]' : 'number',  
        '[object String]' : 'string',  
        '[object Function]' : 'function',  
        '[object Array]' : 'array',  
        '[object Date]' : 'date',  
        '[object RegExp]' : 'regExp',  
        '[object Object]' : 'object'  
    }; 
  
    var type = function(obj) {  
        return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";  
    }; 
  
    var isWindow = function(obj) {  
        return obj && typeof obj === "object" && "setInterval" in obj;  
    }; 
	var isArray = Array.isArray || function(obj) {  
        return type(obj) === "array";  
    };  
  
    var isPlainObject = function(obj) {  
        if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {  
            return false;  
        }  
  
        if (obj.constructor && !hasOwn.call(obj, "constructor")  
                && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {  
            return false;  
        }  
  
        var key;  
        for (key in obj) {  
        }  
  
        return key === undefined || hasOwn.call(obj, key);  
    };
    var extend = function(deep, target, options) {
        for (name in options) {  
            src = target[name];  
            copy = options[name];  
  
            if (target === copy) { continue; }  
  
            if (deep && copy  
                    && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {  
                if (copyIsArray) {  
                    copyIsArray = false;  
                    clone = src && isArray(src) ? src : [];  
  
                } else {  
                    clone = src && isPlainObject(src) ? src : {};  
                }  
  
                target[name] = extend(deep, clone, copy);  
            } else if (copy !== undefined) {  
                target[name] = copy;  
            }  
        }  
  
        return target;  
    }; 
    
    return extend(deep, target, options);

};  


