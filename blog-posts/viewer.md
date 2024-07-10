---
title: "Microscopy/CT/MRI Viewer"
date: "2024-07-07"
---


![Alt text](/gif.gif)

## Project Introduction

I've developed a comprehensive medical imaging suite that includes both a high-performance microscopy viewer and a 3D CT/MRI image viewer. This project seamlessly combines a Python-based backend with a responsive React frontend, pushing the boundaries of web-based medical image analysis.

### Key Components

1. **Microscopy Viewer**: Designed to handle large-scale, high-resolution microscopy images.
2. **3D CT/MRI Viewer**: Enables interactive exploration of three-dimensional medical imaging data.

### Technical Highlights

- **Frontend**: Built with React, leveraging its component-based architecture for a modular and maintainable codebase.
- **Backend**: Powered by Python, utilizing libraries such as FastAPI for efficient API endpoints, and specialized image processing libraries for handling complex medical imaging formats.

### Primary Challenge: Handling Pyramid-Style CZI Images

The most significant challenge in this project was efficiently managing pyramid-style CZI (Carl Zeiss Image) files. These images are structured with multiple resolution levels, each composed of numerous tiles. The key difficulties included:

- **Multi-Resolution Management**: Implementing a system to seamlessly switch between different resolution levels as users zoom in and out.
- **Tile-Based Rendering**: Developing an efficient algorithm to load and display only the necessary tiles for the current view, ensuring smooth performance even with extremely large images.
- **Memory Optimization**: Balancing between caching for quick access and memory management to prevent overwhelming the client's system.

By overcoming these challenges, I created a viewer that offers researchers and medical professionals a smooth, responsive tool for exploring detailed microscopy images at various scales.

This project showcases my ability to tackle complex problems in scientific computing and web development, resulting in a tool that enhances the workflow of professionals in the medical imaging field.




