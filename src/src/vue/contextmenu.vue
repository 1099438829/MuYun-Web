<template>
	<menu v-if=fixed :style='{top:top+"px",left:left+"px"}' @contextmenu.prevent>
		<li v-for='item in context' :class='{line:item.line,parent:item.child}' @click=item.todo(item.type||index)>
			{{item.name}}
			<menu is=contextmenu class=child v-if=item.child :context=item.child :fixed=child_fixed :child=true></menu>
		</li>
	</menu>
</template>

<script>
	export default {
		name : 'contextmenu',
		props : ['context','index','fixed','child'],
		computed : {
			top : function(){
				return this.calc(this.fixed.top , document.body.clientHeight , this.context.length * 30 , 'top');
			},
			left : function(){
				return this.calc(this.fixed.left , document.body.clientWidth , 120);
			},
			child_fixed : function(){
				return {
					top : this.top + 60,
					left : this.left + 120
				}
			}
		},
		methods : {
			calc : function(base,max,menu,plus){
				if(base + menu > max){
					if(this.child){
						plus = (plus == 'top') ? 30 : -123 ;
						return base - menu + plus;
					}
					else
						return base - menu;
				}else{
					return base;
				}
			}
		}
	}
</script>

<style scoped>
	menu{position:fixed;z-index:99;border-radius:4px;background:#FFF;box-shadow:0 0 4px 0 #272822;text-align:center;}

	li{width:120px;height:30px;font-size:14px;line-height:30px;cursor:pointer;transition:all .5s;}
	li:hover{background:#0078D7;color:#FFF;}
	li:first-child{border-radius:4px 4px 0 0;}
	li:last-child{border-radius:0 0 4px 4px;}
	.line{border-bottom:1px solid #DDD;}
	.parent{position:relative;}
	.parent::after{content:'';position:absolute;top:11px;right:8px;border-left:5px solid #272822;border-top:4px solid transparent;border-bottom:4px solid transparent;}
	.parent:hover::after{border-left:5px solid #FFF;}

	.child{display:none;color:#272822;}
	.parent:hover .child{display:block;}
</style>