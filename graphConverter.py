# Cole Foster
# Convert edgelists to json file for graph viewer
import os 
import numpy as np
import json
import argparse

# imports
from DimensionalityReduction import isomap_on_edgeList,tsne_on_edgeList



def createCytoscapeJSON(nodes, edgeList, embeddings):
    data = {"nodes": [], "edges": []}

    location_resize = 1000
    for i, pos in enumerate(embeddings * location_resize):
        data["nodes"].append(
            {
                "data": {
                    "id": str(nodes[i]),
                    "label": str(nodes[i]),
                },
                "position": {"x": str(int(pos[0])), "y": str(int(pos[1]))},
            }
        )

    for i, edge_info in enumerate(edgeList):
        data["edges"].append(
            {
                "data": {
                    "id": str(edge_info[0]) + "-" + str(edge_info[1]),
                    "source": str(edge_info[0]),
                    "target": str(edge_info[1]),
                    "distance": str(edge_info[2]),
                    "label": str(edge_info[2]),
                }
            }
        )
    return data


# convert edgeList into geodesic
def main(args):
    path = args.path #"graphs/netvlad/RNG-edgeList_car_model-1_net-vlad.txt"

    if not os.path.exists(args.path):
        print('Invalid Filename Specified: ', args.path)
        print('Aborting!')
        return
    
    # loading edgelist from filename  
    data_rng = np.loadtxt(args.path, dtype=str)
    edgeList = []
    for row in data_rng:
        i, j, dist = row.split(",")
        edgeList.append((int(i), int(j), float(dist)))

    # create output path
    outputPath = 'jsons/'
    filename = path.split("/")[-1].split('.')[0]

    # creating embedding
    if (args.method == 'isomap'):
        nodes,embeddings = isomap_on_edgeList(edgeList)
        outputPath += filename + '__isomap.json'
    elif (args.method == 'tsne'):
        nodes,embeddings = tsne_on_edgeList(edgeList,perplexity=args.perplexity)
        outputPath += filename + '__tsne-' + str(args.perplexity) + '.json'
    else:
        print('Invalid Method Passed: ', args.method)
        print('Aborting!')
        return 

    # create json object for saving 
    json_data = createCytoscapeJSON(nodes, edgeList, embeddings)

    # save json file to jsons/
    with open(outputPath, "w") as write_file:
        json.dump(json_data, write_file)
    return


parser = argparse.ArgumentParser(description='Convert edgelist into json with 2D embedding')
parser.add_argument('--method','-m', type=str, help='Embedding Technique (isomap,tsne)')
parser.add_argument('--path','-p', type=str, help='path to the edgeList')
parser.add_argument('--perplexity','-k', type=int, default=5, help='perplexity of tsne')
if __name__ == "__main__":
    args = parser.parse_args()

    # input
    metric = 'NetVLAD'
    edgeList_directory = 'edgeLists/'
    method_directory = os.path.join(edgeList_directory,metric)

    # compute stuff
    rngsList = os.listdir(method_directory)
    for rng in rngsList:
        args.path = os.path.join(method_directory, rng, rng + '_' + metric + '.txt')
        #print(args.path)
        main(args)
