/*
//-------------------------------------------
// ONLOAD DEFAULTS FOR THE GRAPH
//-------------------------------------------
*/

// initialize within #cy element
var cy = cytoscape ({
    container: document.getElementById('cy')
});

var cy_neighbors = cytoscape ({
    container: document.getElementById('cy-neighbors')
})

var cy_geo = cytoscape ({
    container: document.getElementById('cy-geo')
})



// for model over all viewpoints graph
var semanticClass = '';
var imageDirectory = '';

var edgeDirectory = 'graphs/'
var edgeListFile = '';

// initializations
var graphCount = 0
var consecutiveEdgeCount = 0;
var imageList = []

// neighbors graph
var currentNeighborNode = 1;
var neighborsRemoved = 1;

// geodesic graph
var geo_source = 1;
var geo_target = 2;




/*
//-------------------------------------------
// INTERACTIVE PORTIONS OF THE APP
//-------------------------------------------
*/

// link input button to file input with jQuery
$('#button-input-reference').click(function(){
    $('#hidden-input-edges').click();
});

$("#hidden-input-edges").click(function(e) { 
    $('hidden-input-edges').val(''); 
})

// button to add graphs
document.getElementById('hidden-input-edges')
        .addEventListener('change', function() {
    edgeListFile = this.files[0].name;
    loadEdges(edgeListFile)
})

// change semantic class
document.getElementById("sementic-class-list").onchange = changeSemanticClass;
function changeSemanticClass() {
    clearGraph();
	semanticClass = this.value;
    imageDirectory = 'assets/' + semanticClass + '/';
    console.log("New Semantic Class: " + semanticClass);
}

// input for target geodesic path
document.getElementById('neighbor-id')
        .addEventListener('change', function() {
    currentNeighborNode = this.value;
    if (graphCount > 0) {
        loadNeighborsGraph(currentNeighborNode);
    }
})


// change number of neighbors removed shown
document.getElementById("neighbors-removed").addEventListener('change', function() {
    console.log(document.getElementById("neighbors-removed").value);
    neighborsRemoved = Number(document.getElementById("neighbors-removed").value);
    if (graphCount > 0) {
        loadNeighborsGraph(currentNeighborNode);
    }
})

// input for source geodesic path
document.getElementById('geo-source')
        .addEventListener('change', function() {  
    if (graphCount > 0) {
        loadGeodesicPath();
    }
})

// input for target geodesic path
document.getElementById('geo-target')
        .addEventListener('change', function() {
    if (graphCount > 0) {
        loadGeodesicPath();
    }
})



/*
//-------------------------------------------
// FUNCTIONS DIRECTLY CALLED BY INTERACTIVE PORTIONS
//-------------------------------------------
*/

// load edges via 
async function loadEdges() {
    console.log("Loading edge file: ", edgeListFile)
    if (graphCount == 0) {
        await loadGraph(edgeListFile);
    } else if (graphCount == 1) {
        await addEdges(edgeListFile);
    } else {
        console.log("Max 2 Graphs can be uploaded")
    }
    graphCount++;

    // update number of elements
    document.getElementById('main-graph-nodes').innerHTML = "Number of Nodes: "+cy.nodes().length;
    document.getElementById('main-graph-edges').innerHTML = "Number of Edges: "+cy.edges().length;

    await loadNeighborsGraph(currentNeighborNode);
    await loadGeodesicPath(currentNeighborNode);

    cy.on('tap', 'node', function( evt ){
        currentNeighborNode = evt.target._private.data.id
        loadNeighborsGraph(currentNeighborNode)
    });
}




/*
//-------------------------------------------
// DECLARING STYLING OF THE GEODESIC FLOW GRAPH
//-------------------------------------------
*/


/*
//-------------------------------------------
// FUNCTIONS OF THE GRAPH
//-------------------------------------------
*/

// add images via imageListFile
function clearGraph()
{
    console.log("Clear Graph Container")
    graphCount = 0;

    document.getElementById('main-graph-nodes').innerHTML = "Number of Nodes: ";
    document.getElementById('main-graph-edges').innerHTML = "Number of Edges: ";

    // initialize within #cy element
    cy = cytoscape 
    ({
        container: document.getElementById('cy')
    });

    cy_neighbors = cytoscape 
    ({
        container: document.getElementById('cy-neighbors')
    });

    cy_geo = cytoscape 
    ({
        container: document.getElementById('cy-geo')
    });
}


