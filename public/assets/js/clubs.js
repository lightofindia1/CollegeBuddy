$(document).ready(function(){
	function mytoastr(msg,title){
		toastr.clear();
		toastr.error(msg, title);
		$("#preloader").fadeOut();
	}
	function daysago(timestamp){
		let dif=Date.now()-timestamp;
		return Math.floor(dif/(1000*60*60*24),1);
	}
	function getClubCard(clubName,members,createdOn,clubSlug){
		return '<div class="col-md-4"><div class="card"><div class="card-header bg-danger text-white">'+clubName+'</div><div class="card-body bg-light"><div class="row"><div class="col-md-6 text-center"><i class="mdi mdi-account-location text-info icon-lg"></i><br><strong>'+members+'</strong> members</div><div class="col-md-6 text-center"><i class="mdi mdi-calendar text-info icon-lg"></i><br><strong>'+daysago(createdOn)+'</strong> days old</div></div><div class="mt-2 text-center"><a class="btn btn-raised btn-info" href="/clubs/'+clubSlug+'">Visit <i class="mdi mdi-arrow-right"></i></a></div></div></div></div>';
	}
	$("#preloader").fadeIn();
	$.ajax({
		url:"/api?op=get_clubs",
		type:"GET",
		success:function(response){
			console.log(response);
			try{
				var resp=JSON.parse(response);
				window.respValue=resp.value;
				var myClubs='';
				var otherClubs='';
				if(resp.code=="GET_CLUBS_SUC"){
					try{
						for(i in resp.value.data){
							if(resp.value.data[i].members.indexOf(resp.value.currentUserEmail)>=0){
								myClubs+=getClubCard(resp.value.data[i].clubName,resp.value.data[i].members.length,resp.value.data[i].createdOn,resp.value.data[i].clubSlug);
							}
							else{
								otherClubs+=getClubCard(resp.value.data[i].clubName,resp.value.data[i].members.length,resp.value.data[i].createdOn,resp.value.data[i].clubSlug);
							}
						}
						$("#myClubs").html(myClubs?myClubs:"No Clubs Joined Yet");
						$("#otherClubs").html(otherClubs?otherClubs:"No Clubs Found");
					}catch(err){
						console.log(err);
					}
					$('#grid').masonry({
					  // options
					  itemSelector: '.col-md-6',
					});
					$("#preloader").fadeOut();
				}
				else if(resp.code=="GET_CLUBS_ERR"){
					$("#myClubs").html("No Clubs Joined Yet");
					$("#otherClubs").html("No Clubs Found");
					$("#preloader").fadeOut();
				}
				else{
					mytoastr(resp.msg,resp.code);
				}
			}
			catch(err){
				mytoastr(err,"Unknown Error");
			}
		},
		error:function(xhr, ajaxOptions, thrownError){
			mytoastr(xhr.responseText,"Network Error");
		}
	});
	$("#createClub").submit(function(e){
		e.preventDefault();
		$("#preloader").fadeIn();
		let clubName=$("#clubName").removeClass("is-invalid").val();
		let clubMission=$("#clubMission").removeClass("is-invalid").val();
		let clubVission=$("#clubVission").removeClass("is-invalid").val();
		if(clubName.length<5){
			$("#clubName").addClass("is-invalid").focus();
			mytoastr('Please enter valid name!', 'Invalid Club Name');
		}
		else if(clubMission.length<5){
			$("#clubMission").addClass("is-invalid").focus();
			mytoastr('Please enter some more details!', 'Invalid Club Mission');
		}
		else if(clubVission.length<5){
			$("#clubVission").addClass("is-invalid").focus();
			mytoastr('Please enter some more details!', 'Invalid Club Vission');
		}
		else{
			$.ajax({
				url:"/api",
				type:"POST",
				data:{"op":"create_club","clubName":clubName,"clubMission":clubMission,"clubVission":clubVission},
				success:function(response){
					console.log(response);
					try{
						var resp=JSON.parse(response);
						if(resp.code=="CREATE_CLUB_SUC"){
							$("#preloader").fadeOut();
							toastr.clear();
							toastr.success("Club has been created successfully","Club Created Successfully");
							setTimeout(function(){
								window.location=resp.value.redirectLoc;
							},500);
						}
						else{
							mytoastr(resp.msg, resp.code);
						}
					}catch(err){
						mytoastr(err, "Unknown Error");
					}
				},
				error:function(resp,data,xhr){
					mytoastr(xhr, "Error");
				}
			});
		}
		return false;
	});
});