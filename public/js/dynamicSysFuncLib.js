//-------------dynamic system function lib-----------------//
var dynamicSysFuncLib = (function (dynamicSysFuncLib) 
{
   dynamicSysFuncLib.attractorStringParam = 
	{anchor: {x: 500, y: 300}, k: 0.001, nv: 0.04, dt: 1, pulse: {dv: 40.0, range: 80, da: 0.01}, imageCenter: {x: 16, y: 22}, id: undefined};
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

		deltav = param.pulse.dv*dis/param.pulse.range

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


