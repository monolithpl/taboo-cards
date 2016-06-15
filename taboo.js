var dictFiles = []
var dict_urls = ['associations.ifo','associations.idx.dz','associations.dict.dz']
var nRequest = new Array()
for (var i=0; i<dict_urls.length; i++){
	(function(i) {
		nRequest[i] = new XMLHttpRequest()
		nRequest[i].open("GET", dict_urls[i], true)
		nRequest[i].responseType = "arraybuffer"
		nRequest[i].onload = function () {
			var blob = new Blob([nRequest[i].response], {type: dict_urls[i]})
			dictFiles.push(blob)
			if(dictFiles.length==3) loadDict()
		}
		nRequest[i].send()
	})(i)
}

var lookup_tbl = {}
var dict
function search(word) {
	if(typeof dict == "undefined" || typeof lookup_tbl == "undefined") return
	var idx_obj = lookup_tbl[word]
	if(typeof idx_obj != "undefined") dict.entry(idx_obj.dictpos).then( function(entry) {
		document.getElementById('card' + word).innerHTML = '<li>' + entry.replace(/,/g,'</li><li>') + '</li>'
	})
}

function loadDict() {
	dict = new StarDict()
	dict.load(dictFiles)
	.then(function() {
		return dict.index({"include_offset" : true,	"include_dictpos" : true, "include_term" : true})})
	.then(function(idx) {
		for (var i = 0, len = idx.length; i < len; i++) {
			lookup_tbl[idx[i].term] = idx[i]
		}
	})
}

var newWord = document.getElementById("word-new")
var list = document.getElementById("word-list")
var demo = document.getElementById("demo");
var count = document.getElementById("word-count")
var wordArray = []

function addWord(word){
	for (var i = 0; i < arguments.length; ++i) {
		var word = arguments[i]
		
		var entry = document.createElement('li')
		entry.innerHTML = '<label>' + word + '</label><button class="destroy"></button>'
		list.insertBefore(entry, list.childNodes[0])
		wordArray.push(word)
		
		var entry = document.createElement('div')
		entry.className = "card"
		entry.id = "card-" + word
		id = 'card' + word
		entry.innerHTML = '<h1>' + word + '</h1><ul class="cardList" id="' + id + '"></ul>'
		var cards = document.getElementById('taboocards')
		cards.insertBefore(entry, cards.childNodes[0])
		
		wordElement = document.getElementById(id)
		search(word)
		updateCount()
	}
}

function updateCount(){
	document.getElementById('instructions').innerHTML = ''
	if (list.children.length > 1) count.innerHTML = list.children.length + ' words'
	else if (list.children.length == 0) count.innerHTML = 'hit enter to add word'
	else count.innerHTML = list.children.length + ' word'
}

list.addEventListener("click", function(event) {
    if (event.target !== event.currentTarget) {
        if (event.target.className == "destroy")
		{
			wordArray.splice(wordArray.indexOf(event.target.parentElement.getElementsByTagName("LABEL")[0].innerHTML), 1)
			event.target.parentElement.parentNode.removeChild(event.target.parentElement)
			updateCount()
			var wordCard = document.getElementById('card-' + event.target.parentElement.getElementsByTagName("LABEL")[0].innerHTML)
			wordCard.parentNode.removeChild(wordCard)
		}
    }
    event.stopPropagation()
})

demo.addEventListener("click", function(event) {
	addWord('learning', 'speaking', 'doing', 'city', 'happy', 'sunny', 'design', 'active')
})

newWord.addEventListener("keypress", function(event) {
    if (event.keyCode == 13 && newWord.value.trim() !== '') {
		addWord(newWord.value)
		newWord.value = ''
	}
})