# Python backend
```python
import os
import io
import base64
from typing import List, Tuple

import numpy as np
import cv2
import javabridge
import bioformats
import nibabel as nib
from PIL import Image
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from shapely.geometry import Polygon

app = FastAPI()

# CORS setup
origins = ["*", "http://localhost:3000", "http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BaseMetadata:
    def __init__(self, file_path: str):
        self.file_path = file_path

    def get_metadata(self):
        raise NotImplementedError("Subclass must implement abstract method")

    def read(self, *args, **kwargs):
        raise NotImplementedError("Subclass must implement abstract method")

class BioFormatsReader(BaseMetadata):
    def __init__(self, czi_path: str):
        super().__init__(czi_path)
        print(f"Initializing reader with path: {czi_path}")
        javabridge.start_vm(class_path=bioformats.JARS)
        self.reader = bioformats.ImageReader(czi_path)
        xml = bioformats.get_omexml_metadata(czi_path)
        ome = bioformats.OMEXML(xml)
        self.REGION_SIZE = 1024
        self.WIDTH = ome.image().Pixels.get_SizeX()
        self.HEIGHT = ome.image().Pixels.get_SizeY()

    def get_metadata(self) -> Tuple[int, int, int]:
        max_level = int(np.log2(np.ceil(np.max([self.WIDTH, self.HEIGHT]) / self.REGION_SIZE))) + 1
        return self.WIDTH, self.HEIGHT, max_level

    def read(self, *args, **kwargs):
        return self.reader.read(*args, **kwargs)

class NiftiReader(BaseMetadata):
    def __init__(self, path: str):
        super().__init__(path)
        self.nifti = nib.load(path)
        self.data = self.nifti.get_fdata()

    def get_metadata(self) -> Tuple[int, int, int]:
        return self.data.shape

    def read(self, axis: int, index: int):
        if axis == 0:
            return np.rot90(self.data[index, :, :], k=3)
        elif axis == 1:
            return np.rot90(self.data[:, index, :], k=3)
        elif axis == 2:
            return np.rot90(self.data[:, :, index], k=1)
        return None

readers: List[BaseMetadata] = []

def get_reader_class(path: str) -> BaseMetadata:
    if path.endswith(".czi"):
        return BioFormatsReader(path)
    elif path.endswith((".nii", ".nii.gz")):
        return NiftiReader(path)
    else:
        return None

def get_reader(path: str) -> BaseMetadata:
    reader = next((r for r in readers if r.file_path == path), None)
    if reader is None:
        reader = get_reader_class(path)
        if reader:
            readers.append(reader)
    return reader

@app.get("/")
async def root():
    readers.append(
        BioFormatsReader(
            r"G:\Windows\Hsa\Slides\Leber\002 2022-07-11 gH2Ax Leber\07_Gr2T2.czi"
        )
    )
    return {"message": "Hello World"}

@app.get("/get_metadata")
async def get_metadata(path: str):
    reader = get_reader(path)
    if not reader:
        return {"error": "Unsupported file format"}
    
    if isinstance(reader, BioFormatsReader):
        width, height, max_level = reader.get_metadata()
        return {"width": width, "height": height, "max_level": max_level}
    elif isinstance(reader, NiftiReader):
        shape = reader.get_metadata()
        return {"width": shape[0], "height": shape[1], "depth": shape[2]}

@app.get("/get_nifti")
async def get_nifti(axis: int, index: int, path: str):
    reader = get_reader(path)
    if not isinstance(reader, NiftiReader):
        return {"error": "Invalid file format"}
    
    img = reader.read(axis, index)
    img = np.interp(img, (img.min(), img.max()), (0, 255)).astype(np.uint8)
    img = Image.fromarray(img)
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    return Response(content=img_byte_arr.getvalue(), media_type="image/jpeg")

@app.get("/get_single_tile")
async def get_single_tile(level: int, x: int, y: int, width: int, height: int, path: str, series: int = 0):
    cache_folder = "cache"
    reader = get_reader(path)
    if not isinstance(reader, BioFormatsReader):
        return {"error": "Invalid file format"}
    
    max_level = reader.get_metadata()[2]
    level = series * max_level + level + series
    image_name = f"img_{level}_{x}_{y}_{width}_{height}.jpg"
    cache_path = os.path.join(cache_folder, image_name)
    
    if not os.path.exists(cache_path):
        img = reader.read(index=0, z=0, t=0, series=level, XYWH=(x, y, width, height))
        cv2.imwrite(cache_path, img * 255.0)
    else:
        img = cv2.imread(cache_path)
    
    img = Image.fromarray(img if isinstance(img, np.ndarray) else (img * 255.0).astype(np.uint8))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    return Response(content=img_byte_arr.getvalue(), media_type="image/jpeg")
```

