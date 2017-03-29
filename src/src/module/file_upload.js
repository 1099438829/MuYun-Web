module.exports = function(file,url,callback,progress = null){
	var form = document.createElement('form');
	form.setAttribute('enctype','multipart/form-data');

	var form_data = new FormData(form);
	form_data.append('file',file);

	var xml = new XMLHttpRequest();

	xml.onload = function(){
		if(xml.status == 200 && xml.readyState == 4){
			try{
				callback(JSON.parse(xml.responseText));
			}catch(e){
				callback(xml.responseText);
			}
		}
		else{
			callback('request error');
		}
	}

	xml.upload.onprogress = progress;

	xml.onerror = function(){
		callback('xml error');
	}

	xml.open('post',url);
	xml.send(form_data);
}