// add images via imageListFile
async function loadGraph(edgeListFile)
{
    console.log("Load Initial Graph");
    console.log(graphCount)
    
    var cy_elements = {
        nodes: [],
        edges: []
    };

    // load edge file
    const response2 = await fetch(edgeDirectory + edgeListFile);
    const data2 = await response2.text();
    const edges_raw = data2.split('\n');

    // collect all nodes
    var nodeSet = new Set();

    // get list of all images
    var sources = [];
    var targets = [];
    var distances = [];
    for (let j = 0; j < edges_raw.length; j++)
    {
        edge = edges_raw[j].split(',');
        if (edge == "") {
            break;
        }
        sources.push(Number(edge[0]));
        targets.push(Number(edge[1]));
        distances.push(edge[2]);

        nodeSet.add(edge[0]);
        nodeSet.add(edge[1]);
    }

    // Load Nodes and Images
    imageList = [];

    // loop through image name file
    var N = nodeSet.size;

    console.log("Number of Nodes: " + N);
    nodeSet.forEach((i) => {
        var nodeData = {
            data: {
                id: i,
                imagePath: imageDirectory + i + '.png',
                label: i
            }
        }
        cy_elements.nodes.push(nodeData)
        imageList.push(imageDirectory + i + '.png')
    });

    if (N > 500) {
        cy_style[0].style =
        {
            'label':'data(label)'
        }
    } else {
        cy_style[0].style = 
        {
            'shape':'rectangle',
            'background-image': 'data(imagePath)',
            'background-fit': 'contain',
            'label':'data(label)'
        }
    }
    
    var numEdges = 0;

    // loop through edges by source, target, edge length
    for (let j = 0; j < sources.length; j++)
    {
        numEdges++;
        var edgeData = {
            data: {
                'id': graphCount + ":" + sources[j]+'-'+targets[j],
                'source': sources[j],
                'target': targets[j],
                'distance': parseFloat(distances[j]),
                'label': parseFloat(distances[j]).toFixed(2)
            },
            classes: cy_edgeColors[0]
        }
        if (j == 0) {
            console.log(edgeData);
        }
        cy_elements.edges.push(edgeData);
    }

    cy = cytoscape ({
        container: document.getElementById('cy'),
        elements: cy_elements,
        layout: cy_layout,
        style: cy_style
    })

    return;
}


// add images via imageListFile
async function addEdges(edgeListFile)
{
    console.log("Add Second Graph");
    console.log(graphCount);
    cy_edges = []

    // Load edges via graph file
    const response1 = await fetch(edgeDirectory+edgeListFile);
    const data1 = await response1.text();
    const edges_raw = data1.split('\n');

    var numEdges = 0;
    var sharedEdges = 0;

    // loop through edges by source, target, edge length
    var edge = []
    for (let j = 0; j < edges_raw.length; j++)
    {
        edge = edges_raw[j].split(',');
        if (edge == "")
        {
            break;
        }
        numEdges++;

        edge = [Number(edge[0]),Number(edge[1]),edge[2]];
        console.log(edge);

        // check if edge exists
        var edgeCheck1 = cy.getElementById("0:" + edge[0]+'-'+edge[1])
        var edgeCheck2 = cy.getElementById("0:" + edge[1]+'-'+edge[0])
        
        if (edgeCheck1.length || edgeCheck2.length) {
            sharedEdges++;
            var edgeData = {
                group: 'edges',
                data: {
                    'id': graphCount + ":" + edge[0]+'-'+edge[1],
                    'source': edge[0],
                    'target': edge[1],
                    'distance': parseFloat(edge[2]),
                    'label': parseFloat(edge[2]).toFixed(2)
                },
                classes: cy_edgeColors[2]
            }
            cy_edges.push(edgeData);

        } else {
            var edgeData = {
                group: 'edges',
                data: {
                    'id': graphCount + ":" + edge[0]+'-'+edge[1],
                    'source': edge[0],
                    'target': edge[1],
                    'distance': parseFloat(edge[2]),
                    'label': parseFloat(edge[2]).toFixed(2)
                },
                classes: cy_edgeColors[1]
            }
            cy_edges.push(edgeData);
        }
    }

    cy.add(cy_edges)
    console.log('Number of Edges: ', numEdges);
    console.log('Shared Edges: ', sharedEdges);

    return;
}



