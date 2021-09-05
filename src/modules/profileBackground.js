function profileBackground(){
	if(useScripts.SFWmode){//clearly not safe, users can upload anything
		return
	};
	const userRegex = /^\/user\/([^\/]+)(\/.*)?$/;
	let URLstuff = location.pathname.match(userRegex);
	const query = `
	query($userName: String) {
		User(name: $userName){
			about
		}
	}`;
	let variables = {
		userName: decodeURIComponent(URLstuff[1])
	}
	generalAPIcall(query,variables,data => {
		if(!data){
			return;
		};
		let jsonMatch = (data.data.User.about || "").match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/);
		if(!jsonMatch){
			let target = document.querySelector(".user-page-unscoped");
			if(target){
				target.style.background = "unset"
			}
			return;
		};
		try{
			let jsonData;
			try{
				jsonData = JSON.parse(atob(jsonMatch[1]))
			}
			catch(e){
				jsonData = JSON.parse(LZString.decompressFromBase64(jsonMatch[1]))
			}
			let adder = function(){
				if(!userRegex.test(location.pathname)){
					return
				};
				let target = document.querySelector(".user-page-unscoped");
				if(target){
					target.style.background = jsonData.background || "none";
				}
				else{
					setTimeout(adder,200);
				}
			};adder();
		}
		catch(e){
			console.warn("Invalid profile JSON for " + variables.userName + ". Aborting.");
			console.log(atob(jsonMatch[1]));
		};
	},"hohProfileBackground" + variables.userName,30*1000);
}
