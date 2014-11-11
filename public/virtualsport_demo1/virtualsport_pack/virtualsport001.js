var canvas_scene;
var ctx_scene;
var canvas_offscreen;
var ctx_offscreen;
var canvas_text;
var ctx_text;
//
var renderer;
//
var indisControllerObject;
var pieces = [];
var logo;

var subtitle_bg;
var subtitle_text;
var piecespos = [[20, 20], [35, 50], [50, 80], [65, 110], [80, 140], [95, 170], [110, 140], [125, 110], [140, 80], [155, 50], [170, 20]];
//
var requestAnimationId;
//
var requestId;
//
var offscreen_rect = new jsRect();
var scene_rect = new jsRect();
//
var mousecount = 0;
//
function indis_setrect(left, top, width, height, canvaswidth, canvasheight)
{
	scene_rect.x = left;
	scene_rect.y = top;
	scene_rect.w = width;
	scene_rect.h = height;
	//
	offscreen_rect.x = 0;
	offscreen_rect.y = 0;
	offscreen_rect.w = canvaswidth;
	offscreen_rect.h = canvasheight;
	//
	if (canvas_offscreen != undefined)
	{
		canvas_offscreen.width = offscreen_rect.w;
		canvas_offscreen.height = offscreen_rect.h;
	}
	//
	if (canvas_scene != undefined)
	{
		canvas_scene.width = scene_rect.w;
		canvas_scene.height = scene_rect.h;
		strTop = scene_rect.y + "px";
		strLeft = scene_rect.x + "px";
		canvas_scene.style.top = strTop;
		canvas_scene.style.left = strLeft;
	}
}
function indis_playtext(text)
{
	canvas_text = document.createElement('canvas');
	ctx_text = canvas_text.getContext('2d');
	ctx_text.font="14px Microsoft YaHei";
	canvas_text.width = ctx_text.measureText(text).width;
	canvas_text.height = 20;
	
	ctx_text.clearRect(0, 0, canvas_text.width, canvas_text.height);
	ctx_text.font="14px Microsoft YaHei";
	ctx_text.fillStyle = "#FFFFFF";
	ctx_text.fillText(text,0,15);
	subtitle_text.updateImage(canvas_text);
	subtitle_text.easeTo(0.95, 50, 0);
	subtitle_text.transFromRectToRect(0, 113, 1.0*canvas_text.width, 1.0*canvas_text.height, 1280, 113, 1.0*canvas_text.width, 1.0*canvas_text.height,500, 0);
	//
}
function indis_sceneanimate() 
{
	for (var i = 0; i < pieces.length; i++)
	{
		pieces[i].animate();
	}
	logo.animate();

	subtitle_bg.animate();
	subtitle_text.animate();
	//
	ctx_offscreen.clearRect(offscreen_rect.x, offscreen_rect.y, offscreen_rect.w, offscreen_rect.h);
	for (var i = 0; i < pieces.length; i++)
	{
		if(pieces[i].live)
		{	
			//pieces[i].renderFrameInImageRect(ctx_offscreen);
		}
	}
	logo.renderFrame(ctx_offscreen);
	//
	ctx_scene.clearRect(0, 0, scene_rect.w, scene_rect.h);
	subtitle_bg.renderFrameInImageRect(ctx_scene);
	
	subtitle_text.renderFrameInImageRect(ctx_scene);

	//ctx_scene.drawImage(canvas_offscreen, 0, 0, offscreen_rect.w, offscreen_rect.h);
	renderer.update();
	ctx_scene.drawImage(renderer.getCanvas(), renderer.offsetX, renderer.offsetY, renderer.getCanvas().width, renderer.getCanvas().height);

	requestId  = window.requestAnimationFrame (indis_sceneanimate);
}
function indis_initObjects(imgs)
{
	for (var j = 0; j < piecespos.length; j++)
	{
		pieces[j]  = new indisObject(null, imgs[0], false);
	}
	logo = new indisObject(null, imgs[1], false);
	logo_center = new indisObject(null, imgs[2], false);
	logo.appendChildObject(logo_center, "independentChild");
	//
	subtitle_bg = new indisObject(null, imgs[3], true);
	subtitle_text = new indisObject(null, imgs[1], false);
}
function indis_preload(parentNode, callback)
{
	canvas_scene = document.createElement('canvas');
	canvas_scene.id = "canvas_scene";
	ctx_scene = canvas_scene.getContext('2d');
	parentNode.appendChild(canvas_scene);
	canvas_scene.width = scene_rect.w;
	canvas_scene.height = scene_rect.h;
	strTop = scene_rect.y + "px";
	strLeft = scene_rect.x + "px";
	canvas_scene.style.top = strTop;
	canvas_scene.style.left = strLeft;
		
	canvas_offscreen = document.createElement('canvas');
	canvas_offscreen.id = "canvas_offscreen";
	ctx_offscreen = canvas_offscreen.getContext('2d');
	canvas_offscreen.width = offscreen_rect.w;
	canvas_offscreen.height = offscreen_rect.h;
	
	var imgs = [];
	var numLoaded = 0;
	$.getJSON("/add_data", function(indis_json_srcimageurls){
		for (var i = 0; i < indis_json_srcimageurls.images.length; i++)
		{
			imgs[i] = document.createElement('img');
			imgs[i].src = indis_json_srcimageurls.images[i].url;
			imgs[i].onload = function()
			{
				numLoaded++;
				if (numLoaded == indis_json_srcimageurls.images.length)
				{
					indis_initObjects(imgs);
					indisControllerObject = new indisController();

					if ("ontouchstart" in window) 
					{
						$("#canvas_scene").on("touchstart", onMouseEvent);
						$("#canvas_scene").on("touchmove", onMouseEvent);
						$("#canvas_scene").on("touchend", onMouseEvent);
					} 
					else 
					{
						$("#canvas_scene").on("mousedown", onMouseEvent);
						$("#canvas_scene").on("mouseup", onMouseEvent);
						$("#canvas_scene").on("mousemove", onMouseEvent);
					}
					var hw = 213;
					var hh = 45;
					var anchor = new jsPoint(644, 432);
					var points =   [[anchor.x - hw, anchor.y - hh],
									  [anchor.x + hw, anchor.y - hh],
									  [anchor.x - hw, anchor.y + hh],
									  [anchor.x + hw, anchor.y + hh]
									];
					renderer = new Renderer3D(canvas_offscreen, points);
					renderer.update();
					//
					callback();
				}
			}
		}
	});
	//
}

