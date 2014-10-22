var canvas_render;
var ctx_render;
//
var indisControllerObject;
var pieces = [];
var piecespos = [[20, 20], [35, 50], [50, 80], [65, 110], [80, 140], [95, 170], [110, 140], [125, 110], [140, 80], [155, 50], [170, 20]];
//
var requestAnimationId;
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
	for (var i = 0; i < pieces.length; i++)
	{
		pieces[i].animate();
	}
	//
	ctx_render.clearRect(0, 0, canvas_render.width, canvas_render.height);
	for (var i = 0; i < pieces.length; i++)
	{
		if(pieces[i].live)
		{	
			pieces[i].renderFrameInImageRect(ctx_render);
		}
	}
	requestId  = window.requestAnimationFrame (indis_sceneanimate);
}
function indis_initObjects(imgs)
{
	for (var j = 0; j < piecespos.length; j++)
	{
		pieces[j]  = new indisObject(null, imgs[0], false)
		for (var i = 1; i < imgs.length; i++)
		{
			var tempObject = new indisObject(null, imgs[i], false);
			pieces[j].appendChildObject(tempObject, "independentChild");
		}
	}
}
function indis_preload(parentNode, callback)
{
	canvas_render = document.createElement('canvas');
	canvas_render.id = "canvas_render";
	ctx_render = canvas_render.getContext('2d');
	canvas_render.width = 1280;
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
					$("#canvas_render").on("touchstart", onMouseEvent);
					$("#canvas_render").on("touchmove", onMouseEvent);
					$("#canvas_render").on("touchend", onMouseEvent);
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
		pieces[i].easeIn(100, 0);
		pieces[i].transToRect(piecespos[i][0], piecespos[i][1], 15, 20, 50, 0);
		setTimeout(function(i){
			var param = cloneJSONparam(dynamicSysFuncLib.attractorStringParam);
			param.anchor.x = piecespos[i][0]; param.anchor.y = piecespos[i][1];
			pieces[i].registorDynamicBehavior("position", dynamicSysFuncLib.attractorStringDynamic, dynamicSysFuncLib.mouseRepulseEvent, 
			param)
		}, 800, i);
		indisControllerObject.registor2Controller(pieces[i], "mousedown");
	}
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