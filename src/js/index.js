let nodes = [] //{data: {id: ""}}
let edges = [] //{data: {source: "", target: ""}}
let selectedNode = null;

var cy = cytoscape();

function updateGraph() {
	cy = cytoscape({
		container: document.getElementById('cy'),

		elements: {
			nodes: nodes,
			edges: edges
		},

		style: [
			{
				selector: 'node',
				style: {
					'background-color': '#b3b3b3',
					'color': '#b3b3b3',
					'label': 'data(id)',
					'active-bg-color': '#8a5cf5'
				}
			},
			{
				selector: 'node[id="+"]',
				style: {
					'text-valign': 'center',
					'text-halign': 'center',
					'text-margin-y': '1.5px',

					'width': '10px',
					'height': '10px',

					'color': '#373737',
					'background-color': '#b3b3b3',
					'background-opacity': '0.8'
				}
			},
			{
				selector: 'edge',
				style: {
					'width': 3,
					'line-color': '#373737',
					'curve-style': 'bezier'
      				}
			},
		],

		layout: {
			name: 'cola',
			infinite: true
		}
	});

	//show right click menu
	cy.on("cxttap", "node", function (evt) {
                var node = evt.target;
		
		selectedNode = node.id();
		
		var container = document.getElementById("add-node-container");
		container.style.display = "none";

		var rightClickMenu = document.getElementById("right-click-menu");

		x = evt.renderedPosition.x;
		y = evt.renderedPosition.y;

		rightClickMenu.style.display = "block";
		rightClickMenu.style.top = `${y}px`;
		rightClickMenu.style.left = `${x}px`;
        })

	cy.on("mousedown", function (evt) {
		var container = document.getElementById("add-node-container");
		container.style.display = "none";

		var rightClickMenu = document.getElementById("right-click-menu");
		rightClickMenu.style.display = "none";
	});

	//change color of node and connceted edges on hover/grab
	cy.on("grab mouseover", "node", function (evt) {
		var node = evt.target;
		var activeNode = node.id();
	
		node.style("background-color", "#8a5cf5");
		cy.elements(`edge[source='${activeNode}'], edge[target='${activeNode}']`).style("line-color", "#8a5cf5");
	});

	cy.on("free mouseout", "node", function (evt) {
		var node = evt.target;
		var activeNode = node.id();
		
		node.style("background-color", "#b3b3b3");
		cy.elements(`edge[source='${activeNode}'], edge[target='${activeNode}']`).style("line-color", "#373737");
	});
}

function updateNodes(data) {
	nodes.push({data: data});
}

function updateEdges(source, target) {
	edges.push({data: {source: source, target: target}});
}

function saveGraph(filename){
	$.ajax({
		type: "post",
		url: `/graph/save/${filename}`,
		data: JSON.stringify({nodes: nodes, edges: edges}),
		dataType: "json",
		contentType: "application/json; charset=utf-8"
	});
}

function loadGraph(filename) {
	$.ajax({
		type: "get",
		url: `/graph/load/${filename}`,
		dataType: "json",
		success: function(data) {
			let d = JSON.parse(data);
			nodes = d["nodes"];
			edges = d["edges"];
			updateGraph();
		}
	});
}

$(document).ready(function(){
	let file = `${window.prompt("File Name")}.json`;
	loadGraph(file);

	if (nodes.length == 0){
		updateNodes({id: "start"});
		updateGraph();
	}

	$(window).bind("keyup keydown", function(evt) {
		if (evt.ctrlKey && evt.which == 83){
			evt.preventDefault();
			saveGraph(file);
			alert("saved");
			return;
		}
	});

	$("#right-click-menu button").click(function() {
		var container = document.getElementById("add-node-container");
		container.style.display = "block";

		container.dataset.parent = selectedNode;

		$("#right-click-menu").hide();

	});

	$("#add-node-attr").click(function () {
		$("#add-node-container .top-container .inputs-container").append(`
			<div class="node-attr">
				<input class="attr-key" type="text" placeholder="Key">
				
				<input class="attr-val" type="text" placeholder="Value">
			</div>
		`);
	});

	$("#add-node").click(function () {
		data = {};

		let id = $("#add-node-container .top-container .inputs-container .node-id").val();
		if (id != null && id != ""){
			data["id"] = id;
		

			$("#add-node-container .top-container .inputs-container .node-attr").each(function () {
				let key = $(this).find(".attr-key").val();
				let value = $(this).find(".attr-val").val();
			
				if (key != null && key != "" && value != null && value != ""){
					data[key] = value;
				}
			});
			
			let container = document.getElementById("add-node-container");
			let source = container.dataset.parent

			updateNodes(data);
			updateEdges(source, id);
			updateGraph();

			container.dataset.parent = null;
			container.style.display = "none";
		}
		
	});
});
