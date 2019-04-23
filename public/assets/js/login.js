function isEmail(email) { 
	return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email);
}
$(document).ready(function(){
	var redirectPath="/dashboard";
	try{
		let url = new URL(window.location.href);
		let searchParams = new URLSearchParams(url.search);
		let redpath = searchParams.get("redirect");
		if(redpath){
			redirectPath=redpath;
		}
	}catch(err){}
	window.closeForm=function(){
		$('form').fadeOut(500);
		$('.wrapper').addClass('form-success');
		$("#heading").text("Validating");
	}
	window.showForm=function(){
		$("#heading").text("CollegeBuddy");
		$('.wrapper').removeClass('form-success');
		$('form').fadeIn(500);
	}
	$("#login").submit(function(event){
		event.preventDefault();
		var email=$("#email").removeClass("is-error").val();
		var password=$("#password").removeClass("is-error").val();
		if(!isEmail(email)){
			$("#email").addClass("is-error").effect("shake", {times:5,distance:50}, 500 ).focus();
			toastr.clear();
			toastr.error('Please enter valid email!', 'Invalid Email ID');
		}
		else if(password.length<5){
			$("#password").addClass("is-error").effect("shake", {times:5,distance:50}, 500 ).focus();
			toastr.clear();
			toastr.error('Please enter valid password!', 'Invalid Password');
		}
		else{
			closeForm();
			setTimeout(function(){
				$.ajax({
					url:"/api",
					type:"POST",
					data:{"op":"login","email":email,"password":password},
					success:function(response){
						console.log(response);
						try{
							var resp=JSON.parse(response);
							if(resp.code=="LOGIN_SUC"){
								window.location=redirectPath;
							}
							else if(resp.code=="auth/user-not-found"){
								showForm();
								toastr.clear();
								toastr.error("There is no user record corresponding to this identifier","User Not Found");
							}
							else{
								showForm();
								toastr.clear();
								toastr.error(resp.msg, resp.code);
							}
						}catch(err){
							toastr.clear();
							toastr.error(err, "Unknown Error");
							showForm();
						}
					},
					error:function(resp,data,xhr){
						toastr.clear();
						toastr.error(xhr, "Error");
						showForm();
					}
				});
			},1000);
		}
		return false;
	});
});