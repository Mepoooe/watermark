'use strict';

$(function() {

    var inputNumberModule = require('./modules/input-number'),
        sliderOpacitySlider = require('./modules/slider-opacity'),
        positionModule = require('./modules/position'),
        imgupload = require('./modules/file-upload'),
        chagneLanguage = require('./modules/language-selection');

    positionModule.init();
    inputNumberModule.init();
    sliderOpacitySlider.init();
    imgupload.init();
    chagneLanguage.init();
});
