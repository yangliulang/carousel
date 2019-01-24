(function($) {
  var CarouselPoster = function(poster) {
    //保存this对象
    var self = this; //save - 1

    //保存一个poster对象
    this.poster = poster; //save - 2
    this.posterItemMain = poster.find('ul.poster-list');
    //定义初始化配置参数//save - 3
    this.setting = {
      width: 1000,
      height: 270,
      posterWidth: 640,
      posterHeight: 270,
      autoPlay: false,
      delay: 5000,
      speed: 500,
      scale: 0.9,
      verticalAlign: 'middle'
    };

    //如果人工配置了参数就继承//save - 4
    $.extend(this.setting, this.getSetting());

    //保存.poster-item列表//save - 5
    this.posterItems = poster.find('li.poster-item');
    //保存左右切换按钮
    this.nextBtn = poster.find('div.poster-next-btn');
    this.prevBtn = poster.find('div.poster-prev-btn');

    //设置帧的排列位置//save - 6
    this.setPosterPos();
    //设置配置参数值去控制一些必要的元素//save - 7
    this.setSettingValue();

    //切换标识，如果动画没结束，不许切换
    this.RotateFlag = true;
    //绑定切换事件save - 8
    this.nextBtn.click(function() {
      if (self.RotateFlag) {
        self.RotateFlag = false;
        self.carouseRotate('left');
      }
    });
    this.prevBtn.click(function() {
      if (self.RotateFlag) {
        self.RotateFlag = false;
        self.carouseRotate('right');
      }
    });

    //添加自动播放功能
    if (this.setting.autoPlay) {
      this.autoPlay();
    }
  };

  CarouselPoster.prototype = {
    autoPlay: function() {
      var self = this;
      window.setInterval(function() {
        self.nextBtn.click();
      }, 1000);
    },
    //旋转所有帧
    carouseRotate: function(dir) {
      var _this_ = this;
      var lastItem = this.posterItems.last(),
        firstItem = this.posterItems.first(),
        zIndexArr = [];
      if (dir === 'left') {
        this.posterItems.each(function(i) {
          var self = $(this),
            prev = $(this)
              .prev()
              .get(0)
              ? $(this).prev()
              : lastItem,
            width = prev.width(),
            height = prev.height(),
            zIndex = prev.css('zIndex'),
            opacity = prev.css('opacity'),
            left = prev.css('left'),
            top = prev.css('top');

          zIndexArr.push(zIndex);
          //过度
          self.animate(
            {
              width: width,
              height: height,
              opacity: opacity,
              left: left,
              top: top
            },
            _this_.setting.speed,
            function() {
              _this_.RotateFlag = true;
            }
          );
        });
        //z-index不需要过度
        this.posterItems.each(function(i) {
          $(this).css('zIndex', zIndexArr[i]);
        });
      } else if (dir === 'right') {
        this.posterItems.each(function() {
          var self = $(this),
            next = $(this)
              .next()
              .get(0)
              ? $(this).next()
              : firstItem,
            width = next.width(),
            height = next.height(),
            zIndex = next.css('zIndex'),
            opacity = next.css('opacity'),
            left = next.css('left'),
            top = next.css('top');

          //记录zIndex
          zIndexArr.push(zIndex);

          self.animate(
            {
              width: width,
              height: height,

              opacity: opacity,
              left: left,
              top: top
            },
            _this_.setting.speed,
            function() {
              _this_.RotateFlag = true;
            }
          );
        });
        //z-index不需要过度
        this.posterItems.each(function(i) {
          $(this).css('zIndex', zIndexArr[i]);
        });
      }
    },
    //设置配置参数值去控制一些必要的元素setp - 3
    setSettingValue: function() {
      this.poster.width(this.setting.width);
      this.posterItemMain.css({
        width: this.setting.width,
        height: this.setting.height
      });
      //计算左右按钮的宽度
      var w = (this.setting.width - this.setting.posterWidth) / 2;
      this.nextBtn
        .width(w)
        .css('zIndex', Math.ceil(this.posterItems.size() / 2));
      this.prevBtn
        .width(w)
        .css('zIndex', Math.ceil(this.posterItems.size() / 2));
    },
    //根据比例排列梅一帧的位置setp - 2
    setPosterPos: function() {
      var self = this;
      var posterSize = this.posterItems.size(), //统计所以帧的数量
        level = Math.floor(posterSize / 2), //记录除去第一帧后左右两边的层级
        sliceItems = this.posterItems.slice(1), //保存除去第一帧的所有集合
        sliceSize = sliceItems.size() / 2, //记录剩余帧左右两边改分配的个数
        leftSlice = sliceItems.slice(sliceSize), //保存左边帧列表
        rightSlice = sliceItems.slice(0, sliceSize), //保存右边帧列表
        firstPoster = this.posterItems.first(); //保存第一帧

      //设置第一帧的位置
      var firstLeft = (this.setting.width - this.setting.posterWidth) / 2; //保存第一帧的left（居中）
      firstPoster.css({
        width: this.setting.posterWidth,
        height: this.setting.posterHeight,
        zIndex: Math.floor(posterSize / 2),
        left: firstLeft
      });

      //设置右边帧的排列位置
      var rw = this.setting.posterWidth,
        rh = this.setting.posterHeight,
        gap =
          (this.setting.width - this.setting.posterWidth) /
          2 /
          leftSlice.size();

      var fixOffsetLeft = firstLeft + rw;
      //	x+w+gap = fixOffsetLeft
      rightSlice.each(function(i, elem) {
        level--;

        rw = rw * self.setting.scale;
        rh = rh * self.setting.scale;

        var j = i;
        $(this).css({
          zIndex: level,
          width: rw,
          height: rh,
          opacity: 1 / ++j,
          left: fixOffsetLeft + ++i * gap - rw,
          //top:(self.setting.height-rh)/2
          top: self.setVerticalAlign(rh)
        });
      });

      //设置左边帧的排列情况
      var lw = rightSlice.last().width(),
        lh = rightSlice.last().height(),
        oloop = Math.floor(posterSize / 2); //记录透明度渐变

      leftSlice.each(function(i, elem) {
        $(this).css({
          zIndex: i,
          width: lw,
          height: lh,
          left: i * gap,
          opacity: 1 / oloop,
          //top:(self.setting.height-lh)/2,
          top: self.setVerticalAlign(lh)
        });
        //每一次除以比例，保证递增放大
        lw = lw / self.setting.scale;
        lh = lh / self.setting.scale;
        oloop--;
      });
    },
    //设置垂直排列对齐
    setVerticalAlign: function(height) {
      var verticalType = this.setting.verticalAlign,
        top = 0,
        posterHeight = this.setting.height;

      if (verticalType === 'middle') {
        top = (posterHeight - height) / 2;
      } else if (verticalType === 'bottom') {
        top = posterHeight - height;
      } else if (verticalType === 'top') {
        top = 0;
      } else {
        top = (posterHeight - height) / 2;
      }
      return top;
    },
    //获取配置参数setp - 1
    getSetting: function() {
      var dataSetting = this.poster.attr('data-setting');
      if (dataSetting != '' || !dataSetting) {
        return $.parseJSON(this.poster.attr('data-setting'));
      } else {
        return {};
      }
    }
  };

  $.fn.extend({
    carousel: function() {
      return this.each(function() {
        new CarouselPoster($(this));
      });
    }
  });
  /*CarouselPoster.init = function(posters){
		var CarouselPoster = this;
		posters.each(function(){
			new CarouselPoster($(this));
		});
	};
	window["CarouselPoster"] = CarouselPoster;
	*/
})(jQuery);
