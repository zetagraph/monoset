(function ($, Drupal) {

  Drupal.behaviors.customTweaks = {
    attach: function (context, settings) {

      // Smooth Scroll to Anchor Links
      $(function () {
        $('a[href*=#]:not([href=#])').click(function () {
          if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var headerHeight = $('.header-main').outerHeight();
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
              $('html,body').animate({
                scrollTop: target.offset().top - headerHeight
              }, 500);
              return false;
            }
          }
        });
      });

      // SVG Injector
      // For testing in IE8
      if (!window.console) {
        console = {
          log: function () {}
        };
      }

      // Elements to inject
      var mySVGsToInject = document.querySelectorAll('img.inject-svg');

      // Options
      var injectorOptions = {
        evalScripts: 'once',
        each: function (svg) {}
      };

      // Trigger the injection
      SVGInjector(mySVGsToInject, injectorOptions, function (totalSVGsInjected) {});

    }
  };
})(jQuery, Drupal);