/*
	WARNING：
		1.以下划线加帕斯卡命名法命名的为常量,如:'_Vue';
		2.以小写字母加下划线命名的为变量,如:'ext','ext_list';
		3.以帕斯卡命名法命名的为方法,如:'PostImg';
*/

// 导入Vue^2.1.10、页面顶栏组件、页面侧栏组件、Post方法及国家省市县数据
import _Vue from 'vue';
import _Header from '../component/header';
import _Aside from '../component/aside';
import _Post from '../module/ajax_post';
import _Cites from '../json/chinese_cites.json';

// 开启Vue的错误提示,将输出到console
_Vue.config.debug = true;

// 输出数据到控制台,默认使用log方法
function log(message,type='log'){
	console[type](message);
}

// 输出多条数据到控制台
function logs(...messages){
	for(var item of messages)
		log(item);
}

// 创建当前页面的Vue实例
const _Personal = new _Vue({
	// 挂载到id为personal的元素上
	el:'#personal',
	// 实例的元数据
	data:{
		// 用户的信息
		info:{},
		// 侧栏列表内容
		ext_list:[
			{ext:'self',name:'个人信息',},
			{ext:'secure',name:'安全中心',},
		],
		// 当前选中的侧栏列表项
		ext:'self',
		// 用户信息备份
		data:{},
		// 用户头像的url
		head_img:'',
		// 个人信息是否编辑状态
		isEdit:'',
		// 用户信息
		name:'',
		sex:'',
		organ:'',
		email:'',
		mobile:'',
		reg_date:'',
		// 用户生日相关,abc依次为年月日
		birth_a:1950,
		birth_b:1,
		birth_c:1,
		// 月日集合
		month:[1,2,3,4,5,6,7,8,9,10,11,12],
		day:[],
		// 用户所在地相关,abc依次为省市县
		live_a:'广东省',
		live_b:'广州市',
		live_c:'白云区',
		// 页面内文本框焦点所在
		focus:'',
		// secure中展开的表单
		menu:'',
		// Post返回的SMS 
		sms:'',
		// 用户输入的SMS
		re_sms:'',
		// 新手机号
		new_mobile:'',
		// 新邮箱
		new_email:'',
		// 旧密码
		pword:'',
		// 新密码
		new_pword:'',
		// 重新输入的新密码
		re_new_pword:'',
	},
	// 实时计算的属性
	computed:{
		// 填充1950至当前年份集合
		year(){
			var year = [];
			for(var i = new Date().getFullYear();i >= 1950;i--)
				year.push(i);
			return year;
		},
		// 当前年份是否闰年
		isLeap(){
			return this.birth_a % 4 == 0;
		},
		// 当前月份是否大月
		isBig(){
			return [1,3,5,7,8,10,12].indexOf(Number(this.birth_b)) != -1;
		},
		// 省市县列表内容填充
		area_a(){
			var area = [];
			for(var key in _Cites)
				area.push(key);
			return area;
		},
		area_b(){
			if(this.live_a && _Cites[this.live_a].constructor == Array)
				return _Cites[this.live_a];
			var area = [];
			for(var key in _Cites[this.live_a])
				area.push(key);
			return area;
		},
		area_c(){
			if(this.live_a && _Cites[this.live_a].constructor != Array) return _Cites[this.live_a][this.live_b];
			return false;
		},
		// 个人信息内容完成度
		done(){
			var name = !this.CheckInput(this.name) && !!this.name && this.name.length<=8,
				birth = this.birth_a && this.birth_b,
				live = this.live_a && (_Cites[this.live_a].constructor == Array ? this.live_b : this.live_c),
				oran = !this.CheckInput(this.organ) && !!this.organ && this.organ.length<=50 && this.organ!='未填写';
			return (name+!!birth+!!live+oran+1)*20;
		},
	},
	// 属性变化监听
	watch:{
		live_a(newVal,oldVal){
			if(oldVal) this.live_b = '';
		},
		live_b(newVal,oldVal){
			if(oldVal) this.live_c = '';
		},
	},
	// 实例的方法
	methods:{
		// 用户信息设置
		SetInfo(data){
			this.head_img = data.ImgSrc;
			this.info.mobile = data.Mobile;
			this.info.user_name = data.UserName;
			this.info.progress = (data.UseSpace / data.HadSpace * 156).toFixed(2) + 'px';
			this.info.used = (data => {
				if((data / 1073741824) >= 1){
					return (data / 1073741824).toFixed(2) + 'TB';
				}else if((data / 1048576) >= 1){
					return (data / 1048576).toFixed(2) + 'GB';
				}else if((data / 1024) >= 1){
					return (data / 1024).toFixed(2) + 'MB';
				}else{
					return data + 'KB';
				}
			})(data.UseSpace);
			this.info.had = data.HadSpace/1073741824 >= 1 ? data.HadSpace/1073741824 + 'TB' : data.HadSpace/1048576 + 'GB';
		},
		// 退出
		Exit(){
			if(confirm('你真的要走吗(T_T)'))
				_Post('/LoginReg/Logout',null,function(){
					alert('好啦你走啦');
				});
		},
		// 侧栏列表项跳转
		ExtLink(ext){
			this.LoadInfo(this.data);
			this.isEdit = '';
			this.ext = ext;
			if(ext == 'secure'){
				this.menu = '';
				this.sms = '';
				this.re_sms = '';
				this.new_mobile = '';
				this.new_email = '';
				this.pword = '';
				this.new_pword = '';
				this.re_new_pword = '';
			}
		},
		// 个人信息读取
		LoadInfo(data){
			this.data = data;
			this.sex = data.Sex;
			this.email = data.Email;
			this.name = data.UserName;
			this.head_img = data.HeadImg;
			this.reg_date = data.CreateTime;
			this.organ = data.Organiztion || '未填写';
			this.mobile = data.Mobile.replace(data.Mobile.substr(3,5),'*****') + '（可登陆）';
			if(data.Address)
				[this.live_a,this.live_b,this.live_c] = data.Address.split(',');
    		if(data.Birthday){
    			[this.birth_a,this.birth_b,this.birth_c] = data.Birthday.split('-');
    			this.MakeDay();
    		}
		},
		// 上传头像
		PostImg(event){
			var target = event.target;
			if(target.files[0]){
				var that = this,
					// 创建表单对象
					form = new FormData(),
					// 创建XHR对象
					xml = new XMLHttpRequest();

				// 填充文件进表单对象中
				form.append('img',target.files[0]);

				xml.onload = function(){
					if(xml.status == 200 && xml.readyState == 4){
						log(xml.responseText);
						// 创建文件读取器对象
						var file = new FileReader();
						file.readAsDataURL(target.files[0]);
						file.onload = function(){
							// 将用户头像改为被上传的头像文件
							that.head_img = file.result;
						};
					}
				};
				xml.open('post','/UserCenter/SetHeadImg');
				xml.setRequestHeader('Content-Type','multipart/form-data');
				xml.send(form);
			}
			// 清空已选择文件
			target.form.reset();
		},
		// 切换编辑模式
		Toggle(){
    		var err,
				that = this;

    		if(this.isEdit){

	    		function error(message,type){
	    			log(message);
	    			that.isEdit = true;
	    			err = 1;
	    			if(type==1) that.focus = 'name';
	    			if(type==2) that.focus = 'organ';
	    		}

	    		if(!this.name)
	    			error('用户名不能为空哦',1);

	    		if(this.name.length>8)
	    			error('用户名不能长于8个字符哦',1);

	    		if(this.CheckInput(this.name))
	    			error('用户名不能有奇奇怪怪的字符哦',1);

	    		if(this.birth_a && !this.birth_c)
	    			error('你得给我们一个明确的出生日期哦');

				if(this.live_a && !(_Cites[this.live_a].constructor == Array ? this.live_b : this.live_c))
					error('所在地也要填写完全哦');

	    		if(this.organ.length>50)
	    			error('麻烦给你的组织起个小名',2);

	    		if(this.CheckInput(this.organ))
	    			error('原来你来自一个奇奇怪怪的地方呀',2);

	    		if(err) return;

	    		this.SubmitSelf();
    		}

			if(this.isEdit){
				if(this.organ == '') this.organ = '未填写' ;
			}else{
				if(this.organ == '未填写') this.organ = '' ;
			}   

			this.isEdit = !this.isEdit;
		},
		// 提交个人信息
		SubmitSelf(){
			var that = this;
    		_Post('/UserCenter/UserInfoEdit',{
	    			UserName:that.name,
	    			Sex:that.sex,
	    			Birthday:`${this.birth_a}-${this.birth_b}-${this.birth_c}`,
	    			Address:`${this.live_a},${this.live_b}` + (this.area_c ? `,${this.live_c}` : ''),
	    			Organiztion:that.organ,
	    			Email:that.email,
	    		},function(data){
	    			log('成功提交了咯');
    			}
    		);
		},
		// 清空用户名
		ClearName(){
			this.name = '';
			this.focus = 'name';
		},
		// 动态生成日期集合
		MakeDay(){
			var num;
			this.day = [];
			if(this.isBig){
				num = 31;
			}else if(this.birth_b == 2){
				num = 28 + this.isLeap;
			}else{
				num = 30;
			}
			for(var i=1;i<=num;i++) this.day.push(i);
			if(this.day.indexOf(Number(this.birth_c)) == -1) this.birth_c = 1;
		},
		// 检查输入值是否合法
		CheckInput(text){
			var regexp = [/\?/,/\!/,/\</,/\>/,/\|/,/\*/,/\:/,/\"/,/\'/,/\//,/\\/];
			for(var item of regexp)
				if(text.search(item)+1)
					return true;
			return false;
		},
		// 展开或关闭表单
		ShowMenu(type){
			var type = type == this.menu ? '' : type;
			this.focus = type;
			this.menu = type;
		},
		// 获取验证码
		GetSMS(){
			var that = this;
    		_Post('/SMS/ReSetMobileSMS',null,function(data){
    			that.re_sms = data;
    		});
		},
		// 修改手机号,邮箱地址,用户密码
		ReMobile(){
			if(this.sms != this.re_sms){
    			log('验证码错误啦');
    		}else if(!this.new_mobile){
    			log('你怎么可以不输入新的手机号呢');
    		}else{
    			_Post('/UserCenter/ReSetMobile',null,function(data){
    				log('修改成功了咯');
    			});
    		}
		},
		ReEmail(){
			if(this.CheckInput(this.new_email)){
				log('你的邮箱有些不合符规范哦');
			}else if(!this.new_email){
				log('邮箱不能为空哦');
			}else{
				_Post('',{},function(data){
					log('修改可以了哦');
				});
			}
		},
		RePword(){
			if(!String(this.pword)){
    			log('怎么可以不输入原来的密码呢');
    		}else if(this.new_pword != this.re_new_pword){
    			log('哎呀你两次输入的密码不一样哦');
    		}else{
    			_Post('/UserCenter/ReSetPWD',{},function(data){
    				log('修改成功啦');
    			});
    		}
		},
	},
	// 实例内应用的组件
	components:{
		// 页面顶栏组件
		'a-head':_Header,
		// 页面侧栏组件
		'a-side':_Aside,
	},
	// 自定义Vue指令
	directives:{
		// 焦点赋予
		focus(el,binding){
			if(!_Personal) return;
			if(binding.expression == _Personal.focus)
				// secure状态下,延时赋予焦点以便动画完成
				if(_Personal.ext == 'self'){
					el.focus();
					_Personal.focus = '';
				}else{
					setTimeout(function(){
						el.focus();
						_Personal.focus = '';
					},700);
				}
		}
	},
	// 实例创建后执行的方法
	created(){
		var that = this;
		this.MakeDay();

		// 获取用户信息
		// _Post('/Home/GetUserInfo',null,function(data){
		// 	that.SetInfo(data.Data);	
		// });

		// _Post('/UserCenter/Index',null,function(data){
		// 	that.LoadInfo(data.Results);
		// });

		// 测试用户信息
		this.SetInfo({
		    UserName: "木木",
		    Sex: "man",
		    UseSpace: 104857600,
		    HadSpace: 1073741824,
		    ImgSrc: 'http://img.muops.cn/muyun/headimg.jpg',
		    Mobile: "18814373213"
		});

		this.LoadInfo({
            HeadImg: "http://img.muops.cn/muyun/headimg.jpg",
            UserName: "木木",
            Sex: "man",
            Email: "mu951899341@gmail.com",
            CreateTime: "2016-11-08 23:25:06",
            Mobile: "18814373213",
            Address: "广东省,广州市,白云区",
            Organiztion: "广东白云学院",
            Birthday: "1994-11-1"
        });
	},
});