function indis_sceneplayoff()
{
	for (var i = 0; i < pieces.length; i++)
	{
		pieces[i].live = false;
	}
	if (requestId) 
	{
       window.cancelAnimationFrame(requestId);
       requestId = undefined;
    }
}

function indis_sceneplayin()
{
	indis_sceneanimate();
	
	var anchor1 = new jsPoint(0, 0);
	var boardSize = new jsSize(5, 5);
	var kk = 0;
	
	for (var i = 0; i < pieces.length; i++)
	{
		pieces[i].easeIn(500, 0);
		pieces[i].transToRect(piecespos[i][0], piecespos[i][1], 15, 20, 50, 0);
		
		var param = cloneJSONparam(dynamicSysFuncLib.attractorStringParam);
		param.anchor.x = piecespos[i][0]; param.anchor.y = piecespos[i][1];
		pieces[i].registorDynamicBehavior("position", dynamicSysFuncLib.attractorStringDynamic, dynamicSysFuncLib.mouseRepulseEvent, 
		param, 20);
	
		indisControllerObject.registor2Controller(pieces[i], "mousedown");
	}
	subtitle_bg.easeTo(1, 1, 0);
	subtitle_bg.transFromRectToRect(0,0, 1280, 720, 0, 0, 1280, 720, 1,0);

	logo.easeTo(0.5, 80, 0);
	logo.transFromRectToRect(logo.imageNaturalwidth/2, logo.imageNaturalheight/2, 0, 0, 0, 0, logo.imageNaturalwidth, logo.imageNaturalheight, 30, 0);
	logo.setAnimateRootPointer(0);
	logo.easeTo(0.5, 80, 0);
	logo.transFromRectToRect(logo.imageNaturalwidth/2, logo.imageNaturalheight/2, 0, 0, 0, 0, logo.imageNaturalwidth, logo.imageNaturalheight, 30, 0);
	logo.resetAnimateRootPointer();
	//
}
var onMouseEvent = function(event) 
{
	if(indisControllerObject != undefined)
	{
		indisControllerObject.onMouseEvent(event);
	}
	if (event.type == "mousedown")
	{
		if (mousecount == 0)
		{
			var x = event.clientX + window.pageXOffset;
			var y = event.clientY + window.pageYOffset;
			var pt = new jsPoint(x, y);
			if(renderer.testObjectClick(pt))
			{
				logo.easeTo(0.0, 60, 25);
				logo.rotate(-Math.PI/6.0, 128, 128, 15, 0);
				logo.scaleTo(0.8, 0.8, 20, 15);
				logo.scaleTo(0.0, 0.0, 10, 35);
				logo.rotate(Math.PI*3.0, 128, 128, 15, 15);
				logo.rotate(Math.PI*3.0, 128, 128, 10, 30);
				//
				logo.setAnimateRootPointer(0);
				logo.easeTo(0, 60, 25);
				logo.rotate(0.0, 128, 128, 40, 0);
				logo.scaleTo(0.8, 0.8, 20, 15);
				logo.scaleTo(0.0, 0.0, 10, 35);
				logo.resetAnimateRootPointer();
			}
		}
		else
		{
			logo.easeIn(0.5, 80, 0);
			logo.transFromRectToRect(logo.imageNaturalwidth/2, logo.imageNaturalheight/2, 0, 0, 0, 0, logo.imageNaturalwidth, logo.imageNaturalheight, 30, 0);
			logo.setAnimateRootPointer(0);
			logo.easeTo(0.5, 80, 0);
			logo.transFromRectToRect(logo.imageNaturalwidth/2, logo.imageNaturalheight/2, 0, 0, 0, 0, logo.imageNaturalwidth, logo.imageNaturalheight, 30, 0);
			logo.resetAnimateRootPointer();
		}
		mousecount += 1;
		mousecount = mousecount%2;
	}
}
function onTouchEvent()
{

}