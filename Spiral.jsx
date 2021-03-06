// Copyright(c) 2017 Takumi Maezawa
// Fri, 28 Feb 2017
//__________________________________

var pix = Math.PI;
var hpi = pix / 2;

//__________________________________
var radius_increment = 50;
var angle = 20 /180 * pix;
var roundnum=10;

//__________________________________
var handle = 4 / 3 * (1 - Math.cos( angle / 2 )) / Math.sin( angle / 2 );
var ver15_or_later = parseFloat(version.substr(0, 2)) >= 15;
var ver10 = (version.indexOf('10') == 0);

//バージョン管理__________________________________
function Origin(){
    var ver15_or_later = (parseFloat(version.substr(0, 2)) >= 15);
    var ver14 = (version.substr(0, 2) == "14");

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
// ---------------------------------------------------------

var g_origin = Origin();
uzumaki();
g_origin.restore();

// ----------------------------------------------
function uzumaki(){
  if(documents.length < 1) return;
  var lay = activeDocument.activeLayer;
  if(lay.locked || !lay.visible){
    alert("レイヤーがロックされているか可視状態にありません");
    return;
  }
  if(! ver10){
    roundnum = prompt("巻数", roundnum);
    radius_increment = prompt("巻幅", radius_increment);
    if(!roundnum
       || isNaN( roundnum )
       || roundnum < 2){
      return;
    }
    roundnum = parseInt( roundnum );
  }

  var angle_rate = Math.abs(angle / (2 * pix));
  radius_increment *= angle_rate;
  roundnum = roundnum / angle_rate + 2;

  var wi;
  var pnt = [[0,0]];
  var handles = [0];

  for(var i = 1; i < roundnum; i++){
    wi = radius_increment * i;
    pnt.push( pnt4angle(angle * i, wi) );
    handles.push( wi * handle );
  }

  //パス生成
  var pi = lay.pathItems.add();
  with(pi){
    closed = false;
    filled = false;
    stroked = true;
    strokeWidth = 1;
  }
  pi.setEntirePath(pnt);
  var p = pi.pathPoints;
  p[p.length-1].remove();
  roundnum -= 1;

  //ハンドルの定義
  var ti, hPnt;
  for(i = 1; i < roundnum; i++){
    ti = getRad(pnt[i-1], pnt[i+1]);
    hPnt = pnt4angle(ti, handles[i]);
    with(p[i]){
      rightDirection = addPnt(pnt[i], hPnt);
      leftDirection  = subPnt(pnt[i], hPnt);
      pointType = PointType.SMOOTH;
    }
  }

  // translate
    pi.translate(activeDocument.width / 2, activeDocument.height / 2);
}

//スパイラル式
// ----------------------------------------------
function getRad(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}
// ----------------------------------------------
function pnt4angle(t, m){
  return [Math.cos(t) * m, Math.sin(t) * m];
}
// ----------------------------------------------
function addPnt(p1, p2){
  return [p1[0] + p2[0], p1[1] + p2[1]];
}
// ----------------------------------------------
function subPnt(p1, p2){
  return [p1[0] - p2[0], p1[1] - p2[1]];
}
