/**
 * Generic matrix class. Built for readability, not for speed.
 *
 * (c) Steven Wittens 2008
 * http://www.acko.net/
 */
var Matrix = function (w, h, values) {
  this.w = w;
  this.h = h;
  this.values = values || Matrix.allocate(h);
};

Matrix.allocate = function (w, h) {
  var values = [];
  for (var i = 0; i < h; ++i) {
    values[i] = [];
    for (var j = 0; j < w; ++j) {
      values[i][j] = 0;
    }
  } 
  return values; 
}

Matrix.cloneValues = function (values) {
  clone = [];
  for (var i = 0; i < values.length; ++i) {
    clone[i] = [].concat(values[i]);
  } 
  return clone; 
}

Matrix.prototype.add = function (operand) {
  if (operand.w != this.w || operand.h != this.h) {
    throw "Matrix add size mismatch";
  }

  var values = Matrix.allocate(this.w, this.h);
  for (var y = 0; y < this.h; ++y) {
    for (var x = 0; x < this.w; ++x) {
      values[y][x] = this.values[y][x] + operand.values[y][x];
    }
  }
  return new Matrix(this.w, this.h, values);
};

Matrix.prototype.transformProjectiveVector = function (operand) {
  var out = [];
  for (var y = 0; y < this.h; ++y) {
    out[y] = 0;
    for (var x = 0; x < this.w; ++x) {
      out[y] += this.values[y][x] * operand[x];
    }
  }
  var iz = 1 / (out[out.length - 1]);
  for (var y = 0; y < this.h; ++y) {
    out[y] *= iz;
  }
  return out;
}

Matrix.prototype.multiply = function (operand) {
  if (+operand !== operand) {
    // Matrix mult
    if (operand.h != this.w) {
      throw "Matrix mult size mismatch";
    }
    var values = Matrix.allocate(this.w, this.h);
    for (var y = 0; y < this.h; ++y) {
      for (var x = 0; x < operand.w; ++x) {
        var accum = 0;
        for (var s = 0; s < this.w; s++) {
          accum += this.values[y][s] * operand.values[s][x];
        }
        values[y][x] = accum;
      }
    }
    return new Matrix(operand.w, this.h, values);
  }
  else {
    // Scalar mult
    var values = Matrix.allocate(this.w, this.h);
    for (var y = 0; y < this.h; ++y) {
      for (var x = 0; x < this.w; ++x) {
        values[y][x] = this.values[y][x] * operand;
      }
    }
    return new Matrix(this.w, this.h, values);
  }
};

Matrix.prototype.rowEchelon = function () {
  if (this.w <= this.h) {
    throw "Matrix rowEchelon size mismatch";
  }
  
  var temp = Matrix.cloneValues(this.values);

  // Do Gauss-Jordan algorithm.
  for (var yp = 0; yp < this.h; ++yp) {
    // Look up pivot value.
    var pivot = temp[yp][yp];
    while (pivot == 0) {
      // If pivot is zero, find non-zero pivot below.
      for (var ys = yp + 1; ys < this.h; ++ys) {
        if (temp[ys][yp] != 0) {
          // Swap rows.
          var tmpRow = temp[ys];
          temp[ys] = temp[yp];
          temp[yp] = tmpRow;
          break;
        }
      }
      if (ys == this.h) {
        // No suitable pivot found. Abort.
        return new Matrix(this.w, this.h, temp);
      }
      else {
        pivot = temp[yp][yp];        
      }
    };
    // Normalize this row.
    var scale = 1 / pivot;
    for (var x = yp; x < this.w; ++x) {
      temp[yp][x] *= scale;
    }
    // Subtract this row from all other rows (scaled).
    for (var y = 0; y < this.h; ++y) {
      if (y == yp) continue;
      var factor = temp[y][yp];
      temp[y][yp] = 0;
      for (var x = yp + 1; x < this.w; ++x) {
        temp[y][x] -= factor * temp[yp][x];
      }
    }
  }  

  return new Matrix(this.w, this.h, temp);
}

