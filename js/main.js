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
        $('.warp-tool').hide();
        $('.mask-tool').show();
        $('.container').addClass('mask-mode');
        $('body').trigger('mask-mode');
      });     
      
    };
    
    App.prototype.getQueryParamValue = function(param) {
      var url = document.location.search,
          params = {}, tokens,
          re = /[?&]?([^=]+)=([^&]*)/g;
          
      url = url.split("+").join(" ");
    
      while (tokens = re.exec(url)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
      }
    
      return params[param];
    };
    
    App.prototype.loadData = function(){
      var that = this,
          src = this.getQueryParamValue('source') || 'houston_bowery',
          url = 'data/'+src+'.json';
          
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

