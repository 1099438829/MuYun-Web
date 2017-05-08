<template>
	<li :class='{root:item.VirName=="/"}' @click.stop=Click>
		<div class=item :class='{sel:sel==item.VirName}' :style='{"padding-left":count*18+"px"}'>
			<div class='dir_icon vm'></div>
			<span class=vm>{{item.PathName}}</span>
		</div>
		<ul v-show=open>
			<li is=tree v-for='child in item.Children' :item=child :sel=sel :count='count+1' @select=Select></li>
		</ul>
	</li>
</template>

<script>
	export default {
		name: 'tree',
		props: ['item','sel','count'],
		data(){
			return {
				open: ''
			}
		},
		methods: {
			Click(){
				this.open = !this.open;
				this.$emit('select',this.item.VirName + '/',this.item.VirName);
			},
			Select(vir,sel){
				this.$emit('select',this.item.VirName + '/' + vir,sel);
			}
		}
	}
</script>

<style scoped>
	.root>div:not(.sel){background:#F5F7F9;}
	.item{cursor:pointer;}
	.dir_icon{display:inline-block;width:18px;height:18px;margin:0 10px;background:url(../image/file/dir.svg) no-repeat;}
	span{font-size:14px;line-height:32px;}
	.sel{background:#0078D7;color:#FFF;}
</style>