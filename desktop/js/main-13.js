function mainPageWidgetsInit () {
  twitterShareInit();
  gplusShareInit();
  facebookShareInit();
}

function twitterShareInit() {
  var e = document.createElement('script');
  e.type="text/javascript";
  e.async = true;
  e.src = '//platform.twitter.com/widgets.js';
  document.getElementsByTagName('head')[0].appendChild(e); //Twitter tracking
  if (!window.jQuery) {
    return;
  }
  jQuery(e).load(function() {
    twttr.events.bind('tweet', function (intent_event) {
      if (intent_event) {
        // console.log('tw');
        ga('send', 'event', 'Share', 'Twitter Share', document.location.href);
      }
    });

    twttr.events.bind('click', function (intent_event) {
      if (intent_event) {
        // console.log('tw cl');
        ga('send', 'event', 'Share', 'Twitter Click', document.location.href);
      }
    });
  });
}

var jsonpCallbacks = [];
function twitterCustomShareInit () {
  var btns = document.querySelectorAll
                ? document.querySelectorAll('.tl_twitter_share_btn')
                : [document.getElementById('tl_twitter_share_btn')];

  if (!btns.length) {
    return;
  }
  var head = document.getElementsByTagName('head')[0], i, script;
  for (i = 0; i < btns.length; i++) {
    (function (btn) {
      var status = btn.getAttribute('data-text'),
          url = btn.getAttribute('data-url') || location.toString() || 'https://telegram.org/',
          via = btn.getAttribute('data-via');

      script = document.createElement('script');
      script.type="text/javascript";
      script.async = true;
      script.src = 'https://cdn.api.twitter.com/1/urls/count.json?url=' + encodeURIComponent(url) + '&callback=jsonpCallbacks[' + jsonpCallbacks.length + ']&rnd=' + Math.random();
      head.appendChild(script);

      var urlEncoded = encodeURIComponent(url),
          popupUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(status) + '&url=' + urlEncoded + '&via=' + encodeURIComponent(via);

      jsonpCallbacks.push(function (data) {
        var cnt = btn.getElementsByTagName('span')[0]
        if (cnt && data.count) {
          cnt.innerHTML = data.count;
          cnt.style.display = 'inline';
        }
      });

      btn.setAttribute('href', popupUrl);
      btn.href = popupUrl;

      btn.addEventListener('click', function (e) {
        var popupW = 550,
            popupH = 450,
            params = [
              'width=' + popupW,
              'height=' + popupH,
              'left=' + Math.round(screen.width / 2 - popupW / 2),
              'top=' + Math.round(screen.height / 2 - popupH / 2),
              'personalbar=0',
              'toolbar=0',
              'scrollbars=1',
              'resizable=1'
            ].join(','),
            popup = window.open(popupUrl, '_blank', params);

        if (popup) {
          try {
            popup.focus();
          } catch (e) {}
        }

        return cancelEvent(e);
      }, false);
    })(btns[i]);
  }
}

function facebookLikeTooltipFix () {
  document.getElementById('fb_widget_wrap').style.height = '192px';
}

function facebookShareInit () {
  window.fbAsyncInit = function() {
    FB.init({
      appId: '254098051407226',
      status: true,
      cookie: true,
      xfbml: true
    });
    FB.Event.subscribe('edge.create', function(targetUrl) {
      facebookLikeTooltipFix();
      ga('send', 'event', 'Share', 'Facebook Like', document.location.href);
    });

    FB.Event.subscribe('edge.remove', function(targetUrl) {
      ga('send', 'event', 'Share', 'Facebook Unlike', document.location.href);
    });
  };

  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}

function gplusShareInit () {
  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();
}

function gplusOnShare (o) {
  // console.log('g+', o);
  if (o && o.state == 'off') {
    ga('send', 'event', 'Share', 'GPlus Share', document.location.href);
  } else {
    ga('send', 'event', 'Share', 'GPlus Unshare', document.location.href);
  }
}

