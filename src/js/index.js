let nodes = [] //{data: {id: ""}}
let edges = [] //{data: {source: "", target: ""}}
let selectedId = null;

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
					'label': 'data(name)',
					'active-bg-color': '#8a5cf5'
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

	//show right click menu for node
	cy.on("cxttap", "node", function (evt) {
                var node = evt.target;
		
		selectedId = node.id();
		
		var container = document.getElementById("add-node-container");
		container.style.display = "none";

		var rightClickMenu = document.getElementById("node-right-click-menu");

		x = evt.renderedPosition.x;
		y = evt.renderedPosition.y;

		rightClickMenu.style.display = "block";
		rightClickMenu.style.top = `${y}px`;
		rightClickMenu.style.left = `${x}px`;
        });

	//show right click menu for edge
	cy.on("cxttap", "edge", function (evt) {
		var edge = evt.target;

		selectedId = edge.id();

		var container = document.getElementById("add-node-container");
		container.style.display = "none";

		var rightClickMenu = document.getElementById("edge-right-click-menu");

		x = evt.renderedPosition.x;
		y = evt.renderedPosition.y;

		rightClickMenu.style.display = "block";
		rightClickMenu.style.top = `${y}px`;
		rightClickMenu.style.left = `${x}px`;
	});

	//close container and right click menu if click away
	cy.on("mousedown", function (evt) {
		var addContainer = document.getElementById("add-node-container");
		addContainer.style.display = "none";

		var updateContainer = document.getElementById("update-node-container");
		updateContainer.style.display = "none";

		var nodeRightClickMenu = document.getElementById("node-right-click-menu");
		nodeRightClickMenu.style.display = "none";
		
		var edgeRightClickMenu = document.getElementById("edge-right-click-menu");
		edgeRightClickMenu.style.display = "none";
	});

	//change color of node and connceted edges on hover/grab
	cy.on("grab mouseover", "node", function (evt) {
		var node = evt.target;
		var activeNode = node.id();
	
		node.style("background-color", "#8a5cf5");
		cy.elements(`edge[source='${activeNode}'], edge[target='${activeNode}']`).style("line-color", "#8a5cf5");
	});

	//return color back
	cy.on("free mouseout", "node", function (evt) {
		var node = evt.target;
		var activeNode = node.id();
		
		node.style("background-color", "#b3b3b3");
		cy.elements(`edge[source='${activeNode}'], edge[target='${activeNode}']`).style("line-color", "#373737");
	});
}

//add a node
function addNode(data) {
	nodes.push({data: data});
}

//update a node
function updateNode(data, id) {
	nodes.forEach(function (node) {
		if (node.data.id == id) {
			node.data = data;
		}
	});
}

//remove a node
function removeNode(id) {
	//go through the connected edges and remove them
	var connectedEdgesCount = 0;
	for (let i = 0; i < edges.length; i++) {
		let edge = edges[i];
		//if the edge's source or target is the node, then remove it
		if (edge.data.source == id || edge.data.target == id) {
			edges.splice(i-connectedEdgesCount, 1);
			//go back one to accomodate for the removal of a node
			i--;
		}
	}

	//find the node and remove it
	nodes.forEach(function (node, index, array) {
		if (node.data.id == id) {
			array.splice(index, 1);
		}
	});
}

//add an edge
function addEdge(source, target) {
	edges.push({data: {source: source, target: target}});
}

//remove an edge by id
function removeEdgeById(id) {
	edges.forEach(function (edge, index, array) {
		if (edge.data.id == id) {
			array.splice(index, 1);
		}
	});
}

//remove an edge by the source and target nodes
function removeEdgeByConnected(source, target) {
	edges.forEach(function (edge, index, array) {
		if (edge.data.source == source && edge.data.target == target) {
			array.splice(index, 1);
		}
	});
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
		addNode({name: "start"});
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

	$("#node-right-click-menu .add-node").click(function() {
		var container = document.getElementById("add-node-container");
		container.style.display = "flex";

		container.dataset.parent = selectedId;

		$("#node-right-click-menu").hide();
	});

	$("#node-right-click-menu .update-node").click(function() {
		var container = document.getElementById("update-node-container");
		container.style.display = "flex";

		container.dataset.parent = selectedId;

		$("#node-right-click-menu").hide();

		var selectedNode;

		nodes.forEach(function(node) {
			if (node.data.id == selectedId) {
				selectedNode = node;
				return;
			}
		});


		for (var attr in selectedNode.data) {
			if (attr == "id") return;
			else if (attr == "name") {
				$("#update-node-container .top-container .inputs-container .node-label").val(selectedNode.data[attr]);
			} else{
				$("#update-node-container .top-container .inputs-container").append(`
					<div class="node-attr">
						<input class="attr-key" type="text" placeholder="Key" value=${attr}>
						
						<input class="attr-val" type="text" placeholder="Value" value=${selectedNode.data[attr]}>
					</div>
				`);
			}
		}

	});

	$("#node-right-click-menu .delete-node").click(function() {
		removeNode(selectedId);
		updateGraph();

		$("#node-right-click-menu").hide();
	});

	$("#edge-right-click-menu .delete-edge").click(function() {
		removeEdgeById(selectedId);
		updateGraph();

		$("#edge-right-click-menu").hide();
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

		let name = $("#add-node-container .top-container .inputs-container .node-label").val();
		if (name != null && name != ""){
			data["name"] = name;
		

			$("#add-node-container .top-container .inputs-container .node-attr").each(function () {
				let key = $(this).find(".attr-key").val();
				let value = $(this).find(".attr-val").val();
			
				if (key != null && key != "" && value != null && value != ""){
					data[key] = value;
				}
			});
			
			let container = document.getElementById("add-node-container");
			let source = container.dataset.parent

			addNode(data);
			updateGraph();
			setTimeout(() => {
				let target = nodes[nodes.length-1].data.id;
				addEdge(source, target);
				updateGraph();
			}, 10);

			container.dataset.parent = null;
			container.style.display = "none";
		}
		
	});

	$("#update-node").click(function () {
		data = {};

		let name = $("#update-node-container .top-container .inputs-container .node-label").val();
		if (name != null && name != ""){
			data["id"] = selectedId;
			data["name"] = name;

			$("#update-node-container .top-container .inputs-container .node-attr").each(function () {
				let key = $(this).find(".attr-key").val();
				let value = $(this).find(".attr-val").val();
			
				if (key != null && key != "" && value != null && value != ""){
					data[key] = value;
				}
			});
			
			let container = document.getElementById("update-node-container");
			let source = container.dataset.parent

			updateNode(data, selectedId);
			updateGraph();

			container.dataset.parent = null;
			container.style.display = "none";
		}
		
	});
});
