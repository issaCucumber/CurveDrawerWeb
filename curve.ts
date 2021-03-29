/// <reference path="jquery.d.ts" />

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;
const STEP_HEIGHT = 10;
const MINISTEP_HEIGHT = 5;
const POINT_SIZE = 3;

class CurveRenderer{
    
    constructor(private curve_context: any,
                private axis_context: any,
                private convex_context: any,
                private points_ctx: any,
                private bpoints_ctx: any
        ) {
        
        this.drawAxis();
    }
    
    private bspline :any;
    private drawMode :boolean = false;
    
    initEmptyBSpline(){
        
       let d = Number($("input[name='optionsRadios']:checked").val());
       this.bspline = new BSpline([], d, 0, []);
       this.clearBoard();
    }
    
    addPointToBSpline(new_point){
        
        let np = this.covnertToStdCoordinates(new_point);
        if(this.bspline.addControlPoint(np)){
           this.drawCurve(this.bspline.samplePoints()); 
        }
        
        this.drawControlPolygon(this.bspline.getControlPoints(), true); 
    }
    
    handleFileSelect(evt) {
      var files = evt.target.files; // FileList object.
    
      // files is a FileList of File objects. List some properties.
      var output = [];
      for (var i = 0, f; f = files[i]; i++) {
          
        var reader = new FileReader();
        var that = this;
          
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            var contents = e.target.result;
            $("#console").empty();
            that.bspline = FileParser.parse(contents);
              
            if(!that.bspline.validate()){
                alert("invalid format!"); 
                return;   
            }  
            
            //bspline.insertKnot(0.55);
            that.drawCurve(that.bspline.samplePoints()); 
            //bspline.samplePoints();
            that.drawControlPolygon(that.bspline.getControlPoints());
            that.printLineInfo();
          };
        })(f);
          
        reader.readAsText(f);
      }
    }
    
    updateCurve(){
        if(this.bspline != undefined){
          this.drawCurve(this.bspline.samplePoints());
          this.printLineInfo();  
        } 
    }
    
    isDrawMode(){
        return this.drawMode;    
    }
    
    toggleDrawMode(toggle){
        this.drawMode = toggle;
        
        if(toggle){
            $("canvas#touch").css("display", "block");  
            this.initEmptyBSpline();  
        }else{
            $("canvas#touch").css("display", "none");
        }
    }
    
    private clearBoard(){
        this.curve_context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.points_ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.bpoints_ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.convex_context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
    
    private drawAxis(){
        
        this.axis_context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        //x-axis
        this.axis_context.beginPath();
        this.axis_context.moveTo(0, CANVAS_HEIGHT / 2);
        this.axis_context.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
        this.axis_context.stroke(); // Draw it 
        
        //y-axis
        this.axis_context.beginPath();
        this.axis_context.moveTo(CANVAS_WIDTH/2, 0);
        this.axis_context.lineTo(CANVAS_WIDTH/2, CANVAS_HEIGHT);
        this.axis_context.stroke(); // Draw it
        
        //steps
        this.axis_context.beginPath();
        for(let i = CANVAS_WIDTH/2; i < CANVAS_WIDTH; i+=10){
            
            if(i == CANVAS_WIDTH/2){
                continue;    
            }
            this.axis_context.moveTo(i, CANVAS_HEIGHT/2);
            this.axis_context.lineTo(i, CANVAS_HEIGHT/2 + ((i - CANVAS_WIDTH/2 + 100) % 100 == 0 ? STEP_HEIGHT : MINISTEP_HEIGHT));
        }
        
        for(let i = CANVAS_WIDTH/2; i > 0; i-=10){
            
            if(i == CANVAS_WIDTH/2){
                continue;    
            }
            
            this.axis_context.moveTo(i, CANVAS_HEIGHT/2);
            this.axis_context.lineTo(i, CANVAS_HEIGHT/2 + ((CANVAS_WIDTH/2 + 100 - i) % 100 == 0 ? STEP_HEIGHT : MINISTEP_HEIGHT));
        }
        
        for(let i = CANVAS_HEIGHT/2; i < CANVAS_HEIGHT; i+=10){
            
            if(i == CANVAS_HEIGHT/2){
                continue;    
            }
            this.axis_context.moveTo(CANVAS_WIDTH/2, i);
            this.axis_context.lineTo(CANVAS_WIDTH/2 + ((i - CANVAS_HEIGHT/2 + 100) % 100 == 0 ? STEP_HEIGHT : MINISTEP_HEIGHT), i);
        }
        
        for(let i = CANVAS_WIDTH/2; i > 0; i-=10){
            
            if(i == CANVAS_WIDTH/2){
                continue;    
            }
            
            this.axis_context.moveTo(CANVAS_WIDTH/2, i);
            this.axis_context.lineTo(CANVAS_WIDTH/2 + ((CANVAS_HEIGHT/2 + 100 - i) % 100 == 0 ? STEP_HEIGHT : MINISTEP_HEIGHT), i);
        }
        
        this.axis_context.stroke(); // Draw it
    }
    
    private drawCurve(sample_points){
        
        if(sample_points.length <= 0){
            return;    
        }
        
        this.curve_context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.points_ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.bpoints_ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        //draw the curve
        this.curve_context.beginPath();
        this.curve_context.lineWidth="4";
        this.curve_context.strokeStyle = '#ff0000';
        
        this.points_ctx.beginPath();
        this.points_ctx.strokeStyle = '#FFFF00';

        let i = 0;
        while(i < sample_points.length){
           if((i+1) < sample_points.length){
                let p0 = this.projectToCanvas(sample_points[i]), p1 = this.projectToCanvas(sample_points[i+1]);
                this.curve_context.moveTo(p0.x, p0.y);
                this.curve_context.lineTo(p1.x, p1.y);
                this.points_ctx.arc(p0.x, p0.y, POINT_SIZE, 0, 2*Math.PI);
            }
            i++; 
        }
        
        this.curve_context.stroke(); // Draw it
        this.points_ctx.stroke();
    }
    
    private printLineInfo(){
        let info = this.bspline.getInfo();
         
        $.each(info, (prop, value) => {
            $("td#"+prop).text(JSON.stringify(value));  
        });
    }
    
    displayBsplineFileStruct(){
        $("textarea#canvas").val("");
        let info = this.bspline.getInfo();
        let str = `${info["degree"]} ${info["order"]}\n`;
        str = str.concat(info["knots"].join(" "), "\n");
        
        for(let i = 0; i<info["cp"].length; i++){
            str = str.concat(`${info["cp"][i].x} ${info["cp"][i].y}\n`);
        }
        
        $("textarea#console").val(str);
    }
    
    drawDeBoorNet(){
        
        this.bpoints_ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        let deboors = $("#deboor").val().split(",");
        
        for(let d of deboors){
            //draw the point
            let u = d.trim();
            let p = this.projectToCanvas(this.bspline.getDeBoorPoint(u));
            let traces = this.bspline.getDeBoorNet(u);
            
            for(let j = 0; j < traces.length; j++){
                let h = traces[j];
                for(let k = 0; k < h.length -1 ; k++){
                    let p0 = this.projectToCanvas(h[k]), 
                    p1 = this.projectToCanvas(h[k+1]);
                    
                    this.bpoints_ctx.beginPath();
                    this.bpoints_ctx.arc(p0.x, p0.y, POINT_SIZE, 0, 2*Math.PI);
                    this.bpoints_ctx.fillStyle = 'blue';
                    this.bpoints_ctx.fill();
                    
                    this.bpoints_ctx.beginPath();
                    this.bpoints_ctx.arc(p1.x, p1.y, POINT_SIZE, 0, 2*Math.PI);
                    this.bpoints_ctx.fillStyle = 'blue';
                    this.bpoints_ctx.fill();
                    
                    this.bpoints_ctx.beginPath();
                    this.bpoints_ctx.fillStyle = '#a64cff';
                    this.bpoints_ctx.lineWidth="1";
                    this.bpoints_ctx.moveTo(p0.x, p0.y);
                    this.bpoints_ctx.lineTo(p1.x, p1.y);
                    this.bpoints_ctx.stroke();
                }
            }
            
            if(p){
                this.bpoints_ctx.beginPath();
                this.bpoints_ctx.arc(p.x, p.y, POINT_SIZE, 0, 2*Math.PI);
                this.bpoints_ctx.fillStyle = 'yellow';
                this.bpoints_ctx.fill();
            }
            
        } 
    }
    
    private drawControlPolygon(control_points, draw_points = false){
        
        this.convex_context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
         
        let i = 0;
        while(i < control_points.length){
           let p0 = this.projectToCanvas(control_points[i]);
            
           if(draw_points){
                this.convex_context.beginPath();
                this.convex_context.arc(p0.x, p0.y, POINT_SIZE, 0, 2*Math.PI);
                this.convex_context.fillStyle = 'blue';
                this.convex_context.fill();
            }
            
           if((i+1) < control_points.length){
                let p1 = this.projectToCanvas(control_points[i+1]);
               
                //draw the control polygon
                this.convex_context.beginPath();
                this.convex_context.strokeStyle = '#0000ff';
                this.convex_context.lineWidth="3";
                this.convex_context.moveTo(p0.x, p0.y);
                this.convex_context.lineTo(p1.x, p1.y);
                this.convex_context.stroke(); // Draw it 
            }
            i++; 
        }  
    }
    
    private covnertToStdCoordinates(p){ //from canvas coord to std coord
        return new ControlPoint( p.x - (CANVAS_WIDTH / 2), (-1 * p.y) + (CANVAS_HEIGHT/2)); 
    }
    
    private projectToCanvas(p: ControlPoint){
       return new ControlPoint( p.x + (CANVAS_WIDTH / 2), (-1 * p.y) + (CANVAS_HEIGHT/2));   
    }
}

