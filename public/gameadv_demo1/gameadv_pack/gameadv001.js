var canvas_overlay;
var ctx_overlay;
var canvas_scene2;
var ctx_scene2;
var canvas_offscreen;
var ctx_offscreen;
var canvas_text;
var ctx_text;
var offscreen_rect = new jsRect();
var scene_rect = new jsRect();
//
var indisControllerObject2;
var fragment;
var box = [];
var boxclickable;
var minion1, minion2, minion3, minion4;
var layout;
var staticobject;
//
var delayerstack = [];
//
var requestId;
//
function indis_initObjects2(imgs)
{
	for (var i = 0; i < layout.length; i++)
	{
		var abox = new indisObject(null, imgs[1], false);
		box.push(abox);
	}
	boxclickable =  new indisObject(null, imgs[0], false);
    minion1 = new indisObject(null, imgs[2], false);
	minion2 = new indisObject(null, imgs[3], false);
	minion3 = new indisObject(null, imgs[4], false);
	minion4 = new indisObject(null, imgs[5], false);
	//
	staticobject = new staticObject(215, 180, 45, 235, boxclickable.imageCSSwidth, boxclickable.imageCSSheight);
}
//
function indis_setrect2(left, top, width, height, canvaswidth, canvasheight)
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
	if (canvas_scene2 != undefined)
	{
		canvas_scene2.width = scene_rect.w;
		canvas_scene2.height = scene_rect.h;
		strTop = scene_rect.y + "px";
		strLeft = scene_rect.x + "px";
		canvas_scene2.style.top = strTop;
		canvas_scene2.style.left = strLeft;
	}
}
function indis_sceneanimate2() 
{
	//
	minion1.animate();
	minion2.animate();
	minion3.animate();
	minion4.animate();
	for (var i = 0; i < box.length; i++)
	{
		box[i].animate();
	}
	//
	for (var i = 0; i < delayerstack.length; i++)
	{
		if(delayerstack[i].live)
		{
			delayerstack[i].update();
		}
	}
	//
	ctx_scene2.clearRect(0, 0, scene_rect.w, scene_rect.h);
	//
	minion1.renderFrame(ctx_scene2);
	minion2.renderFrame(ctx_scene2);
	minion3.renderFrame(ctx_scene2);
	minion4.renderFrame(ctx_scene2);
	for (var i = 0; i < box.length; i++)
	{
		 box[i].renderFrame(ctx_scene2);
	}
	//
	boxclickable.animate();
	ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);
	boxclickable.renderFrame(ctx_overlay);
	//
	requestId  = window.requestAnimationFrame (indis_sceneanimate2);
}
function onSourceLoaded2(imgs, callback)
{
	indis_initObjects2(imgs);
	//
	indisControllerObject2 = new indisController();
	function mousedownfunc()
	{
		if (event.type == "mousedown")
		{	
			this.mousestate = 1;
		}
		if (this.mousestate == 1)
		{
			this.onControlEvent(event); 
		}
	}
	for (var i = 0; i < box.length; i++)
	{
		indisControllerObject2.registorObject2MouseEvent(box[i], mousedownfunc);
	}
	indisControllerObject2.registorObject2MouseEvent(minion1, mousedownfunc);
	indisControllerObject2.registorObject2MouseEvent(minion3, mousedownfunc);
	//
	function mouseboxclickable()
	{
		if (event.type == "mousedown")
		{	
			var x = event.clientX + window.pageXOffset - $("#canvas_overlay").position().left;
			var y = event.clientY + window.pageYOffset - $("#canvas_overlay").position().top;
			var pt = new jsPoint(x, y);
			if (this.state == 0)
			{
				if(this.testObjectClick(pt))
				{
					canvas_overlay.height = 600;
					this.transFromRectToRect(470, 0, 128, 160, 80, 0, 4*128, 4*160, 10, 0);
					this.state = 1;
				}
			}
			else if (this.state == 1)
			{
				if (this.testObjectClick(pt))
				{
					var delayer = new delayton(15, null, null);
					delayerstack.push(delayer);
					delayer.ondelayed = function()
					{
						canvas_overlay.height = 150;
					}
			
					this.transFromRectToRect(80, 0, 4*128, 4*160, 470, 0, 128, 160, 10, 0);
					this.state = 0;
				}
			}
		}
	}
	indisControllerObject2.registorObject2MouseEvent(boxclickable, mouseboxclickable);
	//
	function mousestatic()
	{
		var x = event.clientX + window.pageXOffset - $("#canvas_overlay").position().left;
		var y = event.clientY + window.pageYOffset - $("#canvas_overlay").position().top;
		var pt = new jsPoint(x, y);
		if (event.type == "mousedown")
		{	
			if (boxclickable.state == 0)
			{
				if (this.testObjectClick(boxclickable._rect, pt))
				{
					window.location.href = 'http://www.mengniu.com.cn/';
				}
			}
		}
	}
	indisControllerObject2.registorObject2MouseEvent(staticobject, mousestatic);
	//
	callback();
}
function indis_preload2(parentNode, callback)
{
	canvas_scene2 = document.createElement('canvas');
	canvas_scene2.id = "canvas_scene2";
	ctx_scene2 = canvas_scene2.getContext('2d');
	parentNode.appendChild(canvas_scene2);
	canvas_scene2.width = scene_rect.w;
	canvas_scene2.height = scene_rect.h;
	strTop = scene_rect.y + "px";
	strLeft = scene_rect.x + "px";
	canvas_scene2.style.top = strTop;
	canvas_scene2.style.left = strLeft;
		
	canvas_offscreen = document.createElement('canvas');
	canvas_offscreen.id = "canvas_offscreen";
	ctx_offscreen = canvas_offscreen.getContext('2d');
	canvas_offscreen.width = offscreen_rect.w;
	canvas_offscreen.height = offscreen_rect.h;
	
	canvas_overlay = document.createElement('canvas');
	canvas_overlay.id = "canvas_overlay";
	ctx_overlay = canvas_overlay.getContext('2d');
	parentNode.appendChild(canvas_overlay);
	canvas_overlay.width = scene_rect.w;
	canvas_overlay.height = 150;
	strTop = scene_rect.y - 0 + "px";
	strLeft = scene_rect.x + "px";
	canvas_overlay.style.top = strTop;
	canvas_overlay.style.left = strLeft;
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
					onSourceLoaded2(imgs, function()
					{
						callback();
					});
				}
			}
		}
		layout = indis_json_srcimageurls.layout;
	});
	//
}

