import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls for rotating and zooming
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 10;

// Color mapping functions
function getColorByCluster(cluster) {
  const clusterColors = {
    1: 0xff0000, // Red for cluster 1
    2: 0x00ff00, // Green for cluster 2
    3: 0x0000ff, // Blue for cluster 3
  };
  return clusterColors[cluster] || 0xffffff; // Default to white
}

function getColorByExpression(expressionValue, minVal, maxVal) {
  const normalizedValue = (expressionValue - minVal) / (maxVal - minVal);
  const color = new THREE.Color().setHSL(normalizedValue, 1.0, 0.5);
  return color.getHex();
}

// Visualization creation
let cellObjects = [];
function createVisualization(cellData, colorMode) {
  // Clear previous objects
  cellObjects.forEach(obj => scene.remove(obj));
  cellObjects = [];

  // Get min/max for gene expression values if needed
  let minExpr = Number.POSITIVE_INFINITY, maxExpr = Number.NEGATIVE_INFINITY;
  if (colorMode !== 'cluster') {
    cellData.forEach(cell => {
      const geneValue = cell.gene_expr[colorMode];
      if (geneValue !== undefined) {
        minExpr = Math.min(minExpr, geneValue);
        maxExpr = Math.max(maxExpr, geneValue);
      }
    });
  }

  // Add cells to the scene
  cellData.forEach(cell => {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    let color;

    if (colorMode === 'cluster') {
      color = getColorByCluster(cell.cluster);
    } else {
      color = getColorByExpression(cell.gene_expr[colorMode] || 0, minExpr, maxExpr);
    }

    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.set(cell.x, cell.y, cell.z);
    scene.add(sphere);
    cellObjects.push(sphere);
  });
}

// Fetch data and initialize
async function loadDataAndVisualize(colorMode) {
  try {
    const response = await fetch('backend/cell_data.json');
    if (!response.ok) throw new Error('Failed to fetch cell data');
    const cellData = await response.json();
    createVisualization(cellData, colorMode);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// UI Handling
const colorModeSelector = document.getElementById('color-mode');
colorModeSelector.addEventListener('change', () => {
  loadDataAndVisualize(colorModeSelector.value);
});

// Start with the default mode
loadDataAndVisualize(colorModeSelector.value);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});