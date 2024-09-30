let nodes = [] //{data: {id: ""}}
let edges = [] //{data: {source: "", target: ""}}
let selectedId = null;
let connectMode = false;
let viewAttrs = false;
let filtered = false;

var cy = cytoscape();

function closeContainers() {
	//close add container
	var addContainer = document.getElementById("add-node-container");
	addContainer.style.display = "none";

	var addAttrs = addContainer.getElementsByClassName("node-attr");
	while (addAttrs[0]) addAttrs[0].parentNode.removeChild(addAttrs[0]);

	//close update container
	var updateContainer = document.getElementById("update-node-container");
	updateContainer.style.display = "none";
	
	var updateAttrs = updateContainer.getElementsByClassName("node-attr");
	while (updateAttrs[0]) updateAttrs[0].parentNode.removeChild(updateAttrs[0]);

	//close color container
	var colorContainer = document.getElementById("color-node-container");
	colorContainer.style.display = "none";

	var colorAttrs = colorContainer.getElementsByClassName("node-attr");
	while (colorAttrs[0]) colorAttrs[0].parentNode.removeChild(colorAttrs[0]);
	
	//close view container
	viewAttrs = false;
	var viewContainer = document.getElementById("view-attrs-container");
	viewContainer.style.display = "none";
	
	var viewAttrs = viewContainer.getElementsByClassName("attr");
	while (viewAttrs[0]) viewAttrs[0].parentNode.removeChild(viewAttrs[0]);
}

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
					'background-color': 'data(color)',
					'color': '#b3b3b3',
					'label': 'data(name)',
					'active-bg-color': '#8a5cf5',
					'text-max-width': '160ch', 
					'text-wrap': 'ellipsis'
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

	//show right click menu for clicking on the background (empty)
	cy.on("cxttap", function (evt) {
		closeContainers();

		var rightClickMenus = document.getElementsByClassName("right-click-menu");
		for (rightClickMenu of rightClickMenus) rightClickMenu.style.display = "none";

		var emptyRightClickMenu = document.getElementById("empty-right-click-menu");

		x = evt.renderedPosition.x;
		y = evt.renderedPosition.y

		emptyRightClickMenu.style.display = "block";
		emptyRightClickMenu.style.top = `${y}px`;
		emptyRightClickMenu.style.left = `${x}px`;

	});

	//show right click menu for node
	cy.on("cxttap", "node", function (evt) {
		closeContainers();

                var node = evt.target;
			
		selectedId = node.id();

		var rightClickMenus = document.getElementsByClassName("right-click-menu");
		for (rightClickMenu of rightClickMenus) rightClickMenu.style.display = "none";

		var nodeRightClickMenu = document.getElementById("node-right-click-menu");

		x = evt.renderedPosition.x;
		y = evt.renderedPosition.y;

		nodeRightClickMenu.style.display = "block";
		nodeRightClickMenu.style.top = `${y}px`;
		nodeRightClickMenu.style.left = `${x}px`;
        });

	//show right click menu for edge
	cy.on("cxttap", "edge", function (evt) {
		closeContainers();

		var edge = evt.target;

		selectedId = edge.id();

		var rightClickMenus = document.getElementsByClassName("right-click-menu");
		for (rightClickMenu of rightClickMenus) rightClickMenu.style.display = "none";

		var edgeRightClickMenu = document.getElementById("edge-right-click-menu");

		x = evt.renderedPosition.x;
		y = evt.renderedPosition.y;

		edgeRightClickMenu.style.display = "block";
		edgeRightClickMenu.style.top = `${y}px`;
		edgeRightClickMenu.style.left = `${x}px`;
	});

	//close container and right click menu if click away and reset cursor
	cy.on("mousedown", function (evt) {
		closeContainers();

		evt.cy.container().style.cursor = 'default';

		var rightClickMenus = document.getElementsByClassName("right-click-menu");
		for (rightClickMenu of rightClickMenus) rightClickMenu.style.display = "none";
	});

	//select node to connect to
	cy.on("mousedown", "node", function (evt) {
		if (viewAttrs) {
			closeContainers();

	                var node = evt.target;
			selectedId = node.id();

			var nodeRightClickMenu = document.getElementById("node-right-click-menu")
			var viewAttrsBtn = nodeRightClickMenu.getElementsByClassName("toggle-attrs")[0];

			viewAttrs = false;
			viewAttrsBtn.click();
		}

		if (connectMode) {
			var node = evt.target;
		
			addEdge(selectedId, node.id());
			updateGraph();

			connectMode = false;
		}
	});

	//change color of node and connceted edges on hover/grab
	cy.on("grab mouseover", "node", function (evt) {
		evt.cy.container().style.cursor = 'pointer';

		var node = evt.target;
		var activeNode = node.id();
	
		if (!filtered) {
			node.style("background-color", "#8a5cf5");
		}
		
		if (!connectMode) {
			cy.elements(`edge[source='${activeNode}'], edge[target='${activeNode}']`).style("line-color", "#8a5cf5");
		}
	});

	//return color back
	cy.on("free mouseout", "node", function (evt) {
		evt.cy.container().style.cursor = 'default';

		var node = evt.target;
		var activeNode = node.id();

		if (!filtered) {
			if (!connectMode) {
				node.style("background-color", node.data().color);
			}else {
				node.style("background-color", "red");
			}
		}
			
		cy.elements(`edge[source='${activeNode}'], edge[target='${activeNode}']`).style("line-color", "#373737");
	});
}

