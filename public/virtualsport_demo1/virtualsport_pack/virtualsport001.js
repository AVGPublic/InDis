var canvas_scene;
var ctx_scene;
var canvas_offscreen;
var ctx_offscreen;
var camera;
var renderer;
var scene;
//
var indisControllerObject;
var pieces = [];
var piecespos = [[20, 20], [35, 50], [50, 80], [65, 110], [80, 140], [95, 170], [110, 140], [125, 110], [140, 80], [155, 50], [170, 20]];
//
var requestAnimationId;
//
var requestId;
//
var offscreen_rect = new jsRect();
var scene_rect = new jsRect();
//
var indis_json_srcimageurls = {
	"images":[
	//{"id":  "frag", "url": "livetext_demo1/livetext_pack/image/live_fragment.png"},
	{"id":  "frag", "url": "livetext_demo1/livetext_pack/image/live_fragment.png"},
]}
//
function indis_setrect(left, top, width, height, canvaswidth, canvasheight)
{
	scene_rect.x = 0;
	scene_rect.y = 0;
	scene_rect.w = width;
	scene_rect.h = height;
	//
	offscreen_rect.x = 0;
	offscreen_rect.y = 0;
	offscreen_rect.w = canvaswidth;
	offscreen_rect.h = canvasheight;
	//
	canvas_offscreen.width = offscreen_rect.w;
	canvas_offscreen.height = offscreen_rect.h;
	canvas_scene.width = width;
	canvas_scene.height = height;
	//
	strTop = top + "px";
	strLeft = left + "px";
	canvas_scene.style.top = strTop;
	canvas_scene.style.left = strLeft;
}
function indis_sceneanimate() 
{
	for (var i = 0; i < pieces.length; i++)
	{
		pieces[i].animate();
	}
	//
	ctx_offscreen.clearRect(offscreen_rect.x, offscreen_rect.y, offscreen_rect.w, offscreen_rect.h);
	for (var i = 0; i < pieces.length; i++)
	{
		if(pieces[i].live)
		{	
			pieces[i].renderFrameInImageRect(ctx_offscreen);
		}
	}

	ctx_scene.clearRect(0, 0, scene_rect.w, scene_rect.h);

	ctx_scene.drawImage(canvas_offscreen, 0, 0, scene_rect.w, scene_rect.h);
	
	renderer.render (scene, camera);
	ctx_scene.drawImage(renderer.domElement, 0, 0, scene_rect.w, scene_rect.h);
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
	canvas_scene = document.createElement('canvas');
	canvas_scene.id = "canvas_scene";
	ctx_scene = canvas_scene.getContext('2d');
	parentNode.appendChild(canvas_scene);
	
	canvas_offscreen = document.createElement('canvas');
	canvas_offscreen.id = "canvas_offscreen";
	ctx_offscreen = canvas_offscreen.getContext('2d');
	
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
				//
				renderer = new THREE.CanvasRenderer( {antialias: true, alpha: true} );
				renderer.setClearColor( 0xFFFFFF, 0.0 );
				renderer.setSize (window.innerWidth, window.innerHeight);
				
				camera = new THREE.PerspectiveCamera (
						45, window.innerWidth / window.innerHeight, 1, 1000);
				camera.position.y = 0;
				camera.position.z = 900;
				//
				scene = new THREE.Scene();
				 
				//var texture = new THREE.Texture(imgs[0]);
				//texture.image = imgs[0];
				//texture.needsUpdate = true;
				var texture = THREE.ImageUtils.loadTexture ('textures/HermitCrab.png');
				
				var material_allplane = new THREE.MeshBasicMaterial ({  map: texture, side: THREE.DoubleSide} );
				var geometry_planes = new THREE.PlaneGeometry (200, 200);
				var plan = new THREE.Mesh (geometry_planes, material_allplane);
				plan.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2.2);
				scene.add(plan);

				//
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
	
	var test = [];
	test["a"] = [1, 2];
	test["b"] = 2;
	test["a"].push(3);
	var temp = test["a"];
	       
	//

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