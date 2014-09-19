var canvas_subtitle;
var ctx_subtitle;
var subtitleObject0;
//
var subtitleFly = [20, 30, 10, 8, 15, 25, 45, 15, 30, 20, 8];

var indis_json_srcimageurls = {
	"images":[
	{"id":  "bg", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm-3.png"},
	{"id":  "bg2", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm-1.png"},
	{"id":  "chanel", "url": "videosubtitle_demo1/videosubtitle_pack/image/chanel.png"},
	{"id":  "chanel-logo", "url": "videosubtitle_demo1/videosubtitle_pack/image/chanel-logo.png"},
	{"id":  "armani", "url": "videosubtitle_demo1/videosubtitle_pack/image/armani.png"},
	{"id":  "armani-logo", "url": "videosubtitle_demo1/videosubtitle_pack/image/armani-logo.png"},
	{"id":  "frag01", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm001.png"},
	{"id":  "frag02", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm002.png"},
	{"id":  "frag03", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm003.png"},
	{"id":  "frag04", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm004.png"},
	{"id":  "frag05", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm005.png"},
	{"id":  "frag06", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm006.png"},
	{"id":  "frag07", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm007.png"},
	{"id":  "frag08", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm008.png"},
	{"id":  "frag09", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm009.png"},
	{"id":  "frag010", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm010.png"},
	{"id":  "frag011", "url": "videosubtitle_demo1/videosubtitle_pack/image/zm011.png"}
]}
//

function indis_sceneanimate () 
{
	subtitleObject0.animate();
	//
	ctx_subtitle.clearRect(0, 0, canvas_subtitle.width, canvas_subtitle.height);
	if(subtitleObject0.live)
	{	
		subtitleObject0.renderFrameInImageRect(ctx_subtitle);
	}
	requestAnimationFrame (indis_sceneanimate);
}
function indis_initObjects(imgs)
{
	subtitleObject0  = new indisObject(null, imgs[0], false)
	for (var i = 1; i < imgs.length; i++)
	{
		var tempObject = new indisObject(null, imgs[i], false);
		subtitleObject0.appendChildObject(tempObject, "independentChild");
	}
}
function indis_preload(parentNode, callback)
{
	canvas_subtitle = document.createElement('canvas');
	ctx_subtitle = canvas_subtitle.getContext('2d');
	canvas_subtitle.width = 1280;
	canvas_subtitle.height = 690;
	parentNode.appendChild(canvas_subtitle);
		
	var imgs = [];
	var numLoaded = 0;
	for (var i = 0; i < indis_json_srcimageurls.images.length; i++)
	{
		imgs[i] = document.createElement('img');
		imgs[i].src = indis_json_srcimageurls.images[i].url;
		imgs[i].onload = function()
		{
			numLoaded++;
			if (numLoaded == indis_json_srcimageurls.images.length){
				indis_initObjects(imgs);
				callback();
			}
		}
	}
}

function indis_sceneplayin()
{
	indis_sceneanimate();

	var easeInTime = 20;
	var anchor1 = new jsPoint(canvas_subtitle.clientWidth - subtitleObject0.imageCSSwidth - 10, canvas_subtitle.clientHeight - subtitleObject0.imageCSSheight - 50);
	var boardSize = new jsSize(subtitleObject0.imageCSSwidth, subtitleObject0.imageCSSheight);
	var kk = 0;
	
	subtitleObject0.transFromRectToRect(anchor1.x, anchor1.y, boardSize.width, boardSize.height, anchor1.x, anchor1.y, boardSize.width, boardSize.height, easeInTime);
	subtitleObject0.easeIn(10);
					
	subtitleObject0.setAnimateRootPointer(13);
	subtitleObject0.easeIn(20);
	subtitleObject0.transFromRectToRect(anchor1.x, anchor1.y, boardSize.width, boardSize.height, anchor1.x, anchor1.y, boardSize.width, boardSize.height, easeInTime);
					
	var setIntervalID = setInterval(function()
	{
		subtitleObject0.setAnimateRootPointer(kk);
		subtitleObject0.easeIn(50);
		subtitleObject0.transFromRectToRect(anchor1.x-500, anchor1.y, boardSize.width, boardSize.height, anchor1.x, anchor1.y, boardSize.width, boardSize.height, subtitleFly[kk]);
		kk++;
		if(kk == 11)
		{
			console.log("stop");
			clearInterval(setIntervalID);
			setTimeout(function()
			{
				subtitleObject0.setAnimateRootPointer(11);
				subtitleObject0.easeIn(50);
				subtitleObject0.transFromRectToRect(anchor1.x, anchor1.y, 0, boardSize.height, anchor1.x, anchor1.y, boardSize.width, boardSize.height, easeInTime);
				setTimeout(function()
				{
					subtitleObject0.setAnimateRootPointer(12);
					subtitleObject0.easeIn(50);
					subtitleObject0.transFromRectToRect(anchor1.x+120, anchor1.y+45, 0, 0, anchor1.x, anchor1.y, boardSize.width, boardSize.height, easeInTime);
					subtitleObject0.resetAnimateRootPointer();
				}, 600);
			}, 400);
		}
	}, 50);
}