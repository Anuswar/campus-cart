$(document).ready(function () {
  const $sidebar = $("#sidebar");
  const $pageContent = $("#page-content");
  const $sections = $(".section");
  const $overlay = $("#overlay");
  const $navLinks = $(".nav-link");

  // Initially show only the "Dashboard" section
  $sections.addClass("hidden");
  $("#Dashboard").removeClass("hidden");

  // Toggle Sidebar Visibility
  $("#toggle-sidebar").on("click", function () {
    if (window.innerWidth > 991) {
      $sidebar.toggleClass("hidden");
      $pageContent.toggleClass("full");
    } else {
      $sidebar.addClass("active");
      $overlay.addClass("active");
    }
  });

  // Close Sidebar and Overlay for Small Screens
  $("#close-sidebar, #overlay").on("click", function () {
    $sidebar.removeClass("active");
    $overlay.removeClass("active");
  });

  // Adjust Sidebar Visibility on Window Resize
  $(window)
    .on("resize", function () {
      if (window.innerWidth > 991) {
        $sidebar.removeClass("hidden active");
        $pageContent.removeClass("full");
        $overlay.removeClass("active");
      } else {
        $sidebar.addClass("hidden");
      }
    })
    .trigger("resize");

  // Toggle Sections Based on Sidebar Navigation
  $(".toggle-section").on("click", function (e) {
    e.preventDefault();
    const target = $(this).data("target");
    $sections.addClass("hidden");
    $(target).removeClass("hidden");
    $sidebar.removeClass("active");
    $overlay.removeClass("active");

    // Update Active Link
    $navLinks.removeClass("active");
    $(this).addClass("active");
  });

  // Set Active Link on Page Load
  function setActiveLinkOnLoad() {
    const visibleSection = $sections.filter(":not(.hidden)").attr("id");
    if (visibleSection) {
      $navLinks.removeClass("active");
      $navLinks.filter(`[data-target="#${visibleSection}"]`).addClass("active");
    }
  }

  // Highlight Active Link
  $navLinks.on("click", function () {
    $navLinks.removeClass("active");
    $(this).addClass("active");
  });

  // Call setActiveLinkOnLoad to ensure correct active link after page load
  setActiveLinkOnLoad();
});
