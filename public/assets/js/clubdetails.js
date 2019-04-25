var time2ago=document.querySelectorAll(".time2ago");
for(var i=0;i<time2ago.length;i++){
	var dif=Date.now()-time2ago[i].innerHTML;
	time2ago[i].innerHTML="<strong>"+Math.floor(dif/(1000*60*60*24),1)+"<\/strong> days ago";
}
function mytoastr(msg,title){
	toastr.clear();
	toastr.error(msg, title);
	$("#preloader").fadeOut();
}
$(document).ready(function(){
	$("#joinBtn").click(function(){
		$("#preloader").fadeIn();
		$.ajax({
			url:"/api",
			type:"POST",
			data:{"op":"join_club","clubID":$("#clubID").val()},
			success:function(response){
				try{
					var resp=JSON.parse(response);
					if(resp.code=="JOIN_CLUB_SUC"){
						$("#preloader").fadeOut();
						toastr.clear();
						toastr.success("You are now a member of the club","Joined Successfully");
						$("#membersCnt").html(parseInt($("#membersCnt").text())+1);
						$("#joinBtn").fadeOut(100);
						$("#quitBtn").delay(100).fadeIn(100);
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
	});
	$("#quitBtn").click(function(){
		$("#preloader").fadeIn();
		$.ajax({
			url:"/api",
			type:"POST",
			data:{"op":"quit_club","clubID":$("#clubID").val()},
			success:function(response){
				try{
					var resp=JSON.parse(response);
					if(resp.code=="QUIT_CLUB_SUC"){
						$("#preloader").fadeOut();
						toastr.clear();
						toastr.success("You are no longer a member of this club","Quit Successfully");
						$("#membersCnt").html(parseInt($("#membersCnt").text())-1);
						$("#quitBtn").fadeOut(100);
						$("#joinBtn").delay(100).fadeIn(100);
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
	});
});