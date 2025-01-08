function getScrollTop() {
  var scroll_top = 0;
  if (document.documentElement && document.documentElement.scrollTop) {
    scroll_top = document.documentElement.scrollTop;
  } else if (document.body) {
    scroll_top = document.body.scrollTop;
  }
  return scroll_top;
}

function addEvent(prev_note, prev_color) {
  var svg_div = document.getElementById("osmdSvgPage1");
  svg_div?.addEventListener("click", function (p) {
    if (prev_note) {
      prev_note.sourceNote.noteheadColor = prev_color;
    }
    var height = getScrollTop();
    const p_svg = new opensheetmusicdisplay.PointF2D(p.x, p.y + height);
    const p_osmd = osmd.graphic.svgToOsmd(p_svg);
    var note = osmd.graphic.GetNearestNote(p_osmd);
    var old_color = note.sourceNote.noteheadColor;
    note.sourceNote.noteheadColor = "red";
    osmd.render();
    document.body.scrollTop = height; //还原滚动条
    addEvent(note, old_color);
  });
}

function handleFileSelect(evt) {
  var maxOSMDDisplays = 10; // how many scores can be displayed at once (in a vertical layout)
  var files = evt.target.files; // FileList object
  var osmdDisplays = Math.min(files.length, maxOSMDDisplays);

  var output = [];
  for (var i = 0, file = files[i]; i < osmdDisplays; i++) {
    output.push("<li><strong>", escape(file.name), "</strong> </li>");
    output.push("<div id='osmdCanvas" + i + "'/>");
  }
  document.getElementById("list").innerHTML =
    "<ul>" + output.join("") + "</ul>";

  for (var i = 0, file = files[i]; i < osmdDisplays; i++) {
    if (
      !file.name.match(".*.xml") &&
      !file.name.match(".*.musicxml") &&
      false
    ) {
      alert("You selected a non-xml file. Please select only music xml files.");
      continue;
    }

    var reader = new FileReader();

    reader.onload = function (e) {
      var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmdCanvas", {
        // set options here
        backend: "svg",
        drawFromMeasureNumber: 1,
        drawUpToMeasureNumber: Number.MAX_SAFE_INTEGER, // draw all measures, up to the end of the sample
      });
      osmd.load(e.target.result).then(function () {
        window.osmd = osmd; // give access to osmd object in Browser console, e.g. for osmd.setOptions()
        //console.log("e.target.result: " + e.target.result);

        osmd.render();
        // osmd.cursor.show(); // this would show the cursor on the first note
        // osmd.cursor.next(); // advance the cursor one note
        setTimeout(addEvent, 1);
      });
    };
    if (file.name.match(".*.mxl")) {
      // have to read as binary, otherwise JSZip will throw ("corrupted zip: missing 37 bytes" or similar)
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  }
}

document
  .getElementById("files")
  .addEventListener("change", handleFileSelect, false);
