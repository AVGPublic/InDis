//---------------some basic geometry---------------------//
function jsSize(width, height){
	this.width = width;
	this.height = height;
}
function jsPoint(x, y) {
	this.x = x;
	this.y = y;
}
function jsRect(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}
function isPointInPoly(poly, pt){
	for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
   ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
   && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
   && (c = !c);
   return c;
}
function cloneJSONparam(param)
{
	return JSON.parse(JSON.stringify(param));
}
//---------------------------------------------------------//
//---------------event state machine-----------------------//
function indisEventStateMachine(num)
{
	this.num = num;
	this.live = [];
	this.lock = [];
	for (var i = 0; i < num; i++)
	{
		this.live.push(false);
		this.lock.push(false);
	}
	this.TriggerOnceInAnimation = TriggerOnceInAnimation;
	this.Reset = Reset;
	//
	function TriggerOnceInAnimation(ID)
	{
		if (ID >= this.num || ID < 0)
		{
			return;
		}
		if (!this.lock[ID])
		{
			this.live[ID] = true;
		}
		else
		{
			this.live[ID] = false;
		}
		this.lock[ID] = true;
		if (this.live[ID])
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	function Reset(ID)
	{	
		if (ID >= this.num || ID < 0)
		{
			return;
		}
		this.lock[ID] = false;
		this.live[ID] = false;
	}
}


//-------------dynamic system function lib-----------------//
var dynamicSysFuncLib = (function (dynamicSysFuncLib) 
{
   dynamicSysFuncLib.attractorStringParam = 
	{anchor: {x: 200, y: 100}, k: 0.001, nv: 0.04, dt: 1, pulse: {dv: 4.0, range: 80, da: 0.01}, imageCenter: {x: 16, y: 22}, id: undefined};
   dynamicSysFuncLib.attractorStringDynamic = function(v1, v2, v3, param) 
   {
		var v1_, v2_, v3_;
		if (param.id == "x")
		{
			a = v3 + -param.k*(v1 - param.anchor.x) - param.nv*v2;
			v3_ = v3*param.pulse.da;
			v2_ = v2 + param.dt*a;
			v1_ = v1 + param.dt*v2_;
			
		}
		else if (param.id == "y")
		{
			a = v3 + -param.k*(v1 - param.anchor.y) - param.nv*v2;
			v3_ = v3*param.pulse.da;
			v2_ = v2 + param.dt*a;
			v1_ = v1 + param.dt*v2_;	
		}
		return {v1: v1_, v2: v2_, v3: v3_};
   }
   dynamicSysFuncLib.mouseRepulseEvent = function(v1, v2, v3, param, controlparam)
   {
		var v1_, v2_, v3_;

		var dis = (controlparam.clientX - param.imageCenter.x - param.anchor.x)*(controlparam.clientX - param.imageCenter.x - param.anchor.x);
			dis += (controlparam.clientY - param.imageCenter.y - param.anchor.y)*(controlparam.clientY - param.imageCenter.y - param.anchor.y);
			dis = Math.sqrt(dis);
		var ex = -(controlparam.clientX - param.imageCenter.x - param.anchor.x)/dis;
		var ey = -(controlparam.clientY - param.imageCenter.y - param.anchor.y)/dis;
		var deltav; 
		if( dis > param.pulse.range)
		{
			deltav = 0;
		}
		else
		{
			deltav = param.pulse.dv*dis/param.pulse.range
		}
		if (param.id == "x")
		{
			v1_ = v1;
			v2_ = v2;
			v3_ = deltav*ex;
		}
		else if (param.id == "y")
		{
			v1_ = v1; 
			v2_ = v2;
			v3_ = deltav*ey;
		}
		
		return {v1: v1_, v2: v2_, v3: v3_};
   }
   //
   return dynamicSysFuncLib
}(dynamicSysFuncLib || {}));
//---------------------------------------------------------//
//---------------mouse state and gesture-------------------//
function indisController()
{
	this.mousedown = false;
	//
	this.animateObjects = [];
	this.controlEvent = [];

	this.registor2Controller = registor2Controller;
	this.onMouseEvent = onMouseEvent;
	function registor2Controller(animateobject, event)
	{
		this.animateObjects.push(animateobject);
		this.controlEvent.push(event);
	}
	function onMouseEvent(event)
	{
		if (event.type == "mousedown" || event.type == "touchstart")
		{
			this.mousedown = true;
		}
		else 
		if (event.type == "mouseup" ||  event.type == "touchend")
		{
			this.mousedown = false;
		}
		if (this.mousedown)
		{
			if ("ontouchstart" in window) 
			{
				for(var i = 0; i < this.controlEvent.length; i++)
				{
					this.animateObjects[i].onControlEvent(event.originalEvent.touches[0]);
				}
			}
			else
			{
				for(var i = 0; i < this.controlEvent.length; i++)
				{
					this.animateObjects[i].onControlEvent(event);
				}
			}
		}
	}
}

//---------------------------------------------------------//
//---------------animation object-------------------------//
function animata()
{
	this.live = false;
	this.time = 0;
	this.value = 0;
	this.valuedot = 0;
	this.valuedotdot = 0;
	//keys
	//
	this.timekey = [];
	this.values = [];
	
	//dynamic system
	//
	this.param = undefined;
	//
	this.dynamicsystem = false;
	this.stateupdatefunc = undefined;
	this.setUpdateFunc = setUpdateFunc;
	//
	this.listen2ControlEvent = false;
	this.onControlEvent = onControlEvent;
	this.controlEventFunc = undefined;
	this.setControlEventFunc = setControlEventFunc;
	//
	this.update = update;
	function update()
	{
		if (this.dynamicsystem)
		{
		    if (this.stateupdatefunc  == undefined)
			{
				return;
			}
			var out = this.stateupdatefunc(this.value, this.valuedot, this.valuedotdot, this.param);
			this.value = out.v1;
			this.valuedot = out.v2;
			this.valuedotdot = out.v3;
		}
		else
		{
			inrange = false;
			for (var i = 1; i < this.timekey.length; i++)
			{
				if (this.time < this.timekey[i])
				{
					inrange = true;
					prog = (this.time - this.timekey[i-1])/(this.timekey[i] - this.timekey[i-1]);
					this.value = this.values[i-1]*(1-prog) + this.values[i]*prog;
					break;
				}
			}
			this.time++;
			if (!inrange)
			{
				this.live = false;
			}
		}
	}
	function setUpdateFunc(callback, param)
	{
		this.dynamicsystem = true;
		this.stateupdatefunc = callback;
		this.param = param;
	}
	function setControlEventFunc(callback)
	{
		this.listen2ControlEvent = true;
		this.controlEventFunc = callback;
	}
	function onControlEvent(controlparam)
	{
		if (this.listen2ControlEvent)
		{
			var out = this.controlEventFunc(this.value, this.valuedot, this.valuedotdot, this.param, controlparam);
			this.value = out.v1;
			this.valuedot = out.v2;
			this.valuedotdot = out.v3;
		}
	}
	//
}
//
function staticObject(left, top, width, height, parentwidth, parentheight)
{
	this.onClickParentAction = "close";
	//
	this._rect = [];
	this._rect[0] = left/parentwidth;
	this._rect[1] = top/parentheight;
	this._rect[2] = (left+width)/parentwidth;
	this._rect[3] = (top+height)/parentheight;
	
	this.testObjectClick = testObjectClick;
	this.sketchObjectRespondingRegion = sketchObjectRespondingRegion;
	function testObjectClick(parentRect, pt)
	{
		var mask = [];
		var x1, y1, x2, y2;
		x1 = parentRect[0] + this._rect[0]*parentRect[2];
		y1 = parentRect[1] + this._rect[1]*parentRect[3];
		x2 = parentRect[0] + this._rect[2]*parentRect[2];
		y2 = parentRect[1] + this._rect[3]*parentRect[3];
		mask.push(new jsPoint(x1, y1));
		mask.push(new jsPoint(x2, y1));
		mask.push(new jsPoint(x2, y2));
		mask.push(new jsPoint(x1, y2));

		return(isPointInPoly(mask, pt));
	}
	function sketchObjectRespondingRegion(parentRect, context)
	{
		var x1, y1, x2, y2;
		x1 = parentRect[0] + this._rect[0]*parentRect[2];
		y1 = parentRect[1] + this._rect[1]*parentRect[3];
		x2 = parentRect[0] + this._rect[2]*parentRect[2];
		y2 = parentRect[1] + this._rect[3]*parentRect[3];
		
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x1, y2);
		context.lineTo(x2, y2);
		context.lineTo(x2, y1);
		context.lineTo(x1, y1);
		context.stroke();
		context.closePath();
	}
}

