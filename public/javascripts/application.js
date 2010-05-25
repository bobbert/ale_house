var ale_houses = {};
var map;
var neighborhood_center;
var current_marker;

$(document).ready(function() {
  var convention_center = new google.maps.LatLng(39.285685,-76.616936);
  neighborhood_center = new google.maps.LatLng(39.283925,-76.597967);    
  
  map = new google.maps.Map(document.getElementById("map_canvas"), {
    zoom: 14,
    center: neighborhood_center,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false
  });

  var marker = new google.maps.Marker({
    position: convention_center,
    map: map,
    icon: 'images/red_flag_30.png',
    title: "Railsconf - at the Baltimore Convention Center"
  });

  var navLinks = $("#nav a"), listings = $('#ale_house_listing');

  navLinks.click(function(event) {
    var link = $(this);
    if (!link.hasClass('active')) {
      // Hide listings box
      listings.slideUp();

      // Un-select active links
      navLinks.removeClass('active');

      // Select active link and 
      link.addClass('active');

      // Clear any description currently shown
      $('#description_container p').text('');

      clearMarker();
      map.panTo(neighborhood_center);

      $.get(this.id, function(data) {
        listings.html(data).slideDown(function() {
          $('dl dt:first a').click();
        });
      });
    }
  });

  var activeNeighborhoodLink = window.location.hash ? $('a[href$="' + window.location.hash + '"]') : navLinks.filter(':first');
  activeNeighborhoodLink.click();
  activeNeighborhoodLink.addClass('active');

  $('.locations a.ale_house').live('click', function(event) {
    event.preventDefault();
    var link = $(this);
    if (!link.hasClass('active')) {

      // Remove the active class from everyone but the current selection
      $('ul.locations a.active').removeClass('active');
      link.addClass('active');

      // Add the description for this ale house to the page
      $('#description_container p').text(ale_houses[this.id]['description']);

      clearMarker();

      // Create a marker for the current selection
      var current_position = ale_houses[this.id]['position'];
      current_marker = new google.maps.Marker({
        position: current_position,
        map: map,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=bar|8fb220',
        title: link.text(),
        clickable: true,
        : 'selected-ale-house'
      });
      $('.selected-ale-house').bind('hover', function(e) { return showPreviewer(e) }, 
                                   function() { return hidePreviewer() }
      );

      // Move the map to the new selection
      map.panTo(current_position);
    }
  });

  function clearMarker() {
    if(typeof(current_marker) != 'undefined'){
      current_marker.setMap(null);
    } 
  }

  //--- Previewer Code ---

  // loads previewer
  showPreviewer = function(e) {
    if ( $("#previewer").length == 0) {
      $("body").append("<p id='previewer' style='display:none;'></p>");
    }
    loadImage(e, $(this).attr('pic_url') + '?size=' + getSize(window.innerHeight, window.innerWidth));
  }
  hidePreviewer = function() {
    $("#previewer").remove();
  }
  // calculates X offset: show pic right of cursor normally, or left of cursor if image would get clipped off
  // the right edge.
  xOffset = function(e) {
    var xAbsPosition = e.pageX - $(window).scrollLeft();
    var xDistanceFromRightEnd = window.innerWidth - xAbsPosition - $("#previewer").innerWidth() - 30;
    return (xDistanceFromRightEnd > 0) ? 15 : (-15 - $("#previewer").innerWidth());
  }
  // calculate Y offset: directly under cursor normally, or along bottom edge if image would get clipped
  // off the bottom edge.
  yOffset = function(e)  {
    var yAbsPosition = e.pageY - $(window).scrollTop();
    var yDistanceFromBottom = $(window).height() - yAbsPosition - $("#previewer").innerHeight() - 30;
    return (yDistanceFromBottom > 0) ? 30 : (30 + yDistanceFromBottom);
  }
  // creating body of previewer
  createPreviewer = function(parent_el_id, cap) {
    img = $('#' + parent_el_id).find('img');
    $("#previewer").append(img.clone()).append('<br />' + cap).css("max-width",img.attr('width') + "px");
  }
  // positioning previewer based on X and Y offset from cursor
  positionPreviewer = function(e) {
    $("#previewer").css("top",(e.pageY + yOffset(e)) + "px").css("left",(e.pageX + xOffset(e)) + "px");
  }
  // getting parameters for loading alehouse previewer via XML
  loadImage = function(e, content_url) {
    $.ajax({
      type: "GET",
      url: content_url,
      dataType: "html",
      success: function(e, html) { 
        $("#previewer").append(html).show();
        positionPreviewer(e);
      }
    });
  }

});