//work like vector
class ControlPoint{
    constructor(public x: number,
                public y: number) {
    }
    
    static times(k: number, v: ControlPoint) { return new ControlPoint(k * v.x, k * v.y); }
    static minus(v1: ControlPoint, v2: ControlPoint) { return new ControlPoint(v1.x - v2.x, v1.y - v2.y); }
    static plus(v1: ControlPoint, v2: ControlPoint) { return new ControlPoint(v1.x + v2.x, v1.y + v2.y); }
    static dot(v1: ControlPoint, v2: ControlPoint) { return v1.x * v2.x + v1.y * v2.y; }
    static mag(v: ControlPoint) { return Math.sqrt(v.x * v.x + v.y * v.y); }
    static mag2(v: ControlPoint) { return v.x * v.x + v.y * v.y }
    static norm(v: ControlPoint) {
        var mag = ControlPoint.mag(v);
        var div = (mag === 0) ? Infinity : 1.0 / mag;
        return ControlPoint.times(div, v);
    }
}

class Bezier{
    constructor(private cp: ControlPoint[],
                private degree: number
     ) {}
    
    private deCasteljau(j, u){ //i->degree, j->iterator, u->t
        if(this.degree == 0){
            return this.cp[j];   
        }
        
        return ControlPoint.plus(ControlPoint.times((1-u), this.deCasteljau(this.degree-1,j,u)), 
        ControlPoint.times(u, this.deCasteljau(this.degree-1,j+1,u)));
    }
    
