var canvas_scene;
var ctx_scene;
var canvas_offscreen;
var ctx_offscreen;
var canvas_offscreen2;
var ctx_offscreen2;
var canvas_text;
var ctx_text;
var offscreen_rect = new jsRect();
var scene_rect = new jsRect();
//
var indisControllerObject;
var fragment;
var box;
//
var requestId;
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
function indis_sceneanimate() 
{
	fragment.animate();
	box.animate();
	//
	ctx_scene.clearRect(0, 0, scene_rect.w, scene_rect.h);
	fragment.renderFrame(ctx_scene);
	box.renderFrame(ctx_scene);
	//
	requestId  = window.requestAnimationFrame (indis_sceneanimate);
}
function indis_initObjects(imgs)
{
	fragment = new indisObject(null, imgs[0], false);
	box = new indisObject(null, imgs[1], false);
}
function onSourceLoaded(imgs, callback)
{
	indis_initObjects(imgs);
	//
	indisControllerObject = new indisController();
	function mouse1()
	{
		if (event.type == "mousedown")
		{	
			var x = event.clientX + window.pageXOffset - $("#canvas_scene").position().left;
			var y = event.clientY + window.pageYOffset - $("#canvas_scene").position().top;
			var pt = new jsPoint(x, y);
			this.onControlEvent(event); 
		}
	}
	indisControllerObject.registorObject2MouseEvent(fragment, mouse1);
	//
	callback();
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
	
	//
	canvas_offscreen2 = document.createElement('canvas');
	canvas_offscreen2.id = "canvas_offscreen2";
	ctx_offscreen2 = canvas_offscreen2.getContext('2d');
	canvas_offscreen2.width = scene_rect.w;
	canvas_offscreen2.height = scene_rect.h;
	//
	
	var imgs = [];
	var numLoaded = 0;
	$.getJSON("gameadv_demo1/gameadv_pack/data/gameadv_pack.json", function(indis_json_srcimageurls){
		for (var i = 0; i < indis_json_srcimageurls.images.length; i++)
		{
			imgs[i] = document.createElement('img');
			imgs[i].src = indis_json_srcimageurls.images[i].url;
			imgs[i].onload = function()
			{
				numLoaded++;
				if (numLoaded == indis_json_srcimageurls.images.length)
				{
					onSourceLoaded(imgs, function()
					{
						callback();
					});
				}
			}
		}
	});
	//
}

function indis_sceneplayoff()
{
	if (requestId) 
	{
       window.cancelAnimationFrame(requestId);
       requestId = undefined;
    }
}

function indis_sceneplayin()
{
	indis_sceneanimate();

	fragment.easeTo(1, 10, 0);
	fragment.transFromRectToRect(0, 0, 30, 30, 0, 0, 30, 30, 1, 0);
	var param1 = cloneJSONparam(dynamicSysFuncLib.attractorStringParam);
	param1.id = "x";
	fragment.registorDynamicBehavior("position", dynamicSysFuncLib.attractorStringDynamic, dynamicSysFuncLib.mouseRepulseEvent,
	param1, 0);
	var param2 = cloneJSONparam(dynamicSysFuncLib.attractorStringParam);
	param2.id = "y";
	fragment.registorDynamicBehavior("position", dynamicSysFuncLib.attractorStringDynamic, dynamicSysFuncLib.mouseRepulseEvent,
	param2, 0);
	//
	box.easeTo(1, 10, 0);
	box.transFromRectToRect(0, 0, box.imageCSSwidth/2, box.imageCSSheight/2, 0, 0, box.imageCSSwidth/2, box.imageCSSheight/2, 1, 0);
}
var indisOnMouseEvent = function(event) 
{
	if (indisControllerObject != undefined)
	{
		indisControllerObject.onMouseEvent(event);
	}
}