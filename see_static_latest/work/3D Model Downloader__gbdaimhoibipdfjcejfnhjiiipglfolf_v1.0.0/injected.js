// Injected script - runs in page context to access Three.js objects
(function() {
    'use strict';

    // Store collected scenes and meshes
    const collectedScenes = [];
    let meshCounter = 0;

    // Function to export mesh as OBJ
    function exportMeshToOBJ(mesh, filename) {
        let objString = "# OBJ File\n";
        let geometry = mesh.geometry;

        if (!geometry || !geometry.attributes || !geometry.attributes.position) {
            console.warn('Mesh has no valid geometry:', mesh);
            return;
        }

        let position = geometry.attributes.position;
        let index = geometry.index;

        // Export vertices
        for (let i = 0; i < position.count; i++) {
            let x = position.getX(i);
            let y = position.getY(i);
            let z = position.getZ(i);
            objString += `v ${x} ${y} ${z}\n`;
        }

        // Export faces
        if (index) {
            for (let i = 0; i < index.count; i += 3) {
                let a = index.getX(i) + 1;
                let b = index.getX(i + 1) + 1;
                let c = index.getX(i + 2) + 1;
                objString += `f ${a} ${b} ${c}\n`;
            }
        } else {
            // Non-indexed geometry
            for (let i = 0; i < position.count; i += 3) {
                objString += `f ${i + 1} ${i + 2} ${i + 3}\n`;
            }
        }

        // Download
        let blob = new Blob([objString], { type: 'text/plain' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();

        // Notify content script
        window.postMessage({
            type: 'DOWNLOAD_MESH',
            filename: filename
        }, '*');

        // Clean up
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }

    // Recursively collect all meshes from a scene
    function collectMeshes(object, meshes = []) {
        if (!object) return meshes;

        // Check if it's a mesh
        if (object.isMesh && object.geometry) {
            meshes.push(object);
        }

        // Recursively check children
        if (object.children && object.children.length > 0) {
            for (let child of object.children) {
                collectMeshes(child, meshes);
            }
        }

        return meshes;
    }

    // Download all collected meshes
    function downloadAllMeshes() {
        const allMeshes = [];

        // Collect meshes from all scenes
        for (let scene of collectedScenes) {
            const meshes = collectMeshes(scene);
            allMeshes.push(...meshes);
        }

        if (allMeshes.length === 0) {
            alert('No meshes found on this page. Make sure the page uses Three.js and has loaded 3D content.');
            return;
        }

        console.log(`Downloading ${allMeshes.length} meshes...`);

        // Download each mesh
        allMeshes.forEach((mesh, index) => {
            const name = mesh.name || `mesh_${index}`;
            const filename = `${name}_${Date.now()}_${index}.obj`;

            try {
                exportMeshToOBJ(mesh, filename);
            } catch (error) {
                console.error(`Error exporting mesh ${name}:`, error);
            }
        });

        alert(`Downloaded ${allMeshes.length} meshes!`);
    }

    // Update mesh count
    function updateMeshCount() {
        const allMeshes = [];
        for (let scene of collectedScenes) {
            const meshes = collectMeshes(scene);
            allMeshes.push(...meshes);
        }

        window.postMessage({
            type: 'MESH_COUNT_UPDATE',
            count: allMeshes.length
        }, '*');
    }

    window.__THREE_DEVTOOLS__ = new EventTarget();

    __THREE_DEVTOOLS__.addEventListener('observe', (event) => {
        const scene = event.detail;
        if (scene && scene.isScene && !collectedScenes.includes(scene)) {
            collectedScenes.push(scene);
            console.log('3D Mesh Downloader: Scene captured', scene);
        }
    });

    // Listen for messages from content script
    window.addEventListener('message', function(event) {
        if (event.source !== window) return;

        if (event.data.type === 'DOWNLOAD_ALL_MESHES') {
            downloadAllMeshes();
        } else if (event.data.type === 'GET_MESH_COUNT') {
            updateMeshCount();
        }
    });

    console.log('3D Mesh Downloader: Injected script loaded');
})();