# 3D Viewer
```javascript
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useLoader, useProgress } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { AxesHelper } from 'three';
import { NRRDLoader } from 'three/examples/jsm/loaders/NRRDLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function CustomMesh({ positions, normals, indices }) {
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.geometry.center();
    }
  }, [meshRef]);

  return (
    <mesh>
      <bufferGeometry ref={meshRef}>
        <bufferAttribute
          attach='attributes-position'
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach='attributes-normal'
          array={normals}
          count={normals.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="index"
          array={indices}
          count={indices.length}
          itemSize={1}
        />
      </bufferGeometry>
      <meshPhongMaterial color="#f3f3f3" />
    </mesh>
  );
}

function RenderOBJ({ filePath }) {
  const objData = useLoader(OBJLoader, filePath);
  const objRef = useRef();

  useEffect(() => {
    if (objRef.current) {
      const mesh = objRef.current.children[0];
      mesh.geometry.center();
      mesh.geometry.rotateX(Math.PI);
      mesh.geometry.rotateZ(Math.PI);
    }
  }, [objRef]);

  return <primitive object={objData} ref={objRef} />;
}

function RenderGLTF({ filePath }) {
  const gltfData = useLoader(GLTFLoader, filePath);
  const gltfRef = useRef();

  useEffect(() => {
    if (gltfRef.current) {
      const mesh = gltfRef.current.children[0].children[0];
      mesh.geometry.center();
    }
  }, [gltfRef]);

  return <primitive object={gltfData.scene} ref={gltfRef} />;
}

function RenderNRRD({ filePath }) {
  const nrrdData = useLoader(NRRDLoader, filePath);
  const sliceRefs = useRef([]);

  const sliceZ = nrrdData.extractSlice('z', Math.floor(nrrdData.RASDimensions[2] / 2));
  const sliceY = nrrdData.extractSlice('y', Math.floor(nrrdData.RASDimensions[1] / 2));
  const sliceX = nrrdData.extractSlice('x', Math.floor(nrrdData.RASDimensions[0] / 2));

  const slicesZ = Array.from({ length: Math.floor(nrrdData.RASDimensions[2] / 50) }, (_, i) => 
    nrrdData.extractSlice('z', i * 50)
  );

  return (
    <group>
      <primitive object={sliceX.mesh} ref={el => sliceRefs.current[0] = el} />
      <primitive object={sliceY.mesh} ref={el => sliceRefs.current[1] = el} />
      <primitive object={sliceZ.mesh} ref={el => sliceRefs.current[2] = el} />
      {slicesZ.map((slice, index) => (
        <primitive key={index} object={slice.mesh} />
      ))}
    </group>
  );
}

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(2)}% loaded</Html>;
}

function AxisImage({ images }) {
  const canvasRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (images && images.length > 0) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const image = images[0];
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setSliderValue(Math.floor(images.length / 2));
    }
  }, [images]);

  const handleSliderChange = (event) => {
    const newValue = parseInt(event.target.value);
    setSliderValue(newValue);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = images[newValue];
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  };

  return (
    <div className='h-full w-full'>
      <canvas ref={canvasRef} className='h-4/5 w-full' />
      <input
        type="range"
        min="0"
        max={images ? images.length - 1 : 0}
        value={sliderValue}
        onChange={handleSliderChange}
      />
    </div>
  );
}

export default function MedicalImageViewer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [nrrdFile, setNrrdFile] = useState(null);
  const [zSlices, setZSlices] = useState(null);
  const [ySlices, setYSlices] = useState(null);
  const [xSlices, setXSlices] = useState(null);

  const canvasRef = useRef();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const filePath = URL.createObjectURL(file);
    setSelectedFile(filePath);
  };

  const handleNrrdUpload = (event) => {
    const file = event.target.files[0];
    const filePath = URL.createObjectURL(file);
    setNrrdFile(filePath);
  };

  useEffect(() => {
    if (nrrdFile) {
      loadNrrdImages(nrrdFile);
    }
  }, [nrrdFile]);

  const loadNrrdImages = (filePath) => {
    const loader = new NRRDLoader();
    loader.load(filePath, (data) => {
      const { RASDimensions } = data;
      
      const extractSlices = (axis, dimensions) => {
        return Array.from({ length: dimensions }, (_, i) => {
          const volume = data.extractSlice(axis, i);
          const image = new Image();
          image.src = volume.canvas.toDataURL();
          return image;
        });
      };

      setZSlices(extractSlices('z', RASDimensions[2]));
      setYSlices(extractSlices('y', RASDimensions[1]));
      setXSlices(extractSlices('x', RASDimensions[0]));
    });
  };

  return (
    <div className='grid h-full w-full bg-transparent grid-cols-2 grid-rows-3'>
      <div className='row-span-3'>
        <input type="file" onChange={handleFileUpload} />
        <input type="file" onChange={handleNrrdUpload} />
        <Canvas ref={canvasRef}>
          <primitive object={new AxesHelper(10)} />
          {selectedFile && <RenderGLTF filePath={selectedFile} />}
          {nrrdFile && <RenderNRRD filePath={nrrdFile} />}
          <pointLight position={[100, 100, 100]} />
          <ambientLight />
          <OrbitControls />
        </Canvas>
      </div>
      <div className='col-span-1 row-span-1'>
        {zSlices && <AxisImage images={zSlices} />}
      </div>
      <div className='col-span-1 row-span-1'>
        {ySlices && <AxisImage images={ySlices} />}
      </div>
      <div className='col-span-1 row-span-1'>
        {xSlices && <AxisImage images={xSlices} />}
      </div>
    </div>
  );
}
```

