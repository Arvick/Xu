import scanpy as sc
import json
import numpy as np
import time
# source .venv/Scripts/activate

start_time = time.time()
# Load the h5ad file
adata = sc.read_h5ad('../xulab_test_data_for_fisheye.h5ad')

# Extract relevant data (assuming 'X_pca' holds 3D coordinates)

expression_matrix = adata.X  # Convert to a dense format if needed (may use a lot of memory)
gene_names = adata.var.index.tolist()
coords = adata.obsm['X_spatial']
print(coords)
# Extract gene expression data
'''gene_data = adata[:, 'GENE_NAME'].X  # Replace 'GENE_NAME' with the desired gene
'''
if coords.shape[1] == 2:
    coords = np.hstack([coords, np.zeros((coords.shape[0], 1))])

# Create a JSON structure for WebGL
points = [
    {
        'x': float(x),
        'y': float(y),
        'z': float(z),
        'gene_expr': {gene: float(expr) for gene, expr in zip(gene_names, cell_expr)}
    }
    for (x, y, z), cell_expr in zip(coords, expression_matrix)
]

# Write to JSON file
with open('cell_data.json', 'w') as f:
    json.dump(points, f)

end_time = time.time()
print(f"Execution time: {end_time - start_time:.2f} seconds")