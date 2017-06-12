var displayingVolume = true, displayingFull = true,
    displayingCombined = true, displayingSlices = true,
    displayingFullSlices = false;
var r1, r2, volume, slices, sliceX, sliceY, sliceZ;

var renderBrain = function(snp, colortable) {
    r1 = new X.renderer3D();
    r1.container = 'full-vcontainer';
    r1.init();

    r2 = new X.renderer3D();
    r2.container = 'sliced-vcontainer';
    r2.init();

    slices = new X.volume();
    slices.file = 'http://localhost:8000/file/gray_matter.nii';
    slices.labelmap.file = 'http://localhost:8000/file/converted.nii';

    volume = new X.volume();

    // if (snp) {
    //     volume.file = 'http://localhost:8000/file/volume-' + snp + '.nii.gz';
    // } else {
    //     volume.file = 'http://localhost:8000/file/gray_matter.nii';
    // }

    volume.file = 'http://localhost:8000/file/gray_matter.nii';
    volume.labelmap.file = 'http://localhost:8000/file/converted.nii';
    if (colortable) {
        slices.labelmap.colortable.file = colortable;
        volume.labelmap.colortable.file = colortable;
    }

    sliceX = new X.renderer2D();
    sliceX.container = 'xSliceContainer';
    sliceX.orientation = 'X';
    sliceX.init();

    sliceY = new X.renderer2D();
    sliceY.container = 'ySliceContainer';
    sliceY.orientation = 'Y';
    sliceY.init();

    sliceZ = new X.renderer2D();
    sliceZ.container = 'zSliceContainer';
    sliceZ.orientation = 'Z';
    sliceZ.init();

    r1.add(volume);
    r1.render();

    r1.onShowtime = function() {
        r1.camera.position = [0, 0, 300];
        
        volume.volumeRendering = true;
        volume.opacity = 0.75;
        volume.lowerThreshold = 0.001;
        volume.windowLower = 0.001;
        volume.windowHigh = 1;

        if (colortable == null) {
            volume.minColor = [1, 0, 0];
            volume.maxColor = [0, 0, 1];
        }

        r2.add(slices);
        r2.render();
    };

    r2.onShowtime = function() {
        r2.camera.position = [0, 0, 300];

        sliceX.add(slices);
        sliceX.render();
    }

    sliceX.onShowtime = function() {
        sliceY.add(slices);
        sliceY.render();
    }

    sliceY.onShowtime = function() {
        sliceZ.add(slices);
        sliceZ.render();
    }
};

var setToBothVolume = function() {
    setToFullVolume(false);
    setToSlicedVolume(false);
}

var toggleNoneVolume = function(none) {
    const destHeight = none ? '0' : '62%';
    d3.select('.volume-panel').transition().duration(250)
        .style('height', destHeight);
    displayingVolume = !none;
}

var setToFullVolume = function(only) {
    if (!displayingVolume) {
        toggleNoneVolume(false);
        addSlicing();
    }
    if (!displayingFull) {
        addFullVolume();
    }
    if (only) {
        removeSlicedVolume();
    }
}

var setToSlicedVolume = function(only) {
    if (!displayingVolume) {
        toggleNoneVolume(false);
        addSlicing();
    }
    if (!displayingCombined) {
        addSlicedVolume();
    }
    if (only) {
        removeFullVolume();
    }
}

var addSlicedVolume = function() {
    d3.select('#sliced-vcontainer').transition().duration(250)
        .style('width', '48%');
    d3.select('#full-vcontainer').transition().duration(250)
        .style('width', '48%');
    displayingCombined = true;
}

var addFullVolume = function() {
    d3.select('#full-vcontainer').transition().duration(250)
        .style('width', '48%');
    d3.select('#sliced-vcontainer').transition().duration(250)
        .style('width', '48%');
    displayingFull = true;
}

var removeSlicedVolume = function() {
    d3.select('#full-vcontainer').transition().duration(250)
        .style('width', '98%');
    d3.select('#sliced-vcontainer').transition().duration(250)
        .style('width', '0');
    displayingCombined = false;
}

var removeFullVolume = function() {
    d3.select('#full-vcontainer').transition().duration(250)
        .style('width', '0');
    d3.select('#sliced-vcontainer').transition().duration(250)
        .style('width', '98%');
    displayingFull = false;
}

var setToShowSlicing = function() {
    addSlicing();
}

var setToHideSlicing = function() {
    removeSlicing();
}

var addSlicing = function() {
    toggleNoneVolume(false);
    d3.selectAll('.slice').transition().duration(250)
        .style('height', '45%');
    displayingSlices = true;
}

var removeSlicing = function() {
    d3.selectAll('.slice').transition().duration(250)
        .style('height', 0);
    toggleNoneVolume(false);
    d3.select('.volume-panel').transition().duration(250)
        .style('height', '100%');
    displayingSlices = false;
}

var showFullSlicing = function() {
    toggleNoneVolume(true);
    d3.selectAll('.slice').transition().duration(250)
        .style('height', '100%');
    displayingSlices = true;
}