    static approxHeight(startPoint: ControlPoint, endPoint: ControlPoint, midPoint: ControlPoint){
        
        let baseline_vector = ControlPoint.minus(endPoint, startPoint);
        let midpoint_vector = ControlPoint.minus(midPoint, startPoint);
        
        //find the projection of midpoint on baseline
        let scalar_proj = ControlPoint.dot(baseline_vector, midpoint_vector) / ControlPoint.mag2(baseline_vector);
        let proj_vector = ControlPoint.times(scalar_proj, baseline_vector);
        let height_vector = ControlPoint.minus(proj_vector, midpoint_vector);
        
        return ControlPoint.mag(height_vector);
    }
}

class BSpline{
    
    private DeBoorCache = new Map();
    private DeBoorNetCache = new Map();
    
    constructor(private cp: ControlPoint[],
                private degree: number, //p
                private order: number,
                private knots: number[]
     ) { 
    
        this.DeBoorCache = new Map();
        this.DeBoorNetCache = new Map();
    }
    
    validate(){
        
        if(typeof this.degree != "number" || typeof this.order != "number"){
            return false;
        }
        
        if(this.knots.length != this.degree + this.order + 1){
            return false;    
        }
        
        if(this.cp.length != this.order){
            return false;    
        }
        
        for(let i = 0; i < this.knots.length; i++){
            if(typeof this.knots[i] != "number"){
                return false;    
            }
        }
        
        for(let i = 0; i < this.cp.length; i++){
            if(typeof this.cp[i].x != "number" || typeof this.cp[i].y != "number"){
                return false;    
            }
        }
        
        return true;
    }
    
