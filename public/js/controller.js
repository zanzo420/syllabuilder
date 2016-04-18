var app = angular.module('syllabuilder', []);

// Needed for cross-browser (i.e modern browsers + IE10) download support
app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
}]);

var requiredFormIds = [
    "course-name",
    "dept-id",
    "course-num",
    "section-num",

    "from-time",
    "to-time",
    "meeting-building",
    "meeting-room",

    "instructor-name",
    "instructor-email",
    "instructor-office-hours"
];

// The contents of each section
var sectionContents = {
    "Description":     "",
    "Objectives":      "",
    "Target Audience": "",
    "Prerequisites":   "",
    "Goals":           "",
    "Requirements":    "",
    "Policies":        "",
    "Resources":       "",
    "Materials":       "",
    "Grading":         "",
    "Exams":           "",
    "Honor Code":      "The University of North Carolina at Chapel Hill has had a student-led honor system for over 100 years. Academic integrity is at the heart of Carolina and we all are responsible for upholding the ideals of honor and integrity.  The student-led Honor System is responsible for adjudicating any suspected violations of the Honor Code and all suspected instances of academic dishonesty will be reported to the honor system. Information, including your responsibilities as a student is outlined in the Instrument of Student Judicial Governance. Your full participation and observance of the Honor Code is expected.",
    "Accessibility":   "The University of North Carolina at Chapel Hill ensures that no qualified person shall by reason of a disability be denied access to, participation in, or the benefits of, any program or activity operated by the University. Each qualified person shall receive reasonable accommodations to ensure equal access to educational opportunities, programs, and activities in the most integrated setting appropriate.",
    "Disclaimer":      "The professor reserves to right to make changes to the syllabus, including project due dates and test dates. These changes will be announced as early as possible.",
};

// Get all weekdays between FDOC and LDOC
var getDates = function(fdocstr, ldocstr) {
    // Get FDOC and LDOC as Date objects
    var fdoc = Date.parse(fdocstr);
    var ldoc = Date.parse(ldocstr);

    // Add all weekdays in between
    var date = fdoc.add(-1).day();
    var res = [];
    while (date.compareTo(ldoc) < 0) {
        date = date.add(1).day();
        if (!date.isWeekday())
            date = date.next().monday();
        res.push(date.clone());
    }

    return res;
}

var calendar = {
    "2016" : {
        "fall": {
            "fdoc": "tuesday aug 23 2016",
            "ldoc": "wednesday dec 07 2016",
        },
        "spring": {
            "fdoc": "monday jan 11 2016",
            "ldoc": "wednesday apr 27 2016",
        },
    },

    "2017" : {
        "fall": {
            "fdoc": "",     // TODO: Data doesn't exist yet
            "ldoc": "",     // TODO: Data doesn't exist yet
        },
        "spring": {
            "fdoc": "wednesday jan 11 2017",
            "ldoc": "friday apr 28 2017",
        }
    },
};

var getLocationSearch = function() {
		return location.search;
};

