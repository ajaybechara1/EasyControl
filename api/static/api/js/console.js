const elt_start_capturing_button = document.getElementById('start_capturing_button');
const elt_captured_data_content = document.getElementById('captured_data_content');
const elt_name_of_gesture = document.getElementById('name_of_gesture');
const elt_generate_user_token_button = document.getElementById('generate_user_token_button');
const elt_upload_data_with_token_button = document.getElementById('upload_data_with_token_button');

var generated_user_token = undefined;

var captured_image_dictionary = {};
var image_capture_count = 100;
var gesture_number = 1;

window.onload = function(){
	document.getElementById("name_of_gesture").value = "ges_" + gesture_number;
}

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

function append_header_name_in_content(header_name){
	var header_tmp = document.createElement("H2");
	var text_tmp = document.createTextNode(header_name);
	header_tmp.appendChild(text_tmp);
	elt_captured_data_content.appendChild(header_tmp);	
}

function append_image_in_content(image_data){
	var img_tmp = document.createElement("IMG"); 
	img_tmp.src = image_data;
	elt_captured_data_content.appendChild(img_tmp);	
}

elt_start_capturing_button.addEventListener('click', async event => {

	var name_of_gesture = elt_name_of_gesture.value.trim();

	if(name_of_gesture in captured_image_dictionary){
		alert('Please enter unique gesture name');
		return;
	}

	if(name_of_gesture == ''){
		alert('Please enter gesture name');
		return;
	}

	image_capture_count = document.getElementById("image_capture_count").value;

	if(image_capture_count <= 0){
		alert("please enter image count greater then 1")
		return;
	}

	captured_image_dictionary[name_of_gesture] = [];
	append_header_name_in_content(name_of_gesture);

	for(var index=0 ; index<image_capture_count ; index++){
		var instant_image = capture_image();
		captured_image_dictionary[name_of_gesture].push(instant_image);
		append_image_in_content(instant_image);
	}

	gesture_number += 1;
	document.getElementById("name_of_gesture").value = "ges_" + gesture_number;

});


function upload_data_with_token(){
	if(generated_user_token == undefined){
		alert("Please generate token first")
		return;
	}
	var data = {
		'user_token': generated_user_token,
		"captured_image_dictionary": JSON.stringify(captured_image_dictionary)
	}
	data = JSON.stringify(data);
	
	$.ajax({
		type: "POST",
		url: "http://127.0.0.1:8000/api/upload-images-with-token/",
		headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
		data: {
			"data": data
		},
		success: function(response){
			elt_upload_data_with_token_button.classList.remove("btn-primary");
			elt_upload_data_with_token_button.classList.add("btn-success");
		},
		error: function(error){
			elt_upload_data_with_token_button.classList.remove("btn-primary");
			elt_upload_data_with_token_button.classList.add("btn-danger");
		}
	});
}

function generate_user_token(){	
	var data = {}
	data = JSON.stringify(data);
	
	// console.log(data)
	$.ajax({
		type: "POST",
		url: "http://127.0.0.1:8000/api/create-user-token/",
		headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
		data: {
			"data": data
		},
		success: function(response){
			if(response['status'] == 200){
				var user_token = response['user_token']
				elt_generate_user_token_button.innerHTML = "Your Token : " + user_token;
				elt_generate_user_token_button.disabled = true;
				generated_user_token = user_token;
				document.getElementById("train_model_token_name_input").value = user_token;
				
				elt_generate_user_token_button.classList.remove("btn-primary");
				elt_generate_user_token_button.classList.add("btn-outline-info");

			}else{
				console.error(response)
				alert("Something went wrong contact admin");
			}
		},
		error: function(error){
			// console.error(error)
		}
	});
}

function train_model_with_token(){
	var user_token = document.getElementById("train_model_token_name_input").value;
	user_token = user_token.trim()

	if(user_token == ""){
		alert("please enter token");
		return;
	}

	$.ajax({
		type: "POST",
		url: "http://127.0.0.1:8000/api/train-model-with-token/",
		headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
		data: {
			"user_token": user_token
		},
		success: function(response){
			if(response['status'] == 200){
				document.getElementById("train_model_with_token_button").classList.remove("btn-primary");
				document.getElementById("train_model_with_token_button").classList.add("btn-success");
			}else{
				console.error(response)
				document.getElementById("train_model_with_token_button").classList.remove("btn-primary");
				document.getElementById("train_model_with_token_button").classList.add("btn-danger");
			}
		},
		error: function(error){
			console.error(error)
			document.getElementById("train_model_with_token_button").classList.remove("btn-primary");
			document.getElementById("train_model_with_token_button").classList.add("btn-danger");
		}
	});	

}
