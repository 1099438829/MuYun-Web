<template>
	<menu v-if=fixed :style='{top:top,left:left}' @contextmenu.prevent>
		<li class='tc cp' v-for='item in context' @click=item.todo(index)>{{item.name}}</li>
	</menu>
</template>

<script>
	export default {
		props:['context','index','fixed'],
		computed:{
			top(){
				if(!this.fixed) return;
				return this.calc(this.fixed.top , document.body.clientHeight , this.context.length * 41);
			},
			left(){
				if(!this.fixed) return;
				return this.calc(this.fixed.left , document.body.clientWidth , 102);
			},
		},
		methods:{
			calc(base,max,menu){
				if(base + menu > max)
					return max - menu + 'px';
				else
					return base + 'px';
			}
		},
	}
</script>

<style scoped>
	menu{position:fixed;z-index:999;border-radius:8px;background:#FFF;}
	li{width:80px;padding:10px;font-size:14px;border:1px solid #272822;border-bottom:0;transition:all .5s;}
	li:hover{background:#272822;color:#FFF;}
	li:first-of-type{border-radius:8px 8px 0 0;}
	li:last-of-type{border-radius:0 0 8px 8px;border-bottom:1px solid #272822;}
</style>