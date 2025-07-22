"use client"

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const NURBSCurveEditor3D = () => {
  const [controlPoints, setControlPoints] = useState([]);
  const [curvePoints, setCurvePoints] = useState([]);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [controls, setControls] = useState(null);
  const [raycaster] = useState(new THREE.Raycaster());
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShape, setSelectedShape] = useState('sphere');
  const [degree, setDegree] = useState(3);
  const [isPlacingPoints, setIsPlacingPoints] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up Three.js scene
    const newScene = new THREE.Scene();
    const newCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const newRenderer = new THREE.WebGLRenderer();

    newRenderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(newRenderer.domElement);

    newCamera.position.set(0, 5, 5);
    newCamera.lookAt(0, 0, 0);

    const newControls = new OrbitControls(newCamera, newRenderer.domElement);

    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    setControls(newControls);

    // Clean up
    return () => {
      newRenderer.dispose();
      containerRef.current.removeChild(newRenderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!scene) return;

    // Clear existing shape
    if (currentShape) {
      scene.remove(currentShape);
    }

    // Create new shape
    let geometry;
    switch (selectedShape) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(2, 32, 32);
        break;
      case 'cube':
        geometry = new THREE.BoxGeometry(3, 3, 3);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(1, 1, 4, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(2, 0.5, 16, 100);
        break;
      default:
        geometry = new THREE.SphereGeometry(2, 32, 32);
    }

    const material = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true });
    const newShape = new THREE.Mesh(geometry, material);
    scene.add(newShape);
    setCurrentShape(newShape);

    // Reset control points when shape changes
    setControlPoints([]);
    setCurvePoints([]);

  }, [selectedShape, scene]);

  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }, [scene, camera, renderer, controls]);

  useEffect(() => {
    updateControlPointsVisualization();
    calculateNURBSCurve();
  }, [controlPoints, scene, degree]);

  const updateControlPointsVisualization = () => {
    if (!scene) return;

    // Remove existing control points
    scene.children = scene.children.filter(child => !(child instanceof THREE.Points));

    // Add new control points
    if (controlPoints.length > 0) {
      const geometry = new THREE.BufferGeometry().setFromPoints(controlPoints);
      const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.1 });
      const points = new THREE.Points(geometry, material);
      scene.add(points);
    }
  };

  const calculateNURBSCurve = () => {
    if (controlPoints.length < 2) return;

    const knots = generateKnots(controlPoints.length, degree);
    const curvePoints = [];

    for (let t = 0; t <= 1; t += 0.01) {
      const point = evaluateNURBS(t, degree, controlPoints, knots);
      curvePoints.push(point);
    }

    setCurvePoints(curvePoints);
    updateCurveVisualization(curvePoints);
  };

  const generateKnots = (numControlPoints, degree) => {
    const numKnots = numControlPoints + degree + 1;
    const knots = [];

    for (let i = 0; i < numKnots; i++) {
      if (i < degree + 1) {
        knots.push(0);
      } else if (i >= numControlPoints) {
        knots.push(1);
      } else {
        knots.push((i - degree) / (numControlPoints - degree));
      }
    }

    return knots;
  };

  const evaluateNURBS = (t, degree, controlPoints, knots) => {
    const n = controlPoints.length - 1;
    let x = 0, y = 0, z = 0, w = 0;

    for (let i = 0; i <= n; i++) {
      const basis = basisFunction(i, degree, t, knots);
      x += controlPoints[i].x * basis;
      y += controlPoints[i].y * basis;
      z += controlPoints[i].z * basis;
      w += basis;
    }

    return new THREE.Vector3(x / w, y / w, z / w);
  };

  const basisFunction = (i, degree, t, knots) => {
    if (degree === 0) {
      return (knots[i] <= t && t < knots[i + 1]) ? 1 : 0;
    }

    let left = 0, right = 0;

    if (knots[i + degree] - knots[i] !== 0) {
      left = (t - knots[i]) / (knots[i + degree] - knots[i]);
    }

    if (knots[i + degree + 1] - knots[i + 1] !== 0) {
      right = (knots[i + degree + 1] - t) / (knots[i + degree + 1] - knots[i + 1]);
    }

    return left * basisFunction(i, degree - 1, t, knots) +
           right * basisFunction(i + 1, degree - 1, t, knots);
  };

  const updateCurveVisualization = (curvePoints) => {
    if (!scene) return;

    // Remove existing curve
    scene.children = scene.children.filter(child => !(child instanceof THREE.Line));

    // Add new curve
    if (curvePoints.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      const curve = new THREE.Line(geometry, material);
      scene.add(curve);
    }
  };

  const handleCanvasClick = (event) => {
    if (!isPlacingPoints || !scene || !camera || !currentShape) return;

    const rect = event.target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = raycaster.intersectObject(currentShape);

    if (intersects.length > 0) {
      const newPoint = intersects[0].point;
      setControlPoints([...controlPoints, newPoint]);
    }
  };

  const handleClearPoints = () => {
    setControlPoints([]);
    setCurvePoints([]);
  };

  const handleDegreeChange = (event) => {
    setDegree(Math.max(1, Math.min(parseInt(event.target.value), controlPoints.length - 1)));
  };

  const handleShapeChange = (event) => {
    setSelectedShape(event.target.value);
  };

  const togglePointPlacement = () => {
    setIsPlacingPoints(!isPlacingPoints);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">3D NURBS Curve Editor</h1>
      <div className="mb-4 flex items-center flex-wrap">
        <button
          onClick={handleClearPoints}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4 mb-2"
        >
          Clear Control Points
        </button>
        <label className="mr-2">Degree:</label>
        <input
          type="number"
          value={degree}
          onChange={handleDegreeChange}
          min="1"
          max={Math.max(1, controlPoints.length - 1)}
          className="w-16 border border-gray-300 rounded px-2 py-1 mr-4 mb-2"
        />
        <label className="mr-2">Shape:</label>
        <select
          value={selectedShape}
          onChange={handleShapeChange}
          className="border border-gray-300 rounded px-2 py-1 mr-4 mb-2"
        >
          <option value="sphere">Sphere</option>
          <option value="cube">Cube</option>
          <option value="cylinder">Cylinder</option>
          <option value="torus">Torus</option>
        </select>
        <button
          onClick={togglePointPlacement}
          className={`font-bold py-2 px-4 rounded mb-2 ${
            isPlacingPoints
              ? 'bg-green-500 hover:bg-green-700 text-white'
              : 'bg-yellow-500 hover:bg-yellow-700 text-black'
          }`}
        >
          {isPlacingPoints ? 'Disable Point Placement' : 'Enable Point Placement'}
        </button>
      </div>
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '600px' }} 
        onClick={handleCanvasClick}
      />
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Control Points</h2>
        <p>Number of control points: {controlPoints.length}</p>
        <ul>
          {controlPoints.map((point, index) => (
            <li key={index}>
              Point {index + 1}: ({point.x.toFixed(2)}, {point.y.toFixed(2)}, {point.z.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NURBSCurveEditor3D;