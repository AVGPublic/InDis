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
	this._rect = [];
	this._rect[0] = 0;
	this._rect[1] = 0;
	this._rect[2] = this._image.width;
	this._rect[3] = this._image.height;
	//
	this._animatastack = [];
	//
	this._opacitypointer = -1;
	this._imagerecttranspointer = -1;
	this._affinetranspointer = -1;
	//
	this.transFromRectToRect = transFromRectToRect;
	this.easeIn = easeIn;
	this.breath = breath;
	this.animate = animate;
	this.renderImage = renderImage;
	this.renderFrameInImageRect = renderFrameInImageRect;
	this.renderFrameInMaskRect = renderFrameInMaskRect;
	this.renderMask = renderMask;
	this.setTopleft = setTopleft;
	this.testObjectClick = testObjectClick;
	
	function transFromRectToRect(top1, left1, width1, height1, top2, left2, width2, height2, duration)
	{
		this.live = true;
		this._imagerecttranspointer = this._animatastack.length;
		
		var ani = [];
		ani[0] = new animata();
		ani[0].live = true;
		ani[0].time = 0;
		ani[0].timekey.push(0); ani[0].values.push(top1); 
		ani[0].timekey.push(duration); ani[0].values.push(top2);
		this._animatastack.push(ani[0]);

		ani[1] = new animata();
		ani[1].live = true;
		ani[1].time = 0;
		ani[1].timekey.push(0); ani[1].values.push(left1); 
		ani[1].timekey.push(duration); ani[1].values.push(left2);
		this._animatastack.push(ani[1]);

		ani[2] = new animata();
		ani[2].live = true;
		ani[2].time = 0;
		ani[2].timekey.push(0); ani[2].values.push(width1); 
		ani[2].timekey.push(duration); ani[2].values.push(width2);
		this._animatastack.push(ani[2]);

		ani[3] = new animata();
		ani[3].live = true;
		ani[3].time = 0;
		ani[3].timekey.push(0); ani[3].values.push(height1); 
		ani[3].timekey.push(duration); ani[3].values.push(height2);
		this._animatastack.push(ani[3]);
	}
	function easeIn(duration)
	{
		this.live = true;
		this._opacitypointer = this._animatastack.length;
		//
		var ani = new animata();
		ani.live = true;
		ani.time = 0;
		ani.timekey.push(0); ani.values.push(0); 
		ani.timekey.push(duration); ani.values.push(1);
		this._animatastack.push(ani);
	}
	function breath(duration)
	{
		this.live = true;
		this._opacitypointer = this._animatastack.length;
		//
		this.autodeath = true;
		var ani = new animata();
		ani.live = true;
		ani.time = 0;
		ani.timekey.push(0);  ani.values.push(0);
		ani.timekey.push(0.2*duration);  ani.values.push(1.0);
		ani.timekey.push(0.8*duration);  ani.values.push(1.0);
		ani.timekey.push(1.0*duration);  ani.values.push(0);
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
	function renderFrameInImageRect(context)
	{
		if (this._opacitypointer != -1)
		{
			if (this._animatastack[this._opacitypointer].live == true)
			{
				context.globalAlpha = this._animatastack[this._opacitypointer].value;
			}
		}
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
		context.drawImage(this._image, this._rect[0], this._rect[1], this._rect[2], this._rect[3]);
	}

	function renderFrameInMaskRect(context)
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
	//
	function renderImage(context, top, left, width, height)
	{
		context.drawImage(this._image, top, left, width, height);
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
		return(isPointInPoly(this._mask, pt));
	}
}
//