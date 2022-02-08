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

        var END = 'oTransitionEnd mozTransitionEnd webkitTransitionEnd transitionend';

        /**
         * scroll
         */

        var contents = [];
        var contentsCount = $('section').length;
        var WH = $(window).height();
        var $nav = $('nav a');
        var $obj1 = $('.obj_amazarashi');
        var $obj2 = $('.obj_chihotoshi');
        var $obj3 = $('.obj_mementomori');
        var $obj4 = $('.obj_image');

        function setContents() {
            contents = [];
            $('section').each(function() {
                contents.push({
                    obj: $(this),
                    top: $(this).offset().top
                });
            });
            contents.reverse();
        }
        setContents();

        $(window).on('load', setContents).on('resize', function() {
            WH = $(this).height();
        }).on('scroll', function() {
            var top = $(this).scrollTop();
            $nav.removeClass('active');

            for (var i = 0; i < contentsCount; i++) {
                if (contents[i].top <= top) {
                    $nav.eq(contentsCount - i - 1).addClass('active');
                    break;
                }
            }

            TweenMax.set($obj1, {
                y: top * .5
            });

            TweenMax.set($obj2, {
                y: -top * .4
            });

            if (top >= contents[1].top) {
                TweenMax.set($obj4, {
                    y: -(top - contents[1].top) * 1.5
                });
            } else {
                TweenMax.set($obj4, {
                    y: 0
                });
            }

            if (top >= contents[2].top) {
                var _top = (top - contents[2].top) * .7;
                //_top = _top >= WH+150 ? WH+150 : _top;
                TweenMax.set($obj3, {
                    y: _top
                });
            } else {
                TweenMax.set($obj4, {
                    y: 0
                });
            }
        });

        $nav.on('click', function() {
            var index = $nav.index(this);
            TweenMax.to($('html, body'), .8, {
                scrollTop: contents[contentsCount - index - 1].top,
                ease: Power3.easeOut
            });

            return false;
        });

        /**
         * modal
         */

        $('#release .more').on('click', function() {
            $('body').addClass('fix');

            var index = $('#release .more').index(this);
            $('.disc_modal').addClass('show visible').find('.disc_wrap').eq(index).addClass('show');
        });

        $('.disc_modal .close').on('click', function() {
            $('.disc_modal').removeClass('show').on(END, function() {
                $(this).off(END);
                (function($obj) {
                    setTimeout(function() {
                        $obj.removeClass('visible');
                        $('.disc_wrap').removeClass('show');
                    }, 500);
                })($(this));
                $('body').removeClass('fix');
            });
        });

        /**
         * MV
         */

        $('#mv .play').on('click', function() {
            if ($(this).hasClass('soon')) return;

            $(this).off('click');
            $('#mv .video').append('<iframe src="https://www.youtube.com/embed/' + $(this).data('id') + '?rel=0&autoplay=1" frameborder="0" allowfullscreen></iframe>');
        });

        /**
         * SPECIAL
         */

        var songsData = [];
        var $lyric = $('.lyric');
        var $canvas = $('canvas');
        var WW = void 0,
            xSpan = void 0;
        var ctx = $canvas.get(0).getContext('2d');
        var fftSize = 512;
        var analyserNode = void 0;
        var currentSound = -1;
        var soundInstance = void 0,
            waveID = void 0;

        function setCanvasSize() {
            WW = $(window).width();
            xSpan = WW * 2 / (fftSize / 2 - 1);
            //xSpan = WW*2/(fftSize/2-1);

            $canvas.attr({
                width: WW * 2,
                height: WH * 2
            }).css({
                width: WW,
                height: WH
            });
        }
        setCanvasSize();
        $(window).on('resize', setCanvasSize);

        $.ajax({
            url: '_data/song.json',
            dataType: 'json',
            success: function success(data) {
                for (var i = 0; i < data.songs.length; i++) {
                    songsData.push(data.songs[i]);

                    if (data.songs[i].music) {
                        createjs.Sound.registerSound({
                            id: 'lyric' + i,
                            src: 'sound/' + songsData[i].music + '.mp3'
                        });
                    }

                    var $song = $('<li/>').append($('<button/>', {
                        type: 'button'
                    }).append($('<p/>').css({
                        left: Math.random() * 60 - 30 + '%'
                    }).html('<span>' + (i + 1) + '</span>' + data.songs[i].title)));

                    TweenMax.set($song, {
                        y: Math.random() * 20 - 10,
                        rotation: Math.random() * 6 - 3
                    });

                    $('#special ol').append($song);
                }

                $('#special li').on('click', function() {
                    $('body').addClass('fix');

                    var index = $('#special li').index(this);
                    var className = void 0,
                        title = void 0;
                    var lyric = '';

                    if (songsData[index].music) {
                        currentSound = index;
                        className = 'show visible';
                        title = songsData[index].title + ' 詩集';
                        //lyric = songsData[index].lyric;
                        var _lyric = songsData[index].lyric.split('<br>');
                        for (var _i = 0; _i < _lyric.length; _i++) {
                            if (_lyric[_i]) {
                                lyric += '<p><span>' + _lyric[_i] + '</span></p>';
                            } else {
                                lyric += '<br>';
                            }
                        }
                    } else {
                        className = 'show visible noise';
                        title = songsData[index].title;
                        lyric = 'こちらは曲自体がポエトリーリーディングのため詩はありません。';
                    }
                    $lyric.addClass(className).find('.title').text(title);
                    $lyric.find('.words').html(lyric);
                });

                $('.lyric .close').on('click', function() {
                    $lyric.removeClass('show').on(END, function() {
                        $(this).off(END);
                        setTimeout(function() {
                            if (soundInstance) {
                                soundInstance.paused = true;
                                soundInstance = null;
                            }

                            if ($('.lyric .wave').hasClass('active')) {
                                $('.lyric .wave').click();
                            }

                            if ($('.lyric .image').hasClass('active')) {
                                $('.lyric .image').click();
                            }

                            ctx.clearRect(0, 0, WW * 2, WH * 2);

                            $lyric.removeClass('visible noise').find('button').removeClass('active');
                        }, 500);
                        $('body').removeClass('fix');
                    });
                });

                $('.lyric .play_pause').on('click', function() {
                    if ($(this).hasClass('active')) {
                        soundInstance.paused = true;

                        if ($('.lyric .wave').hasClass('active')) {
                            $('.lyric .wave').click();
                        }
                    } else {
                        if (soundInstance && soundInstance.playState !== 'playFinished') {
                            soundInstance.paused = false;
                        } else {
                            soundInstance = createjs.Sound.play('lyric' + currentSound, 0);
                            soundInstance.on('complete', function() {
                                $('.lyric .play_pause').click();

                                if ($('.lyric .image').hasClass('active')) {
                                    $('.lyric .image').click();
                                }
                            });
                        }
                    }

                    $(this).toggleClass('active');
                });

                $('.lyric .wave').on('click', function() {
                    if ($(this).hasClass('active')) {
                        cancelAnimationFrame(waveID);
                    } else {
                        if (!$('.lyric .play_pause').hasClass('active')) {
                            $('.lyric .play_pause').click();
                        }
                        wave();
                    }

                    $(this).toggleClass('active');
                });

                var TMInstance = [];
                var wordTimeout = void 0;
                $('.lyric .image').on('click', function() {
                    if ($(this).hasClass('active')) {
                        clearTimeout(wordTimeout);

                        TweenMax.to($('.words'), .4, {
                            scale: 1,
                            rotation: 0
                        });
                        wordReset();
                    } else {
                        wordAnimation();
                    }

                    $(this).toggleClass('active');
                });

                function wordAnimation() {
                    wordReset();
                    TMInstance = [];

                    TweenMax.to($('.words'), .4, {
                        scale: Math.random() * 4 + 2,
                        rotation: Math.random() * 60 - 30
                    });

                    for (var _i2 = 0; _i2 < $('.words p').length; _i2++) {
                        var scale = Math.random() * 2 + 1 - .9;
                        var blur = 0;
                        var $this = $('.words p').eq(_i2);
                        if (scale < 1) {
                            blur = scale;
                        } else if (scale > 2) {
                            blur = scale - 2;
                        }

                        TweenMax.to($this, .4, {
                            //scale: scale
                            fontSize: 14 * scale
                        });

                        TMInstance[_i2] = TweenMax.to($this.find('span'), scale * 25, {
                            x: _i2 % 2 === 0 ? '-50%' : '50%',
                            ease: Power0.easeNone
                        });

                        if (blur > 0) {
                            TweenMax.set($this.find('span'), {
                                filter: 'blur(' + blur + 'px)'
                            });
                        }
                    }

                    wordTimeout = setTimeout(wordAnimation, 8000);
                }

                function wordReset() {
                    for (var _i3 = 0; _i3 < $('.words p').length; _i3++) {
                        TweenMax.set($('.words p').eq(_i3).find('span'), {
                            filter: 'blur(0px)',
                            x: '0%'
                        });

                        TweenMax.set($('.words p').eq(_i3), {
                            fontSize: 14
                        });

                        if (TMInstance[_i3]) TMInstance[_i3].pause(0);
                    }
                }

                function wave() {
                    var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
                    analyserNode.getByteFrequencyData(freqByteData);

                    var times = new Uint8Array(analyserNode.fftSize);
                    analyserNode.getByteTimeDomainData(times);
                    /*
     ctx.globalAlpha = .05;
     ctx.fillStyle = '#333';
              ctx.fillRect(0, 0, WW*2, WH*2);
     */

                    ctx.clearRect(0, 0, WW * 2, WH * 2);

                    ctx.strokeStyle = '#999';
                    //ctx.lineWidth = 2;
                    ctx.lineWidth = sum(freqByteData) / 6000;
                    ctx.globalAlpha = 1;

                    ctx.beginPath();

                    for (var _i4 = 0; _i4 < times.length; _i4++) {
                        var y = times[_i4] - 128;
                        if (_i4 === 0) {
                            ctx.moveTo(-50, WH - y * 5);
                        } else {
                            ctx.lineTo(_i4 * xSpan, WH - y * 5);
                        }
                    }

                    /*
     //let len = analyserNode.frequencyBinCount;
     let len = 25;
     ctx.moveTo(0, WH);
     for(let i = 1; i <= len; i++){
     	let y = freqByteData[i-1]-128;
                   if(i === 0){
                      ctx.moveTo(0, WH-y*2);
                  }
                  else{
                      ctx.lineTo(i*xSpan, WH-y*2);
                  }
     		ctx.lineTo(i*xSpan, WH-y*2);
              }
     ctx.lineTo(WW*2, WH);
     */

                    ctx.stroke();
                    waveID = requestAnimationFrame(wave);
                }

                function sum(arr) {
                    var n = 0;
                    for (var i = 0; i < arr.length; i++) {
                        n += arr[i];
                    }

                    return n;
                }
            }
        });

        createjs.Sound.on('fileload', function() {
            var plugin = new createjs.WebAudioPlugin();
            var context = plugin.context;
            analyserNode = context.createAnalyser();
            analyserNode.fftSize = fftSize;
            analyserNode.smoothingTimeConstant = 0.85;
            analyserNode.connect(context.destination);

            var dynamicsNode = plugin.dynamicsCompressorNode;
            dynamicsNode.disconnect();
            dynamicsNode.connect(analyserNode);
        });

        /**
         * effects
         */

        var effectsPosition = void 0;
        $(window).on('load', function() {
            $('#top .block').addClass('show');

            effectsPosition = [{
                top: $('#release .js_discs').offset().top,
                obj: $('#release')
            }, {
                top: $('.haishin').offset().top,
                obj: $('.haishin')
            }, {
                top: $('#mv').offset().top,
                obj: $('#mv')
            }, {
                top: $('#special ol').offset().top,
                obj: $('#special ol')
            }, {
                top: $('#live .block').eq(0).offset().top,
                obj: $('#live .block').eq(0)
            }, {
                top: $('#live .block').eq(1).offset().top,
                obj: $('#live .block').eq(1)
            }];
        }).on('scroll.effect', function() {
            var st = $(this).scrollTop();
            var fire = 0;
            for (var i = 0; i < effectsPosition.length; i++) {
                if (effectsPosition[i].top <= st + WH * .7) {
                    fire = i + 1;
                    effectsPosition[i].obj.addClass('show');
                }
            }

            if (fire > 0) {
                effectsPosition.splice(0, fire);

                if (!effectsPosition.length) {
                    $(window).off('effect');
                }
            }
        });
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

(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    var cancelAnimationFrame = window.cancelAnimationFrame || window.mozcancelAnimationFrame || window.webkitcancelAnimationFrame || window.mscancelAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;
})();