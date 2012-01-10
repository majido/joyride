/*
 * jQuery Joyride Plugin 1.0.2
 * www.ZURB.com/playground
 * Copyright 2011, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

(function($) {
  $.fn.joyride = function(options) {

    // +++++++++++++++++++
    //   Defaults
    // +++++++++++++++++++
    var settings = {
      'tipLocation': 'bottom left', // 'top' or 'bottom' in relation to parent. Also can specify 'left' or 'right' justified
      'scrollSpeed': 300, // Page scrolling speed in milliseconds
      'timer': 0, // 0 = no timer, all other numbers = timer in milliseconds
      'startTimerOnClick': false, // true or false - true requires clicking the first button start the timer
      'nextButton': true, // true or false to control whether a next button is used
      'nextButtonText': 'Next', //Text to show in the next button
      'prevButton': true, //true or false to control whether a previous button is used
      'prevButtonText': 'Previous', // Text to show in the previous button
      'tipAnimation': 'pop', // 'pop' or 'fade' in each tip
      'tipAnimationFadeSpeed': 300, // when tipAnimation = 'fade' this is speed in milliseconds for the transition
      'cookieMonster': false, // true or false to control whether cookies are used
      'cookieName': 'JoyRide', // Name the cookie you'll use
      'cookieDomain': false, // Will this cookie be attached to a domain, ie. '.notableapp.com'
      'tipContainer': 'body', // Where will the tip be attached if not inline
      'inline': false, // true or false, if true the tip will be attached after the element
      'tipContent': '#joyRideTipContent', // What is the ID of the <ol> you put the content in
      'postRideCallback': null // A method to call once the tour closes (canceled or complete)
    };

    //Extend those options
    var options = $.extend(settings, options);

    return this.each(function() {

      if ($(options.tipContent).length === 0) return;

      $(options.tipContent).hide();



      var bodyOffset = $(options.tipContainer).children('*').first().position(),
      tipContent = $(options.tipContent + ' li'),
      count = skipCount = 0,
      prevCount = -1,
      timerIndicatorInstance,
      timerIndicatorTemplate = '<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',
      tipTemplate = function(tipClass, index, buttonText, self) { return '<div class="joyride-tip-guide ' + tipClass + '" id="joyRidePopup' + index + '"><span class="joyride-nub"></span>' + $(self).html() + buttonText + '<a href="#close" class="joyride-close-tip">X</a>' + timerIndicatorInstance + '</div>'; },
      tipLayout = function(tipClass, index, nextText, prevText, self) {
      	var buttonText = '';
        if (index == 0 && settings.startTimerOnClick && settings.timer > 0 || settings.timer == 0) {
          timerIndicatorInstance = '';
        } else {
          timerIndicatorInstance = timerIndicatorTemplate;
        }
        if (!tipClass) tipClass = '';

        if (settings.nextButton || !settings.nextButton && settings.startTimerOnClick) {
        	buttonText =  '<a href="#" class="joyride-next-tip small nice radius yellow button">' + nextText + '</a>'
        }

        if (index != 0 && settings.prevButton) {
        	buttonText = '<a href="#" class="joyride-prev-tip button">' + prevText + '</a>&nbsp;' + buttonText;
        }

        if (settings.inline) {
          $(tipTemplate(tipClass, index, buttonText, self)).insertAfter('#' + $(self).data('id'));
        } else {
          $(options.tipContainer).append(tipTemplate(tipClass, index, buttonText, self));
        }
      };

      if(!settings.cookieMonster || !$.cookie(settings.cookieName)) {

      tipContent.each(function(index) {
        var nextText = $(this).data('next'),
        prevText = $(this).data('previous'),
        tipClass = $(this).attr('class'),
        self = this;

        if (settings.nextButton && nextText == undefined) {
          nextText = settings.nextButtonText;
        }

        if (settings.prevButtonText && prevText == undefined) {
          prevText = settings.prevButtonText;
        }

        if ($(this).attr('class')) {
          tipLayout(tipClass, index, nextText, prevText, self);
        } else {
          tipLayout(false, index, nextText, prevText, self);
        }
        $('#joyRidePopup' + index).hide();
      });
    }

      showPrevTip = function() {
        if (settings.tipAnimation == "pop") {
           $('#joyRidePopup' + (count-1)).hide();
        } else if (settings.tipAnimation == "fade") {
           $('#joyRidePopup' + (count-1)).fadeOut(settings.tipAnimationFadeSpeed);
        }
      	count-=2;
      	prevCount-=2;
      	return showNextTip();
      }

      showNextTip = function() {
        var tipElement = $(tipContent[count]),
        tipLocation = tipElement.data('tip-location') || settings.tipLocation,
        parentElementID = tipElement.data('id'),
        parentElement = $('#' + parentElementID);

        while (parentElement.offset() === null) {
          count++;
          skipCount++;
          prevCount++;
          tipElement = $(tipContent[count]),
          tipLocation = tipElement.data('tip-location') || settings.tipLocation,
          parentElementID = tipElement.data('id'),
          parentElement = $('#' + parentElementID);

          if ($(tipContent).length < count)
            break;
        }
        var windowHalf = Math.ceil($(window).height() / 2),
        currentTip = $('#joyRidePopup' + count),
        currentTipPosition = parentElement.offset(),
        currentParentHeight = parentElement.outerHeight(),
        currentTipHeight = currentTip.outerHeight(),
        nubHeight = Math.ceil($('.joyride-nub').outerHeight() / 2),
        tipOffset = 0;

        if (currentTip.length === 0) return;

        if (count < tipContent.length) {
          if (settings.tipAnimation == "pop") {
            $('.joyride-timer-indicator').width(0);
            if (settings.timer > 0) {
              currentTip.show().children('.joyride-timer-indicator-wrap').children('.joyride-timer-indicator').animate({width: $('.joyride-timer-indicator-wrap').width()}, settings.timer);
            } else {
              currentTip.show();
            }
          } else if (settings.tipAnimation == "fade") {
            $('.joyride-timer-indicator').width(0);
            if (settings.timer > 0) {
              currentTip.fadeIn(settings.tipAnimationFadeSpeed).children('.joyride-timer-indicator-wrap').children('.joyride-timer-indicator').animate({width: $('.joyride-timer-indicator-wrap').width()}, settings.timer);
            } else {
              currentTip.fadeIn(settings.tipAnimationFadeSpeed);
            }
          }
          //Trigger in event on tip element
          tipElement.trigger("joyride/in");
          // ++++++++++++++++++
          //   Tip Location
          // ++++++++++++++++++

          if (tipLocation.indexOf("bottom") != -1 ) {
            currentTip.offset({top: (currentTipPosition.top + currentParentHeight + nubHeight), left: (currentTipPosition.left - bodyOffset.left)});
            currentTip.children('.joyride-nub').addClass('top').removeClass('bottom');
          } else if (tipLocation.indexOf("top") != -1) {
            if (currentTipHeight >= currentTipPosition.top) {
              currentTip.offset({top: ((currentTipPosition.top + currentParentHeight + nubHeight) - bodyOffset.top), left: (currentTipPosition.left - bodyOffset.left)});
              currentTip.children('.joyride-nub').addClass('top').removeClass('bottom');
            } else {
              currentTip.offset({top: ((currentTipPosition.top) - (currentTipHeight + bodyOffset.top + nubHeight)), left: (currentTipPosition.left - bodyOffset.left)});
              currentTip.children('.joyride-nub').addClass('bottom').removeClass('top');
            }
          }
          if (tipLocation.indexOf("right") != -1 ) {
              currentTip.offset({left: (currentTipPosition.left - bodyOffset.left - currentTip.width() + parentElement.width())});
              currentTip.children('.joyride-nub').addClass('right');
          } else if (tipLocation.indexOf("left") != -1 ) {
              currentTip.children('.joyride-nub').removeClass('right');
          }

          // Animate Scrolling when tip is off screen
          tipOffset = Math.ceil(currentTip.offset().top - windowHalf);

          $("html, body").animate({
            scrollTop: tipOffset
          }, settings.scrollSpeed);

          if (count > 0) {
            if (skipCount > 0) {
              var hideCount = prevCount - skipCount;
              skipCount = 0;
            } else {
              var hideCount = prevCount;
            }
            if (settings.tipAnimation == "pop") {
              $('#joyRidePopup' + hideCount).hide();
            } else if (settings.tipAnimation == "fade") {
              $('#joyRidePopup' + hideCount).fadeOut(settings.tipAnimationFadeSpeed);
            }
          }

        // Hide the last tip when clicked
        } else if ((tipContent.length - 1) < count) {
          if (skipCount > 0) {
            var hideCount = prevCount - skipCount;
            skipCount = 0;
          } else {
            var hideCount = prevCount;
          }
          if (settings.cookieMonster == true) {
            $.cookie(settings.cookieName, 'ridden', { expires: 365, domain: settings.cookieDomain });
          } else {
            // Do not include cookie
          }
          if (settings.tipAnimation == "pop") {
            $('#joyRidePopup' + hideCount).fadeTo(0, 0);
          } else if (settings.tipAnimation == "fade") {
            $('#joyRidePopup' + hideCount).fadeTo(settings.tipAnimationFadeSpeed, 0);
          }
        }
        count++;

        if (prevCount < 0) {
          prevCount = 0;
        } else {
          prevCount++;
        }
      }

      if (!settings.inline || !settings.cookieMonster || !$.cookie(settings.cookieName)) {
        $(window).resize(function() {
          var parentElementID = $(tipContent[prevCount]).data('id'),
          currentTipPosition = $('#' + parentElementID).offset(),
          currentParentHeight = $('#' + parentElementID).outerHeight(),
          currentTipHeight = $('#joyRidePopup' + prevCount).outerHeight(),
          nubHeight = Math.ceil($('.joyride-nub').outerHeight() / 2);
          if (settings.tipLocation.indexOf("bottom") != -1 ) {
            $('#joyRidePopup' + prevCount).offset({top: (currentTipPosition.top + currentParentHeight + nubHeight), left: currentTipPosition.left});
          } else if (settings.tipLocation.indexOf("top") != -1) {
            if (currentTipPosition.top <= currentTipHeight) {
              $('#joyRidePopup' + prevCount).offset({top: (currentTipPosition.top + nubHeight + currentParentHeight), left: currentTipPosition.left});
            } else {
              $('#joyRidePopup' + prevCount).offset({top: ((currentTipPosition.top) - (currentTipHeight  + nubHeight)), left: currentTipPosition.left});
            }
          }
        });
      }

      // +++++++++++++++
      //   Timer
      // +++++++++++++++

      var interval_id = null,
      showTimerState = false;

      if (!settings.startTimerOnClick && settings.timer > 0){
       showNextTip();
       interval_id = setInterval(function() {showNextTip()}, settings.timer);
      } else {
       showNextTip();
      }
      var endTip = function(e, interval_id, cookie, self) {
        e.preventDefault();
        clearInterval(interval_id);
        if (cookie) {
           $.cookie(settings.cookieName, 'ridden', { expires: 365, domain: settings.cookieDomain });
        }
        $(self).parent().hide();

        if (settings.postRideCallback != null) {
            settings.postRideCallback();
        }
        $(options.tipContent).trigger("joyride/end");
      }

      //Unbind previous handlers before binding new ones when a new tour starts
      $('.joyride-close-tip, .joyride-prev-tip, .joyride-next-tip').off('click');
      //Bind new handlers
      $('.joyride-close-tip').click(function(e) {
        endTip(e, interval_id, settings.cookieMonster, this);
      });

        $('.joyride-prev-tip').click(function(e) {
          showPrevTip();
        });

      // When the next button is clicked, show the next tip, only when cookie isn't present
        $('.joyride-next-tip').click(function(e) {
          e.preventDefault();
          if (count >= tipContent.length) {
            endTip(e, interval_id, settings.cookieMonster, this);
          }
          if (settings.timer > 0 && settings.startTimerOnClick) {
            showNextTip();
            clearInterval(interval_id);
            interval_id = setInterval(function() {showNextTip()}, settings.timer);
          } else if (settings.timer > 0 && !settings.startTimerOnClick){
            clearInterval(interval_id);
            interval_id = setInterval(function() {showNextTip()}, settings.timer);
          } else {
            showNextTip();
          }
        });
    }); // each call
  }; // joyride plugin call


  // +++++++++++++++++++++++++++++
  //   jQuery Cookie plugin
  // +++++++++++++++++++++++++++++

  // Copyright (c) 2010 Klaus Hartl (stilbuero.de)
  // Dual licensed under the MIT and GPL licenses:
  // http://www.opensource.org/licenses/mit-license.php
  // http://www.gnu.org/licenses/gpl.html
  jQuery.cookie = function (key, value, options) {

      // key and at least value given, set cookie...
      if (arguments.length > 1 && String(value) !== "[object Object]") {
          options = jQuery.extend({}, options);

          if (value === null || value === undefined) {
              options.expires = -1;
          }

          if (typeof options.expires === 'number') {
              var days = options.expires, t = options.expires = new Date();
              t.setDate(t.getDate() + days);
          }

          value = String(value);

          return (document.cookie = [
              encodeURIComponent(key), '=',
              options.raw ? value : encodeURIComponent(value),
              options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
              options.path ? '; path=' + options.path : '',
              options.domain ? '; domain=' + options.domain : '',
              options.secure ? '; secure' : ''
          ].join(''));
      }

      // key and possibly options given, get cookie...
      options = value || {};
      var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
      return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
  }; // cookie plugin call
})(jQuery);
