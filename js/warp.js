(function() {
  var Warp;

  Warp = (function() {
    function Warp(options) {
      var defaults = {
        debug: false
      };
      this.options = $.extend(defaults, options);
      this.init();      
    }   
    
    Warp.prototype.init = function(){
      this.initDraggable();
      this.initListeners();
    };
    
    Warp.prototype.initDraggable = function(){
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
    
    Warp.prototype.initListeners = function(){
      var that = this;
      
      this.warpers = {};
      
      $('.warp-link').on('click', function(){
        that.findMaster();
        that.doWarp();
      });
      
      
    };
    
    Warp.prototype.coordinatesToPoints = function(c){
      return [
        new ImgWarper.Point(c.x1, c.y1),
        new ImgWarper.Point(c.x2, c.y2),
        new ImgWarper.Point(c.x3, c.y3),
        new ImgWarper.Point(c.x4, c.y4)
      ];      
    };
    
    Warp.prototype.distance = function(x1, y1, x2, y2) {
      var xs = x2 - x1;
      xs = xs * xs;
      
      var ys = y2 - y1;
      ys = ys * ys;
      
      return Math.sqrt( xs + ys );
    };
    
    Warp.prototype.doImageWarp = function($canvas, $image, mc, sc) {
      var canvas = $canvas[0],
          id = $canvas.attr('id'),
          image = $image[0],
          ctx = canvas.getContext("2d"),
          imgData;
      
      // warper not initialized
      if (this.warpers[id] === undefined) {        
        ctx.clearRect(0, 0, canvas.width, canvas.height);        
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        imgData = ctx.getImageData(0, 0, image.width, image.height);
        this.warpers[id] = new ImgWarper.Warper(canvas, image, imgData);    
        $image.addClass('invisible');     
      }
      
      // do warp from slave to master coordinates
      this.warpers[id].warp(this.coordinatesToPoints(sc), this.coordinatesToPoints(mc));           
    };
    
    Warp.prototype.doTransform = function($el, c){
      var w = $el.width(), 
          h = $el.height(),
          transform_string = $T.transform2dString(w, h, c.x1, c.y1, c.x2, c.y2, c.x3, c.y3, c.x4, c.y4);       
      
      //console.log('w: ', w, 'h: ', h);
      //console.log('(',c.x1,',', c.y1,')', '(',c.x2,',', c.y2,')', '(',c.x3,',', c.y3,')', '(',c.x4,',', c.y4,')');       
      //console.log(transform_string);
      
      this.transformElement($el, transform_string);
    };
    
    Warp.prototype.doWarp = function(){
      var that = this,
          $master = $('.master').first(),
          mc = this.getHandleCoordinates($master),
          $slaves = $('.slave');
      
      $slaves.each(function(){        
        var $canvas = $(this).find('.canvas').first(),
            $image = $(this).find('.image').first(),
            sc = that.getHandleCoordinates($(this));
        
        // console.log(mc, sc)
        that.doImageWarp($canvas, $image, mc, sc);
      });
      
      $('.image-section-matrix, .handle').hide();
      
    };
    
    Warp.prototype.findMaster = function(){
      var that = this,
          max = 0,
          master_i = 0;
      
      // make all slave
      $('.image-container').removeClass('master').addClass('slave');
      
      // find image container with biggest matrix
      $('.image-container').each(function(i){
        var c = that.getHandleCoordinates($(this)),
            diagonal = that.distance(c.x1, c.y1, c.x2, c.y2);            
        if (diagonal > max) {
          max = diagonal
          master_i = i;
        }        
      });
      
      // make it master
      $('.image-container').eq(master_i).removeClass('slave').addClass('master');
    };
    
    Warp.prototype.getElementCoordinates = function($el){
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
    
    Warp.prototype.getHandleCoordinates = function($container){
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
    
    Warp.prototype.storeHandlePositions = function(){
      var $handles = $('.handle');
      
      // remember each handle's original (x,y)
      $handles.each(function(){
        $(this).data('start-x', parseInt($(this).position().left));
        $(this).data('start-y', parseInt($(this).position().top));
      });
    };
    
    Warp.prototype.transformElement = function($el, value) {
      $el.css({
        "webkitTransform": value,
        "MozTransform": value,
        "msTransform": value,
        "OTransform": value,
        "transform": value
      });
    };

    Warp.prototype.updateMatrix = function($container){
      var $matrix = $container.find('.image-section-matrix').first(),
          c = this.getHandleCoordinates($container);
          
      this.doTransform($matrix, c);
    };

    return Warp;

  })();

  $(function() {
    return new Warp({});
  });

}).call(this);

