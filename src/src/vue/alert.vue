<template>
	<form class=holder v-if=config @click.self='$emit("close")' @submit.prevent>
		<div class=alert>
			<div class=title>
				<span>{{config.title}}</span>
				<div class=close title='关闭' @click='$emit("close")'></div>
			</div>
			<div class=content :class='[config.plus?"plus":"normal"]'>
				<span>{{config.message}}</span>
				<input v-model.trim.lazy=config.value v-select>
			</div>
			<div class=buttons>
				<button v-for='item in config.buttons' :type=item.type :class=item.color @click=item.todo(config.value,config.index)>{{item.title}}</button>
			</div>
		</div>
	</form>
</template>

<script>
	export default {
		props: ['config'],
		directives: {
			select: {
				inserted(el){
					el.select();
				}
			}
		}
	}
</script>

<style scoped>
	.holder{position:fixed;z-index:999;left:0;top:0;right:0;bottom:0;}
	.alert{position:absolute;left:50%;top:50%;transform:translate(-50%,-60%);width:400px;height:208px;background:#FFF;border-radius:4px;box-shadow:0 0 3px #272822;}
	.title{padding:0 20px;height:45px;border-bottom:1px solid #DDD;}
	.title span{font-size:16px;line-height:46px;}

	.content span{font-size:14px;}

	.plus{height:84px;padding-left:80px;padding-top:28px;}
	.plus input{display:block;width:234px;height:30px;margin-top:10px;border:1px solid #DDD;border-radius:6px;text-indent:1em;}
	.normal{height:112px;line-height:112px;text-align:center;}
	.normal input{width:0;height:0;border:0;}

	.buttons{text-align:center;}
	button{width:100px;height:32px;font-size:14px;border-radius:4px;border:0;background:#EEE;}
	button+button{margin-left:36px;}
	button:hover{background:#D2D2D2;}
	.red,.blue{color:#FFF;}
	.red{background:#C33;}
	.red:hover{background:#C03;}
	.blue{background:#0078D7;}
	.blue:hover{background:#006ECD;}
</style>