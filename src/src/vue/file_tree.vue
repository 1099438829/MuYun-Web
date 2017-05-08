<template>
	<div class=holder v-if=tree @click.self='$emit("close")'>
		<div class='pa tree'>
			<header>
				<span class=title>{{type=='Copy'?'复制到':'移动到'}}</span>
				<div class=close title='关闭' @click='$emit("close")'></div>
			</header>
			<ul class=core>
				<li is=item v-for='item in tree' :item=item :sel=sel :count=1 @select=Select></li>
			</ul>
			<div class=tc>
				<button @click.prevent='$emit("close")'>取消</button>
				<button class=complete @click.prevent='$emit("complete",path,sel)'>确定</button>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: ['type','tree'],
		data(){
			return {
				path: '',
				sel: ''
			}
		},
		methods: {
			Select(path,sel){
				this.path = path.slice(1);
				this.sel = sel;
			}
		},
		components: {
			item: require('./file_tree_item')
		}
	}
</script>

<style scoped>
	.holder{position:fixed;z-index:999;left:0;right:0;top:0;bottom:0;}
	.tree{position:absolute;width:400px;height:320px;left:50%;top:50%;transform:translate(-50%,-60%);background:#FFF;border-radius:4px;border:1px solid #DDD;}
	header{border-bottom:1px solid #EEE;}
	.title{font-size:16px;line-height:46px;margin-left:20px;}
	.close{right:20px;}
	.core{width:360px;height:200px;margin:14px auto;outline:1px solid #EEE;overflow:auto;}
	button{width:100px;height:32px;background:#EEE;border:0;border-radius:4px;font:14px '微软雅黑';}
	button:hover{background:#D2D2D2;}
	.complete{background:#0078D7;color:#FFF;margin-left:30px;}
	.complete:hover{background:#006ECD}
</style>