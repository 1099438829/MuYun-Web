<template>
	<header>
		<img width=200 height=58 alt=MuYun src='../image/logo.png'>
		<nav>
			<a href='/Home' :class='{sel:sel=="file"}'>文件</a>
			<a href=javascript:; :class='{sel:sel=="share"}'>分享</a>
		</nav>
	</header>
</template>

<script>
	export default {
		props:['sel']
	}
</script>

<style scoped>
	header{width:100%;min-width:1004px;height:58px;background:#0078D7;line-height:58px;}
	img,a{font-size:20px;color:#FFF;vertical-align:middle;}
	img{cursor:pointer;text-align:center;}
	nav{text-align:center;}
	a{display:inline-block;width:156px;}
	a:hover,.sel{background:#006ECD;}
</style>