import React, { useRef, useState, useEffect } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState("pen");
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      context.lineWidth = 2;
      context.lineCap = "round";
      redrawPaths();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [paths]);

  const redrawPaths = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => {
      context.beginPath();
      context.lineWidth = path.lineWidth;
      context.strokeStyle = path.color;
      path.points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.stroke();
    });
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    const newPath = {
      points: [{ x: offsetX, y: offsetY }],
      color: mode === "pen" ? "black" : null,
      lineWidth: mode === "pen" ? 3 : 20,
    };
    setCurrentPath(newPath);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;

    if (mode === "pen") {
      const updatedPath = {
        ...currentPath,
        points: [...currentPath.points, { x: offsetX, y: offsetY }],
      };
      setCurrentPath(updatedPath);

      const ctx = canvasRef.current.getContext("2d");
      ctx.lineWidth = updatedPath.lineWidth;
      ctx.strokeStyle = updatedPath.color;
      ctx.beginPath();
      const lastPoint = updatedPath.points[updatedPath.points.length - 2];
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (mode === "erase") {
      erasePath(offsetX, offsetY);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      if (mode === "pen" && currentPath) {
        setPaths([...paths, currentPath]);
      }
      setIsDrawing(false);
      setCurrentPath(null);
    }
  };

  const erasePath = (x, y) => {
    const eraserSize = 20;
    const updatedPaths = paths.filter((path) => {
      return !path.points.some(
        (point) =>
          Math.abs(point.x - x) < eraserSize &&
          Math.abs(point.y - y) < eraserSize
      );
    });
    setPaths(updatedPaths);
  };

  const handleToolChange = (tool) => {
    setMode(tool);
  };

  return (
    <div className="App">
      <div className="toolbar">
        <button className={mode === "pen" ? "selected" : ""} onClick={() => handleToolChange("pen")}>🖊️ Pen</button>
        <button  className={mode === "erase" ? "selected" : ""} onClick={() => handleToolChange("erase")}>🧹 Erase</button>
      </div>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="artboard"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}

export default App;
