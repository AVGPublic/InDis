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
function wrapText(context, text, x, y, maxWidth, lineHeight) 
{
    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++)
    {
       var testLine = line + words[n] + ' ';
       var metrics = context.measureText(testLine);
       var testWidth = metrics.width;
       if (testWidth > maxWidth && n > 0)
       {
          context.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
       }
       else 
       {
         line = testLine;
       }
    }
    context.fillText(line, x, y);
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
//---------------mouse state and gesture-------------------//
function indisController()
{
	//
	this.animateObjects = [];
	//
	this.registorObject2MouseEvent = registorObject2MouseEvent;
	this.onMouseEvent = onMouseEvent;
	//
	function registorObject2MouseEvent(animateobject, MouseEventFunction)
	{
		animateobject.onMouseEvent = MouseEventFunction;
		this.animateObjects.push(animateobject);
	}
	function onMouseEvent(event)
	{
		for(var i = 0; i < this.animateObjects.length; i++)
		{
			this.animateObjects[i].onMouseEvent(event);
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
		if (!this.live)
		{
			return;
		}
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
				if (this.time <= this.timekey[i])
				{
					inrange = true;
	
					prog = (this.timekey[i] != this.timekey[i-1])?(this.time - this.timekey[i-1])/(this.timekey[i] - this.timekey[i-1]):1;
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
function delayton(delay, animateobject, pendingstates)
{	
	this.live = true;
	this.aniobj = animateobject;
	//
	this._time = 0;
	this._delay = delay;
	this.pendingstates = pendingstates;
	//
	this.update = update;
	function update()
	{
		this._time += 1;
		if (this._time >= delay)
		{
			this.live = false;
			this.ondelayed();
		}
	}
}

//
function staticObject(left, top, width, height, parentwidth, parentheight)
{
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
	this.state = 0;
	this.mousestate = 0;
	//
	this.imageCSSwidth = 0;
	this.imageCSSheight = 0;
	//
	if (img != null)
	{
		this._image = img;
		//
		this.imageCSSwidth = this._image.width;
		this.imageCSSheight = this._image.height;
		this.imageNaturalwidth = this._image.naturalWidth;
		this.imageNaturalheight = this._image.naturalHeight;
	}
	else
	{
		var canvas_temp = document.createElement('canvas');
		canvas_temp.width = 1;
		canvas_temp.height = 1;
		this._image = canvas_temp;
		this.imageCSSwidth = 1;
		this.imageCSSheight = 1;
		this.imageNaturalwidth = 1;
		this.imageNaturalheight = 1;
	}
	//
	this._text = undefined;
	this._font = undefined;
	this._fontColor = undefined;
	this._textLineHeight = undefined;
	this._textTop = undefined;
	this._textLeft = undefined;
	this._fillColor = undefined;
	this._strokeColor = undefined;
	//
	this._mask = [];
	this._withMask;
	if (mask != null)
	{
		this._withMask = true;
		this._mask = mask;
	}
	else
	{
		this._withMask = false;
		this._mask.push(new jsPoint(0, 0));
		this._mask.push(new jsPoint(this._image.width, 0));
		this._mask.push(new jsPoint(this._image.width,this._image.height));
		this._mask.push(new jsPoint(0, this._image.height));
	}
	//
	this._rect = [];
	this._rect[0] = 0;
	this._rect[1] = 0;
	this._rect[2] = this.imageCSSwidth;
	this._rect[3] = this.imageCSSheight;
	//
	this.external_x = 0;
	this.external_y = 0;
	
	//
	this._localAlpha = 0;
	
	this._affine = [1, 0, 0, 1, 0, 0]; //scalex, tiltx, tilty, scaley, transferx, transfery
	this._rotate = 0;
	this._anchor = [0, 0];
	this._scale = [1, 1];
	this._translate = [0, 0];
	//
	this._animatePointerHash = [];
	this._animatastack = [];
	this._controlstack = [];
	this._delaytack = [];
	//
	this._staticChildStack = [];
	this._animateChildStack = [];
	this._animateIndependChildStack = [];
	//
	this._animaterootpointer = -1;
	//
	this.resetAnimateRootPointer = resetAnimateRootPointer;
	this.setAnimateRootPointer = setAnimateRootPointer;
	this.appendChildObject = appendChildObject;
	//
	this.transToRect = transToRect;
	this.transFromRectToRect = transFromRectToRect;
	this.setRect = setRect;
	this.rotate = rotate;
	this.moveTo = moveTo;
	this.scaleTo = scaleTo;
	this.easeTo = easeTo;
	this.easeIn = easeIn;
	this.easeOut = easeOut;
	this.animate = animate;
	//
	this.renderRect = renderRect;
	this.renderText = renderText;
	this.renderTextThroughTexture = renderTextThroughTexture;
	this.renderFrame = renderFrame;
	this.renderFrameInMask = renderFrameInMask;
	this.renderImage = renderImage;
	this.renderMask = renderMask;
	//
	this.setTopleft = setTopleft;
	this.testObjectClick = testObjectClick;
	this.testStaticMaskClick = testStaticMaskClick;
	//
	this.setColor = setColor;
	this.setText = setText;
	this.updateImage = updateImage;
	this.updateMask = updateMask;
	//
	this.registorDynamicBehavior = registorDynamicBehavior;
	this.onControlEvent = onControlEvent;
	//
	this.onMouseEvent = undefined;
	//
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
		//
		for (var i = 0; i < this._delaytack.length; i++)
		{
			if(this._delaytack[i].live)
			{
				this._delaytack[i].update();
			}
		}
	}
	function setColor(fillColor, strokeColor)
	{
		this._fillColor = fillColor;
		this._strokeColor = strokeColor;
	}
	function setText(text, font, fontColor, lineHeight, left, top)
	{
		this._text = text;
		this._font = font;
		this._fontColor = fontColor;
		this._textLineHeight = lineHeight;
		this._textLeft = left;
		this._textTop = top;
	}
	function updateImage(img)
	{
		this._image = img;
		this.imageCSSwidth = this._image.width;
		this.imageCSSheight = this._image.height;
		this.imageNaturalwidth = this._image.naturalWidth;
		this.imageNaturalheight = this._image.naturalHeight;
		if (!this._withMask)
		{
			this._mask.length = 0;
			this._mask.push(new jsPoint(0, 0));
			this._mask.push(new jsPoint(this._image.width, 0));
			this._mask.push(new jsPoint(this._image.width,this._image.height));
			this._mask.push(new jsPoint(0, this._image.height));
		}
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
	function onControlEvent(param)
	{
		for(var i = 0; i < this._controlstack.length; i++)
		{
			if (this._animatastack[this._controlstack[i]] != -1 && this._animatastack[this._controlstack[i]] != undefined)
			{
				this._animatastack[this._controlstack[i]].onControlEvent(param);
			}
		}
	}
	function registorDynamicBehavior(variable, dynamicSysUpdateFunc, controlEventFunc, param, delay)
	{
		if (delay != undefined && delay > 0)
		{
			var pendingstates = {"animaterootpointer": this._animaterootpointer};
			var delayer = new delayton(delay, this, pendingstates);
			this._delaytack.push(delayer);
			delayer.ondelayed = function()
			{
				var temp = this.aniobj._animaterootpointer;
				this.aniobj._animaterootpointer = this.pendingstates.animaterootpointer;
				this.aniobj.registorDynamicBehavior(variable, dynamicSysUpdateFunc, controlEventFunc, param, undefined);
				this.aniobj._animaterootpointer = temp;
			}
			return;
		}
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._animatePointerHash["rect"] = this._animatastack.length;

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
				this._controlstack.push(this._animatePointerHash["rect"]);
				
				ani[1] = new animata();
				ani[1].live = true;
				ani[1].time = 0;
				ani[1].value = this._rect[1];
				var param2 = cloneJSONparam(param); param2.id = "y";
				ani[1].setUpdateFunc(dynamicSysUpdateFunc, param2);
				ani[1].setControlEventFunc(controlEventFunc);
				this._animatastack.push(ani[1]);
				this._controlstack.push(this._animatePointerHash["rect"]+1);
			}
		}
	}
	function scaleTo(scalex, scaley, duration, delay)
	{
		if (delay != undefined && delay > 0)
		{
			var pendingstates = {"animaterootpointer": this._animaterootpointer};
			var delayer = new delayton(delay, this, pendingstates);
			this._delaytack.push(delayer);
			delayer.ondelayed = function()
			{
				var temp = this.aniobj._animaterootpointer;
				this.aniobj._animaterootpointer = this.pendingstates.animaterootpointer;
				this.aniobj.scaleTo(scalex, scaley, duration, undefined);
				this.aniobj._animaterootpointer = temp;
			}
			return;
		}
		
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._animatePointerHash["scale"] = this._animatastack.length;

			var ani = [];
			ani[0] = new animata();
			ani[0].live = true;
			ani[0].time = 0;
			ani[0].timekey.push(0); ani[0].values.push(this._scale[0]); 
			ani[0].timekey.push(duration); ani[0].values.push(scalex);
			this._animatastack.push(ani[0]);

			ani[1] = new animata();
			ani[1].live = true;
			ani[1].time = 0;
			ani[1].timekey.push(0); ani[1].values.push(this._scale[1]); 
			ani[1].timekey.push(duration); ani[1].values.push(scaley);
			this._animatastack.push(ani[1]);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].scaleTo(scalex, scaley, duration, delay);
		}
	}
	function moveTo(x, y, duration, delay)
	{
		if (delay != undefined && delay > 0)
		{
			var pendingstates = {"animaterootpointer": this._animaterootpointer};
			var delayer = new delayton(delay, this, pendingstates);
			this._delaytack.push(delayer);
			delayer.ondelayed = function()
			{
				var temp = this.aniobj._animaterootpointer;
				this.aniobj._animaterootpointer = this.pendingstates.animaterootpointer;
				this.aniobj.moveTo(x, y, duration, undefined);
				this.aniobj._animaterootpointer = temp;
			}
			return;
		}
		
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._animatePointerHash["translate"] = this._animatastack.length;

			var ani = [];
			ani[0] = new animata();
			ani[0].live = true;
			ani[0].value = this._translate[0];
			ani[0].time = 0;
			ani[0].timekey.push(0); ani[0].values.push(this._translate[0]); 
			ani[0].timekey.push(duration); ani[0].values.push(x);
			this._animatastack.push(ani[0]);

			ani[1] = new animata();
			ani[1].live = true;
			ani[1].value = this._translate[1];
			ani[1].time = 0;
			ani[1].timekey.push(0); ani[1].values.push(this._translate[1]); 
			ani[1].timekey.push(duration); ani[1].values.push(y);
			this._animatastack.push(ani[1]);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].moveTo(x, y, duration, delay);
		}
	}
	function rotate(angle, anchorx, anchory, duration, delay)
	{
		if (delay != undefined && delay > 0)
		{
			var pendingstates = {"animaterootpointer": this._animaterootpointer};
			var delayer = new delayton(delay, this, pendingstates);
			this._delaytack.push(delayer);
			delayer.ondelayed = function()
			{
				var temp = this.aniobj._animaterootpointer;
				this.aniobj._animaterootpointer = this.pendingstates.animaterootpointer;
				this.aniobj.rotate(angle, anchorx, anchory, duration, undefined);
				this.aniobj._animaterootpointer = temp;
			}
			return;
		}
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._animatePointerHash["rotate"] = this._animatastack.length;
			this._anchor[0] = anchorx; this._anchor[1] = anchory;
			
			var ani = new animata();
			ani.live = true;
			ani.time = 0;
			ani.timekey.push(0); ani.values.push(this._rotate); 
			ani.timekey.push(duration); ani.values.push(this._rotate+angle);
			this._animatastack.push(ani);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].rotate(angle, anchorx, anchory, duration, delay);
		}
	}
	function setRect(left, top, width, height)
	{
		this._rect[0] = left;
		this._rect[1] = top;
		this._rect[2] = width;
		this._rect[3] = height;
	}
	function transToRect(left, top, width, height, duration, delay)
	{
		if (delay != undefined && delay > 0)
		{
			var pendingstates = {"animaterootpointer": this._animaterootpointer};
			var delayer = new delayton(delay, this, pendingstates);
			this._delaytack.push(delayer);
			delayer.ondelayed = function()
			{
				var temp = this.aniobj._animaterootpointer;
				this.aniobj._animaterootpointer = this.pendingstates.animaterootpointer;
				this.aniobj.transToRect(left, top, width, height, duration, undefined);
				this.aniobj._animaterootpointer = temp;
			}
			return;
		}
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this._animatePointerHash["rect"] = this._animatastack.length;
					
			var ani = [];
			ani[0] = new animata();
			ani[0].live = true;
			ani[0].time = 0;
			ani[0].value = this._rect[0];
			ani[0].timekey.push(0); ani[0].values.push(this._rect[0]); 
			ani[0].timekey.push(duration); ani[0].values.push(left);
			this._animatastack.push(ani[0]);

			ani[1] = new animata();
			ani[1].live = true;
			ani[1].time = 0;
			ani[1].value = this._rect[1];
			ani[1].timekey.push(0); ani[1].values.push(this._rect[1]); 
			ani[1].timekey.push(duration); ani[1].values.push(top);
			this._animatastack.push(ani[1]);

			ani[2] = new animata();
			ani[2].live = true;
			ani[2].time = 0;
			ani[2].value = this._rect[2];
			ani[2].timekey.push(0); ani[2].values.push(this._rect[2]); 
			ani[2].timekey.push(duration); ani[2].values.push(width);
			this._animatastack.push(ani[2]);

			ani[3] = new animata();
			ani[3].live = true;
			ani[3].time = 0;
			ani[3].value = this._rect[3];
			ani[3].timekey.push(0); ani[3].values.push(this._rect[3]); 
			ani[3].timekey.push(duration); ani[3].values.push(height);
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
			this._animatePointerHash["rect"] = this._animatastack.length;
			
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
	function easeTo(value, duration, delay)
	{
		if (delay != undefined && delay > 0)
		{
			var pendingstates = {"animaterootpointer": this._animaterootpointer};
			var delayer = new delayton(delay, this, pendingstates);
			this._delaytack.push(delayer);
			delayer.ondelayed = function()
			{
				var temp = this.aniobj._animaterootpointer;
				this.aniobj._animaterootpointer = this.pendingstates.animaterootpointer;
				this.aniobj.easeTo(value, duration, undefined);
				this.aniobj._animaterootpointer = temp;
			}
			return;
		}
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this.autodeath = false;
			this._animatePointerHash["opacity"] = this._animatastack.length;
			//
			var ani = new animata();
			ani.live = true;
			ani.time = 0;
			ani.timekey.push(0); ani.values.push(this._localAlpha); 
			ani.timekey.push(duration); ani.values.push(value);
			this._animatastack.push(ani);
		}
		else if (this._animateIndependChildStack[this._animaterootpointer] != undefined)
		{
			this._animateIndependChildStack[this._animaterootpointer].easeTo(value, duration, delay);
		}
	}
	function easeIn(duration, delay)
	{
		if (this._animaterootpointer == -1)
		{
			this.live = true;
			this.autodeath = false;
			this._animatePointerHash["opacity"] = this._animatastack.length;
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
			this._animatePointerHash["opacity"] = this._animatastack.length;
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
	function changeCanvas(canvas)
	{
		var imagerecttranspointer = this._animatePointerHash["rect"];
		var opacitypointer = this._animatePointerHash["opacity"];
		if (imagerecttranspointer != undefined)
		{
			for (var i = 0; i < 4; i++)
			{
				if (this._animatastack[imagerecttranspointer + i] != undefined)
				{
					if (this._animatastack[imagerecttranspointer + i].live == true)
					{	
						this._rect[i] = this._animatastack[imagerecttranspointer + i].value;
					}
				}
			}
		}
		if (opacitypointer != undefined)
		{
			if (this._animatastack[opacitypointer].live == true)
			{
				this._localAlpha = this._animatastack[opacitypointer].value;
			}
		}
		canvas.width = scene_rect.w;
		canvas.height = scene_rect.h;
		strTop = scene_rect.y + "px";
		strLeft = scene_rect.x + "px";
		canvas.style.top = strTop;
		canvas.style.left = strLeft;
		//
		canvas.style.opacity = this._localAlpha;

	}
	function renderFrame(context)
	{
		var imagerecttranspointer = this._animatePointerHash["rect"];
		var rotatepointer = this._animatePointerHash["rotate"];
		var anchorpointer = this._animatePointerHash["anchor"];
		var scalepointer = this._animatePointerHash["scale"];
		var translatepointer = this._animatePointerHash["translate"];
		var affinepointer = this._animatePointerHash["affine"];
		var opacitypointer = this._animatePointerHash["opacity"];
		//
		if (imagerecttranspointer != undefined)
		{
			for (var i = 0; i < 4; i++)
			{
				if (this._animatastack[imagerecttranspointer + i] != undefined)
				{
					if (this._animatastack[imagerecttranspointer + i].live == true)
					{	
						this._rect[i] = this._animatastack[imagerecttranspointer + i].value;
					}
				}
			}
		}
		if (rotatepointer != undefined)
		{
			if (this._animatastack[rotatepointer] != undefined)
			{
				this._rotate = this._animatastack[rotatepointer].value;
			}
		}
		if (anchorpointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[anchorpointer+i] != undefined)
				{
					this._anchor[i] = this._animatastack[anchorpointer+i].value;
				}
			}
		}
		if (scalepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[scalepointer+i] != undefined)
				{
					this._scale[i] = this._animatastack[scalepointer+i].value;
				}
			}
		}
		if (translatepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[translatepointer+i] != undefined)
				{
					this._translate[i] = this._animatastack[translatepointer+i].value;
				}
			}
			if (this.id == "banner" && this.state == 2 && this._translate[1] == 0)
			{
				var test = this._animatastack[translatepointer+1];
			}
		}
		if (affinepointer != undefined)
		{
			for (var i = 0; i < 6; i++)
			{
				if (this._animatastack[affinepointer + i] != undefined)
				{
					if (this._animatastack[affinepointer + i].live == true)
					{	
						this._affine[i] = this._animatastack[affinepointer + i].value;
					}
				}
			}
		}
		if (opacitypointer != undefined)
		{
			if (this._animatastack[opacitypointer].live == true)
			{
				this._localAlpha = this._animatastack[opacitypointer].value;
			}
		}

		context.save();
		context.globalAlpha = this._localAlpha;
		context.translate(this._translate[0], this._translate[1]);
		context.translate(this._anchor[0], this._anchor[1]);
		context.rotate(this._rotate);
		context.scale(this._scale[0], this._scale[1]);
		context.translate(-this._anchor[0], -this._anchor[1]);
		context.transform(this._affine[0], this._affine[1], this._affine[2], this._affine[3], this._affine[4], this._affine[5], this._affine[6]);
		context.drawImage(this._image, this.external_x + this._rect[0], this.external_y + this._rect[1], this._rect[2], this._rect[3]);
		context.restore();

		for (var i = 0; i < this._animateIndependChildStack.length; i++)
		{
			if (this._animateIndependChildStack[i].live)
			{
				this._animateIndependChildStack[i].renderFrame(context);
			}
		}
	}
	function renderRect(context, chamfer)
	{
		var imagerecttranspointer = this._animatePointerHash["rect"];
		var rotatepointer = this._animatePointerHash["rotate"];
		var anchorpointer = this._animatePointerHash["anchor"];
		var scalepointer = this._animatePointerHash["scale"];
		var translatepointer = this._animatePointerHash["translate"];
		var affinepointer = this._animatePointerHash["affine"];
		var opacitypointer = this._animatePointerHash["opacity"];
		//
		if (imagerecttranspointer != undefined)
		{
			for (var i = 0; i < 4; i++)
			{
				if (this._animatastack[imagerecttranspointer + i] != undefined)
				{
					if (this._animatastack[imagerecttranspointer + i].live == true)
					{	
						this._rect[i] = this._animatastack[imagerecttranspointer + i].value;
					}
				}
			}
		}
		if (rotatepointer != undefined)
		{
			if (this._animatastack[rotatepointer] != undefined)
			{
				this._rotate = this._animatastack[rotatepointer].value;
			}
		}
		if (anchorpointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[anchorpointer+i] != undefined)
				{
					this._anchor[i] = this._animatastack[anchorpointer+i].value;
				}
			}
		}
		if (scalepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[scalepointer+i] != undefined)
				{
					this._scale[i] = this._animatastack[scalepointer+i].value;
				}
			}
		}
		if (translatepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[translatepointer+i] != undefined)
				{
					this._translate[i] = this._animatastack[translatepointer+i].value;
				}
			}
			if (this.id == "banner" && this.state == 2 && this._translate[1] == 0)
			{
				var test = this._animatastack[translatepointer+1];
			}
		}
		if (affinepointer != undefined)
		{
			for (var i = 0; i < 6; i++)
			{
				if (this._animatastack[affinepointer + i] != undefined)
				{
					if (this._animatastack[affinepointer + i].live == true)
					{	
						this._affine[i] = this._animatastack[affinepointer + i].value;
					}
				}
			}
		}
		if (opacitypointer != undefined)
		{
			if (this._animatastack[opacitypointer].live == true)
			{
				this._localAlpha = this._animatastack[opacitypointer].value;
			}
		}

		context.save();
		context.globalAlpha = this._localAlpha;
		context.translate(this._translate[0], this._translate[1]);
		context.translate(this._anchor[0], this._anchor[1]);
		context.rotate(this._rotate);
		context.scale(this._scale[0], this._scale[1]);
		context.translate(-this._anchor[0], -this._anchor[1]);
		context.transform(this._affine[0], this._affine[1], this._affine[2], this._affine[3], this._affine[4], this._affine[5], this._affine[6]);
		//
		var x = this._rect[0];
		var y = this._rect[1];
		var width = this._rect[2];
		var height = this._rect[3];
		context.beginPath();  
		context.moveTo(x + chamfer, y);  
		context.lineTo(x + width - chamfer, y);  
		context.quadraticCurveTo(x + width, y, x + width, y + chamfer);  
		context.lineTo(x + width, y + height - chamfer);  
		context.quadraticCurveTo(x + width, y + height, x + width - chamfer, y+ height);  
		context.lineTo(x + chamfer, y + height);  
		context.quadraticCurveTo(x, y + height, x, y + height - chamfer);  
		context.lineTo(x, y + chamfer);  
		context.quadraticCurveTo(x, y, x + chamfer, y);  
		context.closePath();  
		if (typeof this._fillColor != undefined)
		{  
			context.fillStyle = this._fillColor;
		   	context.fill();  
		}  
		if (typeof this._strokeColor != undefined) 
		{  
			context.strokeStyle = this._strokeColor;
		    context.stroke();  
		} 		//
		context.restore();

		for (var i = 0; i < this._animateIndependChildStack.length; i++)
		{
			if (this._animateIndependChildStack[i].live)
			{
				this._animateIndependChildStack[i].renderRect(context, chamfer);
			}
		}
		
	}
	
	function renderTextThroughTexture(context)
	{
		if (this._text == undefined)
		{
			return;
		}
		var imagerecttranspointer = this._animatePointerHash["rect"];
		var rotatepointer = this._animatePointerHash["rotate"];
		var anchorpointer = this._animatePointerHash["anchor"];
		var scalepointer = this._animatePointerHash["scale"];
		var translatepointer = this._animatePointerHash["translate"];
		var affinepointer = this._animatePointerHash["affine"];
		var opacitypointer = this._animatePointerHash["opacity"];
		//
		if (imagerecttranspointer != undefined)
		{
			for (var i = 0; i < 4; i++)
			{
				if (this._animatastack[imagerecttranspointer + i] != undefined)
				{
					if (this._animatastack[imagerecttranspointer + i].live == true)
					{	
						this._rect[i] = this._animatastack[imagerecttranspointer + i].value;
					}
				}
			}
		}
		if (rotatepointer != undefined)
		{
			if (this._animatastack[rotatepointer] != undefined)
			{
				this._rotate = this._animatastack[rotatepointer].value;
			}
		}
		if (anchorpointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[anchorpointer+i] != undefined)
				{
					this._anchor[i] = this._animatastack[anchorpointer+i].value;
				}
			}
		}
		if (scalepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[scalepointer+i] != undefined)
				{
					this._scale[i] = this._animatastack[scalepointer+i].value;
				}
			}
		}
		if (translatepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[translatepointer+i] != undefined)
				{
					this._translate[i] = this._animatastack[translatepointer+i].value;
				}
			}
			if (this.id == "banner" && this.state == 2 && this._translate[1] == 0)
			{
				var test = this._animatastack[translatepointer+1];
			}
		}
		if (affinepointer != undefined)
		{
			for (var i = 0; i < 6; i++)
			{
				if (this._animatastack[affinepointer + i] != undefined)
				{
					if (this._animatastack[affinepointer + i].live == true)
					{	
						this._affine[i] = this._animatastack[affinepointer + i].value;
					}
				}
			}
		}
		if (opacitypointer != undefined)
		{
			if (this._animatastack[opacitypointer].live == true)
			{
				this._localAlpha = this._animatastack[opacitypointer].value;
			}
		}

		var canvas_temp = document.createElement('canvas');
		var ctx_temp = canvas_temp.getContext('2d');
		ctx_temp.font = this._font;
		canvas_temp.width = this._textWidth;
		canvas_temp.height = this._textHeight;
		
		ctx_temp.clearRect(0, 0, canvas_temp.width, canvas_temp.height);
		ctx_temp.font = this._font;
		ctx_temp.fillStyle = this._fontColor;
		//ctx_temp.fillText(this._text, 0, 20);
		var lineHeight = this._textHeight/(this._textNline + 3);
		wrapText(ctx_temp, this._text, this._textLeft, this._textTop + this._textHeight, 1, lineHeight);
		 
		context.save();
		context.globalAlpha = 1;//3this._localAlpha;
		context.translate(this._translate[0], this._translate[1]);
		context.translate(this._anchor[0], this._anchor[1]);
		context.rotate(this._rotate);
		context.scale(this._scale[0], this._scale[1]);
		context.translate(-this._anchor[0], -this._anchor[1]);
		context.transform(this._affine[0], this._affine[1], this._affine[2], this._affine[3], this._affine[4], this._affine[5], this._affine[6]);

		context.drawImage(canvas_temp, this._rect[0], this._rect[1], this._rect[2], this._rect[3]);
		context.restore();

		for (var i = 0; i < this._animateIndependChildStack.length; i++)
		{
			if (this._animateIndependChildStack[i].live)
			{
				this._animateIndependChildStack[i].renderTextThroughTexture(context);
			}
		}
	}
	
	function renderText(context)
	{
		if (this._text == undefined)
		{
			return;
		}
		var imagerecttranspointer = this._animatePointerHash["rect"];
		var rotatepointer = this._animatePointerHash["rotate"];
		var anchorpointer = this._animatePointerHash["anchor"];
		var scalepointer = this._animatePointerHash["scale"];
		var translatepointer = this._animatePointerHash["translate"];
		var affinepointer = this._animatePointerHash["affine"];
		var opacitypointer = this._animatePointerHash["opacity"];
		//
		if (imagerecttranspointer != undefined)
		{
			for (var i = 0; i < 4; i++)
			{
				if (this._animatastack[imagerecttranspointer + i] != undefined)
				{
					if (this._animatastack[imagerecttranspointer + i].live == true)
					{	
						this._rect[i] = this._animatastack[imagerecttranspointer + i].value;
					}
				}
			}
		}
		if (rotatepointer != undefined)
		{
			if (this._animatastack[rotatepointer] != undefined)
			{
				this._rotate = this._animatastack[rotatepointer].value;
			}
		}
		if (anchorpointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[anchorpointer+i] != undefined)
				{
					this._anchor[i] = this._animatastack[anchorpointer+i].value;
				}
			}
		}
		if (scalepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[scalepointer+i] != undefined)
				{
					this._scale[i] = this._animatastack[scalepointer+i].value;
				}
			}
		}
		if (translatepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[translatepointer+i] != undefined)
				{
					this._translate[i] = this._animatastack[translatepointer+i].value;
				}
			}
			if (this.id == "banner" && this.state == 2 && this._translate[1] == 0)
			{
				var test = this._animatastack[translatepointer+1];
			}
		}
		if (affinepointer != undefined)
		{
			for (var i = 0; i < 6; i++)
			{
				if (this._animatastack[affinepointer + i] != undefined)
				{
					if (this._animatastack[affinepointer + i].live == true)
					{	
						this._affine[i] = this._animatastack[affinepointer + i].value;
					}
				}
			}
		}
		if (opacitypointer != undefined)
		{
			if (this._animatastack[opacitypointer].live == true)
			{
				this._localAlpha = this._animatastack[opacitypointer].value;
			}
		}

		context.save();
		context.globalAlpha = 1;//this._localAlpha;
		context.translate(this._translate[0], this._translate[1]);
		context.translate(this._anchor[0], this._anchor[1]);
		context.rotate(this._rotate);
		context.scale(this._scale[0], this._scale[1]);
		context.translate(-this._anchor[0], -this._anchor[1]);
		context.transform(this._affine[0], this._affine[1], this._affine[2], this._affine[3], this._affine[4], this._affine[5], this._affine[6]);
		context.font= this._font;
		context.fillStyle =	this._fontColor;
		//context.fillText(this._text, this._textLeft + this._rect[0], this._textTop + this._rect[1]);
		wrapText(context, this._text, this._textLeft + this._rect[0], this._textLineHeight + this._textTop + this._rect[1], 4, this._textLineHeight);
		context.restore();

		for (var i = 0; i < this._animateIndependChildStack.length; i++)
		{
			if (this._animateIndependChildStack[i].live)
			{
				this._animateIndependChildStack[i].renderText(context);
			}
		}
	}
	
	function renderFrameInMask(context)
	{
		var imagerecttranspointer = this._animatePointerHash["rect"];
		var rotatepointer = this._animatePointerHash["rotate"];
		var anchorpointer = this._animatePointerHash["anchor"];
		var scalepointer = this._animatePointerHash["scale"];
		var translatepointer = this._animatePointerHash["translate"];
		var affinepointer = this._animatePointerHash["affine"];
		var opacitypointer = this._animatePointerHash["opacity"];
		
		//
		if (imagerecttranspointer != undefined)
		{
			for (var i = 0; i < 4; i++)
			{
				if (this._animatastack[imagerecttranspointer + i] != undefined)
				{
					if (this._animatastack[imagerecttranspointer + i].live == true)
					{	
						this._rect[i] = this._animatastack[imagerecttranspointer + i].value;
					}
				}
			}
		}
		if (rotatepointer != undefined)
		{
			if (this._animatastack[rotatepointer] != undefined)
			{
				this._rotate = this._animatastack[rotatepointer].value;
			}
		}
		if (anchorpointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[anchorpointer+i] != undefined)
				{
					this._anchor[i] = this._animatastack[anchorpointer+i].value;
				}
			}
		}
		if (scalepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[scalepointer+i] != undefined)
				{
					this._scale[i] = this._animatastack[scalepointer+i].value;
				}
			}
		}
		if (translatepointer != undefined)
		{
			for (var i = 0; i < 2; i++)
			{
				if (this._animatastack[translatepointer+i] != undefined)
				{
					this._translate[i] = this._animatastack[translatepointer+i].value;
				}
			}
		}
		if (affinepointer != undefined)
		{
			for (var i = 0; i < 6; i++)
			{
				if (this._animatastack[affinepointer + i] != undefined)
				{
					if (this._animatastack[affinepointer + i].live == true)
					{	
						this._affine[i] = this._animatastack[affinepointer + i].value;
					}
				}
			}
		}
		if (opacitypointer != undefined)
		{
			if (this._animatastack[opacitypointer].live == true)
			{
				this._localAlpha = this._animatastack[opacitypointer].value;
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
		context.translate(this._translate[0], this._translate[1]);
		context.translate(this._anchor[0], this._anchor[1]);
		context.rotate(this._rotate);
		context.scale(this._scale[0], this._scale[1]);
		context.translate(-this._anchor[0], -this._anchor[1]);
		context.transform(this._affine[0], this._affine[1], this._affine[2], this._affine[3], this._affine[4], this._affine[5], this._affine[6]);
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
//---------------scroller animation -----------------------//
function indisScroller(heightMax, marginBottomMax)
{
	this._heightMax = heightMax;
	this._marginBottomMax = marginBottomMax;
	this._height = 0;
	this._marginbottom = 0;
	this._animatas = [];
	this.live = false;
	
	this.animate = animate;
	this.playIn = playIn;
	this.playOut = playOut;
	this.getHeight = getHeight;
	this.getMarginBottom = getMarginBottom;
	
	function animate()
	{
		var somethingalive = false;
		for (var i = 0; i < 2; i++)
		{
			if (this._animatas[i].live)
			{
				somethingalive = true;
				this._animatas[i].update();
			}
		}
		this._height = this._animatas[0].value;
		this._marginbottom = this._animatas[1].value;
		if (!somethingalive)
		{
			this.live = false;
		}
	}
	function playIn(duration)
	{
		this.live = true;
		
		this._animatas[0] = new animata();
		this._animatas[0].live = true;
		this._animatas[0].time = 0;
		this._animatas[0].timekey.push(0); this._animatas[0].values.push(0); 
		this._animatas[0].timekey.push(duration); this._animatas[0].values.push(this._heightMax); 
		
		this._animatas[1] = new animata();
		this._animatas[1].live = true;
		this._animatas[1].time = 0;
		this._animatas[1].timekey.push(0); this._animatas[1].values.push(0); 
		this._animatas[1].timekey.push(duration); this._animatas[1].values.push(this._marginBottomMax); 
	}
	function playOut(duration)
	{
		this.live = true;
			
		this._animatas[0] = new animata();
		this._animatas[0].live = true;
		this._animatas[0].time = 0;
		this._animatas[0].timekey.push(0); this._animatas[0].values.push(this._heightMax); 
		this._animatas[0].timekey.push(duration); this._animatas[0].values.push(0); 
		
		this._animatas[1] = new animata();
		this._animatas[1].live = true;
		this._animatas[1].time = 0;
		this._animatas[1].timekey.push(0); this._animatas[1].values.push(this._marginBottomMax); 
		this._animatas[1].timekey.push(duration); this._animatas[1].values.push(0); 
	}
	function getHeight()
	{
		return this._height;
	}
	function getMarginBottom()
	{
		return this._marginbottom;
	}
}