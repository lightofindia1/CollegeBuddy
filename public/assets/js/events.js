$(document).ready(function(){
	function mytoastr(msg,title){
		toastr.clear();
		toastr.error(msg, title);
		$("#preloader").fadeOut();
	}
	function checkDate(str) {
		var m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
		return (m) ? (new Date(m[1], m[2]-1, m[3]) ? true : false) : false;
	}
	function date2bdate(str){
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		let tmp=str.split("-");
		let date=new Date(tmp[0],tmp[1]-1,tmp[2]);
		return tmp[2]+" "+months[date.getMonth()]+", "+tmp[0];
	}
	$("#preloader").fadeIn();
	$.ajax({
		url:"/api?op=get_events",
		type:"GET",
		success:function(response){
			console.log(response);
			try{
				var resp=JSON.parse(response);
				if(resp.code=="GET_EVENTS_SUC"){
					try{
						for(i in resp.value){
							$("#grid").append('<div class="col-md-6 mt-2 mb-2"><div class="card"><div class="card-header bg-danger"><h4 class="text-white">'+resp.value[i].eventTitle+'<span class="small float-right"><i class="mdi mdi-calendar"></i> '+date2bdate(resp.value[i].eventDate)+'</span></h4></div><div class="card-body p-2"><p>'+resp.value[i].eventDesc+'</p><a class="btn btn-sm btn-success" href="/events/'+resp.value[i].eventSlug+'">Details <i class="mdi mdi-arrow-right"></i></a></div></div></div>');
						}	
					}catch(err){}
					$('#grid').masonry({
					  // options
					  itemSelector: '.col-md-6',
					});
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
	$("#addEvent").submit(function(e){
		e.preventDefault();
		$("#preloader").fadeIn();
		let eventTitle=$("#eventTitle").removeClass("is-invalid").val();
		let eventDate=$("#eventDate").removeClass("is-invalid").val();
		let eventFee=$("#eventFee").removeClass("is-invalid").val();
		let eventDesc=$("#eventDesc").removeClass("is-invalid").val();
		if(eventTitle.length<5){
			$("#eventTitle").addClass("is-invalid").focus();
			mytoastr('Please enter valid title!', 'Invalid Title');
		}
		else if(!checkDate(eventDate)){
			$("#eventDate").addClass("is-invalid").focus();
			mytoastr('Please enter valid date!', 'Invalid Date');
		}
		else if(isNaN(eventFee)||parseFloat(eventFee)<10){
			$("#eventFee").addClass("is-invalid").focus();
			mytoastr('Please enter valid fee!', 'Invalid Fee');
		}
		else if(eventDesc.length<5){
			$("#eventDesc").addClass("is-invalid").focus();
			mytoastr('Please enter some more details!', 'Invalid Description');
		}
		else{
			$.ajax({
				url:"/api",
				type:"POST",
				data:{"op":"post_event","eventTitle":eventTitle,"eventDate":eventDate,"eventFee":eventFee,"eventDesc":eventDesc},
				success:function(response){
					console.log(response);
					try{
						var resp=JSON.parse(response);
						if(resp.code=="POST_EVENT_SUC"){
							$("#preloader").fadeOut();
							toastr.clear();
							toastr.success("Event has been added successfully","Event Added Successfully");
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