    samplePoints(){
        
        if(!$('#toggle-mode').prop('checked')){
            return this.adaptiveRendering();
        }else{
            return this.uniformRendering();
        }
        
    }
    
    addControlPoint(new_point){
        if(new_point){
            this.cp.push(new ControlPoint(new_point.x, new_point.y));
            this.knots = []; 
            
            if(this.cp.length > this.degree){
                this.order = this.cp.length;
                
                let knot_count = this.degree + this.order + 1;
                let uniform_count = this.order - this.degree;
                let step = Number((1 / uniform_count).toFixed(2));
                for(let i = 0; i < knot_count; i++){
                    if(i <= this.degree){
                        this.knots.push(0);    
                    }else if(i >= this.order){
                        this.knots.push(1);
                    }else{
                        let step_val = Number(((i - this.degree) * step).toFixed(2));
                        this.knots.push(step_val);
                    }
                }
                
                this.DeBoorCache = new Map();
                
                return true;
            }
        }
        
        return false;
    }
    
    private uniformRendering(){
        
        let sample_pts = [], step = $( "#spinner-uniform" ).spinner("value");
        
        if(step == "" || step <= 0 || step == null){
            return [];
        }
        
        let u_start = this.knots[this.degree], u_end = this.knots[this.order];
        let u_range = u_end - u_start;
        
        if(u_range == 0){
            u_range = 1;
            u_end = this.knots[this.degree + 1];     
        }
        
        let u_step  = u_range / step;

        for (let i = u_start; i <= u_end; i += u_step) {
          //if (i > this.knots.length) break;
          //sample_pts.push(this.deCasteljau(this.degree, 0, i));
            
          let val = this.deBoor(parseFloat(i.toFixed(2))); //floating point error! accumulating...
          if(val){
             sample_pts.push(val); 
          }
          
        }
        
        return sample_pts;
    }
    
    private findCurveHeight(u0: number, u1: number){
        let start_pt = this.deBoor(u0);
        let end_pt   = this.deBoor(u1);
        
        let mid_knot = parseFloat(((u0 + u1) / 2).toFixed(2));
        let mid_pt   = this.deBoor(mid_knot);
        
        return Bezier.approxHeight(start_pt, end_pt, mid_pt);
    }
    
    private extractBezier(u0: number, u1: number, threshold: number){
        
        if(this.findCurveHeight(u0, u1) <= threshold){
            return [this.deBoor(u0), this.deBoor(u1)];
        }
        
        let mid_knot = parseFloat(((u0 + u1) / 2).toFixed(2));
        return this.extractBezier(u0, mid_knot, threshold).concat(this.extractBezier(mid_knot, u1, threshold));
        
    }
    
    private adaptiveRendering(){
        
        let threshold = 1;
        if($("#spinner-adaptive").spinner("value") != "" && $("#spinner-adaptive").spinner("value") != null){
           let curve_height = this.findCurveHeight(this.knots[this.degree], this.knots[this.order])
           threshold = curve_height * (1 / parseFloat($("#spinner-adaptive").val()));    
        }
        
        if(threshold == "" || threshold <= 0 || threshold == null){
            console.log("zero caught!!!");
            return [];
        }
        
        return this.extractBezier(this.knots[this.degree], this.knots[this.order], threshold);
    }
    
    getInfo(){
        return {"degree": this.degree, "order": this.order, "cp": this.cp, "knots": this.knots};    
    }
    
    getControlPoints(){
        return this.cp;    
    }
    
    getDeBoorPoint(u){
        return this.deBoor(u);    
    }
    
    getDeBoorNet(u){
        if(!this.DeBoorNetCache.has(parseFloat(u))){
            return [];    
        }
        return this.DeBoorNetCache.get(parseFloat(u));
    }
    
