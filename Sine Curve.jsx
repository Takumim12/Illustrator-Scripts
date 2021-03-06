


//set____________________________________________

var magnification_ratio = 10;
var loop_times = 8;
var curv = 0;

//バージョン管理____________________________________________
function Origin(){
    var ver15_or_later = (parseFloat(version.substr(0, 2)) >= 15); // CS5 or later
    var ver14 = (version.substr(0, 2) == "14"); // CS4

    if(ver15_or_later){
        var saved_coord_system = app.coordinateSystem;
        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

        var idx  = app.activeDocument.artboards.getActiveArtboardIndex();
        var ab  = app.activeDocument.artboards[idx];

        var o   = ab.rulerOrigin;
        var r   = ab.artboardRect;
        var saved_origin = [o[0], o[1]];
        ab.rulerOrigin = [0, r[1] - r[3]];

    } else if(ver14){
        var o = app.activeDocument.rulerOrigin;
        var saved_origin = [o[0], o[1]];
        app.activeDocument.rulerOrigin = [0, 0];
    }

    this.restore = function(){
        if(ver15_or_later){
            ab.rulerOrigin = saved_origin;
            app.coordinateSystem = saved_coord_system;

        } else if(ver14){
            app.activeDocument.rulerOrigin = saved_origin;
        }
    };

    return this;
}

//____________________________________________
var g_origin = Origin();

main();

g_origin.restore();

function main(){
  loop_times = prompt("波数",loop_times)
  curv = prompt("曲度率", curv);
  if(documents.length<1) return;
  with(activeDocument.activeLayer){
    if(locked || !visible){
      alert("please unlock and show the active layer to draw");
      return;
    }
  }

  var path = activeDocument.activeLayer.pathItems.add();
  with(path){
    closed = false;
    filled = false;
    stroked = true;
    strokeWidth = 1.0;
    strokeColor = new GrayColor();
    strokeColor.gray = 100;
  }
  var r2 = Math.sqrt(2);
  var p  = Math.PI / 12;

  // list of coordinate for [anchor, rightDirection, leftDirection]
  var pnts = [
    [[0,0], [p, (2 * r2 - 1)/7], [-p, -(2 * r2 - 1)/7]],
    [[p*3, r2/2], [p*4, (3 * r2 + 2)/7], [p*2, (4 * r2 - 2)/7]],
    [[p*6, 1], [p*7, 1], [p*5, 1]],
    [[p*9, r2/2], [p*10, (4 * r2 - 2)/7], [p*8, (3 * r2 + 2)/7]]
    ];

  loop_times *= 2;
  var j;
  for(var i = 0; i < loop_times; i++){
    for(j=0; j<pnts.length; j++){
      with(path.pathPoints.add()){
        anchor = mul(pnts[j][0], i);
        rightDirection = mul(pnts[j][1], i);
        leftDirection = mul(pnts[j][2], i);
      }
    }
  }
  with(path.pathPoints.add()){
    anchor = mul(pnts[0][0], i);
    rightDirection = mul(pnts[0][1], i);
    leftDirection = mul(pnts[0][2], i);
  }
}

function mul(ar, i){

  return [(ar[0] + (i * Math.PI)) * magnification_ratio,
          ar[1] * (magnification_ratio+(i*curv)) * (i % 2 ? -1 : 1)];
}
