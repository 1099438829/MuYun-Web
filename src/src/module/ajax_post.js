module.exports = function(url,search,callback){
	var data = '',
		xml = new XMLHttpRequest();

	xml.onload = function(){
		if(xml.status >= 200 && xml.status < 400 && xml.readyState == 4){
			try{
				callback(JSON.parse(xml.responseText));
			}catch(e){
				callback(xml.responseText);
			}
		}else{
			callback('request error');
		}
	}

	xml.onerror = function(){
		callback('xml error');
	}
			
	for(var key in search)
		data += `${key}=${search[key]}&`;
			
	xml.open('post',url);
	xml.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8');
	xml.send(data);
};