# 2D Image Viewer
```javascript
"use client";

import React, { useEffect, useRef, useState } from 'react';

function transformPoint(point, matrix) {
  return {
    x: (point.x - matrix.e) / matrix.a,
    y: (point.y - matrix.f) / matrix.d,
  };
}

function calculateViewportBounds(canvas, context, x = 0, y = 0, width = canvas.width, height = canvas.height) {
  const topLeft = transformPoint({ x, y }, context.getTransform());
  const bottomRight = transformPoint({ x: width, y: height }, context.getTransform());
  return new DOMRect(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
}

function doRectanglesOverlap(rect1, rect2) {
  const [minAx, minAy, maxAx, maxAy] = rect1;
  const [minBx, minBy, maxBx, maxBy] = rect2;
  return maxAx >= minBx && minAx <= maxBx && minAy <= maxBy && maxAy >= minBy;
}

const DrawingToolbar = ({ onToggleDrawMode }) => (
  <div className='fixed top-0 left-0 z-10 flex w-fit m-2'>
    <div className="flex flex-col space-y-2">
      <button className="py-2 px-3 rounded-lg bg-blue-500 text-white" onClick={onToggleDrawMode}>
        Draw Mode
      </button>
    </div>
  </div>
);

export default function ImageViewer() {
  const canvasRef = useRef(null);
  const IMAGE_FILE_NAME = '07.czi';
  const TILE_SIZE = 1024;

  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [maxZoomLevel, setMaxZoomLevel] = useState(0);
  const [isDrawModeActive, setIsDrawModeActive] = useState(false);

  const [initialScaleFactor, setInitialScaleFactor] = useState(0);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(0);
  const [visibleTiles, setVisibleTiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [loadedImages, setLoadedImages] = useState([]);
  const [tilesCurrentlyLoading, setTilesCurrentlyLoading] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState([]);

  useEffect(() => {
    async function fetchImageMetadata() {
      const response = await fetch(`http://127.0.0.1:8000/get_metadata?path=${IMAGE_FILE_NAME}`);
      const metadata = await response.json();
      setImageWidth(metadata.width);
      setImageHeight(metadata.height);
      setMaxZoomLevel(metadata.max_level);
    }

    fetchImageMetadata();
    initializeCanvas();

    window.addEventListener('resize', initializeCanvas);
    return () => window.removeEventListener('resize', initializeCanvas);
  }, []);

  function initializeCanvas() {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const scaleFactor = Math.max(canvas.width / imageWidth, canvas.height / imageHeight);
    setInitialScaleFactor(scaleFactor);
    adjustCanvasScale();

    const context = canvas.getContext('2d');
    context.strokeStyle = 'red';
    context.lineWidth = 0.2;
  }

  function getTilesInViewport(level, tileSize, imageWidth, imageHeight, viewportRect) {
    const tilesWide = Math.ceil(imageWidth / (2 ** level * tileSize));
    const tilesHigh = Math.ceil(imageHeight / (2 ** level * tileSize));
    const scaledWidth = imageWidth / (2 ** level);
    const scaledHeight = imageHeight / (2 ** level);
    const visibleTiles = [];

    for (let i = 0; i < tilesWide; i++) {
      for (let j = 0; j < tilesHigh; j++) {
        const tileX = i * tileSize;
        const tileY = j * tileSize;
        const tileWidth = Math.min(tileSize, scaledWidth - tileX);
        const tileHeight = Math.min(tileSize, scaledHeight - tileY);
        if (doRectanglesOverlap(viewportRect, [tileX, tileY, tileX + tileWidth, tileY + tileHeight])) {
          visibleTiles.push(`img_${level}_${tileX}_${tileY}_${tileWidth}_${tileHeight}`);
        }
      }
    }

    return visibleTiles;
  }

  async function fetchTileImage(level, x, y, width, height) {
    const response = await fetch(`http://127.0.0.1:8000/get_single_tile?level=${level}&x=${x}&y=${y}&width=${width}&height=${height}&path=${IMAGE_FILE_NAME}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  function adjustCanvasScale(maintainPosition = false) {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!maintainPosition) {
      const scaleFactor = initialScaleFactor / context.getTransform().a / 2;
      context.scale(scaleFactor, scaleFactor);
      const offset = 4;
      if (canvas.width / scaleFactor / offset - imageWidth * scaleFactor / offset > canvas.height / scaleFactor / offset - imageHeight * scaleFactor / offset) {
        context.translate(canvas.width / scaleFactor / offset - imageWidth * scaleFactor / offset, 0);
      } else {
        context.translate(0, canvas.height / scaleFactor / offset - imageHeight * scaleFactor / offset);
      }
    }

    redrawCanvas(true);
  }

  function clearCanvas(canvas) {
    const context = canvas.getContext('2d');
    context.save();
    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }

  function parseTileNameToParams(tileName) {
    const [, level, x, y, width, height] = tileName.split('_').map(Number);
    return [level, x, y, width, height];
  }

  function clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  async function redrawCanvas(isFirstDraw = false) {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    clearCanvas(canvas);

    const viewportPadding = Math.min(0, canvas.width / 10);
    const viewportBounds = calculateViewportBounds(canvas, context, 0, 0, canvas.width + viewportPadding, canvas.height + viewportPadding);
    const currentScale = context.getTransform().a;

    const zoomLevelScale = Math.pow(2, Math.min(maxZoomLevel, Math.ceil(Math.log2(1 / clampValue(currentScale, 0, 1)))));
    setCurrentZoomLevel(zoomLevelScale);

    const scaledViewport = [
      viewportBounds.x / zoomLevelScale,
      viewportBounds.y / zoomLevelScale,
      viewportBounds.width / zoomLevelScale,
      viewportBounds.height / zoomLevelScale
    ];

    const newVisibleTiles = getTilesInViewport(Math.log2(zoomLevelScale), TILE_SIZE, imageWidth, imageHeight, scaledViewport);

    for (let i = Math.floor(Math.log2(zoomLevelScale)) + 1; i <= maxZoomLevel; i++) {
      const scaledRect = scaledViewport.map(x => x / Math.pow(2, i));
      newVisibleTiles.unshift(...getTilesInViewport(i, TILE_SIZE, imageWidth, imageHeight, scaledRect));
    }

    setVisibleTiles(newVisibleTiles);

    for (const tileName of newVisibleTiles) {
      const [level, x, y, width, height] = parseTileNameToParams(tileName);
      let img = loadedImages.find(([, name]) => name === tileName)?.[0] || new Image();

      if (!img.src && !tilesCurrentlyLoading.includes(tileName)) {
        setTilesCurrentlyLoading(prev => [...prev, tileName]);
        img.onload = () => {
          setLoadedImages(prev => [...prev, [img, tileName]].sort(([, a], [, b]) => parseInt(b.split('_')[1]) - parseInt(a.split('_')[1])));
          setTilesCurrentlyLoading(prev => prev.filter(item => item !== tileName));
          if (newVisibleTiles.includes(tileName)) {
            requestAnimationFrame(() => redrawCanvas());
          }
        };
        img.src = await fetchTileImage(level, x, y, width, height);
      }

      if (img.complete) {
        const tileScale = Math.pow(2, level);
        context.drawImage(img, x * tileScale, y * tileScale, width * tileScale, height * tileScale);
        drawCurrentDrawing();
      }
    }

    console.log("Visible tiles:", newVisibleTiles.length);
  }

  const handleMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  function getMousePosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    e.preventDefault();
    if (e.buttons === 1 || e.buttons === 2) {
      setLastMousePosition(getMousePosition(canvas, e));
      setIsDragging(true);
      if (isDrawModeActive) {
        const context = canvas.getContext('2d');
        context.beginPath();
        context.moveTo(lastMousePosition.x, lastMousePosition.y);
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (isDragging) {
      if ((e.buttons === 2 && isDrawModeActive) || !isDrawModeActive) {
        const mousePosition = getMousePosition(canvas, e);
        const context = canvas.getContext('2d');
        const transform = context.getTransform();
        const dx = (mousePosition.x - lastMousePosition.x) / transform.a;
        const dy = (mousePosition.y - lastMousePosition.y) / transform.d;
        context.translate(dx, dy);
        setLastMousePosition(mousePosition);
        requestAnimationFrame(() => redrawCanvas());
      }

      if (isDrawModeActive && e.buttons === 1) {
        const mousePosition = getMousePosition(canvas, e);
        const context = canvas.getContext('2d');
        const transform = context.getTransform();
        const lastPointTransformed = transformPoint(lastMousePosition, transform);
        const mousePointTransformed = transformPoint(mousePosition, transform);
        addToCurrentDrawing(lastPointTransformed, mousePointTransformed);
        setLastMousePosition(mousePosition);
        drawCurrentDrawing();
      }
    }
  };

  const addToCurrentDrawing = (startPoint, endPoint) => {
    const newLine = {
      x1: startPoint.x,
      y1: startPoint.y,
      x2: endPoint.x,
      y2: endPoint.y,
      color: canvasRef.current.getContext('2d').strokeStyle,
      width: canvasRef.current.getContext('2d').lineWidth,
    };
    setCurrentDrawing(prev => [...prev, newLine]);
  };

  const drawCurrentDrawing = () => {
    const context = canvasRef.current.getContext('2d');
  
    if (currentDrawing.length > 0) {
      context.save();
      context.globalAlpha = 1.0;
      context.strokeStyle = "red";
      context.lineWidth = currentDrawing[0].width;
      context.beginPath();
      context.moveTo(currentDrawing[0].x1, currentDrawing[0].y1);
  
      currentDrawing.forEach(line => {
        context.lineTo(line.x2, line.y2);
      });
  
      context.stroke();
      context.restore();
    }
  };

  const handleWheel = (event) => {
    const canvas = canvasRef.current;
    const mousePosition = getMousePosition(canvas, event);
    const context = canvas.getContext('2d');
    const transform = context.getTransform();
    const oldScale = transform.a;
    const newScale = oldScale * (1 - event.deltaY / 1000);
    const scaleFactor = newScale / oldScale;

    transform.e = mousePosition.x - scaleFactor * (mousePosition.x - transform.e);
    transform.f = mousePosition.y - scaleFactor * (mousePosition.y - transform.f);
    context.setTransform(newScale, transform.b, transform.c, newScale, transform.e, transform.f);
    requestAnimationFrame(() => redrawCanvas());
  };

  const toggleDrawMode = () => {
    setIsDrawModeActive(!isDrawModeActive);
  };

  return (
    <div className='relative overflow-hidden h-screen'>
      <canvas
        className='absolute top-0 left-0 w-full h-full border border-gray'
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onContextMenu={(e) => e.preventDefault()}
        id="imageCanvas"
      />
      <DrawingToolbar onToggleDrawMode={toggleDrawMode} />
    </div>
  );
}
```



