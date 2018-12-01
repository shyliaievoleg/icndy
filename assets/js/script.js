// Artworks gallery slider
$(document).ready(function () {
  $("#js_gallery").owlCarousel({
    loop: true,
    nav: true,
    navText: ["Предыдущий", "Следующий"],
    dots: false,
    autoWidth: true,
    items: 1,
    lazyLoad: true,
    animateOut: 'fadeOutDown',
    animateIn: 'fadeInDown'
  });
});
