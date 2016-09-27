//
// Jenkins Webservice
// @author: Sedat Zamur 853309 THM / Gießen
//

//
// express REST API
//
var express = require('express');
var router = express();
var port = 8080;
var JefNode = require('json-easy-filter').JefNode;

//
// Jenkins API
//
var jenkinsapi = require('jenkins-api');

//
// username/password Jenkins authentification
//
var jenkins = jenkinsapi.init("http://holoprojekt:35108e9b1a2bfdc2876e68b6ec09ce0e@jenkins-ci.mni.thm.de:8080");

//
// GET all Jobs filtered by Parent/Child in an array
//
router.get('/getallprojects', function (req, res) {
    jenkins.all_jobs(function (err, data) {
        if (err) {
            return console.log(err);
        }
        //var rex = String.prototype.search(['Core']); //suche nur nach "Core"
        var dot;
        var line;
        //split / regExp seperators
        var separators = ['\\.', '-'];
        var parent, temporary;
        var result = [];
        //Filter by name and color
        //map wird eingesetzt wenn man im array sortiert; data sind alle daten; builds ist die class; map wird im array gesucht
        var jobData = data.map(function (projects) {
            return {"Project": projects.name, "Status": projects.color}
        }); //namen gefiltert
        //declaration for first element of filtered data
        parent = jobData[0];

        //eine schleife für alle namen
        for (var i = 1; i < jobData.length; i++) {
            //spliting by regular expression and loop
            temporary = jobData[i].Project.split(new RegExp(separators.join('|')), 1);
            //Temporary holt die Namen schaut ob es einen schon gibt und setzt diesen als Parent
            if (temporary != parent.Project.split(new RegExp(separators.join('|')), 1)[0]) {
                //push chosen element to created array
                result.push(parent);
                //nöchste Index wird zum Parent vom Array
                parent = jobData[i];
                parent.subProjects = [];
            } else {
                parent.subProjects.push(jobData[i]);
            }
        }
        //
        // response status & result
        //
        res.status(200);
        res.end(JSON.stringify(result));
    });
});

//
// GET Job Info
// Liefert ein mit Daten gefülltes Objekt
//
router.get('/projectinfo/:jobname', function (req, res) {
    var jobName = req.params.jobname;
    jenkins.job_info(jobName, function (err, data) {
        if (err) {
            return console.log(err);
        }
        //Erstellt wird eine Variable 'object'; in ihr werden dann die gesuchten Objekte geschrieben
        //console.log(data);
        var object = {Name: data.displayName};
        object.Color = data.color;
        //Index 0, weil nur der Wert aus dem array gewünscht ist
        object.Score = data.healthReport[0].score;
        //object. werden neue Daten in die Variable geschrieben
        object.Buildable = data.buildable;
        //var buildable = {Buildable:data.buildable};
        if (data.First_Build_Number == null) {
            object.First_Build_Number = null;
        } else object.First_Build_Number = data.firstBuild.number;
        //object.First_Build_Number = data.firstBuild.number;
        object.Last_Build_Number = data.lastBuild.number;
        if (data.lastCompletedBuild.number == null) {
            object.Last_Comlete_Build_Number = null;
        } else object.Last_Comlete_Build_Number = data.lastCompletedBuild.number;
        //object.Last_Comlete_Build_Number = data.lastCompletedBuild.number;
        if (data.lastFailedBuild == null) {
            object.Last_Failed_Build_Number = null;
        } else object.Last_Failed_Build_Number = data.lastFailedBuild.number;
        //object.Last_Stable_Build_Number = data.lastStableBuild.number;
        if (data.lastStableBuild == null) {
            object.Last_Stable_Build_Number = null;
        } else  object.Last_Stable_Build_Number = data.lastStableBuild.number;
        //object.Last_Successful_Build_Number = data.lastSuccessfulBuild.number;
        if (data.lastSuccessfulBuild == null) {
            object.Last_Successful_Build_Numbe = null;
        } else  object.Last_Successful_Build_Number = data.lastSuccessfulBuild.number;
        //object.Last_Unsuccessful_Build_Number = data.lastUnsuccessfulBuild.number;
        if (data.lastUnsuccessfulBuild == null) {
            object.Last_Unsuccessful_Build_Number = null;
        } else  object.Last_Unsuccessful_Build_Number = data.lastUnsuccessfulBuild.number;
        object.Next_Build_Number = data.nextBuildNumber;
        res.status(200);
        res.end(JSON.stringify(object));
    });
});

//
// GET last result
// Liefert true, false
//
router.get('/lastresult/:projectname', function (req, res) {
    var name = req.params.projectname;
    jenkins.last_result(name, function (err, data) {
        if (err) {
            return console.log(err);
        }
        //var object = {Name:data.fullDisplayName};
        console.log(data)
        res.status(200);
        res.end(JSON.stringify(data));
    });
});

//GET last build
router.get('/buildinfo/:projectname/:number', function (req, res) {
    var name = req.params.projectname;
    var number = req.params.number;
    jenkins.build_info(name, number, function (err, data) {
        if (err) {
            return console.log(err);
        }
        //console.log(data)
        var object = {Name: data.fullDisplayName};
        object.ID = data.id;
        object.Timestamp = data.timestamp;
        object.Result = data.result;
        object.ID = data.id;
        res.status(200);
        res.end(JSON.stringify(object));
    });
});

//
// GET last build report
// Liefert true, false
//
router.get('/lastbuildreport/:projectname', function (req, res) {
    var name = req.params.projectname;
    jenkins.last_build_report(name, function (err, data) {
        if (err) {
            return console.log(err);
        }
        var object = {Name: data.fullDisplayName};
        object.ID = data.id;
        object.BuildNumber = data.number;
        object.Result = data.result;
        object.ID = data.id;
        res.status(200);
        res.end(JSON.stringify(object));
    });
});

//GET last success info each Job
router.get('/lastsuccess/:projectname', function (req, res) {
    var name = req.params.projectname;
    jenkins.last_success(name, function (err, data) {
        if (err) {
            return console.log(err);
        }
        var object = {};
        object.Name = data.fullDisplayName;
        object.Timestamp = data.timestamp;
        object.Author = data.changeSet.items.map(function (projects) {
            return projects.author.fullName;
        });
        object.CommitID = data.changeSet.items.map(function (projects) {
            return projects.commitId;
        });
        object.Date = data.changeSet.items.map(function (projects) {
            return projects.date;
        });
        object.Message = data.changeSet.items.map(function (projects) {
            return projects.msg;
        });

        //var holo = data.filter("_class");
        //console.log(data)
        res.status(200);
        res.end(JSON.stringify(object));
    });
});

//server create
var server = router.listen(port, function () {
    console.log('Der Server ist erreichbar unter http://127.0.0.1:' + port + '/');

});