function indis_sceneplayoff2()
{
	if (requestId) 
	{
       window.cancelAnimationFrame(requestId);
       requestId = undefined;
    }
}

function indis_sceneplayin2()
{
	indis_sceneanimate2();

	minion1.easeTo(1, 1, 0);
	minion1.setRect(0, -100, scene_rect.w, scene_rect.h);
	var param = cloneJSONparam(dynamicSysFuncLib.attractorStringParam); 
	param.k = 0.01;
	param.anchor.x = layout[0].x; param.anchor.y = 0;
	param.imageTopLeft.x = scene_rect.x;  param.imageTopLeft.y = scene_rect.y;
	param.pulse.x = layout[0].x; param.pulse.y = scene_rect.h/2;
	minion1.registorDynamicBehavior("position", dynamicSysFuncLib.attractorStringDynamic, dynamicSysFuncLib.mouseRepulseEvent,
	param, 15);
	//
	minion2.easeTo(1, 40, 0);
	minion2.setRect(0, 0, scene_rect.w, scene_rect.h, 40, 0);
	//
	minion3.easeTo(1, 1, 0);
	minion3.setRect(0, -100, scene_rect.w, scene_rect.h);
	var param = cloneJSONparam(dynamicSysFuncLib.attractorStringParam); 
	param.k = 0.005;
	param.anchor.x = layout[9].x; param.anchor.y = -20;
	param.imageTopLeft.x = scene_rect.x;  param.imageTopLeft.y = scene_rect.y;
	param.pulse.x = layout[9].x;
	minion3.registorDynamicBehavior("position", dynamicSysFuncLib.attractorStringDynamic, dynamicSysFuncLib.mouseRepulseEvent,
	param, 100);
	//
	minion4.easeTo(1, 1, 0);
	minion4.transFromRectToRect(0, -200, scene_rect.w, scene_rect.h, 0, 0, scene_rect.w, scene_rect.h, 40, 10);
	//
	for (var i = 0; i < box.length; i++)
	{
		box[i].easeTo(1, 1, 0);
		box[i].setRect(layout[i].x, -400, 64*layout[i].size, 128*layout[i].size);
		var param = cloneJSONparam(dynamicSysFuncLib.attractorStringParam); 
		param.anchor.x = layout[i].x; param.anchor.y = layout[i].y;
		param.imageTopLeft.x = scene_rect.x;  param.imageTopLeft.y = scene_rect.y;
		param.pulse.x = layout[i].x; param.pulse.y = scene_rect.h/2;
		box[i].registorDynamicBehavior("position", dynamicSysFuncLib.attractorStringDynamic, dynamicSysFuncLib.mouseRepulseEvent,
		param, i*3);
	}
	//
	boxclickable.easeTo(1, 1, 0);
	boxclickable.setRect(470, 0, 128, 160);
}
var indisOnMouseEvent2 = function(event) 
{
	if (indisControllerObject2 != undefined)
	{
		indisControllerObject2.onMouseEvent(event);
	}
}
var indisMouseUp2 = function(event)
{
	for (var i = 0; i < box.length; i++)
	{
		box[i].mousestate = 0;
	}
	minion1.mousestate = 0;
	minion3.mousestate = 0;
}