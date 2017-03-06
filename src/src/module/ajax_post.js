module.exports = function(url,search,callback){
	var data = '',
		xml = new XMLHttpRequest();

	xml.onload = function(){
		if(xml.status >= 200 && xml.status < 400 && xml.readyState == 4){
			try{
				var json = JSON.parse(xml.responseText);
				console.log(json);
				callback(json);
			}catch(e){
				console.log(xml.responseText);
				callback(xml.responseText);
			}
		}else{
			callback('error');
		}
	}

	xml.onerror = function(){
		callback('error');
	}
			
	for(var key in search)
		data += `${key}=${search[key]}&`;
			
	xml.open('post',url);
	xml.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
	xml.send(data);
};