app.controller('main-controller', function($scope, $window, $http) {
    // Parse URL parameters to get year and semester
    var params = getLocationSearch().substring(1).split("&");
    var year     = params[0].split("=")[1];
    var semester = params[1].split("=")[1];

    $scope.fdocstr = calendar[year][semester]["fdoc"];
    $scope.ldocstr = calendar[year][semester]["ldoc"];

    $scope.dates = getDates($scope.fdocstr, $scope.ldocstr);
	
    $scope.checkDate = function(date) {
        var datestr = date.toString("ddd, MMM dd").substring(0, 2);
        if (datestr === "Mo" && $scope.mo ||
            datestr === "Tu" && $scope.tu ||
            datestr === "We" && $scope.we ||
            datestr === "Th" && $scope.th ||
            datestr === "Fr" && $scope.fr)
            return true;
        return false;
    };

    // Construct HTML representation of section contents
    // TODO: Handle newlines in the textarea more elegantly in the final HTML
    $scope.constructHTML = function() {
        var html = "<!DOCTYPE html><html> <head></head>\n";

        // Set style
        html += "<style type='text/css'>";
        html += "   .section-header, .prelude-header {";
        html += "       font-size: 12pt;";
        html += "       font-weight: bold;";
        html += "   }";
        html += "   .section-contents, .prelude-contents {";
        html += "       font-size: 12pt;";
        html += "   }";
        html += "   body {";
        html += "       margin: 1in;";
        html += "       font-family: Arial;";
        html += "   }";
        html += "   table {";
        html += "       width: 100%;";
        html += "   }";
        html += "   th, td {";
        html += "       padding: 5px;";
        html += "       text-align: left;";
        html += "   }";
        html += "   table, th, td {";
        html += "       border: 1px solid black;";
        html += "       border-collapse: collapse;";
        html += "   }";
        html += "   table th {";
        html += "       background-color: white;";
        html += "       color: black;";
        html += "   }";
        html += "   table input {";
        html += "       width: 99%;";
        html += "   }";
        html += "</style>";

        // Add in prelude
        var courseName = document.getElementById("course-name").value;
        if (courseName === "")
            courseName = "[INSERT-COURSE-NAME-HERE]";
        var deptId = document.getElementById("dept-id").value;
        if (deptId === "")
            deptId = "[INSERT-DEPT-ID-HERE]";
        var courseNum = document.getElementById("course-num").value;
        if (courseNum === "")
            courseNum = "[INSERT-COURSE-NUMBER-HERE]";
        var sectionNum = document.getElementById("section-num").value;
        if (sectionNum === "")
            sectionNum = "[INSERT-SECTION-NUMBER-HERE]";
        var meetingDays = "";
        if ($scope.mo) meetingDays += "Mo";
        if ($scope.tu) meetingDays += "Tu";
        if ($scope.we) meetingDays += "We";
        if ($scope.th) meetingDays += "Th";
        if ($scope.fr) meetingDays += "Fr";
        var fromTime = document.getElementById("from-time").value;
        if (fromTime === "")
            fromTime = "[INSERT-START-TIME-HERE]";
        var toTime = document.getElementById("to-time").value;
        if (toTime === "")
            toTime = "[INSERT-END-TIME-HERE]";
        var meetingBuilding = document.getElementById("meeting-building").value;
        if (meetingBuilding === "")
            meetingBuilding = "[INSERT-MEETING-BUILDING-HERE]";
        var meetingRoom = document.getElementById("meeting-room").value;
        if (meetingRoom === "")
            meetingRoom = "[INSERT-MEETING-ROOM-HERE]";
        var courseWebsite  = document.getElementById("course-website").value;
        var instructorName = document.getElementById("instructor-name").value;
        if (instructorName === "")
            instructorName = "[INSERT-INSTRUCTOR-NAME-HERE]";
        var instructorEmail = document.getElementById("instructor-email").value;
        if (instructorEmail === "")
            instructorEmail = "[INSERT-INSTRUCTOR-EMAIL-HERE]";
        var instructorPhone       = document.getElementById("instructor-phone").value;
        var instructorOfficeHours = document.getElementById("instructor-office-hours").value;
        if (instructorOfficeHours === "")
            instructorOfficeHours = "[INSERT-INSTRUCTOR-OFFICE-HOURS-HERE]";
        var instructorWebsite = document.getElementById("instructor-website").value;
        html += "<div style='font-size: 18pt; font-weight: bold;'>" + deptId + " " + courseNum + "-" + sectionNum + ": " + courseName+ "</div>";
        html += "<br>";
        html += "<br>";
        html += "<div class='prelude-header'>General Course Info</div>";
        html += "<br>";
        html += "<div class='prelude-contents'>Time: " + meetingDays + " from " + fromTime + " to " + toTime + "</div>";
        html += "<div class='prelude-contents'>Meeting Building: " + meetingBuilding + "</div>";
        html += "<div class='prelude-contents'>Meeting Room: " + meetingRoom + "</div>";
        if (courseWebsite !== "")
            html += "<div class='prelude-contents'>Website: " + courseWebsite + "</div>";
        html += "<br>";
        html += "<div class='prelude-header'>Instructor Info</div>";
        html += "<br>";
        html += "<div class='prelude-contents'>Name: " + instructorName + "</div>";
        html += "<div class='prelude-contents'>Email: " + instructorEmail + "</div>";
        if (instructorPhone !== "")
            html += "<div class='prelude-contents'>Phone: " + instructorPhone + "</div>";
        html += "<div class='prelude-contents'>Office Hours: " + instructorOfficeHours + "</div>";
        if (instructorWebsite !== "")
            html += "<div class='prelude-contents'>Website: " + instructorWebsite + "</div>";
        html += "<br>";

        // Add in sections
        for (section in sectionContents) {
            if (sectionContents.hasOwnProperty(section)) {
                if (sectionContents[section] !== "" && sectionContents[section] !== undefined) {
                    html += "<div class='section-header'>" + section + ": </div><br>";
                    html += "<div class='section-contents'>" + sectionContents[section] + "</div><br>";
                    html += "<br>";
                }
            }
        }

        // Add in schedule
        // TODO: If schedule is completely empty, don't include any of it
        html += "<table> <tr><th>Date</th> <th>Material Covered</th> <th>Homework</th></tr>";
        for (var i = 0; i < $scope.dates.length; i++) {
            var date = $scope.dates[i];
            if ($scope.checkDate(date)) {
                html += "<tr>";
                html += "<td>" + date.toString("ddd, MMM dd") + "</td>";
                html += "<td>" + document.getElementById("material_" + i).value + "</td>";
                html += "<td>" + document.getElementById("homework_" + i).value + "</td>";
                html += "</tr>";
            }
        }
        html += "</table>";

        html += "</body></html>";

        return html;
    };

    // Save contents of text editor to appropriate section
    $scope.saveSection = function(text, currentSection, lastSection) {
        // Toggle button background colors
        document.getElementById(lastSection).style.background    = "white";
        document.getElementById(currentSection).style.background = "#235d86";
        document.getElementById(lastSection).style.color    = "#575757";
        document.getElementById(currentSection).style.color = "white";

        // Set current section
        $scope.currentSection = currentSection;

        // Set default placeholder text to be current section being edited
        $scope.placeholderText = currentSection;

        // Save current text to last section edited
        sectionContents[lastSection] = text;

        // Update current text with current section
        $scope.text = sectionContents[currentSection];

        // Update last section
        $scope.lastSection = currentSection;
    };

    // Preview current contents of section in another tab
    $scope.preview = function() {
        // Save current text to appropriate object
        $scope.saveSection($scope.text, $scope.currentSection, $scope.lastSection);

        // Create preview window in new tab
        var previewWindow = window.open();

        // Construct final HTML from section contents
        var html = $scope.constructHTML();

        // Write final HTML to preview window
        previewWindow.document.write(html);
    };

    // Export HTML to .docx file (Word will take care of the rest)
    $scope.exportDOCX = function() {
        // Save current text to appropriate object
        $scope.saveSection($scope.text, $scope.currentSection, $scope.lastSection);

        return $scope.constructHTML();
    };

    // Export HTML file for download, in case automatic conversion fails
    $scope.exportHTML = function() {
        // Save current text to appropriate object
        $scope.saveSection($scope.text, $scope.currentSection, $scope.lastSection);

        // Prompt file download
        $scope.html    = $scope.constructHTML();
        $scope.blob    = new Blob([$scope.html], { type: 'text/html' });
        $scope.fileUrl = ($window.URL || $window.webkitURL).createObjectURL($scope.blob);
    }

    // Clear all data
    $scope.clear = function() {
        if (confirm("Are you sure you want to clear all edit data?")) {
            // Clear prelude
            document.getElementById("course-name").value             = "";
            document.getElementById("dept-id").value                 = "";
            $scope.mo = false;
            $scope.tu = false;
            $scope.we = false;
            $scope.th = false;
            $scope.fr = false;
            document.getElementById("course-num").value              = "";
            document.getElementById("section-num").value             = "";
            document.getElementById("from-time").value               = "";
            document.getElementById("to-time").value                 = "";
            document.getElementById("meeting-building").value        = "";
            document.getElementById("meeting-room").value            = "";
            document.getElementById("course-website").value          = "";
            document.getElementById("instructor-name").value         = "";
            document.getElementById("instructor-email").value        = "";
            document.getElementById("instructor-phone").value        = "";
            document.getElementById("instructor-office-hours").value = "";
            document.getElementById("instructor-website").value      = "";

            // Clear section data
            for (section in sectionContents) {
                if (sectionContents.hasOwnProperty(section) && sectionContents[section] !== undefined) {
                    sectionContents[section] = "";
                }
            }

            // Clear text editor
            $scope.text = "";

            // Clear schedule
            for (var i = 0; i < $scope.dates.length; i++) {
                document.getElementById("material_" + i).value = "";
                document.getElementById("homework_" + i).value = "";
            }
        }
    }
	
	// DB save/load functions. Untested...
	$scope.save = function(username, title) {
		var syllabus = constructJSON(username, title);
		$http.post('/syllabi/:'+username+'-'+title).success(function(data) {
			return 0; // success
		});
	}
		
	$scope.loadSyllabus = function(username, title) {
		var syllabus;
		$http.get('/syllabi/:'+username+'-'+title).success(function(data) {
			syllabus = data;
		});
		// TODO: Add some sort of confirmation so the user doesn't accidentally lose work
		$scope.populateFromJSON(syllabus);
	}
	
	// Compile form data into a JSON object for storage in database
	var constructJSON = function(username, title) {
		var i = 0;
		
		// Construct timetable
		var timetable = [];
		 for (var i = 0; i < $scope.dates.length; i++) {
            timetable.append({material: document.getElementById("material_" + i).value, homework: document.getElementById("homework_" + i).value});           
        }
		
		var json =
		{
			"_id": username+'-'+title,
			"course-info": {
				"course-name": document.getElementById('course-name').value,
				"course": {
					"dept-id": document.getElementById('dept-id').value,
					"course-num": document.getElementById('course-num').value,
					"section-num": document.getElementById('section-num').value,
				},
				"term": semester+' '+year,
				"from-time": document.getElementById('from-time').value,
				"to-time": document.getElementById('to-time').value,
				"meeting-building": document.getElementById('meeting-building').value,	
				"meeting-room": document.getElementById('meeting-room').value,
				"meetings": {
					"mo": $scope.mo,
					"tu": $scope.tu,
					"we": $scope.we,
					"th": $scope.th,
					"fr": $scope.fr
				},
				"website": document.getElementById('course-website').value,
			},
			"instructor-info": {
				"name": document.getElementById('instructor-name').value,
				"email": document.getElementById('instructor-email').value,
				"phone": document.getElementById('instructor-phone').value,
				"office-hours": document.getElementById('office-hours').value,
				"website": document.getElementById('instructor-website').value
			},
			"description": sectionsContents[i++],
			"objectives": sectionsContents[i++],
			"audience": sectionsContents[i++],
			"prerequisites": sectionsContents[i++],
			"goals": sectionsContents[i++],
			"requirements": sectionsContents[i++],
			"policies": sectionsContents[i++],
			"resources": sectionsContents[i++],
			"materials": sectionsContents[i++],
			"grading": sectionsContents[i++],
			"exams": sectionsContents[i++],
			"honor-code": sectionsContents[i++],
			"accessibility": sectionsContents[i++],
			"disclaimer": sectionsContents[i++],
			"time-table": timetable
		};
		
		return json;
	}
	
	// Populate the page from a loaded syllabus. Warning, will overwrite the existing data...
	$scope.populateFromJSON = function(syllabus) {
		// Populate prelude
		document.getElementById("course-name").value             = syllabus['course-info']['course-name'];
        document.getElementById("dept-id").value                 = syllabus['course-info']['course']['dept-id'];
        $scope.mo  												 = syllabus['course-info']['meetings']['mo'];
        $scope.tu  												 = syllabus['course-info']['meetings']['tu'];
		$scope.we  												 = syllabus['course-info']['meetings']['we'];
		$scope.th  												 = syllabus['course-info']['meetings']['th'];
		$scope.fr 	 											 = syllabus['course-info']['meetings']['fr'];
		document.getElementById("course-num").value              = syllabus['course-info']['course']['course-num'];
		document.getElementById("section-num").value             = syllabus['course-info']['course']['section-num'];
		document.getElementById("from-time").value               = syllabus['course-info']['from-time'];
		document.getElementById("to-time").value                 = syllabus['course-info']['to-time'];
		document.getElementById("meeting-building").value        = syllabus['course-info']['meeting-building'];
		document.getElementById("meeting-room").value            = syllabus['course-info']['meeting-room'];
		document.getElementById("course-website").value          = syllabus['course-info']['website'];
		document.getElementById("instructor-name").value         = syllabus['instructor-info']['name'];
		document.getElementById("instructor-email").value        = syllabus['instructor-info']['email'];
		document.getElementById("instructor-phone").value        = syllabus['instructor-info']['phone'];
		document.getElementById("instructor-office-hours").value = syllabus['instructor-info']['office-hours'];
		document.getElementById("instructor-website").value      = syllabus['instructor-info']['website'];
		
		// Populate section data
		var i = 0;
		sectionContents[i++] = syllabus['description'];
		sectionContents[i++] = syllabus['objectives'];
		sectionContents[i++] = syllabus['audience'];
		sectionContents[i++] = syllabus['prerequisites'];
		sectionContents[i++] = syllabus['goals'];
		sectionContents[i++] = syllabus['requirements'];
		sectionContents[i++] = syllabus['policies'];
		sectionContents[i++] = syllabus['resources'];
		sectionContents[i++] = syllabus['materials'];
		sectionContents[i++] = syllabus['grading'];
		sectionContents[i++] = syllabus['exams'];
		sectionContents[i++] = syllabus['honor-code'];
		sectionContents[i++] = syllabus['accessibility'];
		sectionContents[i++] = syllabus['disclaimer'];
		
		for (var i = 0; i < $scope.dates.length; i++) {
            document.getElementById("material_" + i).value = syllabus['time-table'][i]['material'];
            document.getElementById("homework_" + i).value = syllabus['time-table'][i]['homework'];
        }
	}
    // Success and failure callbacks
    /*
    var success = function(resp) {$scope.resp = "Success! " + resp.data;};
    var failure = function(resp) {$scope.resp = "Failure! " + resp.status;};

    $http.get("http://syllabuilder-menozzi.apps.unc.edu/test").then(success, failure);
    */
});
