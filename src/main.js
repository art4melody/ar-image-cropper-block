require('../node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css');
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

var SDK = require('blocksdk');
var sdk = new SDK(null, null, true); // 3rd argument true bypassing https requirement: not prod worthy

var imageURL, imageWidth, imageHeight, aspectRatio, x, y;
var image;
var cropper;
var options = {
	aspectRatio: aspectRatio,
	viewMode: 3,
	crop: onCropEvent,
	ready: function(e) {
		updateContent();
	}
};

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
	document.getElementById('text-input-id-0').value = imageURL;
	document.getElementById('hidden-input-id-0').value = x;
	document.getElementById('hidden-input-id-1').value = y;
	document.getElementById('input-01').value = imageWidth;
	document.getElementById('input-02').value = imageHeight;

	document.getElementById('example-unique-id-122').setAttribute('checked', false);
	document.getElementById('example-unique-id-123').setAttribute('checked', false);
	document.getElementById('example-unique-id-124').setAttribute('checked', false);
	document.getElementById('example-unique-id-125').setAttribute('checked', false);
	document.getElementById('example-unique-id-126').setAttribute('checked', false);
	switch (aspectRatio) {
		case 'NaN':
			document.getElementById('example-unique-id-122').setAttribute('checked', true);
			break;
		case '1.7777777777777777':
			document.getElementById('example-unique-id-123').setAttribute('checked', true);
			break;
		case '1.3333333333333333':
			document.getElementById('example-unique-id-124').setAttribute('checked', true);
			break;
		case '1':
			document.getElementById('example-unique-id-125').setAttribute('checked', true);
			break;
		case '0.6666666666666666':
			document.getElementById('example-unique-id-126').setAttribute('checked', true);
			break;
	}
}

function loadImage() {
	imageURL = document.getElementById('text-input-id-0').value;
	if (!imageURL) {
		return;
	}
	
	x = 0;
	y = 0;
	image.setAttribute('src', imageURL);
}

function paintCropper() {
	aspectRatio = document.querySelector('input[name="aspectRatio"]:checked').value;
	x = document.getElementById('hidden-input-id-0').value;
	y = document.getElementById('hidden-input-id-1').value;
	imageWidth = document.getElementById('input-01').value;
	imageHeight = document.getElementById('input-02').value;

	if (!imageURL) {
		return;
	}

	options.aspectRatio = aspectRatio;
	if (cropper) cropper.destroy();
	cropper = new Cropper(image, options);
	cropper.setCropBoxData({
		left: x,
		top: y,
		width: imageWidth,
		height: imageHeight
	});
}

function updateContent() {
	var imgData = cropper.getCroppedCanvas({
		imageSmoothingEnabled: false
	}).toDataURL();
	sdk.setContent('<img src="' + imgData + '" />');
	sdk.setData({
		imageURL: imageURL,
		imageWidth: imageWidth,
		imageHeight: imageHeight,
		x: x,
		y: y,
		aspectRatio: aspectRatio
	});
}

function onCropEvent(e) {
	var data = e.detail;
	x = Math.round(data.x);
	y = Math.round(data.y);
	imageHeight = Math.round(data.height);
	imageWidth = Math.round(data.width);

	paintSettings();
	updateContent();
}

sdk.getData(function (data) {
	imageURL = data.imageURL || '';
	imageWidth = data.imageWidth || 0;
	imageHeight = data.imageHeight || 0;
	x = data.x || 0;
	y = data.y || 0;
	aspectRatio = data.aspectRatio || 'NaN';

	paintSettings();
	paintCropper();
});

/*
document.getElementById('workspace').addEventListener("input", function () {
	debounce(paintCropper, 500)();
	updateContent();
});
*/

[...document.querySelectorAll('input[name="aspectRatio"]')].forEach((button) => {
	button.addEventListener('change', (e) => {
		var target = e.target || e.srcElement;
		aspectRatio = options.aspectRatio = target.value;
	
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
	imageWidth = e.naturalWidth;
	imageHeight = e.naturalHeight;
	
	paintSettings();
	paintCropper();
};