// add images via imageListFile
async function loadNeighborsGraph(nodeID)
{
    console.log("Loading Neighbors Graph for Node: " + nodeID);
    document.getElementById('neighbor-id').value = nodeID;

    neighborsObject = cy.$("#"+nodeID).neighborhood()
    
    // graph elements
    cy_neighbors_elements = {
        nodes: [],
        edges: []
    };

    console.log(neighborsRemoved);

    if (neighborsRemoved == 1) {

        var element = cy.$("#"+nodeID)[0]
        console.log(element)
        var nodeData = {
            data: {
                id: element._private.data.id,
                imagePath: element._private.data.imagePath,
                label: (element._private.data.id)
            }
        }
        cy_neighbors_elements.nodes.push(nodeData)

        neighborsObject.forEach(element => {
            if (element._private.group == "nodes") {
                var nodeData = {
                    data: {
                        id: element._private.data.id,
                        imagePath: element._private.data.imagePath,
                        label: (element._private.data.id)
                    }
                }
                cy_neighbors_elements.nodes.push(nodeData)
            } else if (element._private.group == "edges") {
                const [e_color] =  element._private.classes;
                var edgeData = {
                    data: {
                        'id': element._private.data.id,
                        'source': element._private.data.source,
                        'target': element._private.data.target,
                        'distance': element._private.data.distance,
                        'label': element._private.data.distance.toFixed(2)
                    },
                    classes: e_color,
                }
                cy_neighbors_elements.edges.push(edgeData);
            }
        })
    } else if (neighborsRemoved == 2) {
        var element = cy.$("#"+nodeID)[0];

        var neighborsList = new Set()
        neighborsList.add(element._private.data.id);
        neighborsObject.forEach(element => {
            if (element._private.group == "nodes") {
                neighborsList.add(element._private.data.id);
            }
        })

        const it1 = neighborsList[Symbol.iterator]();

        for (var i = 0; i < neighborsList.size; i++) {
            var neighborID = it1.next().value;
            console.log(neighborID)

            neighborsObject = cy.$("#"+neighborID).neighborhood();
            neighborsObject.forEach(element => {
                if (element._private.group == "nodes") {
                    var nodeData = {
                        data: {
                            id: element._private.data.id,
                            imagePath: element._private.data.imagePath,
                            label: (element._private.data.id)
                        }
                    }
                    cy_neighbors_elements.nodes.push(nodeData)
                } else if (element._private.group == "edges") {
                    const [e_color] =  element._private.classes;
                    var edgeData = {
                        data: {
                            'id': element._private.data.id,
                            'source': element._private.data.source,
                            'target': element._private.data.target,
                            'distance': element._private.data.distance,
                            'label': element._private.data.distance.toFixed(2)
                        },
                        classes: e_color,
                    }
                    cy_neighbors_elements.edges.push(edgeData);
                }
            })
        }
    } else {
        console.log("no")
    }

    cy_neighbors = cytoscape ({
        container: document.getElementById('cy-neighbors'),
        elements: cy_neighbors_elements,
        layout: cy_neighbors_layout,
        style: cy_neighbors_style
    })

    cy_neighbors.on('tap', 'node', function( evt ){
        console.log('hi tap')
        let node = evt.target._private.data.id
        loadNeighborsGraph(node)
    });

    return;
}


async function loadGeodesicPath() {
    console.log("Loading Geodesic Path...");

    // source node image
    var src_id = document.getElementById('geo-source').value;

    // target node image
    var tgt_id = document.getElementById('geo-target').value;

    // geodesic path via djikstra algorithm
    geo_path = cy.elements().dijkstra("#"+src_id,function(edge) {
        return edge.data('distance')
    })

    // output geodesic distance
    var distanceToTarget = geo_path.distanceTo(cy.$("#"+tgt_id))
    //document.getElementById('geo-output-distance').innerHTML = "Geodesic Distance: " + distanceToTarget.toFixed(2);
    console.log(distanceToTarget)

    // geodesic path
    var pathToTarget = geo_path.pathTo(cy.$("#"+tgt_id))
    console.log(pathToTarget)

    await loadGeodesicGraph(pathToTarget);
}

// add images via imageListFile
async function loadGeodesicGraph(pathObject)
{
    console.log("Load Geodesic Path Graph");
    
    // graph elements
    cy_geo_elements = {
        nodes: [],
        edges: []
    };

    // for each element in path list
    pathObject.forEach(element => {
        if (element._private.group == "nodes") {
            var nodeData = {
                data: {
                    id: element._private.data.id,
                    imagePath: element._private.data.imagePath,
                    label: (element._private.data.id)
                }
            }
            cy_geo_elements.nodes.push(nodeData)
        } else if (element._private.group == "edges") {
            const [e_color] =  element._private.classes;
            var edgeData = {
                data: {
                    'id': element._private.data.id,
                    'source': element._private.data.source,
                    'target': element._private.data.target,
                    'distance': element._private.data.distance,
                    'label': element._private.data.distance.toFixed(2)
                },
                classes: e_color,
            }
            cy_geo_elements.edges.push(edgeData);
        }
    });

    console.log(cy_geo_elements)

    cy_geo = cytoscape ({
        container: document.getElementById('cy-geo'),
        elements: cy_geo_elements,
        layout: cy_geo_layout,
        style: cy_geo_style
    })

    cy_geo.on('tap', 'node', function( evt ){
        currentNeighborNode = evt.target._private.data.id
        loadNeighborsGraph(currentNeighborNode)
    });

    return;
}


