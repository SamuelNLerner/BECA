var parseQuery = function(baseURL, query) {
    if (baseURL.charAt(baseURL.length - 1) != '?') {
        baseURL += "&";
    }
    // Figure out which query format is used.
    if (/(rs)\d+/.test(query)) {
        // Assume query for SNP
        baseURL += 'snp=' + query;
    } else if (/\d{1,2}\:\d+\-\d+/.test(query)) {
        // Assume query for range
        colonIndex = query.indexOf(':');
        dashIndex = query.indexOf('-');

        // Parse query for chromosome, min, and max
        currChr = parseInt(query.substring(0, colonIndex));
        lowerBound = parseInt(query.substring(colonIndex + 1, dashIndex));
        upperBound = parseInt(query.substring(dashIndex + 1, query.length));

        baseURL += 'chr=' + currChr + '&min=' + lowerBound + '&max=' + upperBound;
    } else {
        // Assume query for Gene
        baseURL += 'gene=' + query;
    }
    return baseURL;
}

/**
 * Fetches the SNP data for the given query and roi, formatting them into SNP objects.
 * @see http://api.jquery.com/jquery.ajax/ for more information on AJAX.
 * 
 * @param {string} query Specifies the range and chromosome of SNPs to fetch. Can be of format /(rs)\d+/ to specify a SNP (which adds 300k bp to each side of SNP location), /\d{1,2}\:\d+\-\d+/ which specifies a chromosome and explicit range on that chromosome, or a string represent a gene which is then given a 200k bp buffer on the start and end. 
 * @param {integer} roi Specifies which pvalue for each SNP to fetch.
 * @param {requestCallback} callback Called once the api call to the fileserver is completed.
 */
var parseGenomicData = function(query, roi, callback) {
    // If either query or roi is null, do not perform the fetch request.
    if (!query || !roi) {
        callback();
        return;
    }
    // Indicate to the user that SNP data is being fetched.
    addLoader();
    
    // Base URL for querying the GWAS database.
    var urlString = currentHost + '/query?roi=' + roi;
    urlString = parseQuery(urlString, query);

    // If this is the initial load, render the brain now to avoid lag because the SNP data is not needed.
    if (firstChart) {
        firstChart = false;
        renderBrain(colortable, orientation);
    }

    // Perform AJAX call to the fileserver.
    $.ajax({
        url: urlString,
        type: 'GET',
        dataType: 'json',
        success: data => {
            // On completion, format the data into SNP objects.
            formatData(data, callback);
        }, error: error => {
            console.log("Error with AJAX request: " + error);
            alert("Sorry. We couldn't find any SNPs for your query: " + query);
            $('#back-button').click();
            removeLoader();
        }
    });
}

/**
 * Fetches the SNPs on the specified chromosome either directly before or after the current displayed range.
 * @see http://api.jquery.com/jquery.ajax/ for more information on AJAX.
 * 
 * @param {string} type Indicates whether to fetch the range on the given chromosome before or after the current range. Can be either 'prev' or 'next'.
 * @param {integer} chr Indicates which chromosome to use for the data request.
 * @param {integer} roi Indicates the roi to use for the data request.
 * @param {requestCallback} callback Called once the data request is finished and the data has been formatted.
 */
var adjacentRange = function(type, chr, roi, callback) {
    // Indicate to the user that the database is being queried.
    addLoader();

    // Determine the new range to query for.
    var start, end;
    if (type == 'prev') {
        // If user wants the range before current range, shift the bounds down by the current chrRange.
        end = lowerBound;
        start = end - chrRange;
    } else {
        // If user wants the range after current range, shift the bounds up by the current chrRange.
        start = upperBound;
        end = start + chrRange;
    }

    // Form the URL query.
    query = "chr" + chr + ":" + start + "-" + end;

    // Base URL for database queries.
    var urlString = currentHost + '/query?roi=' + roi + '&chr=' + currChr + '&min=' + start + '&max=' + end;
    
    // Perform AJAX call to the fileserver.
    $.ajax({
        url: urlString,
        type: 'GET',
        dataType: 'json',
        success: data => {
            // On completion, format the data into SNP objects.
            formatData(data, callback);
        }, error: error => {
            console.log("Error with AJAX request: " + error);
            alert("Sorry. We couldn't find any SNPs for your query: " + query);
            $('#back-button').click();
            removeLoader();
        }
    });
}

var getCenterOfROI = function(roi, callback) {
    var urlString = currentHost + '/center?roi=' + roi;
    $.ajax({
        url: urlString,
        type: 'GET',
        dataType: 'json',
        success: data => {
            callback(data);
        }, error: error => {
            console.log("Error with AJAX request: " + error),
            alert("Sorry. There was an error finding the location of the given ROI. Please try again.");
            callback(null);
        }
    });
}

/**
 * Formats the given JSON data into SNP objects.
 * The data is formatted as a JSON object as such:
 *  
 *  {
 *      "results": [
 *          {
 *              "chr": <chromosome_number>,
 *              "start": <basepair_start_of_range>,
 *              "end": <basepair_end_of_range>
 *          },
 *          [
 *              <snp_name>,
 *              <basepair_location>,
 *              <p_value_from_0_to_1> * 116
 *          ], * number of SNPs in range
 *      ]
 *  }
 * The value of the "results" key is passed to this method.
 * 
 * @param {JSON} data 
 * @param {requestCallback} callback 
 */
var formatData = function(data, callback) {
    // Check to see if the response was passed an error.
    let error = data[0].error;
    if (error) {
        // If there was an error (such as no SNP or no Gene found) let the user know and go back to the intro screen.
        alert(error);
        removeLoader();
        $('#back-button').click();
        return;
    }

    // Clear the current, global SNP variable.
    snps = [];
    for (var i = 1; i < data.length; i++) {
        // For each data point, first obtain the name and location from the first two indices.
        let name = data[i].name, loc = data[i].loc;

        // The rest of the data point is the pvalues, so for convenience, the whole array is simply shifted.
        var pvalues = [];
        delete data[i].name;
        delete data[i].loc;

        Object.keys(data[i]).forEach(key => {
            pvalues.push(data[i][key]);
        });

        // Create the SNP object, using a random frequency.
        // Note - Frequency should be removed from the model.
        snps.push(new SNP(name, loc, pvalues, Math.random()));
    }

    // Set the global variables specifying current chromosome and range.
    currChr = parseInt(data[0].chr);
    lowerBound = parseInt(data[0].start);
    upperBound = parseInt(data[0].end);
    chrRange = upperBound - lowerBound;

    // Set the original bounds in order to properly reset the SNP chart and voxel grid after zooming.
    originalLower = lowerBound;
    originalUpper = upperBound;

    // Let the caller know that the data request and formatting is completed.
    callback();
}