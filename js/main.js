(function() {
  var App;

  App = (function() {
    function App(options) {
      var defaults = {
        debug: false
      };
      this.options = $.extend(defaults, options);
      this.init();      
    }   
    
    App.prototype.init = function(){
      this.initDraggable();
      this.initListeners();
    };
    
    App.prototype.initDraggable = function(){
      var that = this;
      
      $('.handle').draggable({
        containment: 'parent',
        drag: function(event, ui) {
          var $parent = $(this).closest('.image-container'); 
          that.updateMatrix($parent);  
          
        }, stop: function(event, ui) {
          var $parent = $(this).closest('.image-container');         
          that.updateMatrix($parent);          
        }
      });
    };
    
    App.prototype.initListeners = function(){
      var that = this;
      
      $('.warp-link').on('click', function(){
        that.doWarp();
      });
    };
    
    App.prototype.doTransform = function($el, c){
      var w = $el.width(), 
          h = $el.height(),
          transform_string = $T.transform2dString(w, h, c.x1, c.y1, c.x2, c.y2, c.x3, c.y3, c.x4, c.y4);       
      
      //console.log('w: ', w, 'h: ', h);
      //console.log('(',c.x1,',', c.y1,')', '(',c.x2,',', c.y2,')', '(',c.x3,',', c.y3,')', '(',c.x4,',', c.y4,')');       
      //console.log(transform_string);
      
      this.transformElement($el, transform_string);
    };
    
    App.prototype.doWarp = function(){
      var that = this,
          $master = $('.master').first(),
          $matrix = $master.find
          mc = this.getHandleCoordinates($master),
          $slaves = $('.slave');
      
      $slaves.each(function(){        
        var $matrix = $(this).find('.image-section-matrix').first(),
            $image = $(this).find('.image').first(),
            sc = that.getHandleCoordinates($(this)),
            c = that.getTransformationCoordinates($image, $matrix, mc, sc);
        
        // console.log(c)
        that.doTransform($image, c);
      });
      
    };
    
    App.prototype.getElementCoordinates = function($el){
      var w = $el.width(), h = $el.height(),      
          x1 = $el.position().left, y1 = $el.position().top,                   
          x2= x1+w, y2 = y1,  
          x3 = x1, y3 = y1+h,        
          x4 = x1+w, y4 = y1+h;      
      return {
        x1: x1, x2: x2, x3: x3, x4: x4,
        y1: y1, y2: y2, y3: y3, y4: y4
      }
    };
    
    App.prototype.getHandleCoordinates = function($container){
      var $tl = $container.children('.tl').first(),
          $tr = $container.children('.tr').first(),
          $bl = $container.children('.bl').first(),
          $br = $container.children('.br').first(),       
          x1 = $tl.position().left, y1 = $tl.position().top,          
          x2 = $tr.position().left, y2 = $tr.position().top,          
          x3 = $bl.position().left, y3 = $bl.position().top,          
          x4 = $br.position().left, y4 = $br.position().top;      
      return {
        x1: x1, x2: x2, x3: x3, x4: x4,
        y1: y1, y2: y2, y3: y3, y4: y4
      }
    };
    
    // determine transformation coordinates based on master/slave coordinates
    App.prototype.getTransformationCoordinates = function($el, $m, c1, c2){
      var c = this.getElementCoordinates($el),
          d = {
            x1: (c1.x1-c2.x1), y1: (c1.y1-c2.y1),
            x2: (c1.x2-c2.x2), y2: (c1.y2-c2.y2),
            x3: (c1.x3-c2.x3), y3: (c1.y3-c2.y3),
            x4: (c1.x4-c2.x4), y4: (c1.y4-c2.y4)
          };
      
      return {
        x1: Math.round(c.x1+d.x1), y1: Math.round(c.y1+d.y1),
        x2: Math.round(c.x2+d.x2), y2: Math.round(c.y2+d.y2),
        x3: Math.round(c.x3+d.x3), y3: Math.round(c.y3+d.y3),
        x4: Math.round(c.x4+d.x4), y4: Math.round(c.y4+d.y4)
      }
    };
    
    App.prototype.storeHandlePositions = function(){
      var $handles = $('.handle');
      
      // remember each handle's original (x,y)
      $handles.each(function(){
        $(this).data('start-x', parseInt($(this).position().left));
        $(this).data('start-y', parseInt($(this).position().top));
      });
    };
    
    App.prototype.transformElement = function($el, value) {
      $el.css({
        "webkitTransform": value,
        "MozTransform": value,
        "msTransform": value,
        "OTransform": value,
        "transform": value
      });
    };

    App.prototype.updateMatrix = function($container){
      var $matrix = $container.find('.image-section-matrix').first(),
          c = this.getHandleCoordinates($container);
          
      this.doTransform($matrix, c);
    };

    return App;

  })();

  $(function() {
    return new App({});
  });

}).call(this);

