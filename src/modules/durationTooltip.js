exportModule({
	id: "durationTooltip",
	description: "Adds media duration as a tooltip",
	isDefault: true,
	importance: -2,
	categories: ["Media"],//what categories your module belongs in
	visible: false,//trivial, can be turned on
	urlMatch: function(url,oldUrl){
		let urlStuff = url.match(/\/anime\/(\d+)\//);
		if(urlStuff){
			let urlStuff2 = oldUrl.match(/\/anime\/(\d+)\//);
			if(urlStuff2 && urlStuff[1] === urlStuff2[1]){
				return false
			}
			return true
		}
		return false
	},
	code: function(){
		let specials = {
			"721": "total 10 hours 38 minutes (13x25min, 24x12min + 1x25min)"//tutu
		};
		let waiter = function(){
			let urlStuff = document.URL.match(/\/anime\/(\d+)\//);
			if(!urlStuff){
				return
			}
			let side = document.querySelector(".sidebar > .data");
			if(!side){
				setTimeout(waiter,1000);
				return
			}
			let eps = null;
			let dur = null;
			let anchor = null;
			if(document.querySelector(".hohHasDurationTooltip")){
				document.querySelector(".hohHasDurationTooltip").title = ""
			}
			try{
				let found = false
				Array.from(side.children).forEach(child => {
					if(child.querySelector(".type")){
						if(child.querySelector(".type").innerText === "Episodes"){
							eps = parseInt(child.querySelector(".value").innerText)
						}
						else if((child.querySelector(".type").innerText === "Duration" || child.querySelector(".type").innerText === "Episode Duration")){
							anchor = child.querySelector(".value");
							found = true;
							let parse = anchor.innerText.match(/((\d+) hours?,)?(\d+) mins?/);
							dur = parseInt(parse[2] || 0) * 60 + parseInt(parse[3] || 0);
						}
					}
				})
				if(!found){
					setTimeout(waiter,1000);
					return
				}
				if(anchor && eps && dur){
					if(specials[urlStuff[1]]){
						anchor.title = specials[urlStuff[1]];
					}
					else{
						anchor.title = "total " + formatTime(eps*dur*60,"twoPart");
					}
					anchor.classList.add("hohHasDurationTooltip")
				}
			}
			catch(e){
				console.warn("failed to parse duration info")
			}
		};waiter()
	},
})
