var model_ab;
var image_captured;
var prediction_obj_ab;
var prediction_data_ab;

// async function loadModel() {
// 	var model_value = await tf.loadLayersModel(
// 	"http://127.0.0.1:8000/api/get-model-file/",
// 		{
// 			weightPathPrefix: "https://raw.githubusercontent.com/ajaybechara1/CNN-TensorflowJS/master/"
// 		}
// 	);
// 	console.log("model loaded");
// 	return model_value;
// }


function get_model_url(token = "DEFAULT") {
	$.get("http://127.0.0.1:8000/api/get-model/" + token, function (
		data,
		status
	) {
		var model_url = data["model_url"];
		console.log(model_url)
		loadModel(model_url).then(function (value) {
			model_ab = value;
		});
	});
}

get_model_url();

async function loadModel(model_url) {
	var model_value = await tf.loadLayersModel(model_url);
	console.log("model loaded");
	return model_value;
}

async function get_image_ready() {
	image_element = document.getElementById("snapShot");
	image = await tf.tidy(function () {
		if (!(image_element instanceof tf.Tensor)) {
			image_element = tf.browser.fromPixels(image_element);
		}
		return image_element.toFloat().expandDims(0);
	});
	return image;
}

function make_prediction() {
	// console.log("in make_prediction");
	get_image_ready().then(function (image) {
		// console.log("image is ready");
		image_captured = image;
		resized_image = image_captured.resizeBilinear([32, 32]);
		prediction_obj_ab = model_ab.predict(resized_image);
		prediction_data_ab = prediction_obj_ab.dataSync();
		document.getElementById(
			"output"
		).innerHTML = prediction_data_ab.toString();
	});
}

function get_image_data() {
	return image_captured;
}

var video = document.querySelector("#videoElement");

if (navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices
		.getUserMedia({
			video: { facingMode: "user", mirrored: true },
		})
		.then(function (stream) {
			video.srcObject = stream;
		})
		.catch(function (err0r) {
			console.log("Something went wrong!");
			console.log(err0r);
		});
}

function stop(e) {
	var stream = video.srcObject;
	var tracks = stream.getTracks();

	for (var i = 0; i < tracks.length; i++) {
		var track = tracks[i];
		track.stop();
	}

	video.srcObject = null;
}

// CAMERA SETTINGS.
Webcam.set({
	image_format: "jpeg",
	jpeg_quality: 100,
});
Webcam.attach("#videoElement");

takeSnapShot = function () {
	Webcam.snap(function (data_uri) {
		document.getElementById("snapShot").src = data_uri;
	});
};

setTimeout(function () {
	setInterval(function () {
		takeSnapShot();
		setTimeout(function () {
			make_prediction();
		}, 100);
	}, 1000);
}, 8000);

navigator.permissions
	.query({ name: "camera" })
	.then(function (result) {
		if (result.state == "granted") {
		} else if (result.state == "prompt") {
		} else if (result.state == "denied") {
		}
		result.onchange = function () {};
	});