    private deBoor(u){
        
        if(this.DeBoorCache.has(parseFloat(u))){
            return this.DeBoorCache.get(parseFloat(u));
        }
        
        let k :number;
        let s :number = 0;
        
        this.traces = [];
        
        //find k
        for(let i = 1; i < this.knots.length - 1; i++){
            
            if(u >= this.knots[i] && u <= this.knots[i+1]){
                k = i;
            }
            
            if(u == this.knots[i]){
                s++;
            }
        }
        
        //validation
        if(k == undefined){
            return false;    
        }
        
        let _cp    = this.cp.slice();
        let _knots = this.knots.slice();
        
        let h :number = this.degree - s;
        let traces = [];
        
        //console.log(`h = ${h} k = ${k} s = ${s} u = ${u}`);
        
        for(let i = 1; i <= h; i++){
            
            let _cpk :ControlPoint[] = [];
            for(let j = k - this.degree + i; j <= k - s; j++){
                
                 if(j >= _cp.length){
                    continue;    
                 }
                 let a = (u - _knots[j]) / (_knots[j+this.degree-(i-1)] - _knots[j]);
                
                 let _p = ControlPoint.plus(ControlPoint.times((1-a), _cp[j-1]), 
                                    ControlPoint.times(a, _cp[j]));
                
                 _cpk.push(_p);  
            }
            
            if(_cpk.length == 1){
                this.DeBoorNetCache.set(parseFloat(u), traces);
                this.DeBoorCache.set(parseFloat(u), _cpk[0]);
                return _cpk[0];
            }else{
                traces.push(_cpk); 
            }
            
            //recontruct the control point array
            let _cp_start = _cp.slice(0, k-this.degree+i);
            let _cp_end = _cp.slice(k-s);
            _cp = _cp_start.concat(_cpk).concat(_cp_end);
           
        }
        
        this.DeBoorCache.set(parseFloat(u), this.cp[k - this.degree]);
        return this.cp[k - this.degree];
        //return false;
    }
    
    insertKnot(u){
        
        let k :number;
        let s :number = 0;
        
        //find k
        for(let i = 0; i < this.knots.length - 1; i++){
            console.log(`Comparing ${u} and ${this.knots[i]} and ${this.knots[i+1]}`);
            
            if(u >= this.knots[i] && u < this.knots[i+1]){
                k = i;
            }
            
            if(u == this.knots[i]){
                s++;
            }
        }
        
        //validation
        if(k == undefined){
            console.log("unable to find k");
            return false;    
        }
        
        let h :number = this.degree - s;
        
        //console.log(`h = ${h} k = ${k} s = ${s}`);
        
        for(let i = 1; i <= h; i++){
            
            let _cpk :ControlPoint[] = [];
            for(let j = k - this.degree + i; j <= k - s; j++){
                 let a = (u - this._knots[j]) / (this._knots[j+this.degree-(i-1)] - this._knots[j]);
                 _cpk.push(ControlPoint.plus(ControlPoint.times((1-a), this._cp[j-1]), 
                                    ControlPoint.times(a, this._cp[j])));  
            }
            
            //recontruct the control point array
            let _cp_start = this._cp.slice(0, k-this.degree+i);
            let _cp_end = this._cp.slice(k-s);
            this._cp = _cp_start.concat(_cpk).concat(_cp_end);
            this._knots.splice(k+1, 0, u);
           
        }
        
        return true;
    }
}

class FileParser{
    static parse(f: string){
        if(!f || 0 === f.length){
            return false;    
        }
        
        let _degree: number, _order: number, knots: number[], 
        cp: ControlPoint[] = [];
        
        let lines: string[] = f.split("\n")
        .filter((l) => {
            if(l.trim().length > 0){
                return l;
            }
        })
        .forEach((val, index) => {
            
            switch(index){
                case 0:
                    let _t = val.trim().split(/\s+/).map((x) => {
                       return parseInt(x);   
                    });
                    
                    _degree = _t[0];
                    _order  = _t[1]; 
                break;    
                case 1:
                    knots = val.trim().split(/\s+/).map((k) => {
                        return parseFloat(k);   
                    });
                break;
                default:
                    let _cp = val.trim().split(/\s+/).filter((x) => {
                       return x;   
                    });
                    cp.push(new ControlPoint(parseFloat(_cp[0]), parseFloat(_cp[1]))); 
                break;
            }
        });
        
        return new BSpline(cp, _degree, _order, knots);
    } 
}

