(function ($, Drupal) {

  Drupal.behaviors.customTweaks = {
    attach: function (context, settings) {
      $(window).scroll(function() {
        if ($(this).scrollTop() > 1){
          $('.header-main').addClass("sticky");
        }
        else {
          $('.header-main').removeClass("sticky");
        }
      });


      // Smooth Scroll

      $(function() {
        $('a[href*=#]:not([href=#])').click(function() {
          if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
              $('html,body').animate({
                scrollTop: target.offset().top
              }, 500);
              return false;
            }
          }
        });
      });

      // SVG Injector

      // For testing in IE8
      if (!window.console){ console = {log: function() {}}; };

      // Elements to inject
      var mySVGsToInject = document.querySelectorAll('img.inject-svg');

      // Options
      var injectorOptions = {
        evalScripts: 'once',
        each: function (svg) {
          // Callback after each SVG is injected
          if (svg) console.log('SVG injected: ' + svg.getAttribute('id'));
        }
      };

      // Trigger the injection
      SVGInjector(mySVGsToInject, injectorOptions, function (totalSVGsInjected) {
        // Callback after all SVGs are injected
        console.log('We injected ' + totalSVGsInjected + ' SVG(s)!');
      });

    }
  };
})(jQuery, Drupal);
