'use strict';

(function($) {
    $(function() {

        var useSVG = Modernizr.svgasimg;
        var useTransition = Modernizr.csstransitions;

        if (!useSVG) {
            $("img[src$='.svg']").each(function() {
                $(this).attr('src', $(this).attr('src').replace('.svg', '.png'));
            });
        }

        var ua = navigator.userAgent;
        var isSP = ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0;
        if (isSP) {
            $('html').addClass('sp');
        }

        var END = 'oTransitionEnd mozTransitionEnd webkitTransitionEnd transitionend';

        /**
         * bg
         */

        var bgn = 0;
        var bgz = 3;

        function bgEffect() {
            setInterval(function() {
                $('#bg div').eq(++bgn).removeClass('hide').on(END, function() {
                    $(this).off(END);
                    $('#bg div').eq(bgn === -1 ? 2 : bgn - 1).addClass('hide');
                    $('#bg div').eq(bgn === 2 ? 0 : bgn + 1).css({
                        zIndex: ++bgz
                    });
                    bgn = bgn === 2 ? -1 : bgn;
                });
            }, 10000);
        }

        /**
         * opening
         */

        var skip = false;
        $('#opening path').each(function() {
            var scale = Math.random() * 3 + 1;
            TweenMax.set($(this), {
                transformOrigin: '50% 50% 0',
                transform: 'scale(' + scale + ',' + scale + ')'
            });
        });

        function opening_effect() {
            $('#opening path').each(function() {
                TweenMax.to($(this), .7, {
                    opacity: 1,
                    delay: Math.random() * 1,
                    transform: 'scale(1, 1)',
                    ease: Power4.easeOut
                });
            });

            setTimeout(function() {
                if (!skip) openingTostart();
            }, 3000);
        }

        function openingTostart() {
            skip = true;

            TweenMax.to($('#opening'), 1, {
                opacity: 0,
                onComplete: function onComplete() {
                    $('#opening').remove();
                    start();
                }
            });
        }

        $('#opening').on('click', openingTostart);
        $(window).on('load', opening_effect);

        /**
         * top
         */

        var hover = false;

        function start() {
            $('body').removeClass('fixed');
            TweenMax.to($('.text1'), .5, {
                opacity: 1,
                onComplete: main_text_effect
            });
            bgEffect();
        }

        function main_text_effect() {
            var rand = [];
            var n = 0;
            $('.main .e').each(function() {
                var deg = Math.random() * 90 - 45;
                TweenMax.set($(this), {
                    transform: 'translate(0, 100px) rotate(' + deg + 'deg)'
                });
                rand.push(n++);

                $(this).on('mouseenter', function() {
                    if (!hover || $(this).hasClass('on')) return;

                    var $this = $(this).addClass('on');
                    var deg = Math.random() * 90 - 45;
                    TweenMax.to($this, .5, {
                        transform: 'translate(0, 40px) rotate(' + deg + 'deg)',
                        ease: Sine.easeOut,
                        onComplete: function onComplete() {
                            TweenMax.to($this, 7, {
                                transform: 'translate(0, 0) rotate(0deg)',
                                ease: Elastic.easeOut.config(1, 0.3),
                                onComplete: function onComplete() {
                                    $this.removeClass('on');
                                }
                            });
                        }
                    });
                }).on('mouseleave', function() {
                    if (!hover) return;
                });
            });

            shuffle(rand);
            for (var i = 0; i < rand.length; i++) {
                TweenMax.to($('.main .e').eq(rand[i]), 4, {
                    delay: i * .05,
                    transform: 'translate(0, 0) rotate(0deg)',
                    opacity: 1,
                    ease: Elastic.easeOut.config(1, 0.3)
                });
            }

            TweenMax.to($('.text2'), .5, {
                opacity: 1,
                delay: (rand.length - 1) * .05 + .7,
                onComplete: function onComplete() {
                    hover = true;
                    TweenMax.to($('.logo'), .5, {
                        opacity: 1
                    });
                }
            });
        }

        function shuffle(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var r = Math.floor(Math.random() * (i + 1));
                var tmp = array[i];
                array[i] = array[r];
                array[r] = tmp;
            }
        }
    });

    if (typeof Zepto !== 'undefined') {
        ['width', 'height'].forEach(function(dimension) {
            var offset,
                Dimension = dimension.replace(/./, function(m) {
                    return m[0].toUpperCase();
                });
            $.fn['outer' + Dimension] = function(margin) {
                var elem = this;
                if (elem) {
                    var size = elem[dimension]();
                    var sides = {
                        'width': ['left', 'right'],
                        'height': ['top', 'bottom']
                    };
                    sides[dimension].forEach(function(side) {
                        if (margin) size += parseInt(elem.css('margin-' + side), 10);
                    });
                    return size;
                } else {
                    return null;
                }
            };
        });
    }
})(typeof Zepto !== 'undefined' ? Zepto : jQuery);