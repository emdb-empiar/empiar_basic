/*
 * Javascript functions that manage
 * communication with AstexViewer.
 */

function av_execute(command){
  document.av.debugOn();
  document.av.execute(command);
  window.status = command;
}

function av_transparency(obj, tr){
  av_execute("object '" + obj + "' transparency " + tr + ";");
}

function av_map_transparency(m, tr){
  av_execute("map model" + m + " contour 0 transparency " + tr + ";");
}

function av_gmm_transparency(m, tr){
  av_execute("map gmm" + m + " contour 0 transparency " + tr + ";");
}

function av_radius(tr){
  av_execute("radius " + tr + ";");
}

function av_clip(tr){
  av_execute("clip " + tr + "  -" + tr +";");
}

function av_map_level(m, l){
  av_execute("map model" + m + " -level " + l + ";map model" + m + " -reread true;");
}

function av_gmm_level(m, l){
  av_execute("map gmm" + m + " -level " + l + ";map gmm" + m + " -reread true;");
}

function av_display(obj, tr){
  var command = "object display '" + obj + "' " + tr + ";";
  av_execute(command);
}

function av_color(obj, tr){
  var command = "object '" + obj + "' color " + tr + ";";
  av_execute(command);
}

function av_map_color(m, c){
  var command = "map model" + m + " contour 0 color '" + c + "';";
  av_execute(command);
}

function av_gmm_color(m, c){
  var command = "map gmm" + m + " contour 0 color '" + c + "';";
  av_execute(command);
}

function av_background(tr){
  var command = "background '" + tr + "';";
  av_execute(command);
}


function av_map_conf(map, transform) {
  var command = "map model"+map+" matrix "+transform+";map model" + map + " -reread true;";
  av_execute(command);
}

function av_gmm_conf(gmm, transform) {
  var command = "map gmm"+gmm+" matrix "+transform+";map gmm" + gmm + " -reread true;";
  av_execute(command);
}

/*
 * Javascript functions that manage interaction with
 * controls on the page.
 */

function js_transparency_sel(sel){
  var val = sel.options[sel.selectedIndex].value;
  val = Math.round(val * 2.55);
  av_transparency('protein_surface', val);
}

function js_transparency(val){
  val = Math.round(val * 2.55);
  av_transparency('protein_surface', val);
}


function js_background(sel){
  var val = sel.options[sel.selectedIndex].value;
  av_background(val);
}

/* antialias and shadows no longer exposed in UI */
function js_antialias(sel){
  if(sel.checked){
    av_execute("view -antialias true;");
  }else{
    av_execute("view -antialias false;");
  }
}

function js_shadows(sel){
  if(sel.checked){
    av_execute("view -realspheres true; view -shadows true;");
  }else{
    av_execute("view -realspheres false; view -shadows false;");
  }
}

function js_map_solid(m, sel){
  if (sel.checked) {
    av_execute("map model" + m + " contour 0 'solid';"); 
  } else {
    av_execute("map model" + m + " contour 0 'wire'; ");
   }
}

function js_map(m, obj){
  if (obj.checked){
    av_execute("map model" + m + " contour 0 on; ");
  } else {
    av_execute("map model" + m + " contour 0 off; ");
  }
}

function js_gmm_solid(m, sel){
  if (sel.checked) {
    av_execute("map gmm" + m + " contour 0 'solid';"); 
  } else {
    av_execute("map gmm" + m + " contour 0 'wire'; ");
   }
}

function js_gmm(m, obj){
  if (obj.checked){
    av_execute("map gmm" + m + " contour 0 on; ");
  } else {
    av_execute("map gmm" + m + " contour 0 off; ");
  }
}

function js_map_toggle(obj){
   av_execute("map mapA contour 0 toggle; map mapA contour 1 toggle; map mapA contour 2 toggle; ");
}

function js_map_transparency_sel(sel){
  var val = sel.options[sel.selectedIndex].value;
  val = Math.round(val * 2.55);
  av_map_transparency(val);
}

function js_map_transparency(m, val){
  val = Math.round(val * 2.55);
  av_map_transparency(m, val);
}

function js_gmm_transparency(m, val){
  val = Math.round(val * 2.55);
  av_gmm_transparency(m, val);
}

function js_radius(m, val){
  /* We display view size, not radius, hence scaling with 0.5 */
  av_radius(val * 0.5);
}

