<template>
	<a class=f14 :class='[`ext_${item.ext}`,{sel:sel==item.ext}]' @click.prevent=$root.ExtLink(item.ext)>
		<img width=16 height=16 class=icon :src='"../image/"+item.ext+".svg"'>
		<span class=vam>{{item.name}}</span>
	</a>
</template>

<script>
	export default {
		props:['item','sel']
	}
</script>

<style scoped>
	a{display:block;width:156px;padding-left:44px;line-height:56px;}
	a:hover,.sel{background:#EBEDEF;}
	img{margin-right:16px;}
	.ext_recycle{position:absolute;bottom:40px;width:156px;}
</style>