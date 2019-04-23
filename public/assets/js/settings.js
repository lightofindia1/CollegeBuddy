$(document).ready(function(){
	function mytoastr(msg,title){
		toastr.clear();
		toastr.error(msg, title);
		$("#preloader").fadeOut();
	}
	$("#updateUsername").submit(function(event){
		event.preventDefault();
		$("#preloader").fadeIn();
		var username=$("#username").removeClass("is-invalid").val();
		var password=$("#password").removeClass("is-invalid").val();
		if(username.length<5){
			$("#username").addClass("is-invalid").focus();
			mytoastr('Please enter valid full name!', 'Invalid Name');
		}
		else if(password.length<5){
			$("#password").addClass("is-invalid").focus();
			mytoastr('Please enter valid password!', 'Invalid Password');
		}
		else{
			$.ajax({
				url:"/api",
				type:"POST",
				data:{"op":"update_username","username":username,"password":password},
				success:function(response){
					console.log(response);
					try{
						var resp=JSON.parse(response);
						if(resp.code=="UPDATE_USERNAME_SUC"){
							$("#preloader").fadeOut();
							toastr.clear();
							toastr.success("Username has been updated successfully","Updated Successfully");
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
	$("#updatePassword").submit(function(event){
		event.preventDefault();
		$("#preloader").fadeIn();
		var oldPassword=$("#oldPassword").removeClass("is-invalid").val();
		var newPassword=$("#newPassword").removeClass("is-invalid").val();
		var repeatPassword=$("#repeatPassword").removeClass("is-invalid").val();
		if(oldPassword.length<5){
			$("#oldPassword").addClass("is-invalid").focus();
			mytoastr('Please enter valid old password!', 'Invalid Old Password');
		}
		else if(newPassword.length<5){
			$("#newPassword").addClass("is-invalid").focus();
			mytoastr('Please enter valid new password!', 'Invalid New Password');
		}
		else if(newPassword!=repeatPassword){
			$("#repeatPassword").addClass("is-invalid").focus();
			mytoastr('Please repeat the same password!', 'Passwords Not Matching');
		}
		else{
			$.ajax({
				url:"/api",
				type:"POST",
				data:{"op":"update_password","old_password":oldPassword,"new_password":newPassword},
				success:function(response){
					console.log(response);
					try{
						var resp=JSON.parse(response);
						if(resp.code=="UPDATE_PASSWORD_SUC"){
							$("#preloader").fadeOut();
							toastr.clear();
							toastr.success("Password has been updated successfully","Updated Successfully");
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