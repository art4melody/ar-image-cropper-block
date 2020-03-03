require('../node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css');
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

var SDK = require('blocksdk');
var sdk = new SDK(null, null, true); // 3rd argument true bypassing https requirement: not prod worthy

var imageURL, imageWidth, imageHeight, aspectRatio, x, y;
var fillWidth = false;
var image;
var cropper;
var options = {
	aspectRatio: aspectRatio,
	
	viewMode: 3,
	crop: onCrop,
	zoom: onZoom,
	cropend: onCropEnd,
	ready: function(e) {
		updateContent();
	}
};
var loadingFromSDK = false;

function debounce (func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

function paintSettings () {
	console.log("Updating UI elements");

	document.getElementById('text-input-id-0').value = imageURL;
	document.getElementById('hidden-input-id-0').value = x;
	document.getElementById('hidden-input-id-1').value = y;
	document.getElementById('input-01').value = imageWidth;
	document.getElementById('input-02').value = imageHeight;

	document.getElementById("checkbox-fillwidth").checked = fillWidth;

	document.getElementById('example-unique-id-122').setAttribute('checked', false);
	document.getElementById('example-unique-id-123').setAttribute('checked', false);
	document.getElementById('example-unique-id-124').setAttribute('checked', false);
	document.getElementById('example-unique-id-125').setAttribute('checked', false);
	document.getElementById('example-unique-id-126').setAttribute('checked', false);
	if (aspectRatio === null || isNaN(aspectRatio)) {
		document.getElementById('example-unique-id-122').checked = true;
	} else {
		switch (aspectRatio) {
			case 1.77:
				document.getElementById('example-unique-id-123').checked = true;
				break;
			case 1.33:
				document.getElementById('example-unique-id-124').checked = true;
				break;
			case 1:
				document.getElementById('example-unique-id-125').checked = true;
				break;
			case 0.66:
				document.getElementById('example-unique-id-126').checked = true;
				break;
		}
	}
	
}

function loadImage() {
	if (!loadingFromSDK) {
		imageURL = document.getElementById('text-input-id-0').value;
		x = 0;
		y = 0;
	}
	
	if (!imageURL) {
		document.getElementById("img-container").hidden = true;
		return;
	}
	document.getElementById("img-container").hidden = false;
	image.setAttribute('src', imageURL);
}

function paintCropper() {
	console.log("Loading cropper...");

	aspectRatio = parseFloat(document.querySelector('input[name="aspectRatio"]:checked').value);
	x = parseInt(document.getElementById('hidden-input-id-0').value);
	y = parseInt(document.getElementById('hidden-input-id-1').value);
	imageWidth = parseInt(document.getElementById('input-01').value);
	imageHeight = parseInt(document.getElementById('input-02').value);
	fillWidth = document.getElementById("checkbox-fillwidth").checked;

	if (!imageURL) {
		return;
	}

	options.aspectRatio = aspectRatio;
	if (cropper) cropper.destroy();
	
	if (loadingFromSDK) {
		var data = {
			"rotate": 0,
			"scaleX": 1,
			"scaleY": 1,
			"x": x,
			"y": y,
			"width": imageWidth,
			"height": imageHeight
		};

		loadingFromSDK = false;
		options.data = data;
	}

	cropper = new Cropper(image, options);
	console.log(options);
}

function updateContent() {
	var imgData = cropper.getCroppedCanvas({
		imageSmoothingEnabled: false
	}).toDataURL();
	var html = '<img';
	if (fillWidth) html += ' style="width:100%;height:auto"';
	html += ' src="' + imgData + '" />';
	var data = {
		imageURL: imageURL,
		imageWidth: imageWidth,
		imageHeight: imageHeight,
		x: x,
		y: y,
		aspectRatio: aspectRatio,
		fillWidth: fillWidth
	};
	sdk.setContent(html);
	sdk.setData(data);

	console.log("Updating content...");
	console.log(data);
}

function onZoom(e) {
	console.log("Zoom: " + e.detail.ratio);
}

function onCropEnd(e) {
	updateContent();
}

function onCrop(e) {
	var data = e.detail;
	x = Math.round(data.x);
	y = Math.round(data.y);
	imageHeight = Math.round(data.height);
	imageWidth = Math.round(data.width);

	paintSettings();
}

function onInputChangeW(e) {
	imageWidth = parseInt(document.getElementById('input-01').value);
	var cropbox = cropper.getCropBoxData();
	var canvasData = cropper.getCanvasData();
	var ratio = canvasData.width / canvasData.naturalWidth;
	cropbox.width = imageWidth * ratio;
	cropper.setCropBoxData(cropbox);
	updateContent();
}

function onInputChangeH(e) {
	imageHeight = parseInt(document.getElementById('input-02').value);
	var cropbox = cropper.getCropBoxData();
	var canvasData = cropper.getCanvasData();
	var ratio = canvasData.width / canvasData.naturalWidth;
	cropbox.height = imageHeight * ratio;
	cropper.setCropBoxData(cropbox);
	updateContent();
}

function onFillWidthInput(e) {
	fillWidth = document.getElementById("checkbox-fillwidth").checked;
	updateContent();
}

function processSDKData(data) {
	console.log("Getting data from SDK:");
	console.log(data);

	imageURL = data.imageURL || '';
	imageWidth = data.imageWidth || 0;
	imageHeight = data.imageHeight || 0;
	x = data.x || 0;
	y = data.y || 0;
	aspectRatio = data.aspectRatio || NaN;
	fillWidth = data.fillWidth || false;
	document.getElementById("img-container").hidden = imageURL != '';

	if (imageURL) loadingFromSDK = true;
	loadImage();
}

sdk.getData(processSDKData);

[...document.querySelectorAll('input[name="aspectRatio"]')].forEach((button) => {
	button.addEventListener('change', (e) => {
		var target = e.target || e.srcElement;
		aspectRatio = options.aspectRatio = parseFloat(target.value);
	
		console.log('Setting aspect ratio to ' + aspectRatio);
		cropper.setAspectRatio(aspectRatio);
		updateContent();
	});
});

document.getElementById('loadImage').onclick = function (e) {
	loadImage();
}

image = document.getElementById('image');
image.onload = function(e) {
	if (!loadingFromSDK) {
		imageWidth = e.naturalWidth;
		imageHeight = e.naturalHeight;
	}

	paintSettings();
	paintCropper();
};

document.getElementById('input-01').onchange = onInputChangeW;
document.getElementById('input-02').onchange = onInputChangeH;
document.getElementById("checkbox-fillwidth").onchange = onFillWidthInput;

/*
// TESTING

var test_data = {
	imageURL: "https://fengyuanchen.github.io/cropperjs/images/picture.jpg",
	imageWidth: 18,
	imageHeight: 18,
	x: 790,
	y: 207,
	aspectRatio: 1,
	fillWidth: true
};

processSDKData(test_data);
*/