var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var formidable = require('formidable');
var cloudinary = require('cloudinary');
var path = require('path');
var fs = require('fs');

cloudinary.config({ 
	cloud_name: 'dxgyixsmg', 
	api_key: '862129673261382', 
	api_secret: 'g-0pnDM6ZVHf_noES9RWrudPr64' 
  //cdn_subdomain: true
});

router.post('/add', function(req, res) {
	//console.log(req.files,req.body)
	//console.log("haim" + req.body.newTrip + " " + req.body.des);
	console.log("start to add to DB")
	var urlImg="";
	var dataForm={};
	var playlistToAdd = {};
	var form = new formidable.IncomingForm();

	form.parse(req, function(error, fields, files) 
	{
		console.log('-->PARSE<--');
        //logs the file information 
        console.log("files", JSON.stringify(files));
        console.log("fields", JSON.stringify(fields));
        dataForm=fields;
    });

	form.on('progress', function(bytesReceived, bytesExpected) 
	{
		var percent_complete = (bytesReceived / bytesExpected) * 100;
		// console.log(percent_complete.toFixed(2));
	});

	form.on('error', function(err) 
	{
		console.log("-->ERROR<--");
		console.error(err);
	});
	form.on('end', function(error, fields, files) {
		var file_names = this.openedFiles;

	 	//console.log(this)
		var files_temp=[];
		var temp_paths=[];
		for(i in file_names){
			files_temp.push(file_names[i]);
			
		}
		for(i in files_temp){
			if(files_temp[i].name==''){
				var x= files_temp[i]
			}else{
				temp_paths[i]=files_temp[i].path;
			}
			// console.log("temp_path file: ",temp_paths[i]);
			// console.log(files_temp[i])
		}

		var urls=[],total=0,size=0;
		total = temp_paths.length;
		for(i in temp_paths){
			console.log(temp_paths[i])
			cloudinary.uploader.upload(temp_paths[i], 
                    function(result) { 
                  		if (result.error) {
							return;
						}
                  		urls.push(result.url);	
                  		
                  		++size;
                  		if (total != size) return;
                  		
                  		console.log('urls',urls)

                  		playlistToAdd.trip_name = dataForm.nameTrip;
						playlistToAdd.trip_description = dataForm.des;
						playlistToAdd.address = dataForm.locationTrip;
						var tripCharachters = [];
						tripCharachters.push(dataForm.firstcharachter);
						tripCharachters.push(dataForm.secondcharachter);
						playlistToAdd.trip_charachters = tripCharachters;
						var sitesName = dataForm.ingredients;
						console.log("SSSSSSSSS",sitesName)
						var loc= dataForm.amount;
						var sites=JSON.parse(dataForm.sites);
						playlistToAdd.mapPoint=(dataForm.mapPoint)?JSON.parse(dataForm.mapPoint):'';
							for (val in sites){
								console.log("############",urls[val]);
								sites[val].img = urls[val];
							}
							console.log("$$$$$$$$",sites)

							playlistToAdd.trip_isPrivate = dataForm.isTripPrivate;
							playlistToAdd.area = dataForm.area;
							var tripFilter =[];
							playlistToAdd.email =dataForm.email;

							var privte = dataForm.isTripPrivate;
							var areaLocition = dataForm.area;
							userEmail =dataForm.email;
							var shareEmail=dataForm.shareEmail;
							playlistToAdd.shareEmail=shareEmail;
							var tripFilter=JSON.parse(dataForm.trip_filter);
							console.log("trip filters " + tripFilter);
							tripFilter.push(dataForm.difficulty);

							console.log("filters enterd " + tripFilter)
							playlistToAdd.trip_filter = tripFilter;
							playlistToAdd.tripSites = sites;
							// playlistToAdd.imageUrl = urlImg;
							// console.log("inage url on cloudinary " + urlImg)
							var newTrip = new Playlist(playlistToAdd);
							console.log("new trip before insert " + newTrip)
							newTrip.save(function(err, docs) {
								if (err) {
									console.log("found error inserting");
									res.json({status:0,err:err})
									return;
								}
								if(docs){
									console.log('insert seccessfuly')
									res.json({status:1},docs)
									return ;
								}
							});
                  		// save into the database
                       	//console.log(result) 

                    },{
                    	crop: 'limit',
						width: 640,
						height: 360
                    });
		}

			// cloudinary.uploader.upload([temp_paths[0],temp_paths[1]], 
   //                         function(result) { console.log(result) 
   //                  });

		/* The file name of the uploaded file */
		// var file_name = this.openedFiles;
		// console.log("file_name: " , file_names);
		
		
		/*/*var stream = cloudinary.uploader.upload_stream(function(result) {
			console.log("result from cloudinary " + result) 
			urlImg=result.url;

			playlistToAdd.trip_name = dataForm.nameTrip;
			playlistToAdd.trip_description = dataForm.des;
			playlistToAdd.address = dataForm.locationTrip;
			var tripCharachters = [];
			tripCharachters.push(dataForm.firstcharachter);
			tripCharachters.push(dataForm.secondcharachter);
			playlistToAdd.trip_charachters = tripCharachters;
			var sitesName = dataForm.ingredients;
			var loc= dataForm.amount;
			var sites=JSON.parse(dataForm.sites);
			playlistToAdd.mapPoint=(dataForm.mapPoint)?JSON.parse(dataForm.mapPoint):'';
			if(sitesName)
				for (val in sitesName){
					sites.push({sitesName:sitesName[val],loc:loc[val]});
				}

				playlistToAdd.trip_isPrivate = dataForm.isTripPrivate;
				playlistToAdd.area = dataForm.area;
				var tripFilter =[];
				playlistToAdd.email =dataForm.email;

				var privte = dataForm.isTripPrivate;
				var areaLocition = dataForm.area;
				userEmail =dataForm.email;
				var shareEmail=dataForm.shareEmail;
				playlistToAdd.shareEmail=shareEmail;
				var tripFilter=JSON.parse(dataForm.trip_filter);
				console.log("trip filters " + tripFilter);
				tripFilter.push(dataForm.difficulty);

				console.log("filters enterd " + tripFilter)
				playlistToAdd.trip_filter = tripFilter;
				playlistToAdd.tripSites = sites;
				playlistToAdd.imageUrl = urlImg;
				console.log("inage url on cloudinary " + urlImg)
				var newTrip = new Playlist(playlistToAdd);
				console.log("new trip before insert " + newTrip)
				newTrip.save(function(err, docs) {
					if (err) {
						console.log("found error inserting");
						res.json({status:0,err:err})
						return;
					}
					if(docs){
						console.log('insert seccessfuly')
						res.json({status:1},docs)
						return ;
					}
				});
			});
	
	var file_reader = fs.createReadStream(temp_paths).pipe(stream)
*/
	 });

});  
function uploadCallBack(total,size,urls){
	if (total == size) console.log('urls',urls)

}

