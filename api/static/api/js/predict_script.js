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

async function loadModel(model_url) {
	var model_value = await tf.loadLayersModel(model_url);
	console.log("model loaded");
	return model_value;
}

function get_model_url_and_load(token = "DEFAULT") {
	$.get("http://127.0.0.1:8000/api/get-model/" + token, function (
		data,
		status
	) {
		var model_url = data["model_url"];
		loadModel(model_url).then(function (value) {
			model_ab = value;
		});
	});
}


//////////////////////////////////////////////////////////////////////////////////
// PREDICT GESTURE CODE

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
		
		for(var index=0 ; index<prediction_data_ab.length ; index++){
			var node = document.createElement("LI");
			var textnode = document.createTextNode(prediction_data_ab[index]);
			node.appendChild(textnode);
			document.getElementById("output").appendChild(node);
		}
	});
}

function load_new_model(){
	var user_token = document.getElementById("user_token_name_input").value.trim();

	if(user_token == ""){
		alert("please enter token")
		return;
	}

	get_model_url_and_load(user_token);

	document.getElementById("load_new_model").classList.remove("btn-primary");
	document.getElementById("load_new_model").classList.add("btn-success");

	document.getElementById(
		"output"
	).innerHTML = "New model loaded";

	setTimeout(function(){
		document.getElementById("load_new_model").classList.remove("btn-success");
		document.getElementById("load_new_model").classList.add("btn-primary");		
	}, 5000)
}

get_model_url_and_load("DEFAULT");