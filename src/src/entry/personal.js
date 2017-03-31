/*
	Author:AIOS | Date:2017-03-16 | QQ:1070053575
	WARNING：
		1.以小写字母加下划线命名的为变量,如:'ext','ext_list';(调试用方法如log及logs除外)
		2.以帕斯卡命名法命名的为方法,如:'Post';
*/

require('../css/reset.min');
require('../css/base');
require('../css/personal');

import vue from 'vue';
import cites from '../json/chinese_cites';
import Post from '../module/ajax_post';

vue.config.debug = true;

function log(message,type='log'){
	console[type](message);
}

function logs(...messages){
	messages.forEach(item => log(item));
}

const personal = new vue({
	el : '#personal',
	data : {
		info : '',
		ext_list : [
			{ext:'self',name:'个人信息',},
			{ext:'secure',name:'安全中心',},
		],
		ext : 'self',
		data_bak : {},
		head_img : '',
		isEdit : '',
		name : '',
		sex : '',
		organ : '',
		email : '',
		mobile : '',
		reg_date : '',
		birth_a : 1950,
		birth_b : 1,
		birth_c : 1,
		month : [1,2,3,4,5,6,7,8,9,10,11,12],
		day : [],
		live_a : '广东省',
		live_b : '广州市',
		live_c : '白云区',
		focus : '',
		menu : '',
		sms : '',
		re_sms : '',
		new_mobile : '',
		new_email : '',
		pword : '',
		new_pword : '',
		re_new_pword : '',
	},
	computed : {
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
			for(var key in cites)
				area.push(key);
			return area;
		},
		area_b(){
			if(this.live_a && cites[this.live_a].constructor == Array)
				return cites[this.live_a];
			var area = [];
			for(var key in cites[this.live_a])
				area.push(key);
			return area;
		},
		area_c(){
			if(this.live_a && cites[this.live_a].constructor != Array) return cites[this.live_a][this.live_b];
			return '';
		},
		// 个人信息内容完成度
		done(){
			var name = !this.CheckInput(this.name) && !!this.name && this.name.length<=8,
				birth = this.birth_a && this.birth_b,
				live = this.live_a && (cites[this.live_a].constructor == Array ? this.live_b : this.live_c),
				oran = !this.CheckInput(this.organ) && !!this.organ && this.organ.length<=50 && this.organ!='未填写';
			return (name+!!birth+!!live+oran+1)*20;
		},
	},
	watch : {
		live_a(newVal,oldVal){
			if(oldVal) this.live_b = '';
		},
		live_b(newVal,oldVal){
			if(oldVal) this.live_c = '';
		}
	},
	methods : {
		// 用户信息设置
		SetInfo(data){
			this.head_img = data.ImgSrc;
			this.info = {};
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
				Post('/LoginReg/Logout',null,function(){
					alert('你走');
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
			// 获取file控件
			var target = event.target;

			// 文件被选中后
			if(target.files[0]){
				// 以控件所属表单为基础创建Form对象
				var form = new FormData(target.form);
				// 把文件塞进Form对象中
				form.append('img',target.files[0]);

				// 创建读取对象
				var reader = new FileReader();
				// 解析被选中的文件
				reader.readAsDataURL(target.files[0]);
				// 解析完成后清除被选中文件
				reader.onload = function(){
					target.form.reset();
				}

				// 创建xhr对象
				var xml = new XMLHttpRequest();
				// 上传成功修正头像为被选中文件
				xml.onload = () => {
					if(xml.status == 200 && xml.readyState == 4)
						this.head_img = reader.result;
				}

				// 开启传送通道
				xml.open('post','/UserCenter/SetHeadImg');
				// 前往极乐世界
				xml.send(form);
			}
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

				if(this.live_a && !(cites[this.live_a].constructor == Array ? this.live_b : this.live_c))
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
    		Post('/UserCenter/UserInfoEdit',{
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
    		Post('/SMS/ReSetMobileSMS',null,function(data){
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
    			Post('/UserCenter/ReSetMobile',null,function(data){
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
				Post('',{},function(data){
					log('修改可以了哦');
				});
			}
		},
		RePword(){
			log(typeof this.pword);
			if(!String(this.pword)){
    			log('怎么可以不输入原来的密码呢');
    		}else if(this.new_pword != this.re_new_pword){
    			log('哎呀你两次输入的密码不一样哦');
    		}else{
    			Post('/UserCenter/ReSetPWD',{},function(data){
    				log('修改成功啦');
    			});
    		}
		}
	},
	components : {
		// 页面顶栏
		'a-head' : require('../vue/ahead'),
		// 页面侧栏
		'a-side' : require('../vue/aside')
	},
	directives : {
		// 焦点赋予
		focus(el,binding){
			if(!personal) return;
			if(binding.expression == personal.focus)
				// secure状态下,延时赋予焦点以便动画完成
				if(personal.ext == 'self'){
					el.focus();
					personal.focus = '';
				}else{
					setTimeout(function(){
						el.focus();
						personal.focus = '';
					},700);
				}
		}
	},
	created(){
		this.MakeDay();

		// 获取用户信息
		Post('/Home/GetUserInfo',null,data => {
			this.SetInfo(data.Data);
		});

		Post('/UserCenter/Index',null,data => {
			this.LoadInfo(data.Data);
		});

		// 测试用户信息
		// this.SetInfo({
		// 	UserName: "木木",
		// 	Sex: "man",
		// 	UseSpace: 104857600,
		// 	HadSpace: 1073741824,
		// 	ImgSrc: 'http://img.muops.cn/muyun/headimg.jpg',
		// 	Mobile: "18814373213"
		// });

		// this.LoadInfo({
		// 	HeadImg: "http://img.muops.cn/muyun/headimg.jpg",
		// 	UserName: "木木",
		// 	Sex: "man",
		// 	Email: "mu951899341@gmail.com",
		// 	CreateTime: "2016-11-08 23:25:06",
		// 	Mobile: "18814373213",
		// 	Address: "广东省,广州市,白云区",
		// 	Organiztion: "广东白云学院",
		// 	Birthday: "1994-11-1"
		// });
	}
})