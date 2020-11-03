function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

async function upload_model(){

	document.getElementById("upload_message").innerHTML = "";
	document.getElementById("upload_message").style.display = "none";
	document.getElementById("upload_message").style.color = "green";

	var user_token = document.getElementById('token_name_input').value;
	user_token = user_token.trim();

	if(user_token == ""){
		alert("Please enter token")
		return;
	}

	var data = {
		'user_token': user_token,
	}

	var model_file = document.getElementById('model_input').files[0];

	if(model_file == undefined){
		alert("Please upload model file")
		return
	}

	var weight_file = document.getElementById('weight_input').files[0];

	if(weight_file == undefined){
		alert("Please upload weight file")
		return
	}

	var model_data = await getBase64(model_file).then(function(data){
		return data.replace(/^data:.+;base64,/, '')
	})

	var weight_data = await getBase64(weight_file).then(function(data){
		return data.replace(/^data:.+;base64,/, '')
	})

	data['model_file'] = model_data
	data['weight_file'] = weight_data
	
	data = JSON.stringify(data);
	
	console.log(data);

	$.ajax({
		type: "POST",
		url: "/api/upload-model-with-token/",
		headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
		data: {
			"data": data
		},
		success: function(response){
			document.getElementById('upload_model_button').classList.remove("btn-primary");
			document.getElementById('upload_model_button').classList.add("btn-success");
			document.getElementById("upload_message").innerHTML = "Model Uploaded";
			document.getElementById("upload_message").style.display = "";
			document.getElementById("upload_message").style.color = "green";
		},
		error: function(error){
			document.getElementById('upload_model_button').classList.remove("btn-primary");
			document.getElementById('upload_model_button').classList.add("btn-danger");
		}
	});
}
