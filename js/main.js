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
      this.initListeners();
    };

    App.prototype.initListeners = function(){
      var that = this;
      
      $('.nav-link').on('click', function(){
        that.showContent($(this).attr('href'))
      });      
      
    };
    
    App.prototype.showContent = function(href){
      var $content = $(href),
          $link = $('.nav-link[href="'+href+'"]');
          
      $('.nav-link, .image-container').removeClass('active');
      
      $link.addClass('active');
      $content.addClass('active');
    };


    return App;

  })();

  $(function() {
    return new App({});
  });

}).call(this);

