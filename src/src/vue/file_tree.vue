<template>
	<li class=cp @click.stop='open = !open'>
		<span>{{item.FileName}}</span>
		<ul v-show=open>
			<li is=tree v-for='child in item.Children' :item=child></li>
			<li v-if=!item.Children.length @click.stop>
				<strong>哈哈哈哈这里什么都没有</strong>
			</li>
		</ul>
	</li>
</template>

<script>
	export default {
		name:'tree',
		props:['item'],
		data:function(){
			return {
				open:'',
			}
		},
	}
</script>

<style scoped>
	li{font-size:16px;}
	strong{cursor:default;}
</style>