Matrix.prototype.invert = function () {
  if (this.w != this.h) {
    throw "Matrix invert size mismatch";
  }

  var temp = Matrix.allocate(this.w * 2, this.h);

  // Initialize augmented matrix
  for (var y = 0; y < this.h; ++y) {
    for (var x = 0; x < this.w; ++x) {
      temp[y][x] = this.values[y][x];
      temp[y][x + this.w] = (x == y) ? 1 : 0;
    }
  }
  
  temp = new Matrix(this.w * 2, this.h, temp);
  temp = temp.rowEchelon();
  
  // Extract right block matrix.
  var values = Matrix.allocate(this.w, this.h);
  for (var y = 0; y < this.w; ++y) {
    for (var x = 0; x < this.w; ++x) {
      values[y][x] = temp.values[y][x + this.w];
    }
  }
  return new Matrix(this.w, this.h, values);
};

Matrix.prototype.print = function () {
  var out = "<table>";
  for (var y = 0; y < this.h; ++y) {
    out += '<tr>';
    for (var x = 0; x < this.w; ++x) {
      out += '<td>';
      out += Math.round(this.values[y][x] * 100.0) / 100.0;
      out += '</td>';
    }
    out += '</tr>';
  }
  out += '</table>';
  $('body').append(out);
  
  return this;
};
/**
 * Projective texturing using Canvas.
 *
 * (c) Steven Wittens 2008
 * http://www.acko.net/
 */