router.post('/filterByChars', function(req, res) {
	try{
		var charachters = req.body.chars;
		var user = req.body.userId;
		console.log("trip charachters " + charachters)
	}
	catch(err){
		console.log("cant get charachters")
	}
 	
	// db.model('tripper_playlist').findOne({ email : user.email }, function(err, result){
	db.model('tripper_playlists').find( {$or : [
			{$and: [ {trip_charachters: { $in : [charachters[0], charachters[1] ] } }, { trip_isPrivate : false } ] },
			{$and: [ {trip_charachters: { $in : [charachters[0], charachters[1] ] } }, { trip_isPrivate : true }, { shareEmail : user} ] }, 
		]}).sort({ rate : 'ascending'}).exec(function (err, docs)
		{ 
                // failure while connecting to sessions collection
                if (err) 
                {
                	console.log("cant get results " + err);

                	return;
                }
                
                else
                {
                	console.log(docs);
                	res.json(docs)
                }
            });
	
});

//addComment

router.post('/addComment', function(req, res) {
	try{
		var user = req.body.user;
		var trip_id = req.body.trip_id;
		var comment = req.body.comment;
		var objComment = {
			userName : user.name,
			userImg : user.image,
			comment : comment
		}
			// user.name + " : " +comment;
		console.log(" update comment",comment);
	}
	catch(err){
		console.log("cant add comment")
	}
	// var tripper_collection = db.model('tripper_playlist')
	db.model('tripper_playlists').findByIdAndUpdate(trip_id, { $push: {comments:objComment}}, function(err, docs) {
		if (err) {
			console.log("found error inserting");
			res.json({status:0})
			db.close();
			return console.error(err);
		}
		console.log("updated comment")
		console.log(docs)
		res.json({status:1})
		return;
	});

});

app.post('/getTripById', function(req, res) {
	try{
		var tripId = req.body.id;
		console.log(tripId);		
	}
	catch(err){
		console.log("error getting trip id " + err)
	}
	db.model('tripper_playlists').findOne({ _id : new ObjectId(tripId) },function (err, docs)
			{ 
                if (err) 
                {
                	console.log( err);

                	return;
                }
                
                else
                {
                	console.log(docs);
                	res.json(docs);
                }
            });
});


