//////////////////////////////////////////////////////////////////////////////////
// DEFINE CANVAS FOR IMAGE CAPTURE

var capture;
var canvas_ab;
var width_ab = 64;
var height_ab = 64;

let sketch = function(p) {
    p.setup = function(){
        canvas_ab = p.createCanvas(width_ab, height_ab);
        capture = p.createCapture(p.VIDEO);
        capture.hide()
    }

    p.draw = function() {
        p.push();
        p.translate(p.width, 0);
        p.scale(-1, 1);
        p.image(capture, 0, 0, width_ab, height_ab);
        p.filter(p.THRESHOLD, 0.35);
        p.pop();
    }
};

function capture_image(){
	// capture.loadPixels();
	// return capture.canvas.toDataURL()
    return canvas_ab.elt.toDataURL();
}

new p5(sketch, 'container');

//////////////////////////////////////////////////////////////////////////////////
// MODEL LOADING

var model_ab;
var gesture_name_list_ab;

var user_token_name = "DEFAULT"

var flag_new_model  = 0;

var message = "Loaded Model ( token : DEFAULT )"

async function loadModel(model_url) {

	var model_value = await tf.loadLayersModel(model_url);
	console.log("model loaded");

	if(flag_new_model){
		document.getElementById("load_new_model").classList.remove("btn-primary");
		document.getElementById("load_new_model").classList.add("btn-success");

		setTimeout(function(){
			document.getElementById("load_new_model").classList.remove("btn-success");
			document.getElementById("load_new_model").classList.add("btn-primary");		
		}, 10000)
	}
	flag_new_model = 1;

	message = "Leaded Model : " + user_token_name 

	document.getElementById(
		"model_load_message"
	).innerHTML = message;

	document.getElementById(
		"model_load_message"
	).style.display = ""

	return model_value;
}

function get_model_url_and_load(token = "DEFAULT") {
	$.get("/api/get-model/" + token, function (
		data,
		status
	) {
		var model_url = data["model_url"];
		gesture_name_list_ab = data['gesture_name_list']
		loadModel(model_url).then(function (value) {
			model_ab = value;
		});
	});
}


//////////////////////////////////////////////////////////////////////////////////
// PREDICT GESTURE CODE

var total_precticted_count = 0;
var predict_start_time;
var total_precticted_time = 0; // second
var fps = 0;

function take_instant_snap(){
	var instant_image = capture_image();
	document.getElementById("snaped_image").src = instant_image;
}

async function get_image_ready() {
	image_element = document.getElementById("snaped_image");
	image = await tf.tidy(function () {
		if (!(image_element instanceof tf.Tensor)) {
			image_element = tf.browser.fromPixels(image_element);
		}
		return image_element.mean(2).toFloat().expandDims(0).expandDims(-1)
		return image_element;
		return image_element.toFloat().expandDims(0)
	});
	return image;
}

function predict_gesture(){

	get_image_ready().then(function (image) {
		image_captured = image;
		
		document.getElementById(
			"output"
		).innerHTML = "prediction result";

		prediction_obj_ab = model_ab.predict(image_captured);
		prediction_data_ab = prediction_obj_ab.dataSync();
		
		total_precticted_count += 1;
		var end_time = new Date();
		total_precticted_time = (end_time.getTime() - predict_start_time.getTime()) / 1000;
		fps = total_precticted_count / total_precticted_time;
		console.log(fps);

		for(var index=0 ; index<prediction_data_ab.length ; index++){
			var node = document.createElement("LI");
			var li_element_val = gesture_name_list_ab[index];
			li_element_val = li_element_val + "  -  " +prediction_data_ab[index].toString();
			var textnode = document.createTextNode(li_element_val);
			node.appendChild(textnode);
			document.getElementById("output").appendChild(node);
		}
		predict_continous();
	});
}

function predict_continous(){
	take_instant_snap();
	setTimeout(predict_gesture, 500);
}

function start_predict(){
	predict_start_time = new Date();
	predict_continous();
}

function load_new_model(){
	var user_token = document.getElementById("user_token_name_input").value.trim();

	if(user_token == ""){
		alert("please enter token")
		return;
	}

	user_token_name = user_token;

	get_model_url_and_load(user_token);
}

get_model_url_and_load("DEFAULT");
