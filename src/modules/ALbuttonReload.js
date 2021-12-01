if(useScripts.ALbuttonReload){
	let logo = document.querySelector("#nav .logo");
	if(logo){
		logo.onclick = function(){
			if(/\/home\/?$/.test(location.pathname)){//we only want this behaviour here
				window.location.reload(false);//reload page, but use cache if possible
			}
		}
	}
}

exportModule({
	id: "ALbuttonReload",
	description: "$ALbuttonReload_description",
	isDefault: true,
	categories: ["Navigation"],
	visible: true
})