/*
    LAYOUTS ON BUTTON CALL
*/

function runLayoutRandom() {
    cy.layout({
        name: 'random'
    }).run()
}

function runLayoutCircle() {
    cy.layout({
        name: 'circle'
    }).run()
}

function runLayoutCola() {
    cy.layout({
        name: 'cola'
    }).run()
}

function runLayoutSpread() {
    cy.layout({
        name: 'spread'
    }).run()
}

function runLayoutEuler() {
    cy.layout({
        name: 'euler'
    }).run()
}

function runLayoutKlay() {
    cy.layout({
        name: 'klay'
    }).run()
}

function runLayoutFCose() {
    cy.layout({
        name: 'fcose',
        quality: 'proof', 
        randomize: false,
        animationDuration: 1000
    }).run()
}


// geodesic layour
function runGeodesicToFit() {
    cy_geo.layout({
        name: 'circle'
    }).run()
}

// geodesic layour
function runNeighborsToFit() {
    cy_neighbors.layout({
        name: 'circle'
    }).run()
}


function toggleMain() {
    if (document.getElementById('main-graph-flex').style.visibility == 'hidden') {
        document.getElementById('main-graph-flex').style.visibility = 'visible';
        document.getElementById('main-graph-flex').style.display = 'flex';

        // only main 
        if (document.getElementById('neighbor-graph-flex').style.visibility == 'hidden' && 
                    document.getElementById('geodesic-graph-flex').style.visibility == 'hidden') {
            document.getElementById('main-graph-flex').style.width = '100vw';

        // main and neighbors
        } else if (document.getElementById('neighbor-graph-flex').style.visibility == 'hidden') {
            document.getElementById('main-graph-flex').style.width = '49vw';
            document.getElementById('geodesic-graph-flex').style.width = '49vw';

        // main and geodesic 
        } else if (document.getElementById('geodesic-graph-flex').style.visibility == 'hidden') {
            document.getElementById('main-graph-flex').style.width = '49vw';
            document.getElementById('neighbor-graph-flex').style.width = '49vw';

        // all three
        } else {
            document.getElementById('main-graph-flex').style.width = '32vw';
            document.getElementById('neighbor-graph-flex').style.width = '32vw';
            document.getElementById('geodesic-graph-flex').style.width = '32vw';
        }
    } else {

        document.getElementById('main-graph-flex').style.visibility = 'hidden';
        document.getElementById('main-graph-flex').style.display = 'none';
        
        // neighbors and geodesic going
        if (document.getElementById('neighbor-graph-flex').style.visibility != 'hidden' && 
                    document.getElementById('geodesic-graph-flex').style.visibility != 'hidden') {
            console.log('here')
            document.getElementById('neighbor-graph-flex').style.width = '49vw';
            document.getElementById('geodesic-graph-flex').style.width = '49vw';

        // neighbors
        } else if (document.getElementById('neighbor-graph-flex').style.visibility != 'hidden') {
            document.getElementById('neighbor-graph-flex').style.width = '100vw';

        // main and geodesic 
        } else if (document.getElementById('geodesic-graph-flex').style.visibility != 'hidden') {
            document.getElementById('geodesic-graph-flex').style.width = '100vw';
        }
    }
}

