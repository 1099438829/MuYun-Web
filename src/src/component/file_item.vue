<template>
	<li class='pr item' :class=[item.type,{sel:item.sel}] @click.stop=click(index) @contextmenu.prevent.stop=menu(index)>
		<div class='cp vam pa item_check'></div>
 		<img class='icon vam item_icon' :src=src>
 		<em class='dib cp vam ellipsis item_name' :title=item.name>{{item.name}}</em>
 		<div class=item_plus>
 			<div class='dn cp vam item_handle' @click.stop></div>
 			<div class='dn cp vam item_handle' @click.stop></div>
 			<div class='dn cp vam item_handle' @click.stop></div>
			<span class='dib f12 vam tc item_size'>{{size}}</span>
 			<time class='dib f12 vam item_time'>{{item.time}}</time>
 		</div>
 	</li>
</template>

<script>
	export default {
		props:['item','index','click','menu'],
		computed:{
			src:function(){
				return `../../contents/images/file/${this.item.ext||'dir'}.svg`;
			},
			size:function(){
				var size = this.item.size;
				
				if(size / 1048576 >= 1){
					return (size / 1048576).toFixed(2) + 'GB';
				}else if(size / 1024 >= 1){
					return (size / 1024).toFixed(2) + 'MB';
				}else if(!size){
					return '--';
				}else{
					return size + 'KB';
				}
			}
		}
	}
</script>

<style scoped>
.item:hover,.sel{background:#F1F5FA;}

.thumb .item{display:inline-block;width:120px;height:120px;margin-top:24px;margin-left:22px;border-radius:10px;text-align:center;}
.thumb .item_icon{width:70px;height:50px;margin-top:24px;}
.thumb .item_name{width:90px;margin-top:20px;font-size:14px;}
.thumb .item_check{display:none;top:4px;right:4px;width:20px;height:20px;border-radius:10px;background-color:#67ABE7;}
.thumb .item:hover .item_check{display:block;}
.thumb .sel .item_check{display:block;background-color:#208DE3;}
.thumb .item_plus{display:none;}

.list .item{height:37px;padding-top:5px;border-bottom:1px solid #DDD;}
.list .item_check{left:-28px;top:15px;}
.list .sel .item_check,.item_handle{background:#272822;}
.list .item_icon{width:32px;height:32px;}
.list .item_name{margin-left:24px;font-size:12px;}
.list .item_plus{float:right;height:37px;margin-top:-5px;}

.item_handle{width:20px;height:20px;}
.item_handle+.item_handle{margin-left:8px;}
.item:hover .item_handle{display:inline-block;}
.item_size{width:60px;margin-left:50px;margin-right:80px;line-height:42px;}
.item_time{width:110px;margin-right:40px;line-height:42px;}
</style>