function checkBrowserSupport(){
   if (window.File && window.FileReader && window.FileList && window.Blob) {
      return true;
    } else {
      return false;
    } 
}

$(function() {
   if(!checkBrowserSupport){
      alert('The File APIs are not fully supported in this browser.');
       return;
    }
   
  var curve_canv    = document.getElementById("curve");  
  var curve_ctx     = curve_canv.getContext("2d");
  var axis_canv     = document.getElementById("axis");  
  var axis_ctx      = axis_canv.getContext("2d");
  var convex_canv   = document.getElementById("convex");  
  var convex_ctx    = convex_canv.getContext("2d");
  var points_canv   = document.getElementById("points");  
  var points_ctx    = points_canv.getContext("2d");
  var bpoints_canv  = document.getElementById("bpoints");
  var bpoints_ctx   = bpoints_canv.getContext("2d");
  var touch_canv    = document.getElementById("touch");
  var touch_ctx     = touch_canv.getContext("2d");
    
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
    
  let app = new CurveRenderer(curve_ctx, axis_ctx, convex_ctx, points_ctx, bpoints_ctx);
    
  $("#spinner-uniform").spinner({
    max: 100,
    min: 1
  }).on( "spinstop", function( event, ui ) {
      app.updateCurve();
  });
    
  $("#spinner-adaptive").spinner({
    max: 100,
    min: 1
  }).on( "spinstop", function( event, ui ) {
      app.updateCurve();
  });
    
  $( "#spinner-uniform" ).spinner( "value", 100 );
  $( "#spinner-adaptive" ).spinner( "value", 100 );
    
  $('#toggle-points').change(function() {
      if($(this).prop('checked')){ //show
          $("canvas#points").css("display", "block");
      }else{
          $("canvas#points").css("display", "none");
      }
  });
    
  $('#toggle-convex').change(function() {
      if($(this).prop('checked')){ //show
          $("canvas#convex").css("display", "block");
      }else{
          $("canvas#convex").css("display", "none");
      }
  });
    
  $('#toggle-mode').change(function() {
      if($(this).prop('checked')){ //show
          $("p#uniform").css("display", "block");
          $("p#adaptive").css("display", "none");
      }else{
          $("p#uniform").css("display", "none");
          $("p#adaptive").css("display", "block");
      }
      
      app.updateCurve();
  });
    
  $('#deboor').keydown(function( event ) {
      if ( event.which == 13 ) {
        app.drawDeBoorNet();
        event.preventDefault();
      }
  });
    
  //click action
    $("button.start-draw").on("click", function(){
        app.toggleDrawMode(true); 
    });
    
    $("input[name='optionsRadios']").on("change", function(){
        app.toggleDrawMode(true);
    });
    
    $("button.clear-board").on("click", function(){
        app.toggleDrawMode(true);
    });
    
    $("button.output").on("click", function(){
        if(app.isDrawMode()){
            app.displayBsplineFileStruct();
        }
    });
    
   // Setup the dnd listeners.
  document.getElementById('upload-file-selector').addEventListener('change', function(evt){
      app.toggleDrawMode(false);
      app.handleFileSelect(evt);
      this.value = '';
  }, false);
    
  touch_canv.addEventListener('mousedown', function(evt) {

      if(app.isDrawMode()){
          var mousePos = getMousePos(touch_canv, evt);
          app.addPointToBSpline(mousePos);
      }
    
  }, false);
    
    $(document).keypress(function(event) {
        
        if(event.charCode == 97){ //a
           $('#toggle-mode').bootstrapToggle('off'); 
        }
        
        if(event.charCode == 112){ //p
            $('#toggle-points').bootstrapToggle('toggle');
        }
        
        if(event.charCode == 99){ //c
            $('#toggle-convex').bootstrapToggle('toggle');
        }
        
        if(event.charCode == 43){ //+
            if($('#toggle-mode').prop('checked')){
                $( "#spinner-uniform" ).spinner( "stepUp" );
            }else{
                $( "#spinner-adaptive" ).spinner( "stepUp" );
            }
        }
        
        if(event.charCode == 95){ //-
            if($('#toggle-mode').prop('checked')){
                $( "#spinner-uniform" ).spinner( "stepDown" );
            }else{
                $( "#spinner-adaptive" ).spinner( "stepDown" );
            }
        }
    });
    
});