function js_clip_sel(sel){
  /* We display view depth in the viewer, hence scaling with 0.5 */
  var val = sel.options[sel.selectedIndex].value * 0.5;
  av_clip(val);
}

function js_clip(m, val){
  av_clip(val * 0.5);
}

function js_map_color(m, val){
  av_map_color(m, val);
}

function js_map_color_sel(sel){
  var val = sel.options[sel.selectedIndex].value;
  av_map_color(val);
}

function js_gmm_color(m, val){
  av_gmm_color(m, val);
}

function js_map_level(m, val){
  av_map_level(m, val);
}

function js_gmm_level(m, val){
  av_gmm_level(m, val);
}

function js_map_level_sel(sel){
  var val = sel.options[sel.selectedIndex].value; 
  val = Math.round(val * 1.00);
  av_map_level(val);
}

function js_model(map, model, obj) {
  if (obj.checked){
    av_execute("object " + map + "_" + model + "_backboneTrace display on; ");
  } else {
    av_execute("object " + map + "_" + model + "_backboneTrace display off; ");
  }
}

function js_model2(model, obj) {
  if (obj.checked){
    av_execute("molecule display " + model + " on; ");
  } else {
    av_execute("molecule display " + model + " off; ");
  }
}

function js_map_conf(map, transform) {
  av_map_conf(map, transform);
}

function js_gmm_conf(gmm, transform) {
  av_gmm_conf(gmm, transform);
}

function js_reset(emId, level, transparency, radius, clip, models) {
  av_reset(emId, level, transparency, radius, clip, models);
}

function av_reset(emId, level, transparency, radius, clip, models) {
  // This is messy, setting the control value does not trigger the associated 
  // update.
  var background = "0xd3d3d3"; // light grey
  var emdId = 'model' + emId;
  document.getElementById("idBackground").value = background;
  document.getElementById('idMap').checked="checked";
  document.getElementById('idMapSolid').checked="checked";
  document.getElementById('idColor').color.fromString('ffa500');
  if (models.length > 0) {
    var mArr = models.split(",");
    var mLen = mArr.length;
    for (var m = 0; m < mLen; m++) {
      var model = 'id'+trim(mArr[m]).substring(1,5);
      document.getElementById(model).checked="checked";
    }
  }
  av_adjust_level(level);
  av_background(background);
  av_adjust_transparency(transparency);
  tr = Math.round(2.55 * transparency);
  av_adjust_radius(0.5 * radius);
  js_radius('', radius);
  av_adjust_clip(0.5 * clip);
  js_clip('', clip);
  av_execute("matrix 1.0 0.0 0.0 0.0 0.0 1.0 0.0 0.0 0.0 0.0 1.0 0.0 0.0 0.0 0.0 1.0;");
  av_execute("map "+emdId+" -color 0xffa500;");
  av_execute("map "+emdId+" -style 2;");
  av_execute("map "+emdId+" -transparency " + tr +";");
  av_execute("map "+emdId+" -show true;");
  av_execute("map "+emdId+" -level " + level + ";");
  av_execute("map "+emdId+" -reread true;");
  av_execute("center map "+emdId+";");
  av_execute("object * display on;"); // map and any model
}

/* Methods to update interface controls when the user used some other method to
 * change the controls, i.e., clicking c, r, drag shift */
function av_adjust_clip(clip) {
  var c = 2 * clip;
  s1.setValue(c);
  document.getElementById("h-value-1").innerHTML = "(" + s1.getValue() + ")";
}

function av_adjust_level(level) {
  s2.setValue(level);
  document.getElementById("h-value-2").innerHTML = "(" + s2.getValue() + ")";
}

function av_adjust_transparency(level) {
  s3.setValue(level);
  document.getElementById("h-value-3").innerHTML = "(" + s3.getValue() + ")";
}

function av_adjust_radius(radius) {
  var r = 2 * radius;
  s4.setValue(r);
  document.getElementById("h-value-4").innerHTML = "(" + s4.getValue() + ")";
}

function trim(str) {
  str = str.toString();
  var begin = 0;
  var end = str.length - 1;
  while (begin <= end && str.charCodeAt(begin) < 33) { ++begin; }
  while (end > begin && str.charCodeAt(end) < 33) { --end; }
  return str.substr(begin, end - begin + 1);
}