function toggleNeighbors() {
    if (document.getElementById('neighbor-graph-flex').style.visibility == 'hidden') {
        document.getElementById('neighbor-graph-flex').style.visibility = 'visible';
        document.getElementById('neighbor-graph-flex').style.display = 'flex';

        // only neighbors 
        if (document.getElementById('main-graph-flex').style.visibility == 'hidden' && 
                    document.getElementById('geodesic-graph-flex').style.visibility == 'hidden') {
            document.getElementById('neighbor-graph-flex').style.width = '100vw';

        // main and neighbors
        } else if (document.getElementById('main-graph-flex').style.visibility == 'hidden') {
            document.getElementById('geodesic-graph-flex').style.width = '49vw';
            document.getElementById('neighbor-graph-flex').style.width = '49vw';

        // neighbors and geodesic 
        } else if (document.getElementById('geodesic-graph-flex').style.visibility == 'hidden') {
            document.getElementById('neighbor-graph-flex').style.width = '49vw';
            document.getElementById('main-graph-flex').style.width = '49vw';

        // all three
        } else {
            document.getElementById('main-graph-flex').style.width = '32vw';
            document.getElementById('neighbor-graph-flex').style.width = '32vw';
            document.getElementById('geodesic-graph-flex').style.width = '32vw';
        }
    } else {
        document.getElementById('neighbor-graph-flex').style.visibility = 'hidden';
        document.getElementById('neighbor-graph-flex').style.display = 'none';

        console.log(document.getElementById('main-graph-flex').style.visibility)
        console.log(document.getElementById('neighbor-graph-flex').style.visibility)
        console.log(document.getElementById('geodesic-graph-flex').style.visibility)

        // main and geodesic going
        if (document.getElementById('main-graph-flex').style.visibility != 'hidden' && 
                    document.getElementById('geodesic-graph-flex').style.visibility != 'hidden') {
            console.log('here')
            document.getElementById('main-graph-flex').style.width = '49vw';
            document.getElementById('geodesic-graph-flex').style.width = '49vw';

        // neighbors
        } else if (document.getElementById('main-graph-flex').style.visibility != 'hidden') {
            document.getElementById('main-graph-flex').style.width = '100vw';

        // geodesic 
        } else if (document.getElementById('geodesic-graph-flex').style.visibility != 'hidden') {
            document.getElementById('geodesic-graph-flex').style.width = '100vw';
        }
    }
}


function toggleGeodesic() {
    if (document.getElementById('geodesic-graph-flex').style.visibility == 'hidden') {
        document.getElementById('geodesic-graph-flex').style.visibility = 'visible';
        document.getElementById('geodesic-graph-flex').style.display = 'flex';

        // only geo 
        if (document.getElementById('main-graph-flex').style.visibility == 'hidden' && 
                    document.getElementById('neighbor-graph-flex').style.visibility == 'hidden') {
            document.getElementById('geodesic-graph-flex').style.width = '100vw';

        // main and geo
        } else if (document.getElementById('main-graph-flex').style.visibility == 'hidden') {
            document.getElementById('neighbor-graph-flex').style.width = '49vw';
            document.getElementById('geodesic-graph-flex').style.width = '49vw';

        // neighbors and geo
        } else if (document.getElementById('neighbor-graph-flex').style.visibility == 'hidden') {
            document.getElementById('main-graph-flex').style.width = '49vw';
            document.getElementById('geodesic-graph-flex').style.width = '49vw';

        // all three
        } else {
            document.getElementById('main-graph-flex').style.width = '32vw';
            document.getElementById('neighbor-graph-flex').style.width = '32vw';
            document.getElementById('geodesic-graph-flex').style.width = '32vw';
        }
    } else {
        document.getElementById('geodesic-graph-flex').style.visibility = 'hidden';
        document.getElementById('geodesic-graph-flex').style.display = 'none';

        // main and neighbors going
        if (document.getElementById('main-graph-flex').style.visibility != 'hidden' && 
                    document.getElementById('neighbor-graph-flex').style.visibility != 'hidden') {
            document.getElementById('main-graph-flex').style.width = '49vw';
            document.getElementById('neighbor-graph-flex').style.width = '49vw';

        // main
        } else if (document.getElementById('main-graph-flex').style.visibility != 'hidden') {
            document.getElementById('main-graph-flex').style.width = '100vw';

        // neighbors
        } else if (document.getElementById('neighbor-graph-flex').style.visibility != 'hidden') {
            document.getElementById('neighbor-graph-flex').style.width = '100vw';
        }
    }
}



// change number of neighbors removed shown
document.getElementById("neighbors-icon-size").addEventListener('change', function() {
    sz = Number(document.getElementById("neighbors-icon-size").value);
    console.log(sz)
    cy_neighbors_style[0].style =
    {
        'width':sz+'px',
        'height':sz+'px',
        'shape':'rectangle',
        'background-image': 'data(imagePath)',
        'background-fit': 'contain',
        'label':'data(label)'
    }

    if (graphCount > 0) {
        cy_neighbors = cytoscape ({
            container: document.getElementById('cy-neighbors'),
            elements: cy_neighbors_elements,
            layout: cy_neighbors_layout,
            style: cy_neighbors_style
        })
    
        cy_neighbors.on('tap', 'node', function( evt ){
            console.log('hi tap')
            let node = evt.target._private.data.id
            loadNeighborsGraph(node)
        });
    }
})


