<template>
	<li class=item :class='{sel:item.sel}' @click.stop=click(index) @contextmenu.prevent.stop=menu(index)>
		<div data-type=check class=item_check></div>
		<div data-type=icon class=item_icon :class='item.ext||"dir"'></div>
 		<span data-type=name class='ellipsis item_name' :title=item.name>{{item.name}}</span>
 		<div class=item_plus>
 			<div class=item_handle @click.stop></div>
 			<div class=item_handle @click.stop></div>
 			<div class=item_handle @click.stop></div>
			<span class=item_size>{{size}}</span>
 			<time class=item_time>{{item.time}}</time>
 		</div>
 	</li>
</template>

<script>
	export default {
		props:['item','index','click','menu'],
		computed:{
			size:function(){
				var size = this.item.size;

				if(size / 1048576 >= 1){
					return (size / 1048576).toFixed(1) + 'GB';
				}else if(size / 1024 >= 1){
					return (size / 1024).toFixed(1) + 'MB';
				}else if(!size){
					return '--';
				}else{
					return size + '.0KB';
				}
			}
		}
	}
</script>

<style scoped>
.item:hover,.sel{background:#F1F5FA;}

.item{position:relative;}
.item_check{position:absolute;vertical-align:middle;cursor:pointer;}
.item_icon{display:inline-block;background-size:100% 100%;cursor:pointer;vertical-align:middle;}
.item_icon,.item_name,.item_size,.item_time,.item:hover .item_handle{display:inline-block;}

.thumb .item{display:inline-block;width:120px;height:120px;margin-top:24px;margin-left:22px;border-radius:10px;text-align:center;}
.thumb .item_name{width:90px;margin-top:20px;font-size:14px;}
.thumb .item_check{display:none;top:4px;right:4px;width:20px;height:20px;border-radius:10px;background-color:#67ABE7;}
.thumb .item_icon{width:44px;height:52px;margin-top:24px;}
.thumb .item:hover .item_check{display:block;}
.thumb .sel .item_check{display:block;background-color:#208DE3;}
.thumb .item_plus{display:none;}

.list .item{height:37px;padding-top:5px;border-bottom:1px solid #DDD;}
.list .item_check{left:-28px;top:15px;}
.list .sel .item_check,.item_handle{background:#272822;}
.list .item_icon{width:32px;height:32px;margin-left:10px;}
.list .item_name{margin-left:24px;font-size:12px;vertical-align:middle;line-height:34px;}
.list .item_plus{float:right;height:37px;margin-top:-5px;}

.item_handle{display:none;vertical-align:middle;cursor:pointer;width:20px;height:20px;}
.item_handle+.item_handle{margin-left:8px;}
.item_size{width:60px;margin-left:50px;margin-right:80px;line-height:42px;text-align:center;}
.item_time{width:110px;margin-right:40px;line-height:42px;}
.item_size,.item_time{vertical-align:middle;font-size:12px;}

.dir{background-image:url(../image/file/dir.svg);}
.app{background-image:url(../image/file/app.svg);}
.doc{background-image:url(../image/file/doc.svg);}
.rar{background-image:url(../image/file/rar.svg);}
.video{background-image:url(../image/file/video.svg);}
.music{background-image:url(../image/file/music.svg);}

.thumb .item_icon.dir{width:70px;height:50px;}
</style>