function Renderer3D(image, points)
{
	this.canvas = createCanvas(0, 0, 1, 1);
	this.ctx = this.canvas.getContext("2d");
	this.image = image;
	this.transform = null;
	this.iw = 0;
	this.ih = 0;
	this.points = points;
	this.bounds = [];//just the right order of points
	this.offsetx = 0;
	this.offsety = 0;
	
	//
	this.options = {
	  wireframe: false,
	  image: 'images/image1.jpg',
	  subdivisionLimit: 5,
	  patchSize: 32
	};
	//Update the display to match a new point configuration.
    this.update = update;
	this.divide = divide;
	this.getCanvas = getCanvas;
	this.testObjectClick = testObjectClick;
	function getCanvas(){
		return this.canvas;
	}
	function testObjectClick(pt){
		return(isPointInPoly(this.bounds, pt));
	}
	function update() {
	  // Get extents.
	  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	  for (var i = 0; i < 4; i++)
	  {
		minX = Math.min(minX, Math.floor(this.points[i][0]));
		maxX = Math.max(maxX, Math.ceil(this.points[i][0]));
		minY = Math.min(minY, Math.floor(this.points[i][1]));
		maxY = Math.max(maxY, Math.ceil(this.points[i][1]));
	  }
	  
	  minX--; minY--; maxX++; maxY++;
	  this.offsetX = minX;
	  this.offsetY = minY;
	  
	  var width = maxX - minX;
	  var height = maxY - minY;

	  // Reshape canvas.
	  this.canvas.style.left = minX +'px';
	  this.canvas.style.top = minY +'px';
	  this.canvas.width = width;
	  this.canvas.height = height;
	  
	  // Measure texture.
	  this.iw = this.image.width;
	  this.ih = this.image.height;

	  // Set up basic drawing context.
	  this.ctx = this.canvas.getContext("2d");
	  this.ctx.translate(-minX, -minY);
	  this.ctx.clearRect(minX, minY, width, height);
	  this.ctx.strokeStyle = "rgb(220,0,100)";

	  this.transform = getProjectiveTransform(points);

	  // Begin subdivision process.
	  var ptl = this.transform.transformProjectiveVector([0, 0, 1]);
	  var ptr = this.transform.transformProjectiveVector([1, 0, 1]);
	  var pbl = this.transform.transformProjectiveVector([0, 1, 1]);
	  var pbr = this.transform.transformProjectiveVector([1, 1, 1]);

	  this.ctx.beginPath();
	  this.ctx.moveTo(ptl[0], ptl[1]);
	  this.ctx.lineTo(ptr[0], ptr[1]);
	  this.ctx.lineTo(pbr[0], pbr[1]);
	  this.ctx.lineTo(pbl[0], pbl[1]);
	  this.ctx.closePath();
	  this.ctx.clip();

	  this.bounds.length = 0;
	  this.bounds.push(new jsPoint(ptl[0], ptl[1]));
	  this.bounds.push(new jsPoint(ptr[0], ptr[1]));
	  this.bounds.push(new jsPoint(pbr[0], pbr[1]));
	  this.bounds.push(new jsPoint(pbl[0], pbl[1]));
	   
	  this.divide(0, 0, 1, 1, ptl, ptr, pbl, pbr, this.options.subdivisionLimit);

	  
	  if (this.options.wireframe) {
		this.ctx.beginPath();
		this.ctx.moveTo(ptl[0], ptl[1]);
		this.ctx.lineTo(ptr[0], ptr[1]);
		this.ctx.lineTo(pbr[0], pbr[1]);
		this.ctx.lineTo(pbl[0], pbl[1]);
		this.ctx.closePath();
		this.ctx.stroke();
	  }
	}
	//Render a projective patch.
	function divide(u1, v1, u4, v4, p1, p2, p3, p4, limit) {
	  // See if we can still divide.
	  if (limit) {
		// Measure patch non-affinity.
		var d1 = [p2[0] + p3[0] - 2 * p1[0], p2[1] + p3[1] - 2 * p1[1]];
		var d2 = [p2[0] + p3[0] - 2 * p4[0], p2[1] + p3[1] - 2 * p4[1]];
		var d3 = [d1[0] + d2[0], d1[1] + d2[1]];
		var r = Math.abs((d3[0] * d3[0] + d3[1] * d3[1]) / (d1[0] * d2[0] + d1[1] * d2[1]));

		// Measure patch area.
		d1 = [p2[0] - p1[0] + p4[0] - p3[0], p2[1] - p1[1] + p4[1] - p3[1]];
		d2 = [p3[0] - p1[0] + p4[0] - p2[0], p3[1] - p1[1] + p4[1] - p2[1]];
		var area = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]);

		// Check area > patchSize pixels (note factor 4 due to not averaging d1 and d2)
		// The non-affinity measure is used as a correction factor.
		if ((u1 == 0 && u4 == 1) || ((.25 + r * 5) * area > (this.options.patchSize * this.options.patchSize))) {
		  // Calculate subdivision points (middle, top, bottom, left, right).
		  var umid = (u1 + u4) / 2;
		  var vmid = (v1 + v4) / 2;
		  var pmid = this.transform.transformProjectiveVector([umid, vmid, 1]);
		  var pt = this.transform.transformProjectiveVector([umid, v1, 1]);
		  var pb = this.transform.transformProjectiveVector([umid, v4, 1]);
		  var pl = this.transform.transformProjectiveVector([u1, vmid, 1]);
		  var pr = this.transform.transformProjectiveVector([u4, vmid, 1]);

		  // Subdivide.
		  limit--;
		  this.divide(u1, v1, umid, vmid, p1, pt, pl, pmid, limit);
		  this.divide(umid, v1, u4, vmid, pt, p2, pmid, pr, limit);
		  this.divide(u1, vmid, umid, v4, pl, pmid, p3, pb, limit);
		  this.divide(umid, vmid, u4, v4, pmid, pr, pb, p4, limit);

		  if (this.options.wireframe) {
			this.ctx.beginPath();
			this.ctx.moveTo(pt[0], pt[1]);
			this.ctx.lineTo(pb[0], pb[1]);
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(pl[0], pl[1]);
			this.ctx.lineTo(pr[0], pr[1]);
			this.ctx.stroke();
		  }

		  return;
		}
	  }

	  // Render this patch.
	  this.ctx.save();

	  // Set clipping path.
	  this.ctx.beginPath();
	  this.ctx.moveTo(p1[0], p1[1]);
	  this.ctx.lineTo(p2[0], p2[1]);
	  this.ctx.lineTo(p4[0], p4[1]);
	  this.ctx.lineTo(p3[0], p3[1]);
	  this.ctx.closePath();
	  //this.ctx.clip();
	  
	  // Get patch edge vectors.
	  var d12 = [p2[0] - p1[0], p2[1] - p1[1]];
	  var d24 = [p4[0] - p2[0], p4[1] - p2[1]];
	  var d43 = [p3[0] - p4[0], p3[1] - p4[1]];
	  var d31 = [p1[0] - p3[0], p1[1] - p3[1]];
	  
	  // Find the corner that encloses the most area
	  var a1 = Math.abs(d12[0] * d31[1] - d12[1] * d31[0]);
	  var a2 = Math.abs(d24[0] * d12[1] - d24[1] * d12[0]);
	  var a4 = Math.abs(d43[0] * d24[1] - d43[1] * d24[0]);
	  var a3 = Math.abs(d31[0] * d43[1] - d31[1] * d43[0]);
	  var amax = Math.max(Math.max(a1, a2), Math.max(a3, a4));
	  var dx = 0, dy = 0, padx = 0, pady = 0;
	  
	  // Align the this.transform along this corner.
	  switch (amax) {
		case a1:
		  this.ctx.transform(d12[0], d12[1], -d31[0], -d31[1], p1[0], p1[1]);
		  // Calculate 1.05 pixel padding on vector basis.
		  if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
		  if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
		  break;
		case a2:
		  this.ctx.transform(d12[0], d12[1],  d24[0],  d24[1], p2[0], p2[1]);
		  // Calculate 1.05 pixel padding on vector basis.
		  if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
		  if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
		  dx = -1;
		  break;
		case a4:
		  this.ctx.transform(-d43[0], -d43[1], d24[0], d24[1], p4[0], p4[1]);
		  // Calculate 1.05 pixel padding on vector basis.
		  if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
		  if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
		  dx = -1;
		  dy = -1;
		  break;
		case a3:
		  // Calculate 1.05 pixel padding on vector basis.
		  this.ctx.transform(-d43[0], -d43[1], -d31[0], -d31[1], p3[0], p3[1]);
		  if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
		  if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
		  dy = -1;
		  break;
	  }
	  
	  // Calculate image padding to match.
	  var du = (u4 - u1);
	  var dv = (v4 - v1);
	  var padu = padx * du;
	  var padv = pady * dv;
	  this.ctx.drawImage(
		image,
		u1 * this.iw,
		v1 * this.ih,
		Math.min(u4 - u1 + padu, 1) * this.iw,
		Math.min(v4 - v1 + padv, 1) * this.ih,
		dx, dy,
		//1 + padx, 1 + pady
		1, 1
	  );

	  this.ctx.restore();
	}
}	
/**
 * Create a canvas at the specified coordinates.
 */
