var noise = ( function () {
        var aa;   
        var bb;   
        var imgData;  
        var px;  
        var w;  
        var h;  
        var flickInt;  

        var flicker = function () {
            aa = document.getElementById('canv');
            bb= aa.getContext('2d');
            aa.width = w = 700;
            aa.height = h = 500;
            bb.fillStyle = 'hsla(255,255%,255%,1)';
            bb.fillRect(0, 0, w, h);
           bb.fill();
            imgData =bb.getImageData(0, 0, w, h);
            px = imgData.data;
            flickInt = setInterval(flicks, 30);
        };

        var flicks = function () {
            for (var i = 0; i < px.length; i += 4) {
                var col = (Math.random() * 255) + 50; 
                px[i] = col;
                px[i + 1] = col;
                px[i + 2] = col;
            }
            bb.putImageData(imgData, 0, 0);
        };

        return {
            init: flicker
        };
    }());

    noise.init();