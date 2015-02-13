var canvas_scene;
var ctx_scene;
var canvas_offscreen;
var ctx_offscreen;
var canvas_offscreen2;
var ctx_offscreen2;
var offscreen_rect = new jsRect();
var scene_rect = new jsRect();
//
var renderer;
//
var indisControllerObject;
var logo;
var logoformove;
var logo_gear;
var subtitle_text;
var banner;
//
var requestAnimationId;
var requestId;
//
var posdata;
var videofortime;
var points = [];
//
var textpopup;
var surveypopup = [];
//
function indis_setvideo(video)
{
	videofortime = video;
}
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
	var canvas_text = document.createElement('canvas');
	var ctx_text = canvas_text.getContext('2d');
	ctx_text.font = "20px Microsoft YaHei";
	canvas_text.width = ctx_text.measureText(text).width;
	canvas_text.height = 20;
	
	subtitle_text.setText(text, "20px Microsoft YaHei", "#FFFFFF", 15, 0, 0);
	subtitle_text.easeTo(0.95, 50, 0);
	//
	var hpos =  banner._rect[1] + banner._rect[3] - 25;
	subtitle_text.transFromRectToRect(0, hpos, 1.0*canvas_text.width, 1.0*canvas_text.height, 1280, hpos, 1.0*canvas_text.width, 1.0*canvas_text.height,500, 0);
	//
}
function indis_sceneanimate() 
{
	//
	logo.animate();
	logoformove.animate();
	logo_gear.animate();
	banner.animate();
	//
	textpopup.animate();
	subtitle_text.animate();
	for (var i = 0; i < surveypopup.length; i++)
	{
		surveypopup[i].animate();
	}
	//
	ctx_offscreen.clearRect(offscreen_rect.x, offscreen_rect.y, offscreen_rect.w, offscreen_rect.h);
	logo.renderFrame(ctx_offscreen);
	//
	ctx_scene.clearRect(0, 0, scene_rect.w, scene_rect.h);
	banner.renderFrame(ctx_scene);
	subtitle_text.renderText(ctx_scene);
		
	textpopup.renderRect(ctx_scene, 10);
	textpopup.renderText(ctx_scene);
		
	surveypopup[0].renderRect(ctx_scene, 5);
	surveypopup[0].renderText(ctx_scene);
	
	surveypopup[1].renderRect(ctx_scene, 5);
	surveypopup[1].renderText(ctx_scene);
	
	surveypopup[2].renderText(ctx_scene);
	
	//
	var time = videofortime.currentTime;
	time += 0.48;
	time = time*25;

	var i = Math.floor(time);
	var di = (time - i);
	var _di = 1.0 - di;

	var w = scene_rect.w;
	var h = scene_rect.h;
	if (logo.state == 0)
	{
		if (i < posdata.length -1)
		{
			points[0] = []; points[1] = []; points[2] = []; points[3] = [];
			points[0][0] = w*(_di*posdata[i][0] + di*posdata[i+1][0]);
			points[0][1] = h*(_di*posdata[i][1] + di*posdata[i+1][1]);
			points[1][0] = w*(_di*posdata[i][2] + di*posdata[i+1][2]);
			points[1][1] = h*(_di*posdata[i][3] + di*posdata[i+1][3]);
			points[2][0] = w*(_di*posdata[i][6] + di*posdata[i+1][6]);
			points[2][1] = h*(_di*posdata[i][7] + di*posdata[i+1][7]);
			points[3][0] = w*(_di*posdata[i][4] + di*posdata[i+1][4]);
			points[3][1] = h*(_di*posdata[i][5] + di*posdata[i+1][5]);

			renderer = new Renderer3D(canvas_offscreen, points);
			renderer.update();

			ctx_scene.drawImage(renderer.getCanvas(), renderer.offsetX, renderer.offsetY, renderer.getCanvas().width, renderer.getCanvas().height);
		}
	}
	else
	{
		logoformove.updateImage(canvas_offscreen);
		logoformove.renderFrame(ctx_scene);
	}
	//
	requestId  = window.requestAnimationFrame (indis_sceneanimate);
}
function indis_SurveyVote(text1, text2, text3)
{
	surveypopup[0].easeTo(0.95, 10, 0);
	surveypopup[0].transFromRectToRect(-120, 420, 20, 20, 30, 420, 20, 20, 20, 20);
	surveypopup[0].setColor("#DB4527","#762213");
	surveypopup[0].setText(text1, "20px Microsoft YaHei", "#FFFFFF", 15, 25, 3);
	
	surveypopup[1].easeTo(0.95, 1, 0);
	surveypopup[1].transFromRectToRect(-120, 445, 20, 20, 30, 445, 20, 20, 20, 30);
	surveypopup[1].setColor("#020868","#010434");
	surveypopup[1].setText(text2, "20px Microsoft YaHei", "#FFFFFF", 15, 25, 3);
	
	surveypopup[2].easeTo(0.95, 10, 0);
	surveypopup[2].transFromRectToRect(-120, 395, 20, 20, 30, 395, 20, 20, 20, 10);
	surveypopup[2].setColor("#0082E5","#0082E5");
	surveypopup[2].setText(text3, "20px Microsoft YaHei", "#FFFFFF", 15, 0, 0);
}
function indis_initObjects(imgs)
{
	//
	logo = new indisObject(null, imgs[1], false);
	logo_center = new indisObject(null, imgs[2], false);
	logo.appendChildObject(logo_center, "independentChild");
	logo_gear = new indisObject(null, imgs[3], true);
	logo.appendChildObject(logo_gear, "independentChild");
	
	logoformove = new indisObject(null, null, false);
	//
	subtitle_text = new indisObject(null, imgs[1], false);
	//
	banner = new indisObject(null, imgs[4], false);
	//
	textpopup = new indisObject(null, null, false);
	//
	for (var i = 0; i < 3; i++)
	{
		surveypopup[i] = new indisObject(null, null, false);
	}
}
function onSourceLoaded(imgs, callback)
{
	indis_initObjects(imgs);
	//
	indisControllerObject = new indisController();
	function textpopupmouse()
	{
		if (event.type == "mousedown")
		{
			var x = event.clientX + window.pageXOffset - $("#canvas_scene").position().left;
			var y = event.clientY + window.pageYOffset - $("#canvas_scene").position().top;
			var pt = new jsPoint(x, y);
			if (this.testObjectClick(pt))
			{
				this.easeTo(0.0, 15, 0);
				this.transFromRectToRect(590, 420, 360, 100, 1200, 420, 360, 100, 15, 0);
			}
		}
	}
	indisControllerObject.registorObject2MouseEvent(textpopup, textpopupmouse);
	
	
	function surveyClick()
	{
		if (event.type == "mousedown")
		{
			var x = event.clientX + window.pageXOffset - $("#canvas_scene").position().left;
			var y = event.clientY + window.pageYOffset - $("#canvas_scene").position().top;
			var pt = new jsPoint(x, y);
			if (this.testObjectClick(pt))
			{
				if (surveypopup[0].state == 0)
				{
					surveypopup[0].transFromRectToRect(30, 420, 20, 20, 30, 420, 240, 20, 40, 0);
					surveypopup[1].transFromRectToRect(30, 445, 20, 20, 30, 445, 160, 20, 40, 0);
					surveypopup[0].setText("中国%73", "20px Microsoft YaHei", "#FFFFFF", 15, 25, 3);
					surveypopup[1].setText("澳大利亚%19", "20px Microsoft YaHei", "#FFFFFF", 15, 25, 3);
					surveypopup[0].state = 1;
				}
				else if (surveypopup[0].state == 1)
				{ 
					surveypopup[0].transFromRectToRect(30, 420, 240, 20, -300, 420, 240, 20, 20, 0);
					surveypopup[1].transFromRectToRect(30, 445, 160, 20, -300, 445, 240, 20, 20, 0);
					surveypopup[2].transFromRectToRect(20, 395, 20, 20, -120, 395, 20, 20, 20, 0);
					surveypopup[0].state = 0;
				}
			}
		}
	}
	indisControllerObject.registorObject2MouseEvent(surveypopup[0], surveyClick);
	indisControllerObject.registorObject2MouseEvent(surveypopup[1], surveyClick);
	
	function mouse1()
	{
		if (event.type == "mousedown")
		{	
			var x = event.clientX + window.pageXOffset - $("#canvas_scene").position().left;
			var y = event.clientY + window.pageYOffset - $("#canvas_scene").position().top;
			var pt = new jsPoint(x, y);
			if (this.state == 0)
			{
				if(renderer.testObjectClick(pt))
				{
					logoformove.easeIn(10, 0);
					logoformove.transToRect(285, 95, 1.5*offscreen_rect.w, 1.5*offscreen_rect.h, 1, 0);
					logoformove.transToRect(850, -30, 128, 128, 30, 20);
					//
					this.easeTo(1.0, 60, 30);
					this.rotate(-Math.PI/6.0, 128, 128, 15, 0);
					this.scaleTo(0.8, 0.8, 20, 15);
					this.scaleTo(0.4, 0.4, 10, 35);
					this.rotate(Math.PI*2.0, 128, 128, 15, 16);
					this.rotate(Math.PI*4.0 + Math.PI/6.0, 128, 128, 10, 35);
					//
					this.setAnimateRootPointer(0);
					this.easeTo(1.0, 60, 25);
					this.rotate(0.0, 128, 128, 40, 0);
					this.scaleTo(0.8, 0.8, 20, 15);
					this.scaleTo(0.4, 0.4, 10, 35);
					//
					this.resetAnimateRootPointer();
					//
					this.state = 1;
				}
			}
			else if (this.state == 1)
			{
				if (logoformove.testObjectClick(pt))
				{
					logo_gear.easeIn(10, 0);
					//
					this.rotate(Math.PI/6.0, 128, 128, 15, 0);
					this.rotate(-Math.PI*4.0 - Math.PI/6.0, 128, 128, 40, 17);
					//
					this.setAnimateRootPointer(1);
					this.easeTo(0.3, 60, 25);
					this.scaleTo(0.8, 0.8, 0, 0);
					this.rotate(Math.PI/6.0, 128, 128, 15, 0);
					this.rotate(-Math.PI*4.0 - Math.PI/6.0, 128, 128, 40, 15);
					this.easeTo(0.0, 10, 75);
					this.resetAnimateRootPointer();
					//
					banner.transToRect(0, 0, 960, 370, 30, 15);
					//
					this.state = 2;
				}
			}
			else if (this.state == 2)
			{
				if (logoformove.testObjectClick(pt))
				{
					this.rotate(Math.PI/6.0, 128, 128, 15, 0);
					this.rotate(-Math.PI*10.0 - Math.PI/6.0, 128, 128, 40, 17);
					//
					this.setAnimateRootPointer(1);
					this.easeTo(0.3, 60, 25);
					this.scaleTo(0.8, 0.8, 0, 0);
					this.rotate(Math.PI/6.0, 128, 128, 15, 0);
					this.rotate(Math.PI*4.0 - Math.PI/6.0, 128, 128, 40, 15);
					this.easeTo(0.0, 30, 45);
					this.resetAnimateRootPointer();
					//
					banner.transToRect(0, -305, 960, 370, 30, 15);
					//
					this.state = 3;
				}
			}
			else if (this.state == 3)
			{
				if (logoformove.testObjectClick(pt))
				{
					this.rotate(Math.PI/6.0, 128, 128, 15, 0);
					this.rotate(-Math.PI*10.0 - Math.PI/6.0, 128, 128, 40, 17);
					//
					this.setAnimateRootPointer(1);
					this.easeTo(0.3, 60, 25);
					this.scaleTo(0.8, 0.8, 0, 0);
					this.rotate(Math.PI/6.0, 128, 128, 15, 0);
					this.rotate(Math.PI*4.0 - Math.PI/6.0, 128, 128, 40, 15);
					this.easeTo(0.0, 30, 45);
					this.resetAnimateRootPointer();
					//
					banner.transToRect(0, -380, 960, 370, 30, 15);
					//
					this.state = 1;
				}
			}
		}
	}
	indisControllerObject.registorObject2MouseEvent(logo, mouse1);
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
					onSourceLoaded(imgs, function()
					{
						callback();
					});
				}
			}
		}
	});
	$.getJSON("virtualsport_demo1/virtualsport_pack/data/BWM_Tracking.json",  function(indis_json_srcdata){
		posdata = indis_json_srcdata.pos;
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

function indis_playintext(text)
{
	textpopup.easeTo(0.95, 10, 0);
	textpopup.setColor("#111111","#222222");
	textpopup.setText(text, "20px Microsoft YaHei", "#FBFCAE", 15, 10, 10);
}
function indis_sceneplayin()
{
	indis_sceneanimate();

	textpopup.easeTo(0.95, 10, 0);
	textpopup.transFromRectToRect(1200, 420, 360, 100, 590, 420, 360, 100, 15, 0);
	textpopup.setColor("#111111","#222222");
	textpopup.setText("事实： \n 本场比赛有将近3万2千名中国球迷来到 \n 布里斯班，占场内观众的45%。", "20px Microsoft YaHei", "#FBFCAE", 15, 10, 10);
	 
	banner.easeTo(1, 10, 0);
	banner.transFromRectToRect(0, -380, 960, 540, 0, -380, 960, 370, 1, 0);
	
	logo.easeTo(0.5, 80, 0);
	logo.transFromRectToRect(logo.imageNaturalwidth/2, logo.imageNaturalheight/2, 0, 0, 0, 0, logo.imageNaturalwidth, logo.imageNaturalheight, 30, 0);
	logo.setAnimateRootPointer(0);
	logo.easeTo(0.5, 80, 0);
	logo.transFromRectToRect(logo.imageNaturalwidth/2, logo.imageNaturalheight/2, 0, 0, 0, 0, logo.imageNaturalwidth, logo.imageNaturalheight, 30, 0);
	logo.setAnimateRootPointer(1);
	logo.easeTo(0.0, 80, 0);
	logo.transFromRectToRect(logo.imageNaturalwidth/2, logo.imageNaturalheight/2, 0, 0, 0, 0, logo.imageNaturalwidth, logo.imageNaturalheight, 30, 0);
	logo.resetAnimateRootPointer();
	//
}
var indisOnMouseEvent = function(event) 
{
	if (indisControllerObject != undefined)
	{
		indisControllerObject.onMouseEvent(event);
	}
}