import numpy as np
from scipy.sparse import csr_matrix
from sklearn.utils.graph_shortest_path import graph_shortest_path
from sklearn.manifold import TSNE,Isomap
import networkx as nx
from tqdm import tqdm 

# given an edgeList, create the geodesic 
def edgeListToDistanceMatrix(edgeList):
    print('Creating Distance Matrix From EdgeList')

    # create a graph with all nodes
    G = nx.Graph()
    G.add_weighted_edges_from(edgeList)
    nodes_list = list(G.nodes)
    nodes_map = {w: i for i,w in enumerate(nodes_list)}
    N = len(nodes_list)
    distances = np.zeros([N, N],dtype=float)

    # get all distances into matrix
    for src_node in tqdm(nodes_list):
        iti = nodes_map[src_node]
        for tgt_node in G[src_node]:
            itj = nodes_map[tgt_node]
            distances[iti, itj] = G[src_node][tgt_node]['weight']

    return nodes_list, distances


# given an edgeList, create the geodesic 
def edgeListToGeodesicDistanceMatrix(edgeList):
    print('Creating Geodesic Distance Matrix by A-Star Search')

    # create a graph with all nodes
    G = nx.Graph()
    G.add_weighted_edges_from(edgeList)
    nodes_list = list(G.nodes)
    nodes_map = {w: i for i,w in enumerate(nodes_list)}
    N = len(nodes_list)
    adjacency_matrix = nx.adjacency_matrix(G,weight='weight')

    #for src_node in tqdm(nodes_list):
    #    iti = nodes_map[src_node]
    #    for tgt_node in nodes_list:
    #        itj = nodes_map[tgt_node]
    #        if itj <= iti:
    #            continue
    #        dist = nx.astar_path_length(G, src_node, tgt_node)
    #        distances[iti, itj] = dist
    #        distances[itj, iti] = dist
    distances = graph_shortest_path(adjacency_matrix,directed=False)

    return nodes_list, distances



# perform isomap on distance matrix 
# can pass a csr matrix?
def isomap_on_edgeList(edgeList):
    nodes,distanceMatrix = edgeListToDistanceMatrix(edgeList)
    sparse_matrix = csr_matrix(distanceMatrix)

    isomap = Isomap(
        n_components=2,
        metric='precomputed')
    embeddings = isomap.fit_transform(sparse_matrix)
    return nodes, embeddings 



# perform tsne on edgelist 
def tsne_on_edgeList(edgeList, perplexity=5):
    nodes, distanceMatrix = edgeListToGeodesicDistanceMatrix(edgeList)

    print(f'Performing TSNE with perplexity={perplexity}')
    tsne = TSNE(
        n_components=2,
        random_state=1,
        init="random",
        perplexity=perplexity,
        metric="precomputed",
    )
    embeddings = tsne.fit_transform(distanceMatrix)

    # normalize the data from [0,1]
    embeddings[:] -= embeddings[:].min()
    embeddings[:] /= embeddings[:].max()
    return nodes, embeddings
