/*
 * Adapted from: 
 *  http://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript
 *  http://jsfiddle.net/dFrHS/1/
 */

(function() {
  
  window.$T = {};
  
  $T.adj = function(m) { // Compute the adjugate of m
    return [
      m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
      m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
      m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
    ];
  }
  
  $T.basisToPoints = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    var m = [
      x1, x2, x3,
      y1, y2, y3,
       1,  1,  1
    ];
    var v = $T.multmv($T.adj(m), [x4, y4, 1]);
    return $T.multmm(m, [
      v[0], 0, 0,
      0, v[1], 0,
      0, 0, v[2]
    ]);
  }
  
  $T.general2DProjection = function(
    x1s, y1s, x1d, y1d,
    x2s, y2s, x2d, y2d,
    x3s, y3s, x3d, y3d,
    x4s, y4s, x4d, y4d
  ) {
    var s = $T.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
    var d = $T.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
    return $T.multmm(d, $T.adj(s));
  };
  
  $T.multmm = function(a, b) { // multiply two matrices
    var c = Array(9);
    for (var i = 0; i != 3; ++i) {
      for (var j = 0; j != 3; ++j) {
        var cij = 0;
        for (var k = 0; k != 3; ++k) {
          cij += a[3*i + k]*b[3*k + j];
        }
        c[3*i + j] = cij;
      }
    }
    return c;
  }
  
  $T.multmv= function(m, v) { // multiply matrix and vector
    return [
      m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
      m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
      m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
    ];
  }
  
  $T.pdbg= function(m, v) {
    var r = $T.multmv(m, v);
    return r + " (" + r[0]/r[2] + ", " + r[1]/r[2] + ")";
  }
  
  $T.transform2d = function(w, h, x1, y1, x2, y2, x3, y3, x4, y4) {        
    var t = $T.general2DProjection(0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
     
    for(i = 0; i != 9; ++i) 
      t[i] = t[i]/t[8];
    
    return [t[0], t[3], 0, t[6],
            t[1], t[4], 0, t[7],
            0   , 0   , 1, 0   ,
            t[2], t[5], 0, t[8]];
    
  };
  
  $T.transform2dString = function(w, h, x1, y1, x2, y2, x3, y3, x4, y4) {        
    var t = $T.transform2d(w, h, x1, y1, x2, y2, x3, y3, x4, y4);
    
    return $T.transformToString(t);    
  };
  
  $T.transformToString = function(t){
    return "matrix3d(" + t.join(", ") + ")";
  };

})();
