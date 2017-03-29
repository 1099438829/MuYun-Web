/*
	Author:AIOS | Date:2017-03-27 | QQ:1070053575
	WARNING：
		1.以小写字母加下划线命名的为变量,如:'ext','ext_list';(调试用方法如log及logs除外)
		2.以帕斯卡命名法命名的为方法,如:'Post','LastItem';
*/

require('../css/reset.min');
require('../css/base');
require('../css/home');

import vue from 'vue';
import Post from '../module/ajax_post';

vue.config.debug = true;

function log(message,type='log'){
	console[type](message);
}

function logs(...messages){
	messages.forEach(item => log(item));
}

const LastItem = arr => arr[arr.length-1];

new vue({
	el : '#home',
	data : {
		info : '',
		ext_list : [
			{ext:'all',name:'全部文件',},
			{ext:'doc',name:'文档',},
			{ext:'images',name:'图片',},
			{ext:'video',name:'视频',},
			{ext:'music',name:'音乐',},
			{ext:'others',name:'其它',},
			{ext:'recycle',name:'回收站',}
		],
		ext : '',
		id : '',
		trail : [{name:'全部文件',vir:'/'}],
		index : [],
		mode : 'list',
		search_text : '',
		dir : '',
		shift_bak : '',
		menu_target : '',
		file_fixed : '',
		folder_fixed : '',
		file_tree : '',
		upload_list : [],
	},
	computed : {
		isAll(){
			return this.dir.length == this.index.length && this.dir[0];
		},
		file_context(){
			return [
				{name:'打开',todo:this.FileOpen,line:true},
				{name:'下载',todo:this.Fuck},
				{name:'发送',todo:this.Fuck},
				{name:'复制',todo:this.LoadTree},
				{name:'剪切',todo:this.LoadTree,line:true},
				{name:'重命名',todo:this.ReName},
				{name:'删除',todo:this.DelFile,line:true},
				{name:'属性',todo:this.Fuck}
			];
		},
		folder_context(){
			return [
				{name:'新建文件夹',todo:this.NewDir,line:true},
				{name:'切换显示模式',todo:this.Toggle},
				{
					name : '排序方式',
					todo(){event.stopPropagation()},
					child : [
						{name:'文件名',todo:this.Sort,type:'name'},
						{name:'创建时间',todo:this.Sort,type:'time'},
						{name:'文件大小',todo:this.Sort,type:'size'},
						{name:'文件类别',todo:this.Sort,type:'ext'}
					]
				},
				{name:'刷新',todo:this.Fuck,line:true},
				{name:'属性',todo:this.Fuck}
			];
		}
	},
	methods : {
		Fuck(index){
			log(index);
		},
		SetInfo(data){
			this.LoadDir(this.ext,data.UserId,'/','全部文件');
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
				Post('/LoginReg/Logout',null,function(){
					alert('给我走');
				})
		},
		// 侧栏列表项跳转
		ExtLink(ext){
			this.ext = ext;
			if(ext == 'recycle'){
				location.href = '/Home/Recycle';
			}else{
				// 复位面包屑
				this.trail = [{name:'全部文件',vir:'/'}];
				this.LoadDir(ext,this.id,'/','全部文件');
			}
		},
		// 文件列表加载
		LoadDir(ext,id,vir,name){
			Post('/Home/Index',{FileExt:ext,ParentPath:vir,UserId:id}, data => {
				this.SetDir(data.Results);
				if(!this.trail[0] || LastItem(this.trail).vir != vir) this.trail.push({name:name,vir:vir});
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
		// 切换列表与缩略图模式
		Toggle(){
			this.mode = this.mode == 'thumb' ? 'list' : 'thumb';
			this.Reset();
		},
		// 返回上一级目录
		GoBack(){
			this.trail.pop();
			this.LoadDir('all',this.id,LastItem(this.trail).vir,LastItem(this.trail).name);
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
			if(this.search_text){
				Post('/Home/SearchFile',{SearchStr:this.search_text.replace(/ /g,',')},data => {
					this.Reset();
					this.trail = [];
					this.ext = '';
					this.SetDir(data.Data);
				});
			}else{
				log('搜索字段不能为空哦(>_<)');
			}
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
				Post('/Home/CreateDir',{FileName:name,ParentPath:LastItem(this.trail).vir},data => {
					if(data.Code == 1)
						this.LoadDir('all',this.id,LastItem(this.trail).vir,LastItem(this.trail).name);
				})
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
				Post('/Home/ReNameFile',{NewFileName:name,VirName:this.dir[index].vir},data => {
					this.dir[index].name = name;
				})
			}
		},
		// 检查输入值是否合法
		CheckName(name,index){
			var j=this.dir.length,
				regexp = [/\?/,/\</,/\>/,/\|/,/\*/,/\:/,/\"/,/\'/,/\//,/\\/];

			regexp.forEach(item => {
				if(name.search(item)+1){
					log('不许输入那些奇奇怪怪的字符哦');
					return true;
				}
			});

			while(j>0){
				for(var i in this.dir){
					if(i == index) continue;
					if(name == this.dir[i].name){
						log('不许输入这里出现过的名字哦');
						return true;
					}
				}
				// this.dir.forEach((item,i) => {
				// 	if(i == index) continue;
				// 	if(name == item.name){
				// 		log('不许输入这里出现过的名字哦');
				// 		return true;
				// 	}
				// });
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
				this.dir.forEach((item,index) => {
					item.sel = true;
					this.index.push(index);
				});
			}
		},
		// 点击文件
		FileClick(index){
			var list = this.dir,
				type = event.target.dataset.type;

			this.file_fixed = '';
			this.folder_fixed = '';


			var todo = index => {
				list[index].sel = !list[index].sel;
				if(list[index].sel){
					this.index.push(index);
				}else{
					for(var item of this.index){
						if(item == index){
							this.index.splice(i,1);
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
					this.FileOpen(index);
			}
		},
		// 打开文件
		FileOpen(index){
			var item = this.dir[index];
			if(item.type == 'dir')
				this.LoadDir(this.ext,this.id,item.vir,item.name);
				// this.trail.push({name:item.name,vir:item.vir});
			else
				log('oh you had download me');
		},
		// 删除文件
		DelFile(){
			var json = [];

			for(var i of this.index)
				json.push({VirName:this.dir[i].vir,FileType:this.dir[i].type});

			if(confirm('你真的忍心丢我们到黑黑的回收站吗(>_<)'))
				Post('/Home/DeleteFileEnable',{DeleteArray:JSON.stringify(json)},data => {
					if(data == 'Succeed')
						this.LoadDir(this.ext,this.id,LastItem(this.trail).vir,LastItem(this.trail).name);
				})
			else
				log('就知道你最好了(-3-)');
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
				if(!this.dir[index].sel){
					this.Reset();
					this.dir[index].sel = true;
					this.index.push(index);
				}
				this.file_fixed = {left:event.clientX,top:event.clientY};
			}
		},
		// 文件目录树读取
		LoadTree(){
			Post('/Home/GetDirIndex',null,data => {
				this.file_tree = data.Rows;
			})
		},
		// 文件排序
		Sort(type){
			this.file_fixed = '';
			this.folder_fixed = '';

			log(type);
			// var reverse,
			// 	time = this.dir.length;
			// while(time){
			// 	for(var i=0;i<time-1;i++){
			// 		if(this.dir[i][type] > this.dir[i+1][type]){
			// 			if(!this.dir[i].size) continue;
			// 			var temp = this.dir[i];
			// 			this.dir[i] = this.dir[i+1];
			// 			Vue.set(this.dir,i+1,temp);
			// 			reverse = true;
			// 		}
			// 	}
			// 	time--;
			// }
			// if(!reverse) this.dir.reverse();
		},
		// 重置状态
		Reset(){
			this.index = [];
			this.shift_bak = '';
			this.dir.forEach(item => item.sel = '');
		},
		// Upload
		Upload(file){
			this.upload_list.push({name:file.name});
		},
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
		// 文件目录树
		'a-tree' : require('../vue/file_tree'),
		// 上传控件
		// 'a-upload' : require('../vue/upload')
	},
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

		// 获取文件类
		var ext = sessionStorage['pomelo_aios_file_ext'];
		// 设置当前文件类
		this.ext = ['all','doc','images','video','music','others'].indexOf(ext) + 1 ? ext : 'all';

		// 获取用户信息及文件列表
		Post('/Home/GetUserInfo',null,data => {
			this.SetInfo(data.Data);
		});

		// 测试用户信息及文件列表
		// this.SetInfo({
		// 	UserId : 1,
		// 	UserName : "木木",
		// 	UseSpace : 104857600,
		// 	HadSpace : 1073741824,
		// 	ImgSrc : 'http://img.muops.cn/muyun/headimg.jpg',
		// 	Mobile : 18814373213
		// });

		// this.SetDir(require('../json/file_list_test'));
	}
})