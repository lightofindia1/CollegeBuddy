$(document).ready(function(){
	function mytoastr(msg,title){
		toastr.clear();
		toastr.error(msg, title);
		$("#preloader").fadeOut();
	}
	$("#preloader").fadeIn();
	$("body").on("click",".contactBtn",function(){
		var id=$(this).attr("contactid");
		$("#contactTitle").text($("#"+id+" .card-title").text());
		$("#contactMsg").text($("#"+id+" .card-text").text());
		$("#contactInfo").text($("#"+id+" .contactInfo").val());
		$("#contactModal").modal("show");
	});
	$.ajax({
		url:"/api?op=get_lostandfound",
		type:"GET",
		success:function(response){
			console.log(response);
			try{
				var resp=JSON.parse(response);
				if(resp.code=="GET_LOSTANDFOUND_SUC"){
					try{
						for(i in resp.value){
							$("#grid").append('<div class="col-md-4" id="'+i+'"><div class="card"><div class="card-body"><h5 class="card-title">'+resp.value[i].postTitle+' <span class="badge badge-'+((resp.value[i].postType.toLowerCase()=="lost")?"danger":"success")+' float-right">'+resp.value[i].postType+'</span></h5><p class="card-text">'+resp.value[i].postMsg+'</p><input type="hidden" class="contactInfo" value="'+resp.value[i].postContact+'"><a href="#" class="btn btn-warning contactBtn" contactid="'+i+'">Contact</a></div></div></div>');
						}	
					}catch(err){}
					$('#grid').masonry({
					  // options
					  itemSelector: '.col-md-4',
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
	$("#postLostAndFound").submit(function(e){
		e.preventDefault();
		$("#preloader").fadeIn();
		let postTitle=$("#postTitle").removeClass("is-invalid").val();
		let postMsg=$("#postMsg").removeClass("is-invalid").val();
		let postType=$("#postType").val();
		let postContact=$("#postContact").removeClass("is-invalid").val();
		if(postTitle.length<5){
			$("#postTitle").addClass("is-invalid").focus();
			mytoastr('Please enter valid title!', 'Invalid Title');
		}
		else if(postMsg.length<5){
			$("#postMsg").addClass("is-invalid").focus();
			mytoastr('Please enter some more details!', 'Invalid Description');
		}
		else if(postContact.length<5){
			$("#postContact").addClass("is-invalid").focus();
			mytoastr('Please enter valid contact details!', 'Invalid Contact Details');
		}
		else{
			$.ajax({
				url:"/api",
				type:"POST",
				data:{"op":"post_lostandfound","post_title":postTitle,"post_msg":postMsg,"post_type":postType,"post_contact":postContact},
				success:function(response){
					console.log(response);
					try{
						var resp=JSON.parse(response);
						if(resp.code=="POST_LOSTANDFOUND_SUC"){
							$("#preloader").fadeOut();
							toastr.clear();
							toastr.success("Post has been shared successfully among your peers","Post Added Successfully");
							setTimeout(function(){
								window.location="";
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