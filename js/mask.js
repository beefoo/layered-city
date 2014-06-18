(function() {
  var Mask;

  Mask = (function() {
    function Mask(options) {
      var defaults = {
        debug: false,
        brush_size: 40
      };
      this.options = $.extend(defaults, options);
      this.init();      
    }   
    
    Mask.prototype.init = function(){      
      var that = this;
      
      this.mode = $('input[name="tool"]').val();
      
      $('body').bind('dom-ready', function(e){
        that.initAfterDOMReady();
      });
      
      $('body').bind('mask-mode', function(e){
        that.initCanvasMasks();
      });      
      
    };
    
    Mask.prototype.initAfterDOMReady = function(){
      var that = this;
      
      $('.reset-mask-link').on('click', function(){
        that.resetCanvasMasks();
      });
      
      $('input[name="tool"]').on('change', function(){
        var tool = $(this).val();
        
        that.mode = tool;
        
        if (tool=='brush') {
          $('.drawing-board').removeClass('active');
        } else {
          $('.drawing-board').addClass('active');
        }
      });
      
      this.initDrawingBoards();
    };
    
    Mask.prototype.initCanvasMasks = function(){
      var that = this;
      
      this.imgDataOriginal = {};
      
      $('.image-container .canvas').each(function(){
        that.initCanvasMask($(this));
      });
    };
    
    Mask.prototype.initCanvasMask = function($canvas){    
      var that = this,
          canvas = $canvas[0];
          
      // init lastXY
      this.lastX = null;
      this.lastY = null;
      
      // init masked context
      this.ctx = canvas.getContext("2d");
      
      // save original img data for resetting
      this.imgDataOriginal[$canvas.attr('id')] = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // drag events
      $canvas.hammer().on('dragstart',function(e){
        that.lastX = null;
        that.lastY = null;
        that.ctx = $(this)[0].getContext("2d");
        e.gesture.preventDefault();
        that.drawStart($(this), e);
      });
      $canvas.hammer().on('drag',function(e){
        e.gesture.preventDefault();
        that.draw($(this), e);
      });
      $canvas.hammer().on('dragend',function(e){
        e.gesture.preventDefault();
        that.drawStop($(this), e);
      });
      
      console.log('inialized masking for ', $canvas.attr('id'))
    };
    
    Mask.prototype.initDrawingBoards = function(){
      var that = this;
      
      $('.drawing-board').hammer().on('dragstart',function(e){        
        e.gesture.preventDefault();
        that.shapeStart($(this), e);
      });
      $('.drawing-board').hammer().on('drag',function(e){
        e.gesture.preventDefault();
        that.shape($(this), e);
      });
      $('.drawing-board').hammer().on('dragend',function(e){
        e.gesture.preventDefault();
        that.shapeStop($(this), e);
      });
    };
    
    Mask.prototype.drawStart = function($parent, e){      
      this.updateLastPos($parent, e);
      
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX,this.lastY);
      
      // console.log('moving to', this.lastX, this.lastY);
    };
    
    Mask.prototype.draw = function($parent, e){  
      this.updateLastPos($parent, e);
      
      var brush_size = this.options.brush_size,
          gradient_black = this.ctx.createRadialGradient(this.lastX, this.lastY, 0, this.lastX, this.lastY, brush_size);
          gradient_black.addColorStop(0, 'rgba(0, 0, 0, 1)');
          gradient_black.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
      this.ctx.arc(this.lastX, this.lastY, brush_size, 0, 2 * Math.PI);
      this.ctx.fillStyle = gradient_black;
      this.ctx.fill();
      
      // console.log('line to', this.lastX, this.lastY);
    };
    
    Mask.prototype.drawStop = function($parent, e){      
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.closePath();
  
      // console.log('last stroke', this.lastX, this.lastY);
    };
    
    Mask.prototype.shapeStart = function($parent, e){      
      var parentX = $parent.offset().left,
          parentY = $parent.offset().top,
          parentW = $parent.width(),
          parentH = $parent.height(),
          eventX = (e.gesture) ? e.gesture.center.pageX : e.originalEvent.pageX,
          eventY = (e.gesture) ? e.gesture.center.pageY : e.originalEvent.pageY,
          offsetX = eventX - parentX,
          offsetY = eventY - parentY;
      
      // set global vars        
      this.parentX = parentX;
      this.parentY = parentY;
      this.startX = offsetX;
      this.startY = offsetY;
      this.$shape = $parent.find('.shape');
      
      // update shape css      
      this.$shape.css({
        width: '0px',
        height: '0px',
        top: this.startX+'px',
        left: this.startY+'px',
        'border-radius': '0px'
      });
           
    };
    
    Mask.prototype.shape = function($parent, e){  
      var startX = this.startX,
          startY = this.startY,
          parentX = this.parentX,
          parentY = this.parentY,          
          eventX = e.gesture.center.pageX,
          eventY = e.gesture.center.pageY,
          offsetX = eventX - parentX,
          offsetY = eventY - parentY,
          width = Math.abs(offsetX-startX),
          height = Math.abs(offsetY-startY),
          left = (offsetX - startX < 0) ? offsetX : startX,
          top = (offsetY - startY < 0) ? offsetY : startY,
          radius_x = 0, radius_y = 0;
          
      if (this.mode=='ellipse') {
        radius_x = parseInt(width/2);
        radius_y = parseInt(height/2);
      }
      
      // update shape css 
      this.$shape.css({
        width: width+'px',
        height: height+'px',
        left: left+'px',
        top: top+'px',
        'border-radius': radius_x+'px / '+radius_y+'px'
      });
    };
    
    Mask.prototype.shapeStop = function($parent, e){      
      var $shape = this.$shape,
          x = parseInt($shape.css('left')),
          y = parseInt($shape.css('top')),
          w = parseInt($shape.width()),
          h = parseInt($shape.height()),
          rx = parseInt(w/2),
          ry = parseInt(h/2),          
          cx = x+rx,
          cy = y+ry,
          target = $parent.attr('data-target'),
          $canvas = $(target),
          canvas = $canvas[0],
          ctx = canvas.getContext("2d");
          
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      
      // make ellipse
      if (this.mode=='ellipse') {
        ctx.save();
        ctx.translate(cx-rx, cy-ry);
        ctx.scale(rx, ry);
        ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);
        ctx.restore();
        
      // make rectangle
      } else {
        ctx.rect(x, y, w, h);       
      }      
      
      // fill it
      ctx.fillStyle = "#000000";
      ctx.fill(); 
      ctx.globalCompositeOperation = 'source-over';
      ctx.closePath();
      
      // reset shape
      this.$shape.css({
        width: '0px',
        height: '0px',
        top: '0px',
        left: '0px',
        'border-radius': '0px'
      });
    };
    
    Mask.prototype.resetCanvasMasks = function(){
      var that = this;
      
      $('.image-container .canvas').each(function(){
        that.resetCanvasMask($(this));
      });
    };
    
    Mask.prototype.resetCanvasMask = function($canvas){
      var canvas = $canvas[0],
          ctx = canvas.getContext("2d"),
          imgData = this.imgDataOriginal[$canvas.attr('id')];
      
      if (imgData!==undefined)
        ctx.putImageData(imgData, 0, 0);  
    };
    
    Mask.prototype.updateLastPos = function($parent, e){
      var x = e.gesture.center.clientX,
          y = e.gesture.center.clientY;
      this.lastX = parseInt(x-$parent.offset().left);
      this.lastY = parseInt(y-$parent.offset().top);
    };
  
    return Mask;
  
  })();

  $(function() {
    return new Mask({});
  });

}).call(this);
