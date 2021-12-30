//begin "cache.js"

let reliablePersistentStorage = true;
if (navigator.storage && navigator.storage.persist){
	navigator.storage.persist().then(function(persistent){
		if(!persistent){
			reliablePersistentStorage = false;
			console.log("Automail was denied persistent storage, and may run slower/use more data since it can't keep a cache. Consider enabling persistent storage in 'site info' > 'permissions'")
		}
	})
}

const cache = {
	list: {ANIME: null,MANGA: null},
	scheduled: false,
	lock: {ANIME: false,MANGA: false},
	lockedCallbacks: {ANIME: [],MANGA: []},
	synch: function(){
		if(!cache.scheduled){
			cache.scheduled = true;
			setTimeout(function(){
				localStorage.setItem("automailListCache",cache.list);
				cache.scheduled = false
			},10*1000)
		}
	},
	forceUpdate: function(){
		authAPIcall(
			`
query($name: String!){
	anime:MediaListCollection(userName: $name, type: ANIME){
		lists{
			name
			isCustomList
			entries{
				mediaId
				status
				progress
				repeat
				notes
				${userObject.mediaListOptions.animeList.advancedScoringEnabled ? "advancedScores" : ""}
				startedAt{
					year
					month
					day
				}
				media{
					episodes
					duration
					nextAiringEpisode{episode}
					format
					title{romaji native english}
					tags{name}
					genres
					meanScore
					studios{nodes{isAnimationStudio id name}}
				}
				scoreRaw: score(format: POINT_100)
			}
		}
	}
	manga:MediaListCollection(userName: $name, type: MANGA){
		lists{
			name
			isCustomList
			entries{
				mediaId
				status
				progress
				progressVolumes
				repeat
				notes
				${userObject.mediaListOptions.mangaList.advancedScoringEnabled ? "advancedScores" : ""}
				startedAt{
					year
					month
					day
				}
				media{
					chapters
					volumes
					format
					title{romaji native english}
					tags{name}
					genres
					meanScore
				}
				scoreRaw: score(format: POINT_100)
			}
		}
	}
}`,
			{name: whoAmI},
			function(data){
				if(!data){
					return
				}
				cache.list.ANIME = {
					time: NOW(),
					duration: 60*60*1000,
					data: data.data.anime
				}
				cache.list.MANGA = {
					time: NOW(),
					duration: 60*60*1000,
					data: data.data.manga
				}
				localforage.setItem("automailListCacheANIME",cache.list.ANIME);
				localforage.setItem("automailListCacheMANGA",cache.list.MANGA);
				cache.lockedCallbacks.ANIME.forEach(a => a.callback(cache.list[a.type].data));
				cache.lockedCallbacks.MANGA.forEach(a => a.callback(cache.list[a.type].data));
				cache.lockedCallbacks.ANIME = [];
				cache.lockedCallbacks.MANGA = [];
				cache.lock.ANIME = false;
				cache.lock.MANGA = false;
			}
		)
		
	},
	updateIfDifferent: function(mediaData,doNotWrite){
		let different = false;
		let found = false;
		//logic here
		if(different){
			aniCast.postMessage({type:"cachev2",mediaData: mediaData});
			if(!doNotWrite){
				cache.synch()
			}
		}
	},
	getList: function(type,callback){
		if(!cache.list[type]){
			cache.lockedCallbacks[type].push({callback: callback,type: type})
			if(!cache.lock[type]){
				cache.lock[type] = true;
				localforage.getItem("automailListCache" + type,function(err,value){
					if(err){
						console.log(err);
						return
					}
					if(value){
						if(NOW() - value.time > value.duration){
							cache.forceUpdate()
						}
						else{
							cache.list[type] = value;
							cache.lockedCallbacks[type].forEach(a => a.callback(cache.list[a.type].data));
							cache.lockedCallbacks[type] = [];
							cache.lock[type] = false;
						}
					}
					else{
						cache.forceUpdate()
					}
				})
			}
		}
		else{
			callback(cache.list[type].data)
		}
	}
}
//end "cache.js"
