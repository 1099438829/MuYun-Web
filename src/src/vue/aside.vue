<template>
	<aside>
		<div class=info :style='{opacity:Number(!!info.user_name)}' @mouseleave='plus=false'>
			<img width=60 height=60 class=head_img :src=img||info.img @mouseover='plus=true'>
			<!-- <div class=img v-img-only=img||info.img @mouseover='plus=true'></div> -->
			<span class='ellipsis name' :title=info.user_name @mouseover='plus=true'>{{info.user_name}}</span>
			<div class=plus v-show=plus>
				<div class=plus_delta></div>
				<div class=plus_content>
					<div>
						<span class=plus_mobile>{{info.mobile}}</span>
						<a class=plus_exit @click.prevent=exit>退出</a>
					</div>
					<a href='/UserCenter/Index'>个人中心</a>
					<a href=javascript:;>官网</a>
					<a href=javascript:;>关于</a>
				</div>
			</div>
			<div class=progress :style={width:info.progress}></div>
			<span>{{info.used}} / {{info.had}}</span>
		</div>
		<nav>
			<a class=item v-for='item in list' :class='[item.ext,{sel:ext==item.ext}]' @click.prevent=link(item.ext)>
				<img width=16 height=16 :src='"../image/ext/"+item.ext+".svg"'>
				<span>{{item.name}}</span>
			</a>
		</nav>
	</aside>
</template>

<script>
	export default {
		props : ['info','list','ext','img','exit','link'],
		data : function(){
			return {
				plus:false
			}
		}
	}
</script>

<style scoped>
	aside{position:relative;}
	aside,.name,.plus_content>a{display:inline-block;}
	span,.plus_exit,.plus_content>a{font-size:12px;}
	.head_img,.name,.item img,.item span{vertical-align:middle;}
	aside{width:200px;height:calc(100% - 58px);min-height:600px;background:#F5F7F9;vertical-align:top;}
	.info{position:relative;height:111px;padding:20px;}
	.head_img{border-radius:30px;}
	.name{width:70px;margin-left:18px;line-height:24px;}

	.plus{position:absolute;z-index:9;}
	.plus_delta{position:relative;left:15px;top:3px;width:32px;height:16px;overflow:hidden;}
	.plus_delta::after{content:'';display:block;position:absolute;left:6px;top:6px;width:20px;height:20px;transform:rotate(45deg);background:#FFF;box-shadow:0 0 3px 0 #DDD;}
	.plus_content{width:177px;height:99px;border-radius:6px;margin-top:3px;overflow:hidden;background:#FFF;box-shadow:0 0 3px 0 #DDD;}
	.plus_mobile,.plus_exit{line-height:40px;}
	.plus_mobile{margin-left:20px;}
	.plus_exit{float:right;margin-right:20px;}
	.plus_exit:hover{text-decoration:underline;}
	.plus_content>a{width:59px;height:59px;line-height:60px;color:#FFF;background:#0078D7;text-align:center;}
	.plus_content>a:hover{background:#006ECD;}

	.progress{position:relative;height:6px;margin:24px 2px 5px;border-radius:3px;background:#0078D7;}
	.progress::before{content:'';position:absolute;left:-2px;top:-2px;width:158px;height:8px;border-radius:4px;border:1px solid #6AACE7;}

	.item{display:block;width:156px;padding-left:44px;line-height:56px;}
	.item:hover,.sel{background:#EBEDEF;}
	.item img{margin-right:16px;}
	.item span{font-size:14px;}
	
	.recycle{position:absolute;bottom:30px;}
</style>