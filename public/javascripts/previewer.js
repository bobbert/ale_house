jQuery(function($){
  // called when the user hovers over a photo thumbnail
  $('.img_expand').hover(function(e) {
    var preview_img =  $(this).next('span').find('img');
    this.tmp_title = this.title;
    this.title = "";
    if( preview_img.length > 0 )  {
      $("body").append(renderPreviewer(true, this.tmp_title));
      positionPreviewer(e);
    }
    else {
      $("body").append(renderPreviewer(false));
      loadImage(e, $(this).attr('pic_url') + '?size=' + getSize(window.innerHeight, window.innerWidth));
    }
  },
  function() {
    this.title = this.tmp_title;
    $("#previewer").remove();
  });

  // repositions previewer
  $('.img_expand').mousemove(function(e) {
    positionPreviewer(e);
  });

  // creates HTML for previewer window
  renderPreviewer = function(is_visible, current_title = "") {
    if (is_visible) {
      return "<p id='previewer' style='max-width:" + preview_img.attr('width') + 
             "px'><img src='"+ preview_img.attr('src') +"' alt='Image preview' /><br />" + 
                               current_title +"</p>"
    } else {
      return "<p id='previewer' style='display:none;'></p>"
    }
  }

  // calculates X offset: show pic right of cursor normally, or left of cursor if image would get clipped off
  // the right edge.
  xOffset = function(e) {
    var xAbsPosition = e.pageX -  $(window).scrollLeft();
    var xDistanceFromRightEnd = window.innerWidth - xAbsPosition - $("#previewer").innerWidth() - 30;
    return (xDistanceFromRightEnd > 0) ? 15 : (-15 - $("#previewer").innerWidth());
  }

  // calculate Y offset: directly under cursor normally, or along bottom edge if image would get clipped
  // off the bottom edge.
  yOffset = function(e)  {
    var yAbsPosition = e.pageY -  $(window).scrollTop();
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

  // get image size based on dimensions
  getSize = function(h, w) {
    if ((h > 480) && (w > 1440)) { return "L"; }
    else if ((h > 360) && (w > 960)) { return "M"; }
    else { return "S"; }
  }

  // getting parameters for loading image via XML
  loadImage = function(e, pic_url) {
    $.ajax({
      type: "GET",
      url: pic_url,
      dataType: "xml",
      success: function(xml) { return parsePictureXml(e, xml) }
    });
  }

  // saving image into DOM then loading previewer
  parsePictureXml = function(e, xml) {
    // find picture and append contents to image viewer
    $(xml).find("picture").each(function()
    {
      var parent_el_id = $(this).find("id").text();
      var photo_url = $(this).find("photo").text();
      var photo_cap = $(this).find("caption").text();
      var img = new Image();
  
      // run previewer-loading code after image loads
      $(img).load(function () {
        $('#' + parent_el_id).append($(this));
        createPreviewer( parent_el_id, photo_cap );
        positionPreviewer( e );
	$("#previewer").show()
      }).attr('src', photo_url);
    });
  }

});