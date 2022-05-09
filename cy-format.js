
/*
//-------------------------------------------
// DECLARING STYLING OF THE FULL GRAPH
//-------------------------------------------
*/

var cy_edgeColors = ['red', 'blue', 'purple']

// default layout for graph
var cy_layout = {
    name: 'circle',
    random: true
};

// default stylesheet for graph
var cy_style = [

    // nodes
    {
        selector: 'node',
        style:
        {
            'shape': 'rectangle',
            'background-image': 'data(imagePath)',
            'background-fit': 'contain',
            'label': 'data(label)',
            'font-size':4,
            'width': 20,
            'height': 20
        }
    },

    // edges
    {
        selector: 'edge',
        style:
        {
            //'label': 'data(distance)',
            'width': '1px',
        }
    },

    // classes
    {
        selector: '.red',
        style: {
            'line-color': 'red'
        }
    },
    {
        selector: '.green',
        style: {
            'line-color': 'green'
        }
    },
    {
        selector: '.blue',
        style: {
            'line-color': 'blue'
        }
    },
    {
        selector: '.purple',
        style: {
            'line-color': 'purple'
        }
    },
    {
        selector: '.black',
        style: {
            'line-color': 'black'
        }
    }
];


var cy_neighbors_elements = {
    nodes: [],
    edges: []
};
// default layout for graph
var cy_neighbors_layout = {
    name: 'circle'
};

// default stylesheet for graph
var cy_neighbors_style = [

    // nodes
    {
        selector: 'node',
        style:
        {
            'width': '80px',
            'height': '80px',
            'shape': 'rectangle',
            'background-image': 'data(imagePath)',
            'background-fit': 'contain',
            'label': 'data(label)'
        }
    },

    // edges
    {
        selector: 'edge',
        style:
        {
            'label': 'data(label)',
            'width': '2px',
            ///'line-color': 'pink'
        }
    },

    // classes
    {
        selector: '.red',
        style: {
            'line-color': 'red'
        }
    },
    {
        selector: '.green',
        style: {
            'line-color': 'green'
        }
    },
    {
        selector: '.blue',
        style: {
            'line-color': 'blue'
        }
    },
    {
        selector: '.purple',
        style: {
            'line-color': 'purple'
        }
    },
    {
        selector: '.black',
        style: {
            'line-color': 'black'
        }
    },
    {
        selector: '.pink',
        style: {
            'line-color': 'pink'
        }
    }
];


var cy_geo_elements = {
    nodes: [],
    edges: []
};
// default layout for graph
var cy_geo_layout = {
    name: 'circle'
};

// default stylesheet for graph
var cy_geo_style = [

    // nodes
    {
        selector: 'node',
        style:
        {
            'width': '80px',
            'height': '80px',
            'shape': 'rectangle',
            'background-image': 'data(imagePath)',
            'background-fit': 'contain',
            'label': 'data(label)'
        }
    },

    // edges
    {
        selector: 'edge',
        style:
        {
            'label': 'data(label)',
            'width': '4px',
            ///'line-color': 'pink'
        }
    },

    // classes
    {
        selector: '.red',
        style: {
            'line-color': 'red'
        }
    },
    {
        selector: '.green',
        style: {
            'line-color': 'green'
        }
    },
    {
        selector: '.blue',
        style: {
            'line-color': 'blue'
        }
    },
    {
        selector: '.purple',
        style: {
            'line-color': 'purple'
        }
    },
    {
        selector: '.black',
        style: {
            'line-color': 'black'
        }
    },
    {
        selector: '.pink',
        style: {
            'line-color': 'pink'
        }
    }
];

