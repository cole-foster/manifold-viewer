# Cole Foster
# Convert edgelists to json file for graph viewer
import numpy as np
from sklearn.manifold import TSNE
import networkx as nx
import json
from tqdm import tqdm


# geodesic distance matrix
def geodesicDistanceMatrix(edgeList):

    # create a graph with all nodes
    G = nx.Graph()
    G.add_weighted_edges_from(edgeList)
    nodes_list = G.nodes
    N = len(nodes_list)
    distances = np.zeros([N, N])

    for iti, i in tqdm(enumerate(nodes_list)):
        for itj, j in enumerate(nodes_list):
            if j <= i:
                continue
            dist = nx.astar_path_length(G, i, j)
            distances[iti, itj] = dist
            distances[itj, iti] = dist

    return list(nodes_list), distances


def tsne_on_distances(distanceMatrix, perplexity=5):
    tsne = TSNE(
        n_components=2,
        learning_rate="auto",
        random_state=1,
        init="random",
        perplexity=perplexity,
        metric="precomputed",
    )
    embeddings = tsne.fit_transform(distanceMatrix)

    # normalize the data from [0,1]
    embeddings[:] -= embeddings[:].min()
    embeddings[:] /= embeddings[:].max()
    return embeddings


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
def main(path):
    data_rng = np.loadtxt(path, dtype=str)
    edgeList = []
    for row in data_rng:
        i, j, dist = row.split(",")
        edgeList.append((int(i), int(j), float(dist)))

    nodes, distanceMatrix = geodesicDistanceMatrix(edgeList)

    embeddings = tsne_on_distances(distanceMatrix)

    # create json object
    json_data = createCytoscapeJSON(nodes, edgeList, embeddings)

    # save json file to jsons/
    filename = path.split("/")[-1].rstrip(".txt")
    out_path = "jsons/" + filename + ".json"
    with open(out_path, "w") as write_file:
        json.dump(json_data, write_file)

    return


if __name__ == "__main__":
    path = "graphs/netvlad/RNG-edgeList_car_model-1_net-vlad.txt"
    main(path)
