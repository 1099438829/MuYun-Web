// Author: AIOS | QQ: 1070053575

require('../css/reset.min');
require('../css/base');
require('../css/home');
require('../css/explorer');

var vue = require('vue');
var Post = require('../module/ajax_post');

vue.config.debug = true;

var LastItem = arr => arr[arr.length-1];
var Log = message => console.log(message);

new vue({
	el: '#home',
	data: {
		user_info: '',
		ext: '',
		ext_list: [
			{name: '全部文件',ext: 'all'},
			{name: '文档',ext: 'doc'},
			{name: '图片',ext: 'images'},
			{name: '视频',ext: 'video'},
			{name: '音乐',ext: 'music'},
			{name: '其它',ext: 'others'},
			{name: '回收站',ext: 'recycle'}
		],
		id: '',
		mode: 'thumb',
		dir: '',
		dir_file: [],
		dir_folder: [],
		dir_had_sort : '',
		index: [],
		trail: [],
		fixed_dir: '',
		fixed_file: '',
		search_text: '',
		upload_show: '',
		upload_list: [],
		file_tree: '',
		tree_type: '',
		menu_target: '',
		move_vir: '',
		shift_bak : '',
		alert_config: '',
		tips: ''
	},
	computed: {
		isAll(){
			return this.index.length == this.dir.length && this.dir[0];
		},
		context_dir(){
			return [
				{name: '新建文件夹',todo: this.NewDir,line:true},
				{name: '切换显示模式',todo: this.Toggle},
				{
					name: '排序方式',
					todo(){event.stopPropagation()},
					child : [
						{name: '文件名',todo: this.Sort,type:'name'},
						{name: '创建时间',todo: this.Sort,type:'time'},
						{name: '文件大小',todo: this.Sort,type:'size'},
						{name: '文件类别',todo: this.Sort,type:'ext'}
					]
				},
				{name: '刷新',todo: this.ReLoad,line:true},
				{name: '属性',todo(){Log('lalala')}}
			]
		},
		context_file(){
			return [
				{name: '打开',todo: this.EnterFile,line:true},
				{name: '下载',todo: this.Download},
				{name: '分享',todo(){Log('lalala')}},
				{name: '复制到',todo: this.CopyTo},
				{name: '移动到',todo: this.MoveTo,line:true},
				{name: '重命名',todo: this.ReName},
				{name: '删除',todo: this.DelFile,line:true},
				{name: '属性',todo(){Log('lalala')}}
			]
		}
	},
	methods: {
		ExtLink(ext){
			this.ext = ext;
			if(ext == 'recycle'){
				location.href = '/Home/Recycle';
			}else{
				this.trail = [];
				this.LoadDir(ext,'/','全部文件');
			}
		},
		LoadDir(ext,vir,name){
			Post('/Home/Index',{FileExt:ext,UserId:this.id,ParentPath:vir},data => {
				if(data.Code == 1){
					this.SetDir(data.Data);
					if(!this.trail[0] || LastItem(this.trail).vir != vir) this.trail.push({name:name,vir:vir});
					this.Reset();
				}else{
					this.ErrorTips(data.Msg);
				}
			})
		},
		SetDir(data){
			this.dir_file = [];
			this.dir_folder = [];
			this.dir = data.map(item => {
				var _item = {
					sel : '',
					ext : item.FileExt,
					vir : item.VirName,
					name : item.FileName,
					type : item.FileType,
					size : Number(item.FileSize),
					time : item.CreateTime.replace(/-/g,'/').substr(0,16).replace(/\s/,'　')
				}

				if(_item.type == 'dir')
					this.dir_folder.push(_item);
				else
					this.dir_file.push(_item);

				return _item;
			})
		},
		ReLoad(){
			this.LoadDir(this.ext,LastItem(this.trail).vir,LastItem(this.trail).name);
			Post('/Home/GetUserInfo',null,data => {
				if(data.Code == 1){
					setTimeout(()=>{
						this.tips = '';
					},1000);
					this.user_info = data.Data;
				}else{
					this.ErrorTips(data.Msg);
				}
			})
		},
		GoBack(){
			this.trail.pop();
			this.ReLoad();
		},
		TrailLink(index){
			var item = this.trail[index];
			this.LoadDir(this.ext,item.vir,item.name);
			this.trail = this.trail.slice(0,index+1);
		},
		Toggle(){
			this.mode = this.mode == 'thumb' ? 'list' : 'thumb';
			this.Reset();
		},
		SelAll(){
			if(this.isAll)
				this.Reset();
			else{
				this.index = [];
				this.dir.forEach((item,index) => {
					item.sel = true;
					this.index.push(index);
				})
			}
		},
		Search(){
			if(this.search_text)
				Post('/Home/SearchFile',{SearchStr:this.search_text.replace(/ /g,',')},data => {
					if(data.Code == 1){
						this.Reset();
						this.trail = [];
						this.ext = '';
						this.SetDir(data.Data);
					}else{
						this.ErrorTips(data.Msg);
					}
				})
			else
				this.tips = '搜索字段不能为空哦(>_<)';
		},
		Sort(type){
			this.fixed_dir = '';
			this.fixed_file = '';

			var Sort = (list,mode) => {
				if(type == 'size' && mode) return;

				var time = list.length;
				while(time){
					var flag;
					for(var i=0 ; i<time-1 ; i++)
						if( list[i][type] > list[i+1][type] ){
							[ list[i] , list[i+1] ] = [ list[i+1] , list[i] ];
							this.dir_had_sort = true;
							flag = true;
						}
					if(!flag) break;
					time--;
				}
			}

			Sort(this.dir_folder,1);
			Sort(this.dir_file);

			if(this.dir_had_sort){
				this.dir = this.dir_folder.concat(this.dir_file);
				this.dir_had_sort = '';
			}else{
				this.dir.reverse();
			}
		},
		NewDir(){
			var value = '新建文件夹' , num = 1 , i = this.dir.length;
			while(i > 0){
				var flag;
				for(var item of this.dir_folder)
					if(item.name == value){
						value = `新建文件夹(${++num})`;
						flag = true;
					}
				if(!flag) break;
				i--;
			}

			this.alert_config = {
				title: '新建',
				message: '请对文件夹命名',
				plus: true,
				value,
				buttons: [
					{title: '取消',todo: this.CloseAlert,type: 'button'},
					{title: '确定',todo: this.NewDirComplete,type: 'submit',color: 'blue'}
				]
			}
		},
		NewDirComplete(name){
			if(!this.CheckName(name)){
				this.alert_config = '';
				Post('/Home/CreateDir',{FileName:name,ParentPath:LastItem(this.trail).vir},data => {
					if(data.Code == 1){
						this.tips = '创建成功';
						this.ReLoad();
					}else{
						this.ErrorTips(data.Msg);
					}
				})
			}
		},
		ReName(index){
			var index = typeof index == 'object' ? this.index.sort()[0] : index;
			this.alert_config = {
				title: '重命名',
				message: '请输入新的文件名',
				plus: true,
				value: this.dir[index].name,
				index,
				buttons: [
					{title: '取消',todo: this.CloseAlert,type: 'button'},
					{title: '确定',todo: this.ReNameComplete,type: 'submit',color: 'blue'}
				]
			}
		},
		ReNameComplete(name,index){
			if(!this.CheckName(name,index)){
				this.alert_config = '';
				Post('/Home/ReNameFile',{NewFileName:name,VirName:this.dir[index].vir},data => {
					if(data.Code == 1){
						this.tips = '重命名成功';
						this.ReLoad();
					}else{
						this.ErrorTips(data.Msg);
					}
				})
			}
		},
		CheckName(name,index){
			var regexp = [/\?/,/\</,/\>/,/\|/,/\*/,/\:/,/\"/,/\'/,/\//,/\\/];

			for(var i of regexp){
				if(name.search(i)+1){
					this.tips = '不许输入非法字符哦';
					return true;
				}
			}

			for(var i in this.dir){
				if(i == index) continue;
				if(name == this.dir[i].name){
					this.tips = '不许输入这里出现过的名字哦';
					return true;
				}
			}

			if(!name.trim()){
				this.tips = '不许输入空名哦';
				return true;
			}
		},
		DelFile(){
			this.alert_config = {
				title: '删除文件',
				message: '确定删除所选文件？',
				buttons: [
					{title: '取消',todo: this.CloseAlert,type: 'button',},
					{title: '确定',todo: this.DelFileSure,type: 'submit',color: 'red'}
				]
			}
		},
		DelFileSure(){
			this.alert_config = '';
			var json = [];

			for(var i of this.index)
				json.push({VirName:this.dir[i].vir,FileType:this.dir[i].type});

			Post('/Home/DeleteFileEnable',{DeleteArray:JSON.stringify(json)},data => {
				if(data.Code == 1)
					this.ReLoad();
				else
					this.alert_config = {
						title: '提示',
						message: '文件删除失败',
						buttons: [{title: '确定',todo: this.CloseAlert,type: 'submit',color: 'red'}]
					}
			})
		},
		FileClick(index){
			var list = this.dir;
			var type = event.target.dataset.type;

			this.fixed_dir = '';
			this.fixed_file = '';

			var Select = index => {
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
						Select(j);
					}
				}else{
					Select(index);
					this.shift_bak = index;
				}
			}else{
				if(type == 'check' || event.ctrlKey){
					Select(index);
					this.shift_bak = index;
				}else if(type == 'icon')
					this.FileEnter(index);
			}
		},
		FileEnter(index){
			var item = this.dir[index];
			if(item.type == 'dir')
				this.LoadDir(this.ext,item.vir,item.name);
			else
				Log('you had click my icon , but you can\'t download me');
		},
		Download(index){
			var index = typeof index == 'object' ? this.index.sort()[0] : index ;
			if(this.dir[index].type == 'dir')
				this.tips = '暂时不支持整个文件夹下载哦';
			else
				Post('/Home/DownLoadFile',{VirName:this.dir[index].vir},data => {
					if(data.Code == 1){
						var file = document.createElement('a');
						file.download = true;
						file.href = data.Data;
						file.click();
					}else{
						this.ErrorTips(data.Msg);
					}
				})
		},
		Upload(event){
			if(event.target.files[0]){
				var flag = !this.upload_list[0];

				var file_vir = '';
				for(var v of this.trail)
					file_vir += v.vir + '/';

				var list = [].slice.call(event.target.files).map(item => {
					return {
						file: item,
						file_vir: file_vir.slice(1),
						path_vir: LastItem(this.trail).vir,
						type: 'file'
					}
				})

				this.upload_list = this.upload_list.concat(list);

				this.upload_show = true;

				if(flag)
					setTimeout(() => {
						this.$refs.upload.CheckLoading();
					},0)
			}
		},
		CopyTo(index){
			var index = typeof index == 'object' ? this.index.sort()[0] : index;
			this.move_vir = this.dir[index].vir;
			this.ShowTree('Copy');
		},
		Copy(pathVir,selVir){
			this.tips = '文件复制中';
			Post('/Home/CopyFile',{VirName:this.move_vir,NewParentPath:selVir,NewFilePath:pathVir},data => {
				if(data.Code == 1){
					this.tips = '文件复制成功';
					this.ReLoad();
				}
				else
					this.ErrorTips(data.Msg);
			})
		},
		MoveTo(index){
			var index = typeof index == 'object' ? this.index.sort()[0] : index;
			this.move_vir = this.dir[index].vir;
			this.ShowTree('Move');
		},
		Move(pathVir,selVir){
			this.tips = '文件移动中';
			Post('/Home/MoveFile',{VirName:this.move_vir,NewParentPath:selVir,NewFilePath:pathVir},data => {
				if(data.Code == 1){
					this.tips = '文件移动成功';
					this.ReLoad();
				}
				else
					this.ErrorTips(data.Msg);
			})
		},
		ShowTree(type){
			this.tree_type = type;
			// this.file_tree = [{PathName:'根目录',VirName:'/',Children:require('../json/file_tree_test').Data}];
			Post('/Home/GetDirIndex',null,data => {
				if(data.Code == 1)
					this.file_tree = [{PathName:'根目录',VirName:'/',Children:data.Data}];
				else
					this.ErrorTips(data.Msg);
			})
		},
		SubmitTree(pathVir,selVir){
			this.ResetTree();
			this[this.tree_type](pathVir,selVir);
		},
		ResetTree(){
			this.file_tree = '';
			if(this.tree_type == 'Upload')
				document.getElementById('upload').form.reset();
		},
		ShowMenu(index){
			this.fixed_dir = '';
			this.fixed_file = '';
			this.upload_show = '';
			if(typeof index == 'object'){
				this.fixed_dir = {left:event.clientX,top:event.clientY};
			}else{
				this.menu_target = index;
				if(!this.dir[index].sel){
					this.Reset();
					this.dir[index].sel = true;
					this.index.push(index);
				}
				this.fixed_file = {left:event.clientX,top:event.clientY};
			}
		},
		CloseAlert(){
			this.alert_config = '';
		},
		CloseTips(){
			this.tips = '';
		},
		ErrorTips(message){
			this.tips = message;
			setTimeout(() => {
				this.tips = '';
			},3000);
		},
		Reset(){
			this.index = [];
			this.shift_bak = '';
			this.dir.forEach(item => item.sel = '');
		}
	},
	components: {
		'a-tips': require('../vue/tips'),
		'a-side': require('../vue/aside'),
		'a-head': require('../vue/header'),
		'a-tree': require('../vue/file_tree'),
		'a-item': require('../vue/file_item'),
		'a-menu': require('../vue/contextmenu'),
		'a-load': require('../vue/upload_window'),
		'a-alert': require('../vue/alert')
	},
	created(){
		document.addEventListener('click',() => {
			this.fixed_dir = '';
			this.fixed_file = '';
			this.upload_show = '';
		})

		document.addEventListener('contextmenu',() => {
			this.fixed_dir = '';
			this.fixed_file = '';
			this.upload_show = '';
		})

		document.addEventListener('keydown',event => {
			var key = event.keyCode;

			if((event.metaKey || event.ctrlKey) && key == 65 && event.target.type != 'text'){
				event.preventDefault();
				this.SelAll();
			}

			if(key == 113 && this.index.length)
				this.ReName({});

			if(key == 46 && this.index.length)
				this.DelFile({});

			if((key == 13 || key == 108) && this.index.length == 1)
				this.FileEnter(this.index[0]);
		})

		this.ext = sessionStorage.getItem('pomelo_aios_ext') || 'all';

		Post('/Home/GetUserInfo',null,data => {
			if(data.Code == 1){
				this.user_info = data.Data;
				this.id = data.Data.UserId;
				this.LoadDir(this.ext,'/','全部文件');
			}else{
				this.ErrorTips(data.Msg);
			}
		})

		// setTimeout(()=>{
		// 	this.user_info = {
		// 		UserName: "木木",
		// 		UseSpace: 104857600,
		// 		HadSpace: 1073741824,
		// 		ImgSrc: 'http://img.muops.cn/muyun/headimg.jpg',
		// 		Mobile: 18814373213
		// 	}

		// 	this.SetDir(require('../json/file_list_test'));
		// 	this.trail.push({name:'全部文件'});
		// },1000)
	}
})