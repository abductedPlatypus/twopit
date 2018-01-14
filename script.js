function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        params = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!params.hasOwnProperty(n)) params[n] = [];
        params[n].push(nv.length === 2 ? v : null);
    }
    return params;
} // https://stackoverflow.com/questions/814613/how-to-read-get-data-from-a-url-using-javascript

function fromMilliSeconds(pbMS, sobMS)
{
     return sobMS/pbMS;
}

function fromString(pbStr, sobStr)
{
    let pbMS = parseTimeString(pbStr);
    let sobMS = parseTimeString(sobStr);
    if(pbMS < 0 || sobMS < 0){
        return 0.0;
    }
    return fromMilliSeconds(pbMS, sobMS);
}

function parseTimeString(str)
{
    str = str.toString();
    // 4 times similar to "<number><h, m, s or ms>", case insensitive, with whitespaces allowed
    let hmsmsRegExp = new RegExp("^([0-9]+\\s*h)*\\s*([0-9]+\\s*m)*\\s*([0-9]+\\s*s)\\s*([0-9]+\\s*(ms))*\\s*$", "i"); 
    // 2 times similar to "<number>:" then <x>(.<xxx>), case insensitive, with whitespaces allowed
    let colonRegExp = new RegExp("^\\s*(\\s*[0-9]*:\\s*)?(\\s*[0-9]*:\\s*)?(\\s*[0-9]+[.,]?\\s*)[0-9]*\\s*$", "i");
    let ms = -1;
    if(hmsmsRegExp.test(str)){
        ms = parseHMSMSString(str)
    }else if (colonRegExp.test(str)){ //else if(str.indexOf(":") !== -1){
        ms = parseColonString(str);
    }
    if(isNaN(ms)){
        return -1;
    }
    return ms;
}

function getSumHMSMS(h, m, s, ms){
    let result = 0;
    if(h !== undefined){
        result += 3600000 * h;
    }
    if(m !== undefined){
        result += 60000 * m;
    }
    if(s !== undefined){
        result += 1000 * s;
    }
    if(ms !== undefined){
        result += ms;
    }
    return Math.floor(result);
}

function parseColonString(str){
    str = str.replace(",", ".");
    str = str.replace(new RegExp("\\s", "g"), "");
    let strs = str.split(":");
    if(strs.length > 3 || strs.length == 0){
        return -1;
    }
    let h = 0;
    let s = 0;
    let m = 0;
    if(strs.length == 3){
        h = parseFloat(strs[0]);
        m = parseFloat(strs[1]);
        s = parseFloat(strs[2]);
    }
    else if(strs.length == 2){
        m = parseFloat(strs[0]);
        s = parseFloat(strs[1]);
    }
    if(strs.length == 1){
        s = parseFloat(strs[0]);
    }
    return getSumHMSMS(h, m, s);
}

function parseHMSMSString(str)
{
    let h = 0;
    let m = 0;
    let s = 0;
    let ms = 0
    // find the hour part
    let strH = new RegExp("[0-9]+\\s*h", "i").exec(str);
    if(strH !== null && strH[0]){
        // replace all h's and whitespaces
        let number = strH[0].replace(/(\s*h*)/gi, "");
        h += parseFloat(number); 
    }
    let strM = new RegExp("[0-9]+\\s*m", "i").exec(str);
    if(strM !== null && strM[0]){
        let number = strM[0].replace(/(\s*m*)/gi, "");
        m += parseFloat(number);
    }
    let strS = new RegExp("[0-9]+\\s*s", "i").exec(str);
    if(strS !== null && strS[0]){
        let number = strS[0].replace(/(\s*s*)/gi, "");
        s += parseFloat(number);
    }
    let strMS = new RegExp("[0-9]+\\s*(ms)", "i").exec(str);
    if(strMS !== null && strMS[0]){ 
        let number = strMS[0].replace(/(\s*(ms)*)/gi, "");
        ms += parseFloat(number);
    } 
    return getSumHMSMS(h,m,s,ms);
}

function msToHMSMSString(ms){
    let result = "";
    let remainder = ms;
    if (ms > 3600000){
        let hours = Math.floor(ms/3600000);
        result += hours;
        result += "h "
        remainder -= hours * 3600000; // should be faster than modulo
    }
    if (ms > 60000){
        let minutes = Math.floor(remainder/60000);
        result += minutes;
        result += "m "
        remainder -= minutes * 60000; 
    }
    if (ms > 1000){
        let seconds = Math.floor(remainder/1000);
        result += seconds;
        result += "s "
        remainder -= seconds * 1000;
    }
    result += remainder+"ms";

    return result;
}

