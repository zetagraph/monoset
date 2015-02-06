(function ($, Drupal) {

  Drupal.behaviors.frontPage = {
    attach: function (context, settings) {

      //  Animations

      $(function() {
        new WOW().init();
      });

    }
  };
})(jQuery, Drupal);