app.get('/findTripByUser/:email?', function(req, res) {
	try{
		userEmail = req.query.email;
		console.log(userEmail);
	}
	catch(err){
		console.log("couldent get user " + err);
	}
	db.model('tripper_playlists').find({ email : userEmail },{_id:true, trip_name:true, address:true , tripSites : true}, function (err, docs)
			{ 
                // failure while connecting to sessions collection
                if (err) 
                {
                	console.log( err);

                	return;
                }
                
                else
                {
                	console.log(docs);
                	res.json(docs)
                }
            });
});
router.post("/updateRate", function(req, res) 
{
    var data=req.body.value;
    var tripId=req.body.tripId;
    var userEmail=req.body.userEmail;
    var temp_trip={};
         var temp={
     	
     }
     var exit=0;
     var r ={}
    	db.model('tripper_playlists').findOne({ _id : new ObjectId(tripId) },function (err, result)
			{ 
                // failure while connecting to sessions collection
                if (err) 
                {
                	console.log( err);

                	return;
                }
                
                else
                {
                	console.log("seccess to find",result);
                	temp_trip=result;
                	console.log("temp_trip.rate",temp_trip.rate)
					
		      	  console.log("rate is: " + data);
            
			    	if (data==1) {
			    		//check IF THE USER MADE LIKE BEFORE
						for (item in temp_trip.rate.userEmail) {
							console.log("###############",item);
							if (temp_trip.rate.userEmail[item]==userEmail) {
								console.log("###############allready did like");
								exit=1;
							};
						}
						
		            console.log("temp",temp)
		            if (exit==0) {

		            	temp_trip.rate.value++;
			    		temp_trip.rate.userEmail.push(userEmail);
			    		temp=temp_trip.rate;
				        db.model('tripper_playlists').findOneAndUpdate({ _id : new ObjectId(tripId) }, {$set : {rate : temp}}, function(err, result)
				        {
				            if (err) 
				            {
				                console.log("--> Err <-- : " + err);
				                r.status = 0;
				                r.desc = "--> Err <-- : " + err;
				                res.json(r);
				            }
				            
				            if (result)
				            {
				                console.log("the result is: " + result.length);
				                r.status = 1;
				                r.info = (result.length)?result[0]:[];
				                res.json(r);
				            }
				        });
			    		}
			    		else{
			    			r.status = 2;
				            res.json(r);
			    		}
	           		}else{//if data==0

		            	temp_trip.rate.userEmail.splice(userEmail, 1);
						temp_trip.rate.value--;
						temp=temp_trip.rate;
						db.model('tripper_playlists').findOneAndUpdate({ _id : new ObjectId(tripId) }, {$set : {rate : temp}}, function(err, result)
				        {
				            if (err) 
				            {
				                console.log("--> Err <-- : " + err);
				                r.status = 0;
				                r.desc = "--> Err <-- : " + err;
				                res.json(r);
				            }
				            
				            if (result)
				            {
				                console.log("the result is: " + result.length);
				                r.status = 1;
				                r.info = (result.length)?result[0]:[];
				                res.json(r);
				            }
				        });
	           		}
	        	};
            });
		//  if (data==0) {
		
		// temp_trip.rate.userEmail.splice(userEmail, 1);
		// temp_trip.rate.value--;
		// temp=temp_trip.rate;
		//   db.model('tripper_playlists').findOneAndUpdate({ _id : new ObjectId(tripId) }, {$set : {rate : temp}}, function(err, result)
	 //        {
	 //            if (err) 
	 //            {
	 //                console.log("--> Err <-- : " + err);
	 //                r.status = 0;
	 //                r.desc = "--> Err <-- : " + err;
	 //                res.json(r);
	 //            }
	            
	 //            if (result)
	 //            {
	 //                console.log("the result is: " + result.length);
	 //                r.status = 1;
	 //                r.info = (result.length)?result[0]:[];
	 //                res.json(r);
	 //            }
  //       });
  //  }
});

router.post('/uploadImageToTrip', function(req, res){
	try{
		// var imgToUpload = req.body.imgUrl;
		var trip = req.body.tripId;
		console.log("image", imgToUpload, "upload to trip", trip)
	}
	catch(err){
		console.error(err)
	}

	var form = new formidable.IncomingForm();
	form.parse(req, function(error, fields, files) 
	{
		console.log('-->PARSE<--');
        //logs the file information 
        console.log("files", JSON.stringify(files));
        console.log("fields", JSON.stringify(fields));
        dataForm=fields;
    });
	// cloudinary.uploader.upload(imgToUpload, function(result) { 
 //  	console.log(result) 
	// });
})

module.exports = router;