$(document).ready(function(){
    let params = parseURLParams(window.location.href);
    if(params !== undefined && params["pb"] !== undefined && params["pb"] !== undefined)
    {
        if(parseTimeString(params["pb"]) >=0 && parseTimeString(params["sob"]) >=0) {
            showScore(params);
        }else{
            showHome(params);
        }
    } else {
        showHome(params);
    }

    $("#go").click(function(){
        localStorage.setItem('name', $("#name").val());
        localStorage.setItem('sob', $("#sob").val());
        localStorage.setItem('sobname', $("#sobname").val());
    });
});

function showScore(params){
    $("#home").addClass("d-none");
    $("#score").removeClass("d-none");
    params["pb"]
    if(params["name"] !== undefined && params["name"].toString().length > 0){
        $("#yesname").removeClass("d-none");
        $("#sobNameDisplay").text(params["name"]);
        $("#noname").addClass("d-none");
    }else{
        $("#noname").removeClass("d-none");
        $("#yesname").addClass("d-none");
    }

    var sobratio = fromString(params["pb"], params["sob"]);
    $("#ratioDisplay").text((sobratio*100).toFixed(4) + "%");
    if(sobratio > 1){
        $("#reported").removeClass("d-none");
        $("#tryharder").addClass("d-none");
    }else{
        $("#tryharder").removeClass("d-none");
        $("#reported").addClass("d-none");
    }
    var pbString = msToHMSMSString(parseTimeString(params["pb"]));
    $("#pbDisplay").text(pbString);
    var sobString = msToHMSMSString(parseTimeString(params["sob"]));
    $("#sobDisplay").text(sobString);
    
    if(params["name"] !== undefined && params["name"].toString().length > 0){
        $("#pbNameDisplayBrackets").text("(" + params["name"] +")");
    }else {
        $("#pbNameDisplayBrackets").text("");
    }

    if(params["sobname"] !== undefined && params["sobname"].toString().length > 0){
        $("#sobNameDisplayBrackets").text("(" + params["sobname"] +")");
    }else {
        $("#sobNameDisplayBrackets").text("");
    }

    $("#twitterArea").html('<a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-size="large" id="twitter" data-text="I am ' +(sobratio*100).toFixed(4)+'% Mr.Destructoid. PB:'+pbString+' SoB'+(params["sobname"] !== undefined && params["sobname"].toString().length > 0?'('+params["sobname"]+'):':":")+sobString+'." data-url="'+window.location.href+'" data-hashtags="SoBRatio" data-related="abductypus,wfingr" data-show-count="false">Tweet</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>');
    twttr.widgets.load();
}

function showHome(params){
    $("#pb").removeClass("is-invalid");
    $("#pb").removeClass("is-valid");
    $("#sob").removeClass("is-invalid");
    $("#sob").removeClass("is-valid");
    $("#name").removeClass("is-valid");
    $("#sobname").removeClass("is-valid");

    if(params !== undefined){
        if(params["name"] !== undefined){
            $("#pb").val(params["name"]);
            $("#name").addClass("is-valid");
        }
        if(params["sobname"] !== undefined){
            $("#pb").val(params["sobname"]);
            $("#sobname").addClass("is-valid");
        }
        if(params["pb"] !== undefined){
            $("#pb").val(params["pb"]);
            if(parseTimeString(params["pb"]) > 0){
                $("#pb").addClass("is-valid");
            } else {
                $("#pb").addClass("is-invalid");
            }
        }
        if(params["sob"] !== undefined){
            $("#sob").val(params["sob"]);
            if(parseTimeString(params["sob"]) > 0){
                $("#sob").addClass("is-valid");
            } else {
                $("#sob").addClass("is-invalid");
            }
        }
    }else{
        $("#sobratio-form").removeClass("was-validated");
    }
    let sobVal = localStorage.getItem("sob");
    if(sobVal && sobVal !== undefined){
        $("#sob").val(localStorage.getItem("sob"));
    }
    let nameVal = localStorage.getItem("name");
    if(nameVal && sobVal !== undefined){
        $("#name").val(localStorage.getItem("name"));
    }
    let sobnameVal = localStorage.getItem("sobname");
    if(sobnameVal && sobVal !== undefined){
        $("#sobname").val(localStorage.getItem("sobname"));
    }

    $("#home").removeClass("d-none");
    $("#score").addClass("d-none");
}

