/*
	Author:AIOS | Date:2017-03-05 | QQ:1070053575
	WARNING：
		1.以下划线加帕斯卡命名法命名的为常量,如:'_Vue','_LastItem';
		2.以小写字母加下划线命名的为变量,如:'ext','ext_list';(log及logs两个方法为常量)
		3.以帕斯卡命名法命名的为方法,如:'ReName';
*/

// 导入Vue^2.1.10、页面顶栏组件、页面侧栏组件、文件项组件、文件目录树组件、右键菜单组件及Post方法
// 还有测试用的数据
import _Vue from 'vue';
import _Header from '../component/header';
import _Aside from '../component/aside';
import _Item from '../component/file_item';
import _Menu from '../component/contextmenu';
import _Tree from '../component/file_tree';
import _Post from '../module/ajax_post';
import _FileListTest from '../json/FileListTest.json';
import _FileTreeTest from '../json/FileTreeTest.json';

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

// 返回数组的最后一项
const _LastItem = arr => arr[arr.length-1];

// 创建当前页面的Vue实例
new _Vue({
	// 挂载到id为home的元素上
	el:'#home',
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
		ext:'',
		// 用户的ID
		id:'',
		// 面包屑列表
		trail:[{name:'全部文件',vir:'/'}],
		// 当前选中项的索引集合
		index:[],
		// 当前显示模式
		mode:'thumb',
		// 搜索字段
		search_text:'',
		// 文件列表
		dir:'',
		// 按shift选择文件项的起点
		shift_bak:'',
		// 右键菜单相关
		file_index:'',
		file_fixed:'',
		folder_fixed:'',
		// 文件目录树
		file_tree:'',
	},
	// 实时计算的属性
	computed:{
		// 是否全选当前目录文件
		isAll(){
			return this.dir.length == this.index.length && this.dir[0];
		},
		// 缩略图及列表模式的图标路径
		img_mode(){
			return `../../contents/images/folder/${this.mode}.svg`;
		},
		// 列表为空时的图片路径
		img_none(){
			var img = this.trail[0].search ? 'search' : 'file';
			return `../../contents/images/folder/${img}_none.svg`;
		},
		file_context(){
			return [
				{name:'打开',todo:this.FileOpen},
				{name:'下载',todo:this.Fuck},
				{name:'发送',todo:this.Fuck},
				{name:'剪切',todo:this.Fuck},
				{name:'复制',todo:this.Fuck},
				{name:'删除',todo:this.DelFile},
				{name:'重命名',todo:this.ReName},
				{name:'属性',todo:this.Fuck},
			];
		},
		folder_context(){
			return [
				{name:'切换显示模式',todo:this.Toggle},
				{name:'排序方式',todo:this.Fuck},
				{name:'刷新',todo:this.Fuck},
				{name:'新建文件夹',todo:this.NewDir},
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
			// 复位面包屑
			if(ext == 'recycle'){
				location.href = '../recycle/index.html';
			}else{
				this.trail = [{name:'全部文件',vir:'/'}];
				this.LoadDir(ext,this.id,'/','全部文件');
			}
		},
		// 文件列表加载
		LoadDir(ext,id,vir,name){
			log('had into the function used to load the files list');
			_Post('/Home/Index',{FileExt:ext,ParentPath:vir,UserId:id}, data => {
				this.dir = data.Results.map( item => {
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
				if(!this.trail[0] || _LastItem(this.trail).vir != vir) this.trail.push({name:name,vir:vir});
			});
		},
		// 切换列表与缩略图模式
		Toggle(){
			this.mode = this.mode == 'thumb' ? 'list' : 'thumb';
			this.Reset();
		},
		// 返回上一级目录
		GoBack(){
			this.trail.pop();
			this.LoadDir('all',this.id,_LastItem(this.trail).vir,_LastItem(this.trail).name);
		},
		// 面包屑跳转
		TrailLink(index){
			var item = this.trail[index];
			if(item.name == '搜索结果') return;
			this.LoadDir(this.ext,this.id,item.vir,item.name);
			this.trail = this.trail.slice(0,index+1);
		},
		// 搜索
		Search(){
			if(!this.search_text) log('搜索字段不能为空哦(>_<)');

			_Post('/Home/SearchFile',{SearchStr:this.search_text.replace(/ /g,',')},data => {
				this.reset();
				this.trail = [{search:true}];
				this.dir = data.Data ;
				if(!data.Data) log('没有找到相关内容');
				this.ext = 'all';
			});
		},
		// 新建文件夹
		NewDir(){
			var name = prompt('请输入文件夹的名字(将就一下下……)');
			if(!name) return;

			// var value = (() => {
			// 	var num = 1 , value = '新建文件夹' , i = this.dir.length;
			// 	while(i > 0){
			// 		for(var item of this.dir)
			// 			if(item.name == value)
			// 				value = `新建文件夹(${++num})`;
			// 		i--;
			// 	}
			// 	return value;
			// })();

			if(this.CheckName(name)){
				log('输入的值有非法字符哦');
				this.NewDir();
			}else{
				this.dir.push({name,type:'dir',sel:''});
				log('创建成功');
				_Post('/Home/CreateDir',{FileName:name,ParentPath:_LastItem(this.trail).vir},data => {
					if(data.Code == 1)
						this.LoadDir('all',this.id,_LastItem(this.trail).vir,_LastItem(this.trail).name);
				});
			}
		},
		// 重命名文件
		ReName(index){
			var name = prompt('请输入文件的名字(将就一下下……)'),
				index = typeof index == 'object' ? this.index.sort()[0] : index;
			if(!name) return;
			if(this.CheckName(name,index)){
				log('输入的值有非法字符哦');
				this.ReName(index);
			}else{
				this.dir[index].name = name;
				log('重命名成功');
				this.Reset();
				_Post('/Home/ReNameFile',{NewFileName:name,VirName:this.dir[index].vir},data => {
					this.dir[index].name = name;
				});
			}
		},
		// 检查输入值是否合法
		CheckName(name,index){
			var j=this.dir.length,
				regexp = [/\?/,/\</,/\>/,/\|/,/\*/,/\:/,/\"/,/\'/,/\//,/\\/];
			for(var item of regexp){
				if(name.search(item)+1){
					log('不许输入那些奇奇怪怪的字符哦');
					return true;
				}
			}
			while(j>0){
				for(var i in this.dir){
					if(i == index) continue;
					if(name == this.dir[i].name){
						log('不许输入这里出现过的名字哦');
						return true;
					}
				}
				j--;
			}
			if(!name.trim()){
				log('不许输入空名哦');
				return true;
			}
			return false;
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
			var that = this,
				list = this.dir,
				node = event.target.nodeName.toLowerCase();

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
					for(var item of list)
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
				if(node == 'div' || event.ctrlKey){
					todo(index);
					this.shift_bak = index;
				}else if(node == 'img' || node == 'em'){
					this.FileOpen(index);
				}
			}
		},
		// 打开文件
		FileOpen(index){
			var item = this.dir[index];
			if(item.type == 'dir'){
				this.LoadDir(this.ext,this.id,item.vir,item.name);
			}else{
				log('oh you had download me');
			}
		},
		// 删除文件
		DelFile(){
			var json = [];

			for(var i of this.index){
				json.push({VirName:this.dir[i].vir,FileType:this.dir[i].type});
			}

			log(json);

			if(confirm('你真的忍心丢我们到黑黑的回收站吗(>_<)'))
				_Post('/Home/DeleteFileEnable',{DeleteArray:JSON.stringify(json)},data => {
					if(data == 'Succeed')
						this.LoadDir(this.ext,this.id,_LastItem(this.trail).vir,_LastItem(this.trail).name);
				});
			else
				log('就知道你最好了(-3-)');

			// 隐藏菜单
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
		// 文件目录树读取
		LoadTree(){
			this.file_tree = _FileTreeTest.Rows;
			// _Post('/Home/GetDirIndex',null,data => {
			// 	this.file_tree = data.Rows;
			// });
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
	// 组件
	components:{
		// 页面顶栏组件
		'a-head':_Header,
		// 页面侧栏组件
		'a-side':_Aside,
		// 文件项组件
		'a-item':_Item,
		// 右键菜单组件
		'a-menu':_Menu,
		// 文件目录树组件
		'a-tree':_Tree,
	},
	// 自定义指令
	
	// 实例创建后执行的方法
	created(){
		// 添加键盘事件
		document.addEventListener('keydown',event => {
			var keyCode = event.keyCode;
			// Ctrl + A 全选 , 如果焦点所在位置为文本输入框 , 则为全选文本
			if((event.metaKey || event.ctrlKey) && keyCode == 65 && event.target.type != 'text'){
				event.preventDefault();
				this.SelAll();
			}
			// F2 重命名文件
			if(keyCode == 113 && this.index.length)
				this.ReName({});

			// Del删除文件
			if(keyCode == 46 && this.index.length)
				this.DelFile();

			// Enter打开文件(支持数字键盘上的Enter)
			if((keyCode == 13 || keyCode == 108) && this.index.length == 1)
				this.FileOpen(this.index[0]);
		});

		document.addEventListener('click',() => {
			this.file_fixed = '';
			this.folder_fixed = '';
		});

		document.addEventListener('contextmenu',() => {
			this.file_fixed = '';
			this.folder_fixed = '';
		});

		// 获取查询字符串
		var query = document.URL.match(/\?(.*)/) || [0,'all'];
		// 根据查询字符串设置当前文件类
		this.ext = ['all','doc','images','video','music','others'].indexOf(query[1]) + 1 ? query[1] : 'all';
		// 伪造URL,单纯是编者的恶趣味
		history.pushState(null,null,'./index.html');

		// 获取用户信息
		// _Post('/Home/GetUserInfo',null,data => {
		// 	this.SetInfo(data.Data);
		// 	if(data.Code != 1) return ;
		// 	// 获取文件列表
		// 	this.LoadDir(this.ext,this.id,'/','全部文件');
		// });

		// 测试用户信息
		this.SetInfo({
			"UseId": 1,
		    "UserName": "木木",
		    "Sex": "",
		    "UseSpace": 104857600,
		    "HadSpace": 1073741824,
		    "ImgSrc": 'http://img.muops.cn/muyun/headimg.jpg',
			"IsVip": 1,
		    "Mobile": "18814373213",
		});

		// 测试文件列表
		this.LoadDirTest(_FileListTest);
	},
});