function createCanvas(x, y, width, height) {
  // Create <canvas>
  var canvas;
  if (typeof G_vmlCanvasManager != 'undefined') {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    $('#canvas').appendChild(canvas);
    canvas = G_vmlCanvasManager.initElement(canvas);
  }
  else {
    canvas = $('<canvas width="'+ width +'" height="'+ height +'"></canvas>');
    $('#canvas').append(canvas);
    canvas = canvas[0];
  }
  return canvas;
}

/**
 * Calculate a projective transform that maps [0,1]x[0,1] onto the given set of points.
 */
function getProjectiveTransform(points) {
  var eqMatrix = new Matrix(9, 8, [
    [ 1, 1, 1,   0, 0, 0, -points[3][0],-points[3][0],-points[3][0] ], 
    [ 0, 1, 1,   0, 0, 0,  0,-points[2][0],-points[2][0] ],
    [ 1, 0, 1,   0, 0, 0, -points[1][0], 0,-points[1][0] ],
    [ 0, 0, 1,   0, 0, 0,  0, 0,-points[0][0] ],

    [ 0, 0, 0,  -1,-1,-1,  points[3][1], points[3][1], points[3][1] ],
    [ 0, 0, 0,   0,-1,-1,  0, points[2][1], points[2][1] ],
    [ 0, 0, 0,  -1, 0,-1,  points[1][1], 0, points[1][1] ],
    [ 0, 0, 0,   0, 0,-1,  0, 0, points[0][1] ]

  ]);
  
  var kernel = eqMatrix.rowEchelon().values;
  var transform = new Matrix(3, 3, [
    [-kernel[0][8], -kernel[1][8], -kernel[2][8]],
    [-kernel[3][8], -kernel[4][8], -kernel[5][8]],
    [-kernel[6][8], -kernel[7][8],             1]
  ]);
  return transform;
}