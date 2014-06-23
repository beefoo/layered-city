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
      var that = this;
      
      this.loadData();
      
      $('body').bind('dom-ready', function(e){
        that.initAfterDOMReady();
      });
    };
    
    App.prototype.initAfterDOMReady = function(){
      this.initListeners();
    };

    App.prototype.initListeners = function(){
      var that = this;
      
      $('.nav-link').on('click', function(e){
        e.preventDefault();
        that.showContent($(this).attr('href'))
      });
      
      $('.warp-link').on('click', function(){
        $('.instructions').hide();
        $('.warp-tool').hide();
        $('.mask-tool').show();
        $('.container').addClass('mask-mode');
        $('body').trigger('mask-mode');
      });     
      
    };
    
    App.prototype.loadData = function(){
      var that = this,
          url = $('.content').attr('data-src'),
          query_src = helper.getQueryParamValue('src');          
      
      if (query_src) {
        url = 'data/'+query_src+'.json';
      }
       
      $.getJSON( url, function(data) {
        var assets = data.assets;
        
        that.loadView(assets);
      });      
    };
    
    App.prototype.loadView = function(assets){
      
      $.each(assets, function(i, asset){
        
        asset.active = (i<=0) ? 'active' : '';
        
        // add to nav
        var nav_link_tmpl = $('#nav-link-tmpl').html();
        Mustache.parse(nav_link_tmpl);
        var nav_link = Mustache.render(nav_link_tmpl, asset);
        $('.nav').append(nav_link);
        
        // add to content
        var content_tmpl = $('#content-tmpl').html();
        Mustache.parse(content_tmpl);
        var content = Mustache.render(content_tmpl, asset);
        $('.content').append(content);
        
      });
      
      $('body').trigger('dom-ready');    
      
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

