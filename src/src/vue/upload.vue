<template>
	<div></div>
</template>

<script>
	export default {
		props : ['list'],
		methods : {
			Add(event){
				var file = event.target.files[0];

				this.upload_list.push(file);

				if(!this.upload_list[1])
					this.Upload(file);
			},
			Upload : require('../module/file_upload')
		}
	}
</script>

<style scoped>
	div{position:absolute;top:42px;right:-40px;z-index:999;width:400px;height:300px;border-radius:6px;box-shadow:0 0 4px 0 #272822;background:#FFF;cursor:default;}
</style>