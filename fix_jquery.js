const fs = require('fs');

let mainJs = fs.readFileSync('js/main.js', 'utf8');

// Find the start of jquery.min.js
const jqueryStartStr = '/* --- JS from js/jquery.min.js --- */';
const startIndex = mainJs.indexOf(jqueryStartStr);

if (startIndex > -1) {
    // Find the end of jquery.min.js
    // It ends with jQuery.noConflict();;
    const jqueryEndStr = 'jQuery.noConflict();;\n';
    let endIndex = mainJs.indexOf(jqueryEndStr, startIndex);
    
    if (endIndex > -1) {
        endIndex += jqueryEndStr.length;
        
        let jqueryContent = mainJs.substring(startIndex, endIndex);
        
        // Remove jQuery.noConflict() so $ works
        jqueryContent = jqueryContent.replace('jQuery.noConflict();;', '');
        
        // Remove from current position
        mainJs = mainJs.substring(0, startIndex) + mainJs.substring(endIndex);
        
        // Prepend to the top
        mainJs = jqueryContent + '\n' + mainJs;
        
        fs.writeFileSync('js/main.js', mainJs);
        console.log("Successfully moved jquery to the top and removed noConflict!");
    } else {
        console.log("Could not find the end of jquery.min.js");
    }
} else {
    console.log("Could not find jquery.min.js in main.js");
}