function blogRecentNewsInit () {
  if (document.querySelectorAll) {
    var sideImages = document.querySelectorAll('.blog_side_image_wrap');
    var sideImage, parent, i;
    var len = len = sideImages.length;
    for (i = 0; i < len; i++) {
      sideImage = sideImages[i];
      parent = sideImage.parentNode.parentNode;
      if (parent) {
        parent.insertBefore(sideImage, parent.firstChild);
      }
    }
  }

  var moreBtn = document.getElementById('tlb_blog_head_more_link');
  if (!moreBtn) {
    return false;
  }

  var activeClassName = 'tlb_blog_head_recent_active';
  moreBtn.addEventListener('click', function (event) {
    var parent = this.parentNode;
    var className = parent.className;
    if (className.indexOf(activeClassName) == -1) {
      className += ' ' + activeClassName;
    } else {
      className = className.replace(' ' + activeClassName, '');
    }
    parent.className = className;

    return cancelEvent(event);
  });
}

function cancelEvent (event) {
  event = event || window.event;
  if (event) event = event.originalEvent || event;

  if (event.stopPropagation) event.stopPropagation();
  if (event.preventDefault) event.preventDefault();

  return false;
}

function trackDlClick (element, event) {
  var href = element.getAttribute('href'),
      track = element.getAttribute('data-track') || false;

  if (!track) {
    return;
  }

  var trackData = track.toString().split('/');

  ga('send', 'event', trackData[0], trackData[1], href);

  if ((element.getAttribute('target') || '').toLowerCase() != '_blank') {
    setTimeout(function() { location.href = href; }, 200);
    return false;
  }
}

var toTopWrapEl,
    toTopEl,
    pageContentWrapEl,
    curVisible,
    curShown = false;
function backToTopInit () {
  pageContentWrapEl = document.getElementById('dev_page_content_wrap');
  if (!pageContentWrapEl) {
    return false;
  }
  var t = document.createElement('div');

  t.innerHTML = '<div class="back_to_top"><i class="icon icon-to-top"></i>回到顶部</div>';
  toTopEl = t.firstChild;
  t.innerHTML = '<a class="back_to_top_wrap" onclick="backToTopGo()"></a>';
  toTopWrapEl = t.firstChild;

  toTopWrapEl.appendChild(toTopEl);
  document.body.appendChild(toTopWrapEl);

  if (window.addEventListener) {
    window.addEventListener('resize', backToTopResize, false);
    window.addEventListener('scroll', backToTopScroll, false);
  }
  backToTopResize();
}

function backToTopGo () {
  window.scroll(0, 0);
  backToTopScroll();
}

function backToTopResize () {
  var left = getXY(pageContentWrapEl)[0],
      dwidth = Math.max(window.innerWidth, document.documentElement.clientWidth, 0),
      dheight = Math.max(window.innerHeight, document.documentElement.clientHeight);

  curVisible = pageContentWrapEl && left > 130 && dwidth > 640;
  toTopWrapEl.style.width = left + 'px';
  toTopEl.style.height = dheight + 'px';
  backToTopScroll();
}

function backToTopScroll () {
  var st = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || document.documentElement.scrollTop;
  if ((st > 400 && curVisible) != curShown) {
    curShown = !curShown;
    toTopWrapEl.className = 'back_to_top_wrap' + (curShown ? ' back_to_top_shown' : '');
  }
}

function getXY (obj) {
  if (!obj) return [0, 0];

  var left = 0, top = 0;
  if (obj.offsetParent) {
    do {
      left += obj.offsetLeft;
      top += obj.offsetTop;
    } while (obj = obj.offsetParent);
  }
  return [left, top];
}


var onDdBodyClick,
    currentDd;
function dropdownClick (element, event) {
  var parent = element.parentNode;
  var isOpen = (parent.className || '').indexOf('open') > 0;
  if (currentDd && currentDd != parent) {
    dropdownHide(currentDd);
  }
  if (!isOpen) {
    parent.className = (parent.className || '') + ' open';
    if (!onDdBodyClick) {
      window.addEventListener('click', dropdownPageClick, false);
    }
    currentDd = parent;
  } else {
    dropdownHide(currentDd);
    currentDd = false;
  }
  event.cancelBubble = true;
  return false;
}

function dropdownHide (parent) {
  parent.className = parent.className.replace(' open', '');
}

function dropdownPageClick (event) {
  if (currentDd) {
    dropdownHide(currentDd);
    currentDd = false;
  }
}

function escapeHTML (html) {
  html = html || '';
  return html.replace(/&/g, '&amp;')
             .replace(/>/g, '&gt;')
             .replace(/</g, '&lt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&apos;');
}

function videoTogglePlay(el) {
  if (el.paused) {
    el.play();
  } else {
    el.pause();
  }
}
