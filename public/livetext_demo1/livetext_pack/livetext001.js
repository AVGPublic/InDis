var canvas_render;
var ctx_render;
//
var indisControllerObject;
var subtitleObject0;
//
var requestAnimationId;
var subtitleFly = [20, 30, 10, 8, 15, 25, 45, 15, 30, 20, 8];
//
var requestId;
//
var canvas_render_top, canvas_render_left;
//
var indis_json_srcimageurls = {
	"images":[
	{"id":  "frag", "url": "livetext_demo1/livetext_pack/image/live_fragment.png"},
]}
//
function indis_settopleft(top, left)
{
	canvas_render_top = top;
	canvas_render_left = left;
}
function indis_sceneanimate() 
{
	subtitleObject0.animate();
	//
	ctx_render.clearRect(0, 0, canvas_render.width, canvas_render.height);
	if(subtitleObject0.live)
	{	
		subtitleObject0.renderFrameInImageRect(ctx_render);
	}
	requestId  = window.requestAnimationFrame (indis_sceneanimate);
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
	canvas_render = document.createElement('canvas');
	canvas_render.id = "canvas_render";
	ctx_render = canvas_render.getContext('2d');
	canvas_render.width = 800;
	canvas_render.height = 600;
	strTop = canvas_render_top + "px";
	strLeft = canvas_render_left + "px";
	canvas_render.style.top = strTop;
	canvas_render.style.left = strLeft;
	//
	parentNode.appendChild(canvas_render);
	
	var imgs = [];
	var numLoaded = 0;
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
					$("#canvas_render").on("touchstart", onTouchEvent);
					$("#canvas_render").on("touchmove", onTouchEvent);
					$("#canvas_render").on("touchend", onTouchEvent);
				} 
				else 
				{
					$("#canvas_render").on("mousedown", onMouseEvent);
					$("#canvas_render").on("mouseup", onMouseEvent);
					$("#canvas_render").on("mousemove", onMouseEvent);
				}
				callback();
			}
		}
	}
	//
}

function indis_sceneplayoff()
{
	subtitleObject0.live = false;
	if (requestId) 
	{
       window.cancelAnimationFrame(requestId);
       requestId = undefined;
    }
}
function indis_sceneplayin()
{
	indis_sceneanimate();
	
	var anchor1 = new jsPoint(0, 10);
	var boardSize = new jsSize(subtitleObject0.imageCSSwidth, subtitleObject0.imageCSSheight);
	var kk = 0;
	
	subtitleObject0.easeIn(100, 0);
	subtitleObject0.registorDynamicBehavior(dynamicSysFuncLib.attractorStringDynamic, dynamicSysFuncLib.mouseRepulseEvent, dynamicSysFuncLib.attractorStringParam);
	indisControllerObject.registor2Controller(subtitleObject0, "mousedown");
	//
}
var onMouseEvent = function(event) 
{
	if(indisControllerObject != undefined)
	{
		indisControllerObject.onMouseEvent(event);
	}
}
function onTouchEvent()
{

}