const PackCSS = require('extract-text-webpack-plugin');

module.exports = {
	entry : {
		home : './src/entry/home',
		recycle : './src/entry/recycle',
		personal : './src/entry/personal'
	},
	output : {
		path : './contents/js',
		filename : '[name].js'
	},
	module : {
		rules : [
			{
				test : /\.css$/,
				exclude : /node_modules/,
				use : PackCSS.extract({
					use : 'css-loader!postcss-loader'
				})
			},
			{
				test : /\.js$/,
				exclude : /node_modules/,
				loader : 'babel-loader',
				options : {
					presets : ['es2015'],
					cacheDirectory : true
				}
			},
			{
				test : /\.vue$/,
				exclude : /node_modules/,
				loader : 'vue-loader',
				options : {
					css : 'css-loader!postcss-loader',
					html : 'html-loader'
				},
			},
			{
				test : /\.(svg|png)$/,
				loader : 'url-loader?limit=40960',
			}
		]
	},
	plugins : [
		new PackCSS('../css/[name].css')
	],
	resolve : {
		extensions : ['.js','.css','.vue','.json']
	},
	externals : {
		vue : 'Vue'
	}
}