import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { PieChart, Pie } from "recharts";
import { setGaugeValue, setRandomValue } from "./gaugeSlice";
import "./GaugeChart.css";

const GaugeChart = () => {
  const gaugeValue = useSelector((state) => state.gauge.value);
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  // Load saved value on component mount
  useEffect(() => {
    const savedValue = localStorage.getItem("gaugeValue");
    if (savedValue !== null) {
      dispatch(setGaugeValue(parseInt(savedValue, 10)));
    }
  }, [dispatch]);

  // Save value to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("gaugeValue", gaugeValue.toString());
  }, [gaugeValue]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const chartWidth = Math.min(containerWidth, 500); // Limit maximum width
        setDimensions({
          width: chartWidth,
          height: (chartWidth / 2) + 80 // Maintain aspect ratio plus space for value
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const angle = (gaugeValue / 100) * 180;
  const backgroundData = [{ value: 1 }];
  const valueData = [{ value: gaugeValue / 100 }];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === "") {
      dispatch(setRandomValue());
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        dispatch(setGaugeValue(numValue));
      }
    }
  };

  const handleRandomClick = () => {
    dispatch(setRandomValue());
    setInputValue("");
  };

  // Calculate dimensions based on container size
  const { width, height } = dimensions;
  const centerX = width / 2;
  const centerY = height - 80;
  const radius = Math.min(width / 2, (height - 80) / 1.2);

  // Define labels with positions
  const labels = [
    { value: "0%", angle: 180, radius: radius - 50 },
    { value: "25%", angle: 225, radius: radius - 50 },
    { value: "50%", angle: 270, radius: radius - 50 },
    { value: "75%", angle: 315, radius: radius - 50 },
    { value: "100%", angle: 360, radius: radius - 50 },
  ];

  return (
    <div className="gauge-container">
      <div className="gauge-card">
        <div className="gauge-content">
          <div ref={containerRef} className="gauge-chart-container">
            {width > 0 && (
              <>
                <PieChart width={width} height={height}>
                  <Pie
                    data={backgroundData}
                    cx={centerX}
                    cy={centerY}
                    startAngle={180}
                    endAngle={0}
                    innerRadius={radius - 30}
                    outerRadius={radius + 20}
                    fill="var(--gauge-background)"
                    stroke="none"
                    dataKey="value"
                    cornerRadius={10}
                  />

                  <Pie
                    data={valueData}
                    cx={centerX}
                    cy={centerY}
                    startAngle={180}
                    endAngle={180 - angle}
                    innerRadius={radius - 30}
                    outerRadius={radius + 20}
                    fill="url(#gaugeGradient)"
                    stroke="none"
                    dataKey="value"
                    cornerRadius={10}
                  />

                  <defs>
                    <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--gauge-gradient-start)" />
                      <stop offset="100%" stopColor="var(--gauge-gradient-end)" />
                    </linearGradient>
                  </defs>

                  {labels.map((label) => {
                    const labelX =
                      centerX +
                      label.radius * Math.cos((label.angle * Math.PI) / 180);
                    const labelY =
                      centerY +
                      label.radius * Math.sin((label.angle * Math.PI) / 180);
                    const lineEndX =
                      centerX +
                      (radius - 75) * Math.cos((label.angle * Math.PI) / 180);
                    const lineEndY =
                      centerY +
                      (radius - 75) * Math.sin((label.angle * Math.PI) / 180);

                    return (
                      <g key={label.value}>
                        <line
                          x1={centerX}
                          y1={centerY}
                          x2={lineEndX}
                          y2={lineEndY}
                          stroke="var(--gauge-grid-line)"
                          strokeWidth={0.5}
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          fill="var(--gauge-text)"
                          fontSize="14"
                          fontFamily="Space Grotesk"
                          fontWeight="500"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {label.value}
                        </text>
                      </g>
                    );
                  })}

                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={4}
                    fill="var(--gauge-center-point)"
                  />
                </PieChart>

                <div
                  className="gauge-needle"
                  style={{
                    top: `${centerY}px`,
                    left: `${centerX}px`,
                    transform: `translate(-50%, -50%) rotate(${angle - 90}deg)`,
                  }}
                >
                  <img src="/needle.svg" alt="gauge needle" />
                  <div
                    className="value-display"
                    style={{
                      position: "absolute",
                      top: "-120px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "clamp(20px, 5vw, 28px)",
                      fontWeight: "700",
                    }}
                  >
                    {gaugeValue}%
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter value (0-100)"
              className="gauge-input"
              style={{
                fontSize: "clamp(16px, 4vw, 20px)",
                fontWeight: "600",
              }}
            />
            <button onClick={handleRandomClick} className="randomize-button">
              Randomize Value
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;