function indisObject(mask, img, live)
{
	this.live = live;
	this.id;
	//
	this.autodeath = false;
	this.onClickAction = "NULL";
	//
	this._mask = [];
	if (mask != null)
	{
		this._mask = mask;
	}
	else
	{
		this._mask.push(new jsPoint(0, 0));
		this._mask.push(new jsPoint(img.width, 0));
		this._mask.push(new jsPoint(img.width,img.height));
		this._mask.push(new jsPoint(0, img.height));
	}
	this._image = img;
	//
	this.imageCSSwidth = this._image.width;
	this.imageCSSheight = this._image.height;
	this.imageNaturalwidth = this._image.naturalWidth;
	this.imageNaturalheight = this._image.naturalHeight;
	//
	this._rect = [];
	this._rect[0] = 0;
	this._rect[1] = 0;
	this._rect[2] = this.imageCSSwidth;
	this._rect[3] = this.imageCSSheight;
	
	this._localAlpha = 0;
	//
	this._animatastack = [];
	this._controlstack = [];
	//
	this._staticChildStack = [];
	this._animateChildStack = [];
	this._animateIndependChildStack = [];
	//
	this._opacitypointer = -1;
	this._imagerecttranspointer = -1;
	this._affinetranspointer = -1;
	//
	this._animaterootpointer = -1;
	//
	this.resetAnimateRootPointer = resetAnimateRootPointer;
	this.setAnimateRootPointer = setAnimateRootPointer;
	this.appendChildObject = appendChildObject;
	this.transToRect = transToRect;
	this.transFromRectToRect = transFromRectToRect;
	this.transFromRectToRectBounce = transFromRectToRectBounce;
	this.easeIn = easeIn;
	this.easeOut = easeOut;
	this.easeInHighlightEaseOut = easeInHighlightEaseOut;
	this.breath = breath;
	this.animate = animate;
	this.renderImage = renderImage;
	this.renderFrameInImageRect = renderFrameInImageRect;
	this.renderFrameInMaskRect = renderFrameInMaskRect;
	this.renderMask = renderMask;
	this.setTopleft = setTopleft;
	this.testObjectClick = testObjectClick;
	this.testObjectClickReturnAction = testObjectClickReturnAction;
	this.testStaticMaskClick = testStaticMaskClick;
	this.updateImage = updateImage;
	this.updateMask = updateMask;
	//
	this.registorDynamicBehavior = registorDynamicBehavior;
	this.onControlEvent = onControlEvent;
	//
	function updateImage(img)
	{
		this._image = img;
		this.imageCSSwidth = this._image.width;
		this.imageCSSheight = this._image.height;
		this.imageNaturalwidth = this._image.naturalWidth;
		this.imageNaturalheight = this._image.naturalHeight;
	}
	function updateMask(mask)
	{
		this._mask = mask;
	}
	function resetAnimateRootPointer()
	{
		this._animaterootpointer = -1;
	}
	function setAnimateRootPointer(pointer)
	{
		this._animaterootpointer = pointer;
	}
	function appendChildObject(child, type)
	{
		if (type == "staticChild")
		{
			this._staticChildStack.push(child);
		}
		else if (type == "independentChild")
		{
			this._animateIndependChildStack.push(child);
		}
	}
	function onControlEvent(event)
	{
		for(var i = 0; i < this._controlstack.length; i++)
		{
			if (this._animatastack[this._controlstack[i]] != -1 && this._animatastack[this._controlstack[i]] != undefined)
			{
				this._animatastack[this._controlstack[i]].onControlEvent(event);
			}
		}
	}
	function registorDynamicBehavior(variable, dynamicSysUpdateFunc, controlEventFunc, param)
	{
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._imagerecttranspointer = this._animatastack.length;
	
			if (variable == "position")
			{
				var ani = [];
				ani[0] = new animata();
				ani[0].live = true;
				ani[0].time = 0;
				ani[0].value = this._rect[0];
				var param1 = cloneJSONparam(param); param1.id = "x";
				ani[0].setUpdateFunc(dynamicSysUpdateFunc, param1);
				ani[0].setControlEventFunc(controlEventFunc);
				this._animatastack.push(ani[0]);
				this._controlstack.push(this._imagerecttranspointer);
				
				ani[1] = new animata();
				ani[1].live = true;
				ani[1].time = 0;
				ani[1].value = this._rect[1];
				var param2 = cloneJSONparam(param); param2.id = "y";
				ani[1].setUpdateFunc(dynamicSysUpdateFunc, param2);
				ani[1].setControlEventFunc(controlEventFunc);
				this._animatastack.push(ani[1]);
				this._controlstack.push(this._imagerecttranspointer+1);
			}
		}
	}
	function transFromRectToRectBounce(left1, top1, width1, height1, left2, top2, width2, height2, duration, delay)
	{
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._imagerecttranspointer = this._animatastack.length;
			
			var ani = [];
			ani[0] = new animata();
			ani[0].live = true;
			ani[0].time = 0;
			
			ani[0].timekey.push(0); ani[0].values.push(left1); 
			ani[0].timekey.push(delay); ani[0].values.push(left1); 
			ani[0].timekey.push(delay+0.7*duration); ani[0].values.push(left2 + 0.2*(left2 - left1));
			ani[0].timekey.push(delay+0.9*duration); ani[0].values.push(left2 - 0.1*(left2 - left1));
			ani[0].timekey.push(delay+duration); ani[0].values.push(left2);
			this._animatastack.push(ani[0]);

			ani[1] = new animata();
			ani[1].live = true;
			ani[1].time = 0;
			ani[1].timekey.push(0); ani[0].values.push(top1);
			ani[1].timekey.push(delay); ani[1].values.push(top1); 
			ani[1].timekey.push(delay+0.7*duration); ani[1].values.push(top2 + 0.2*(top2 - top1));
			ani[1].timekey.push(delay+0.9*duration); ani[1].values.push(top2 - 0.1*(top2 - top1));
			ani[1].timekey.push(delay+duration); ani[1].values.push(top2);
			this._animatastack.push(ani[1]);

			ani[2] = new animata();
			ani[2].live = true;
			ani[2].time = 0;
			ani[2].timekey.push(0); ani[2].values.push(width1); 
			ani[2].timekey.push(delay); ani[2].values.push(width1); 
			ani[2].timekey.push(delay+0.7*duration); ani[2].values.push(width2 + 0.2*(width2 - width1));
			ani[2].timekey.push(delay+0.9*duration); ani[2].values.push(width2 - 0.1*(width2 - width1));
			ani[2].timekey.push(delay+duration); ani[2].values.push(width2); 

			this._animatastack.push(ani[2]);

			ani[3] = new animata();
			ani[3].live = true;
			ani[3].time = 0;
			ani[3].timekey.push(0); ani[3].values.push(height1); 
			ani[3].timekey.push(delay); ani[3].values.push(height1); 
			ani[3].timekey.push(delay+0.7*duration); ani[3].values.push(height2 + 0.2*(height2 - height1));
			ani[3].timekey.push(delay+0.9*duration); ani[3].values.push(height2 - 0.1*(height2 - height1));
			ani[3].timekey.push(delay+duration); ani[3].values.push(height2);
			this._animatastack.push(ani[3]);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].transFromRectToRect(left1, top1, width1, height1, left2, top2, width2, height2, duration, delay);
		}
	}
	function transToRect(left, top, width, height, duration, delay)
	{
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._imagerecttranspointer = this._animatastack.length;
			
			var ani = [];
			ani[0] = new animata();
			ani[0].live = true;
			ani[0].time = 0;
			ani[0].timekey.push(0); ani[0].values.push(this._rect[0]); 
			ani[0].timekey.push(delay); ani[0].values.push(this._rect[0]); 
			ani[0].timekey.push(delay+duration); ani[0].values.push(left);
			this._animatastack.push(ani[0]);

			ani[1] = new animata();
			ani[1].live = true;
			ani[1].time = 0;
			ani[1].timekey.push(0); ani[1].values.push(this._rect[1]); 
			ani[1].timekey.push(delay); ani[1].values.push(this._rect[1]); 
			ani[1].timekey.push(delay+duration); ani[1].values.push(top);
			this._animatastack.push(ani[1]);

			ani[2] = new animata();
			ani[2].live = true;
			ani[2].time = 0;
			ani[2].timekey.push(0); ani[2].values.push(this._rect[2]); 
			ani[2].timekey.push(delay); ani[2].values.push(this._rect[2]); 
			ani[2].timekey.push(delay+duration); ani[2].values.push(width);
			this._animatastack.push(ani[2]);

			ani[3] = new animata();
			ani[3].live = true;
			ani[3].time = 0;
			ani[3].timekey.push(0); ani[3].values.push(this._rect[3]); 
			ani[3].timekey.push(delay); ani[3].values.push(this._rect[3]); 
			ani[3].timekey.push(delay+duration); ani[3].values.push(height);
			this._animatastack.push(ani[3]);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].transToRect(left, top, width, height, duration, delay);
		}
	}
	function transFromRectToRect(left1, top1, width1, height1, left2, top2, width2, height2, duration, delay)
	{
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._imagerecttranspointer = this._animatastack.length;
			
			var ani = [];
			ani[0] = new animata();
			ani[0].live = true;
			ani[0].time = 0;
			ani[0].timekey.push(0); ani[0].values.push(left1); 
			ani[0].timekey.push(delay); ani[0].values.push(left1); 
			ani[0].timekey.push(delay+duration); ani[0].values.push(left2);
			this._animatastack.push(ani[0]);

			ani[1] = new animata();
			ani[1].live = true;
			ani[1].time = 0;
			ani[1].timekey.push(0); ani[1].values.push(top1); 
			ani[1].timekey.push(delay); ani[1].values.push(top1); 
			ani[1].timekey.push(delay+duration); ani[1].values.push(top2);
			this._animatastack.push(ani[1]);

			ani[2] = new animata();
			ani[2].live = true;
			ani[2].time = 0;
			ani[2].timekey.push(0); ani[2].values.push(width1); 
			ani[2].timekey.push(delay); ani[2].values.push(width1); 
			ani[2].timekey.push(delay+duration); ani[2].values.push(width2);
			this._animatastack.push(ani[2]);

			ani[3] = new animata();
			ani[3].live = true;
			ani[3].time = 0;
			ani[3].timekey.push(0); ani[3].values.push(height1); 
			ani[3].timekey.push(delay); ani[3].values.push(height1); 
			ani[3].timekey.push(delay+duration); ani[3].values.push(height2);
			this._animatastack.push(ani[3]);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].transFromRectToRect(left1, top1, width1, height1, left2, top2, width2, height2, duration, delay);
		}
	}
	function easeInHighlightEaseOut(duration, delay)
	{
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this.autodeath = true;
			this._opacitypointer = this._animatastack.length;
			//
			var ani = new animata();
			ani.live = true;
			ani.time = 0;
			ani.timekey.push(0); ani.values.push(0); 
			ani.timekey.push(delay); ani.values.push(0); 
			ani.timekey.push(delay+0.45*duration); ani.values.push(0.4); 
			ani.timekey.push(delay+0.5*duration); ani.values.push(1);
			ani.timekey.push(delay+0.55*duration); ani.values.push(0.4);
			ani.timekey.push(delay+duration); ani.values.push(0);
			this._animatastack.push(ani);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].easeInHighlightEaseOut(duration, delay);
		}
	}
	function easeIn(duration, delay)
	{
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this.autodeath = false;
			this._opacitypointer = this._animatastack.length;
			//
			var ani = new animata();
			ani.live = true;
			ani.time = 0;
			ani.timekey.push(0); ani.values.push(0); 
			ani.timekey.push(delay); ani.values.push(0); 
			ani.timekey.push(delay+duration); ani.values.push(1);
			this._animatastack.push(ani);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].easeIn(duration, delay);
		}
	}
	function easeOut(duration, delay)
	{
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this.autodeath = true;
			this._opacitypointer = this._animatastack.length;
			//
			var ani = new animata();
			ani.live = true;
			ani.time = 0;
			ani.timekey.push(0); ani.values.push(1); 
			ani.timekey.push(delay); ani.values.push(1); 
			ani.timekey.push(delay+duration); ani.values.push(0);
			this._animatastack.push(ani);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].easeOut(duration, delay);
		}
	}
	function breath(duration, delay)
	{
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._opacitypointer = this._animatastack.length;
			//
			this.autodeath = true;
			var ani = new animata();
			ani.live = true;
			ani.time = 0;
			ani.timekey.push(0);  ani.values.push(0);
			ani.timekey.push(delay);  ani.values.push(0);
			ani.timekey.push(delay+0.45*duration);  ani.values.push(1.0);
			ani.timekey.push(delay+0.55*duration);  ani.values.push(1.0);
			ani.timekey.push(delay+1.0*duration);  ani.values.push(0);
			this._animatastack.push(ani);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].breath(duration, delay);
		}
	}

	function animate()
	{
		var somethingalive = false;
		for (var i = 0; i < this._animatastack.length; i++)
		{
			if (this._animatastack[i].live == true)
			{
				somethingalive = true;
				this._animatastack[i].update();
			}
		}
		if(!somethingalive && this.autodeath)
		{
			this.live = false;
		}
		//
		for (var i = 0; i < this._animateIndependChildStack.length; i++)
		{
			this._animateIndependChildStack[i].animate();
		}
	}
	function renderFrameInImageRect(context)
	{
		if (this._imagerecttranspointer != -1)
		{
			for (var i = 0; i < 4; i++)
			{
				if (this._animatastack[this._imagerecttranspointer + i] != undefined)
				{
					if (this._animatastack[this._imagerecttranspointer + i].live == true)
					{	
						this._rect[i] = this._animatastack[this._imagerecttranspointer + i].value;
					}
				}
			}
		}

		if (this._opacitypointer != -1)
		{
			if (this._animatastack[this._opacitypointer].live == true)
			{
				this._localAlpha = this._animatastack[this._opacitypointer].value;
			}
		}
		context.save();
		context.globalAlpha = this._localAlpha;
		context.drawImage(this._image, this._rect[0], this._rect[1], this._rect[2], this._rect[3]);
		context.restore();

		//this._staticChildStack[0].sketchObjectRespondingRegion(this._rect, context);

		for (var i = 0; i < this._animateIndependChildStack.length; i++)
		{
			if (this._animateIndependChildStack[i].live)
			{
				this._animateIndependChildStack[i].renderFrameInImageRect(context);
			}
		}
	}

	function renderFrameInMaskRect(context)
	{
		if (this._imagerecttranspointer != -1)
		{
			for (var i = 0; i < 4; i++)
			{
				if (this._animatastack[this._imagerecttranspointer + i].live == true)
				{	
					this._rect[i] = this._animatastack[this._imagerecttranspointer + i].value;
				}
			}
		}

		if (this._opacitypointer != -1)
		{
			if (this._animatastack[this._opacitypointer].live == true)
			{
				this._localAlpha = this._animatastack[this._opacitypointer].value;
			}
		}

		context.beginPath();
		context.moveTo(this._mask[0].x, this._mask[0].y);

		for (var j = 1; j < this._mask.length; j++)
		{
			context.lineTo(this._mask[j].x, this._mask[j].y);
		}
		context.lineTo(this._mask[0].x, this._mask[0].y);
		context.closePath();
		context.save();
		context.globalAlpha = this._localAlpha;
		context.clip();
		context.drawImage(this._image, this._rect[0], this._rect[1], this._rect[2], this._rect[3]);
		context.restore();
	}
	//
	function renderImage(context, left, top, width, height)
	{
		context.drawImage(this._image, left, top, width, height);
	}
	function renderMask(context)
	{
		context.beginPath();
		context.moveTo(this._mask[0].x, this._mask[0].y);

		for (var j = 1; j < this._mask.length; j++)
		{
			context.lineTo(this._mask[j].x, this._mask[j].y);
		}
		context.lineTo(this._mask[0].x, this._mask[0].y);
		context.closePath();
		context.strokeStyle = "#0000FF";
		context.stroke();
	}
	//
	function setTopleft(top, left)
	{
		for (var j = 0; j < this._mask.length; j++)
		{
			this._mask[j].x += left;
			this._mask[j].y += top;
		}
	}
	function testObjectClickReturnAction(pt)
	{
		var mask = [];
		var fx = this._rect[2]/this.imageCSSwidth;
		var fy = this._rect[3]/this.imageCSSheight;

		for (var i = 0; i < this._mask.length; i++)
		{
			mask.push(new jsPoint(this._rect[0] + fx*this._mask[i].x, this._rect[1] + fy*this._mask[i].y)); 
		}
		if (!isPointInPoly(mask, pt))
		{
			return "NULL";
		}
		if (this.onClickAction != "NULL")
		{
			return this.onClickAction;
		}
		else
		{
			for (var i = 0; i < this._staticChildStack.length; i++)
			{
				if (this._staticChildStack[i].testObjectClick(this._rect, pt))
				{
					return this._staticChildStack[i].onClickParentAction;
				}
			}
		}
		return "NULL";
	}
	function testObjectClick(pt)
	{
		if(this.live == false)
		{
			return false;
		}
		var mask = [];
		var fx = this._rect[2]/this.imageCSSwidth;
		var fy = this._rect[3]/this.imageCSSheight;

		for (var i = 0; i < this._mask.length; i++)
		{
			mask.push(new jsPoint(this._rect[0] + fx*this._mask[i].x, this._rect[1] + fy*this._mask[i].y)); 
		}
		return(isPointInPoly(mask, pt));
	}
	function testStaticMaskClick(pt)
	{
		var mask = [];
		var fx = this._rect[2]/this.imageCSSwidth;
		var fy = this._rect[3]/this.imageCSSheight;

		for (var i = 0; i < this._mask.length; i++)
		{
			mask.push(new jsPoint(this._rect[0] + fx*this._mask[i].x, this._rect[1] + fy*this._mask[i].y)); 
		}
		return(isPointInPoly(this._mask, pt));
	}
}
//---------------------------------------------------------//