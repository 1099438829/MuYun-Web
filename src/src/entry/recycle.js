/*
	Author:AIOS | Date:2017-02-26 | QQ:1070053575
	WARNING：
		1.以下划线加帕斯卡命名法命名的为常量,如:'_Vue';
		2.以小写字母加下划线命名的为变量,如:'ext','ext_list';(log及logs两个方法为常量)
		3.以帕斯卡命名法命名的为方法,如:'ReName';
*/

// 导入Vue^2.1.10、页面顶栏组件、页面侧栏组件、文件项组件、右键菜单组件及Post方法
// 还有测试用的数据
import _Vue from 'vue';
import _Header from '../component/header';
import _Aside from '../component/aside';
import _Item from '../component/file_item';
import _Menu from '../component/contextmenu';
import _Post from '../module/ajax_post';
// import _FileListTest from '../json/FileListTest.json';

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
new _Vue({
	// 挂载到id为home的元素上
	el:'#recycle',
	// 实例的元数据
	data:{
		// 用户的信息
		info:'',
		// 侧栏列表内容
		ext_list:[
			{ext:'all',name:'全部文件',},
			{ext:'doc',name:'文档',},
			{ext:'images',name:'图片',},
			{ext:'video',name:'视频',},
			{ext:'music',name:'音乐',},
			{ext:'others',name:'其它',},
			{ext:'recycle',name:'回收站',}
		],
		// 当前选中的侧栏列表项
		ext:'recycle',
		// 当前选中项的索引集合
		index:[],
		// 文件列表
		dir:'',
		// 按shift选择文件项的起点
		shift_bak:'',
		// 右键菜单相关
		file_index:'',
		file_fixed:'',
		folder_fixed:'',
	},
	// 实时计算的属性
	computed:{
		// 是否全选当前目录文件
		isAll(){
			return this.dir.length == this.index.length && this.dir[0];
		},
		file_context(){
			return [
				{name:'还原',todo:this.ReCover},
				{name:'彻底删除',todo:this.DelFile},
				{name:'属性',todo:this.Fuck}
			];
		},
		folder_context(){
			return [
				{name:'排序方式',todo:this.Fuck},
				{name:'刷新',todo:this.LoadDir},
				{name:'全部还原',todo:this.Fuck},
				{name:'清空回收站',todo:this.DelAllFile},
				{name:'属性',todo:this.Fuck},
			];
		},
	},
	// 实例的方法
	methods:{
		// 未定义的右键方法
		Fuck(index){
			log(index);
		},
		// 用户信息设置
		SetInfo(data){
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
			this.ext = ext;
			if(ext != 'recycle'){
				location.href = '../home/index.html?' + ext ;
			}
		},
		// 文件列表加载
		LoadDir(){
			_Post('/Home/Recycle',null, data => {
				this.dir = data.Results.map( item => {
					return {
						sel : '',
						ext : item.FileExt,
						vir : item.VirName,
						name : item.FileName,
						type : item.FileType,
						size : item.FileSize,
						time : item.CreateTime.replace(/-/g,'/').substr(0,16)
					};
				});
			});
		},
		// 全选文件
		SelAll(){
			if(this.isAll)
				this.Reset();
			else{
				this.index = [];
				for(var i in this.dir){
					this.dir[i].sel = true;
					this.index.push(i);
				}
			}
		},
		// 点击文件
		FileClick(index){
			var todo = index => {
				this.dir[index].sel = !this.dir[index].sel;
				if(this.dir[index].sel){
					this.index.push(index);
				}else{
					for(var i in this.index){
						if(this.index[i] == index){
							this.index.splice(i,1);
							break;
						}
					}
				}
			}

			if(event.shiftKey){
				if(this.index.length){
					for(var item of this.dir)
						item.sel = false;
					this.index = [];
					for(var i=0;i <= Math.abs(index-this.shift_bak);i++){
						var j = index > this.shift_bak ? this.shift_bak+i : this.shift_bak-i;
						todo(j);
					}
				}else{
					todo(index);
					this.shift_bak = index;
				}
			}else{
				if(event.target.nodeName.toLowerCase() == 'div' || event.ctrlKey){
					todo(index);
					this.shift_bak = index;
				}
			}
		},
		// 彻底删除文件
		DelFile(){
			var json = [];

			for(var i of this.index)
				json.push({VirName:this.dir[i].vir,FileType:this.dir[i].type});

			if(confirm('你真的再也不要我们了吗(>_<)'))
				_Post('/Home/DeleteFile',{DeleteArray:JSON.stringify(json)},data => {
					if(data == 'Succeed')
						this.LoadDir();
				});
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
		// 还原文件
		ReCover(index){
			var index = typeof index == 'object' ? this.index[0] : index;
			_Post('/Home/RecoverFile',{VirName:this.dir[index].vir},function(data){
				log(data);
			});
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
				this.file_index = index;
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
			for(var item of this.dir)
				item.sel = '';
		},
		LoadDirTest(data){
			this.dir = data.map( item => {
				return {
					sel : '',
					ext : item.FileExt,
					vir : item.VirName,
					name : item.FileName,
					type : item.FileType,
					size : item.FileSize,
					time : item.CreateTime.replace(/-/g,'/').substr(0,16),
				};
			});
		},
	},
	// 实例内应用的组件
	components:{
		// 页面顶栏组件
		'a-head':_Header,
		// 页面侧栏组件
		'a-side':_Aside,
		// 文件项组件
		'a-item':_Item,
		// 右键菜单组件
		'a-menu':_Menu,
	},
	// 实例创建后执行的方法
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

		// 获取用户信息
		_Post('/Home/GetUserInfo',null,data => {
			this.SetInfo(data.Data);
			// 获取文件列表
			this.LoadDir();
		});

		// 测试用户信息
		// this.SetInfo({
		//     "UserName": "木木",
		//     "UseSpace": 104857600,
		//     "HadSpace": 1073741824,
		//     "ImgSrc": 'http://img.muops.cn/muyun/headimg.jpg',
		//     "Mobile": "18814373213",
		// });

		// 测试文件列表
		// this.LoadDirTest(_FileListTest);
	},
});