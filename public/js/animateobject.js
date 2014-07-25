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
function animata()
{
	this.live = false;
	this.time = 0;
	this.value = -1;
	this.timekey = [];
	this.values = [];
	
	this.update = update;
	function update()
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
function indisObject(mask, img, live)
{
	this.live = live;
	//
	this.autodeath = false;
	//
	this._mask = mask;
	this._image = img;
	//
	this._animatastack = [];
	//
	this._opacitypointer = -1;
	//
	this.easeIn = easeIn;
	this.breath = breath;
	this.animate = animate;
	this.renderImage = renderImage;
	this.renderFrameImageRect = renderFrameImageRect;
	this.renderImageInMask = renderImageInMask;
	this.renderMask = renderMask;
	this.setTopleft = setTopleft;
	this.testObjectClick = testObjectClick;
	
	/*function emergeTo(top, left, width, height)
	{
		this._innerclock = 0;
		this._bTrans = true;
		
		this._transStart[0] = top;
		this._transStart[1] = left;
		this._transStart[2] = 0;
		this._transStart[3] = 0;
	
		this._transEnd[0] = top;
		this._transEnd[1] = left;
		this._transEnd[2] = width;
		this._transEnd[3] = height;			
	}*/
	function easeIn(duration)
	{
		this.live = true;
		var ani = new animata();
		ani.live = true;
		ani.time = 0;
		ani.timekey.push(0); ani.values.push(0); 
		ani.timekey.push(duration); ani.values.push(1);
		this._opacitypointer = this._animatastack.length;
		this._animatastack.push(ani);
	}
	function breath(duration)
	{
		this.live = true;
		this.autodeath = true;
		var ani = new animata();
		ani.live = true;
		ani.time = 0;
		ani.timekey.push(0);  ani.values.push(0);
		ani.timekey.push(0.2*duration);  ani.values.push(1.0);
		ani.timekey.push(0.8*duration);  ani.values.push(1.0);
		ani.timekey.push(1.0*duration);  ani.values.push(0);
		this._opacitypointer = this._animatastack.length;
		this._animatastack.push(ani);
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
	}
	function renderFrameImageRect(context)
	{
		if (this._opacitypointer != -1)
		{
			if (this._animatastack[this._opacitypointer].live == true)
			{
				context.globalAlpha = this._animatastack[this._opacitypointer].value;
			}
		}
		this.renderImage(context, 0, 0, this._image.width, this._image.height);
	}
	function renderImage(context, top, left, width, height)
	{
		context.drawImage(this._image, top, left, width, height);
	}
	function renderImageInMask(context)
	{
		if (this._opacitypointer != -1)
		{
			if (this._animatastack[this._opacitypointer].live == true)
			{
				context.globalAlpha = this._animatastack[this._opacitypointer].value;
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
		context.clip();
		
		context.drawImage(this._image, 0, 0);
		context.restore();
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
		return(isPointInPoly(this._mask, pt));
	}
}
//