function filter(key, value) {
	filtered = true;

	nodes.forEach(function (node) {
		if (node.data[key] == value) cy.elements(`node[id='${node.data.id}']`).style("background-color", "#8a5cf5");
	});
}

function unfilter() {
	filtered = false;

	nodes.forEach(function (node) {
		cy.elements(`node[id='${node.data.id}']`).style("background-color", node.data.color);
	});
}

//add a node
function addNode(data) {
	if (!data["color"]) data["color"] = "#b3b3b3"
	nodes.push({data: data});
}

//update a node
function updateNode(data, id) {
	nodes.forEach(function (node) {
		if (node.data.id == id) {
			data["color"] = node.data.color;
			node.data = data;
		}
	});
}

function updateNodeColor(color, id) {
	nodes.forEach(function (node, index, array) {
		console.log(id);
		if (node.data.id == id) {
			nodes[index].data.color = color;
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

	$("#empty-right-click-menu .add-node").click(function() {
		var container = document.getElementById("add-node-container");
		container.style.display = "flex";

		container.dataset.parent = "";

		$("#empty-right-click-menu").hide();
	});
	
	$("#empty-right-click-menu .reload").click(function() {
		location.reload();
		
		$("#empty-right-click-menu").hide();
	});

	$("#empty-right-click-menu .save").click(function() {
		saveGraph(file);
		alert("saved");
		
		$("#empty-right-click-menu").hide();
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
			if (attr != "id" && attr != "color"){
				if (attr == "name") {
					$("#update-node-container .top-container .inputs-container .node-label").val(selectedNode.data[attr]);
				}else {
					$("#update-node-container .top-container .inputs-container").append(`
						<div class="node-attr">
							<input class="attr-key" type="text" placeholder="Key" value=${attr}>
							
							<input class="attr-val" type="text" placeholder="Value" value=${selectedNode.data[attr]}>
						</div>
					`);
				}
			}
		}

	});

	$("#node-right-click-menu .color-node").click(function() {
		var container = document.getElementById("color-node-container");
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
			if (attr == "name") {
				$("#color-node-container .top-container .inputs-container .node-label").val(selectedNode.data[attr]);
			} else if (attr == "color") {
				$("#color-node-container .top-container .inputs-container").append(`
					<div class="node-attr">
						<input class="attr-key" type="text" placeholder="Key" value=${attr}>
						
						<input class="attr-val" type="text" placeholder="Value" value=${selectedNode.data[attr]}>
					</div>
				`);
			}
		}

	});

	$("#node-right-click-menu .toggle-attrs").click(function() {
		if (!viewAttrs){
			viewAttrs = true;
			$(this).html("Hide Attributes");

			var container = document.getElementById("view-attrs-container");
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
				if (attr != "id" && attr != "color") {
					if (attr == "name") {
						$("#view-attrs-container .top-container .inputs-container .node-label").val(selectedNode.data[attr]);
					}else {
						$("#view-attrs-container .top-container .inputs-container").append(`
							<input class="attr" type="text" value="${attr}: ${selectedNode.data[attr]}" readonly>
						`);
					}
				}
			}
		}else {
			viewAttrs = false;
			
			$(this).html("Show Attributes");
			
			$("#node-right-click-menu").hide();

			closeContainers();
		}
	});

	$("#node-right-click-menu .add-edge").click(function() {
		if (!connectMode) connectMode = true;

		cy.elements(`node[id = '${selectedId}']`).style("background-color", "red");
		cy.elements(`node[id != '${selectedId}']`).style("background-color", "red");
		cy.elements(`edge`).style("line-color", "#373737");
		
		$("#node-right-click-menu").hide();
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

	$("#add-node-container .top-container .add-node-attr").click(function () {
		$("#add-node-container .top-container .inputs-container").append(`
			<div class="node-attr">
				<input class="attr-key" type="text" placeholder="Key">
				
				<input class="attr-val" type="text" placeholder="Value">
			</div>
		`);
	});

	$("#update-node-container .top-container .add-node-attr").click(function () {
		$("#update-node-container .top-container .inputs-container").append(`
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
			
			addNode(data);
			updateGraph();

			setTimeout(() => {
				let target = nodes[nodes.length-1].data.id;
				addEdge(selectedId, target);
				updateGraph();
			}, 10);

			let container = document.getElementById("add-node-container");
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
			
			updateNode(data, selectedId);
			updateGraph();

			let container = document.getElementById("update-node-container");
			container.dataset.parent = null;
			container.style.display = "none";
		}
	});

	$("#color-node").click(function () {
		$("#color-node-container .top-container .inputs-container .node-attr").each(function () {
			let key = $(this).find(".attr-key").val();
			let value = $(this).find(".attr-val").val();
			if (key != null && key != "" && value != null && value != ""){
				if (key == "color") {
					updateNodeColor(value, selectedId);
					updateGraph();
					return;
				}
			}
		});
			
		let container = document.getElementById("color-node-container");
		container.dataset.parent = null;
		container.style.display = "none";	
	});

});
