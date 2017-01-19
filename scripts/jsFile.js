var datasource = "../data/data.json"
var backi= -1;

// HELPER FUNCTIONS
var timeLeftDescription = function(x) {

  var t = x.getTime();
  if(t<0) t=0;

  var tseconds = t / 1000;
  var seconds = Math.floor(tseconds) % 60;
  var tminutes = tseconds / 60;
  var minutes = Math.floor(tminutes) % 60;
  var thours = tminutes / 60;
  var hours = Math.floor(thours) % 24;
  var tdays = thours / 24;
  var days = Math.floor(tdays);

  return days + " days, " +
         ((hours < 10) ? "0" : "") + hours + "h " +
         ((minutes < 10) ? "0" : "") + minutes + "m " +
         ((seconds < 10) ? "0" : "") + seconds + "s";
}

// load DATABASE
// Note: data is a list of json objects of this form containing, "venue", "area", "deadline" as parsable string for data (see http://www.w3schools.com/js/js_dates.asp) and optionally "approx" that indicates if the date is just based on a previous date
var deadlines = new Array();
var deadlines_approx = new Array();
// probably not the best idea to make it synchronous, but the quick and dirty hack works for now
$.ajaxSetup({'async': false});
$.getJSON(datasource, function(data) {
  var now = new Date();
  for (var i in data) {
    d = new Date(data[i].deadline);
    while(d < now){
      d.setFullYear(d.getFullYear()+1);
      data[i].approx = 1;
    }
    data[i].deadline = d;
    if(data[i].approx){
      deadlines_approx.push(data[i]);
    }
    else{
      deadlines.push(data[i]);
    }
  }
  deadlines.sort(function(a,b) {
    return a.deadline.getTime() - b.deadline.getTime();
  });
  deadlines_approx.sort(function(a,b) {
    return a.deadline.getTime() - b.deadline.getTime();
  });
});

// Friday, March 1st, 11:59pm UTC
//deadlines.push({venue: "UAI", area: "Machine Learning", deadline: new Date("Friday, March 1st, 11:59pm UTC"), approx: 1});
// Mar. 15, 2013
//deadlines.push({venue: "IROS", area: "Robotics", deadline: new Date(2014, 2, 15, 23, 59, 0, 0)});

// Display function, called every second or so
function refreshDisplay() {

    var dc = new Date();
    $("#currtime").text("Current time: " + dc);

    // calculate and display deadlines
    for(var i=0;i<deadlines.length;i++) {
      var dl = deadlines[i];
      refreshDeadline(i, dl, dc, deadlines);
    }
    for(var i=0;i<deadlines_approx.length;i++) {
      var dl = deadlines_approx[i];
      refreshDeadline(i, dl, dc, deadlines_approx);
    }

}

function refreshDeadline(i, dl, dc, deadlines__){

  suffix = ""
  warningString= "";
  if("approx" in dl) {
    warningString= "based on previous year!";
    suffix= "_approx"
  }

  var timeLeft = new Date(dl.deadline.getTime() - dc.getTime());

  var venue = dl.venue;

  if("location" in dl)
    venue = venue + "  (" + dl.location + ")";

  if("link" in dl)
    venue = "<span class=\"vld\" id=\"link"+suffix+i+"\">" + venue + "</span>";

  $("#deadline" + suffix + i).html(
    "<div class=\"tld\">" + timeLeftDescription(timeLeft) + "</div>"
  + "<div class=\"vd\">" + venue + "</div>"
  + "<div class=\"ad\">" + dl.area + "</div>"
  + "<div class=\"td\"> Deadline: " + dl.deadline.toUTCString() + "</div>"
  + "<div class=\"wd\">" + warningString + "</div>"
  + "<div class=\"hd\" id=\"hide"+suffix+i+"\">hide</div>"
  );
  var hid = "#hide"+suffix+i;
  var did = "#deadline"+suffix+i;
  $(hid).click(function(x) {
    return function() {
      $(x).hide();
      return false;
    }
  }(did));

  var linkid = "#link"+suffix+i;
  $(linkid).click(function(x) {
    return function() {
      window.open(x);
      return false;
    }
  }(dl.link));

  if(backi !== -1) {
    var dl = deadlines[backi];
    if(backapprox)
      dl = deadlines_approx[backi];

    var venue = dl.venue;
    if("link" in dl)
      venue = "<span class=\"vld\" id=\"link"+suffix+i+"\">" + venue + "</span>";
    var timeLeft= new Date(dl.deadline.getTime() - dc.getTime());
    $("#backfacetext").html(
      venue + "</br>"
      + timeLeftDescription(timeLeft)
      );

    var linkid = "#link"+suffix+i;
    $(linkid).click(function(x) {
      return function() {
        window.open(x);
        return false;
      }
    }(dl.link));
  }
}

// int main(){}
$(document).ready(function() {

  // create divs for all deadlines and insert into DOM
  for(var i=0;i<deadlines.length;i++) {
    var dl= deadlines[i];
    $("<div class=dd id=deadline" + i + "></div>").appendTo("div#deadlinesdiv");
    var divid= "#deadline" + i;
    var hidid= "#hide" + i;

    $(divid).hide();
    $(divid).fadeIn(200*(i+1), function() { }); // create a nice fade in effect

    $(divid).click(function(z,zapprox) { // Fade in backface and make a giant timer for this event on click
      // self-executing function hackery :)
      return function() {
        backi = z;
        backapprox = zapprox;
        $("#backface").fadeIn("slow"); // fade in white stuff
      }
    }(i,false));
  }
  for(var i=0;i<deadlines_approx.length;i++) {
    var dl= deadlines_approx[i];
    $("<div class=dd id=deadline_approx" + i + "></div>").appendTo("div#deadlinesdiv");
    var divid= "#deadline_approx" + i;
    var hidid= "#hide_approx" + i;

    $(divid).hide();
    $(divid).fadeIn(200*(i+1), function() { }); // create a nice fade in effect

    $(divid).click(function(z,zapprox) { // Fade in backface and make a giant timer for this event on click
      // self-executing function hackery :)
      return function() {
        backi = z;
        backapprox = zapprox;
        $("#backface").fadeIn("slow"); // fade in white stuff
      }
    }(i,true));
  }

  // set up deadline timer to redraw
  setInterval(
    function(){ refreshDisplay(); },
    1000
  );

  $("#backface").click(function() {
    backi = -1;
    $("#backface").fadeOut("slow");
  });

  $("#makeown").click(function() {
    backi = -1;
    $("#instrown").fadeToggle();
  });

  // draw!
  refreshDisplay();

});
