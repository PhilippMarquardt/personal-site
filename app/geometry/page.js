"use client"

import React, { useState, useEffect, useRef } from 'react';

const NURBSCurveEditor = () => {
  const [controlPoints, setControlPoints] = useState([]);
  const [curvePoints, setCurvePoints] = useState([]);
  const [polynomialSegments, setPolynomialSegments] = useState([]);
  const [degree, setDegree] = useState(3);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const canvasRef = useRef(null);

  const addControlPoint = (x, y) => {
    setControlPoints([...controlPoints, { x, y, weight: 1 }]);
  };

  const updateControlPoint = (index, newX, newY) => {
    const newControlPoints = [...controlPoints];
    newControlPoints[index] = { ...newControlPoints[index], x: newX, y: newY };
    setControlPoints(newControlPoints);
  };

  const calculateNURBSCurve = () => {
    if (controlPoints.length < 2) return;

    const numPoints = 100;
    const knots = generateKnots(controlPoints.length, degree);
    const curvePoints = [];
    const segments = [];

    for (let i = 0; i < controlPoints.length - 1; i++) {
      const segmentPoints = [];
      const tStart = knots[degree + i];
      const tEnd = knots[degree + i + 1];
      
      for (let j = 0; j <= numPoints; j++) {
        const t = tStart + (j / numPoints) * (tEnd - tStart);
        const point = evaluateNURBS(t, degree, controlPoints, knots);
        if (!isNaN(point.x) && !isNaN(point.y)) {
          segmentPoints.push(point);
          if (i === 0 || j > 0) {
            curvePoints.push(point);
          }
        }
      }
      
      if (segmentPoints.length > 0) {
        segments.push(segmentPoints);
      }
    }

    setCurvePoints(curvePoints);
    setPolynomialSegments(segments);
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
    let x = 0;
    let y = 0;
    let w = 0;

    for (let i = 0; i <= n; i++) {
      const basis = basisFunction(i, degree, t, knots);
      x += controlPoints[i].x * controlPoints[i].weight * basis;
      y += controlPoints[i].y * controlPoints[i].weight * basis;
      w += controlPoints[i].weight * basis;
    }

    if (w === 0) return { x: NaN, y: NaN };

    return { x: x / w, y: y / w };
  };

  const basisFunction = (i, degree, t, knots) => {
    if (degree === 0) {
      return (knots[i] <= t && t < knots[i + 1]) ? 1 : 0;
    }

    let left = 0;
    let right = 0;

    if (knots[i + degree] - knots[i] !== 0) {
      left = (t - knots[i]) / (knots[i + degree] - knots[i]);
    }

    if (knots[i + degree + 1] - knots[i + 1] !== 0) {
      right = (knots[i + degree + 1] - t) / (knots[i + degree + 1] - knots[i + 1]);
    }

    return (
      left * basisFunction(i, degree - 1, t, knots) +
      right * basisFunction(i + 1, degree - 1, t, knots)
    );
  };

  useEffect(() => {
    calculateNURBSCurve();
  }, [controlPoints, degree]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw control points
    controlPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = 'black';
      ctx.fillText(`P${index}`, point.x + 10, point.y - 10);
    });

    // Draw control polygon
    ctx.beginPath();
    controlPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.stroke();
    ctx.closePath();

    // Draw curve
    ctx.beginPath();
    curvePoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.closePath();
  }, [controlPoints, curvePoints]);

  const handleCanvasMouseDown = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedPointIndex = controlPoints.findIndex(
      point => Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) < 10
    );

    if (clickedPointIndex !== -1) {
      setDraggingIndex(clickedPointIndex);
    } else {
      addControlPoint(x, y);
    }
  };

  const handleCanvasMouseMove = (event) => {
    if (draggingIndex !== null) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      updateControlPoint(draggingIndex, x, y);
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingIndex(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">NURBS Curve Editor</h1>
      <div className="mb-4">
        <label className="mr-2">Degree:</label>
        <input
          type="number"
          min="1"
          max={controlPoints.length - 1}
          value={degree}
          onChange={(e) => setDegree(Math.min(parseInt(e.target.value), controlPoints.length - 1))}
          className="w-16 border border-gray-300 rounded px-2"
        />
      </div>
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className="border border-gray-300"
        />
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Control Points</h2>
        <ul>
          {controlPoints.map((point, index) => (
            <li key={index} className="mb-2">
              P{index}: ({point.x.toFixed(2)}, {point.y.toFixed(2)})
              <input
                type="number"
                value={point.weight}
                onChange={(e) => {
                  const newControlPoints = [...controlPoints];
                  newControlPoints[index].weight = parseFloat(e.target.value);
                  setControlPoints(newControlPoints);
                }}
                className="ml-2 w-16 border border-gray-300 rounded px-2"
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Polynomial Segments</h2>
        {polynomialSegments.map((segment, index) => (
          <div key={index} className="mb-2">
            <h3 className="font-semibold">Segment {index + 1}</h3>
            {segment.length > 0 ? (
              <>
                <p>Start: ({segment[0].x.toFixed(2)}, {segment[0].y.toFixed(2)})</p>
                <p>End: ({segment[segment.length - 1].x.toFixed(2)}, {segment[segment.length - 1].y.toFixed(2)})</p>
                <p>Number of points: {segment.length}</p>
              </>
            ) : (
              <p>No valid points in this segment</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NURBSCurveEditor;