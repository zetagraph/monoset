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

      // Smooth Scroll to Application

      $(".scroll").click(function(event){ // When a link with the .scroll class is clicked
          event.preventDefault(); // Prevent the default action from occurring
          $('html,body').animate({scrollTop:$(this.hash).offset().top}, 500); // Animate the scroll to this link's href value
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
