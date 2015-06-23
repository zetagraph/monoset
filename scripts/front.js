(function ($, Drupal) {

  Drupal.behaviors.frontPage = {
    attach: function (context, settings) {

      //  Header Tweaks
      $(window).scroll(function () {
        if ($(this).scrollTop() > 1) {
          $('.header-main').addClass("sticky");
        }
        else {
          $('.header-main').removeClass("sticky");
        }
      });

      //  Animations
      $(function () {
        new WOW().init();
      });

    }
  };
})(jQuery, Drupal);