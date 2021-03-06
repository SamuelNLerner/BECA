/**
 * Global variables used throughout multiple files grouped for convenience. 
 */

/** Variables regarding the genetic data being displayed. */

// Array of SNP objects on the current chromosome between the current lower and upper bounds.
var snps = [];
// Bounds of SNPs to fetch on the current chromosome;
var lowerBound, upperBound;
// Bounds of SNPs on the current chromosome. Set directly after database query. Used in order to reset after zooming.
var originalLower, originalUpper;
// The chromosome currently displaying SNPs for.
var currChr;
// The current roi queried for.
var roi;
// The current query entered by the user (see accepted formats in parser documentation).
var query;
// The default range between lower and upper bounds.
var chrRange = 600000;

/** Variables regarding the min and max panel size */
let minTop = 0.2, maxTop = 0.55;
let minLeft = 0.2, maxLeft = 0.65;
let minMain = 0.2, maxMain = 0.75;
let minSec = 0.2, maxSec = 0.75;

/** Variables for displaying the chart and grid. */

// Margins for the SNP chart.
var chartMargins = {
    top: 25,
    bottom: 20,
    left: 50,
    right: 25
};

// Margins for the voxel grid.
var gridMargins = {
    left: 25,
    right: 25,
    top: 25,
    bottom: 25
};

var panel;

/** Variables for the renderers */

// The filename for the colortable overlay of the renderers.
var colortable = null;

var displayingOverlay = false;
// The orientation of the main slice of the renderers.
var orientation = null;
// Whether or not to display the SNP label on the render container.
var displaySNPLabel = true;
// Holds the current SNP selected from the Voxel Grid for the renderer label.
var previousSNPLabel = '';

/** Miscellaneous variables */

// Flag for if the database has been queried yet.
var firstChart = true;

var selectedROI;

// Returns the bounding rect for the given JQuery/D3 selector.
var rectFor = function(selector) {
    return d3.select(selector).node().getBoundingClientRect();
};

var gwasMode = false;

var localHost = "http://localhost:8080";
var iupuiHost = "http://igb.cs.iupui.edu";
var currentHost = localHost;