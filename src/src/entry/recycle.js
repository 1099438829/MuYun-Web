/*
	Author:AIOS | Date:2017-03-15 | QQ:1070053575
	WARNING：
		1.以小写字母加下划线命名的为变量,如:'ext','ext_list';(调试用方法如log及logs除外)
		2.以帕斯卡命名法命名的为方法,如:'Post';
*/

// 导入CSS样式表及JS模块
require('../css/reset.min');
require('../css/base');
require('../css/recycle');

import vue from 'vue';
import Post from '../module/ajax_post';

// import vue_img from '../module/v-img-only';
// vue.directive('img-only',vue_img);

// 启动Vue调试模式
vue.config.debug = true;

// 打印单项数据,默认使用log方法
function log(message,type='log'){
	console[type](message);
}

// 打印多项数据
function logs(...messages){
	messages.forEach(item => log(item));
}

// 创建当前页面的Vue实例
new vue({
	el : '#recycle',
	data : {
		// 用户的信息
		info : '',
		// 侧栏列表内容
		ext_list : [
			{ext:'all',name:'全部文件',},
			{ext:'doc',name:'文档',},
			{ext:'images',name:'图片',},
			{ext:'video',name:'视频',},
			{ext:'music',name:'音乐',},
			{ext:'others',name:'其它',},
			{ext:'recycle',name:'回收站',}
		],
		// 当前选中的侧栏列表项
		ext : 'recycle',
		// 用户的ID
		id : '',
		// 当前选中项的索引集合
		index : [],
		// 文件列表
		dir : '',
		// 按shift选择文件项的起点
		shift_bak : '',
		// 右键菜单相关
		menu_target : '',
		file_fixed : '',
		folder_fixed : '',
	},
	computed : {
		// 当前目录文件是否被全选
		isAll(){
			return this.dir.length == this.index.length && this.dir[0];
		},
		// 文件右键菜单
		file_context(){
			return [
				{name:'还原',todo:this.ReCover},
				{name:'彻底删除',todo:this.DelFile},
				{name:'属性',todo:this.Fuck}
			];
		},
		// 目录右键菜单
		folder_context(){
			return [
				{name:'排序方式',todo:this.Fuck},
				{name:'刷新',todo:this.LoadDir},
				{name:'全部还原',todo:this.ReCoverAll},
				{name:'清空回收站',todo:this.DelAllFile},
				{name:'属性',todo:this.Fuck}
			];
		}
	},
	methods : {
		// 未定义的右键方法
		Fuck(index){
			log(index);
		},
		// 用户信息设置
		SetInfo(data){
			this.id = data.UserId;
			this.info = {};
			this.info.mobile = data.Mobile;
			this.info.user_name = data.UserName;
			this.info.img = data.ImgSrc;
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
			this.LoadDir();
		},
		// 退出
		Exit(){
			if(confirm('你真的要走吗(T_T)'))
				Post('/LoginReg/Logout',null,function(){
					alert('给我走');
				})
			else
				alert('就知道你最好了');
		},
		// 侧栏列表项跳转
		ExtLink(ext){
			this.ext = ext;
			if(ext == 'recycle'){
				this.LoadDir();
			}else{
				sessionStorage.pomelo_aios_file_ext = ext;
				location.href = '/Home';
			}
		},
		// 文件列表加载
		LoadDir(){
			Post('/Home/Recycle',null, data => {
				this.SetDir(data.Results);
				this.Reset();
			})
		},
		// 文件列表设置
		SetDir(data){
			this.dir = data.map( item => {
				return {
					sel : '',
					ext : item.FileExt,
					vir : item.VirName,
					name : item.FileName,
					type : item.FileType,
					size : item.FileSize,
					time : item.CreateTime.replace(/-/g,'/').substr(0,16).replace(/\s/,'　')
				}
			})
		},
		// 全选文件
		SelAll(){
			if(this.isAll)
				this.Reset();
			else{
				this.index = [];
				this.dir.forEach((item,index) => {
					item.sel = true;
					this.index.push(index);
				});
			}
		},
		// 点击文件
		FileClick(index){
			var that = this,
				list = this.dir,
				type = event.target.dataset.type;

			this.file_fixed = '';
			this.folder_fixed = '';

			function todo(index){
				list[index].sel = !list[index].sel;
				if(list[index].sel){
					that.index.push(index);
				}else{
					for(var item of that.index){
						if(item == index){
							that.index.splice(i,1);
							break;
						}
					}
				}
			}

			if(event.shiftKey){
				if(this.index.length){
					this.index = [];
					list.forEach(item => item.sel = '');
					for(var i=0;i <= Math.abs(index-this.shift_bak);i++){
						var j = index > this.shift_bak ? this.shift_bak+i : this.shift_bak-i;
						todo(j);
					}
				}else{
					todo(index);
					this.shift_bak = index;
				}
			}else{
				if(type == 'check' || event.ctrlKey){
					todo(index);
					this.shift_bak = index;
				}else if(type == 'name' || type == 'icon')
					this.Fuck(index);
			}
		},
		// 还原文件
		ReCover(index){
			var index = typeof index == 'object' ? this.index[0] : index;
			Post('/Home/RecoverFile',{VirName:this.dir[index].vir},function(data){
				log(data);
			});
		},
		// 还原全部文件
		ReCoverAll(){
			log('Fuck');
		},
		// 删除文件
		DelFile(){
			var json = [];

			for(var i of this.index)
				json.push({VirName:this.dir[i].vir,FileType:this.dir[i].type});

			if(confirm('你真的忍心丢我们到黑黑的回收站吗(>_<)'))
				Post('/Home/DeleteFile',{DeleteArray:JSON.stringify(json)},data => {
					if(data == 'Succeed')
						this.LoadDir();
				})
			else
				log('就知道你最好了(-3-)');

			// 隐藏菜单
		},
		// 清空回收站
		DelAllFile(){
			this.index = [];
			for(var i in this.dir)
				this.index.push[i];
			this.DelFile();
		},
		// 右键菜单
		ShowMenu(index){
			this.file_fixed = '';
			this.folder_fixed = '';
			if(typeof index == 'object'){
				// 资源管理器
				this.folder_fixed = {left:event.clientX,top:event.clientY};
			}else{
				// 文件项
				this.menu_target = index;
				this.dir[index].sel = true;
				this.file_fixed = {left:event.clientX,top:event.clientY};
			}
		},
		// 文件排序
		Sort(type){
			log('waiting for sort this list ...');
		},
		// 重置状态
		Reset(){
			this.index = [];
			this.shift_bak = '';
			this.dir.forEach(item => item.sel = '');
		}
	},
	components : {
		// 页面头部
		'a-head' : require('../vue/ahead'),
		// 页面侧栏
		'a-side' : require('../vue/aside'),
		// 文件项
		'a-item' : require('../vue/file_item'),
		// 右键菜单
		'a-menu' : require('../vue/contextmenu'),
	},
	created(){
		// 添加键盘事件
		document.addEventListener('keydown',event => {
			var keyCode = event.keyCode;
			// Ctrl + A 全选
			if((event.metaKey || event.ctrlKey) && keyCode == 65){
				event.preventDefault();
				this.SelAll();
			}

			// Del删除文件
			if(keyCode == 46 && this.index.length)
				this.DelFile();
		});

		document.addEventListener('click',() => {
			this.file_fixed = '';
			this.folder_fixed = '';
		});

		document.addEventListener('contextmenu',() => {
			this.file_fixed = '';
			this.folder_fixed = '';
		});

		// 获取用户信息及文件列表
		Post('/Home/GetUserInfo',null,data => {
			this.SetInfo(data.Data);
		});

		// 测试用户信息及文件列表
		// this.SetInfo({
		// 	UseId : 1,
		// 	UserName : "木木",
		// 	UseSpace : 104857600,
		// 	HadSpace : 1073741824,
		// 	ImgSrc : 'http://img.muops.cn/muyun/headimg.jpg',
		// 	Mobile : 18814373213
		// });

		// this.SetDir(require('../json/file_list_test'));
	}
})