<template>
	<aside class='dib pr'>
		<div class=info @mouseleave='plus=false'>
			<img width=60 height=60 class='cp vam img0' :src=img||info.img @mouseover='plus=true'>
			<em class='dib cp vam ellipsis f12' :title=info.user_name @mouseover='plus=true'>{{info.user_name}}</em>
			<div class='plus pa' v-show=plus>
				<div class='delta pr'></div>
				<div class='cont pa'>
					<span class=f12>{{info.mobile}}</span>
					<a class='exit pa f12' @click.prevent=exit>退出</a><br>
					<a href=javascript:; class='dib link tc f12'>个人中心</a>
					<a href=javascript:; class='dib link tc f12'>官网</a>
					<a href=javascript:; class='dib link tc f12'>关于</a>
				</div>
			</div>
			<div class='bar pr' :style={width:info.progress}></div>
			<span class=f12>{{info.used}}/{{info.had}}</span>
		</div>
		<nav>
			<a is=ext_item v-for='item in list' :item=item :sel=ext></a>
		</nav>
	</aside>
</template>

<script>
	import ext_item from './ext_item.vue';
	export default {
		props:['info','list','ext','img','exit'],
		components:{ext_item},
		data(){
			return {
				plus:false
			}
		},
	}
</script>

<style scoped>
	aside{width:200px;height:calc(100% - 58px);min-height:600px;vertical-align:top;background:#F5F7F9;}
	.info{height:111px;padding:20px;}
	img{border-radius:30px;}
	em{width:70px;margin-left:18px;line-height:24px;}
	.bar{height:6px;margin:24px 2px 5px;border-radius:3px;background:#0078D7;}
	.bar::before{content:'';position:absolute;left:-2px;top:-2px;width:158px;height:8px;border-radius:4px;border:1px solid #6AACE7;}
	.delta{left:15px;top:3px;width:32px;height:16px;overflow:hidden;}
	.delta::after{content:'';z-index:2;display:block;position:absolute;left:6px;top:6px;width:20px;height:20px;transform:rotate(45deg);background:#FFF;box-shadow:0 0 3px 0 #DDD;}
	.cont{border-radius:6px;overflow:hidden;z-index:1;width:177px;height:99px;margin-top:3px;background:#FFF;box-shadow:0 0 3px 0 #DDD;}
	.cont span{line-height:40px;margin-left:20px;}
	.exit{right:20px;line-height:40px;}
	.exit:hover{text-decoration:underline;}
	.link{width:59px;height:59px;background:#0078D7;line-height:60px;color:#FFF;}
	.link:hover{background:#006ECD;}
</style>