import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { PieChart, Pie } from "recharts";
import { setGaugeValue, setRandomValue } from "./gaugeSlice";
import "./GaugeChart.css";

const GaugeChart = () => {
  const gaugeValue = useSelector((state) => state.gauge.value);
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");

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

  // Responsive dimensions calculation
  const getChartDimensions = () => {
    const baseWidth = Math.min(window.innerWidth * 0.8, 400);
    const baseHeight = baseWidth * 0.8;
    return {
      width: baseWidth,
      height: baseHeight,
      centerX: baseWidth / 2,
      centerY: baseHeight / 2,
      radius: 150,
    };
  };

  const { width, height, centerX, centerY, radius } = getChartDimensions();

  // Calculate value display position based on needle angle
  const getValuePosition = () => {
    const valueRadius = radius - 40; // Adjust this value to position the display
    const valueAngle = ((180 - angle) * Math.PI) / 180;
    return {
      x: centerX + valueRadius * Math.cos(valueAngle),
      y: centerY - valueRadius * Math.sin(valueAngle),
    };
  };

  const valuePosition = getValuePosition();

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
          <div className="gauge-chart-container">
            <PieChart width={width} height={width/2}>
              <Pie
                data={backgroundData}
                cx={centerX}
                cy={centerY}
                startAngle={180}
                endAngle={0}
                innerRadius={radius - 20}
                outerRadius={radius + 10}
                fill="var(--gauge-background)"
                stroke="none"
                dataKey="value"
              />

              <Pie
                data={valueData}
                cx={centerX}
                cy={centerY}
                startAngle={180}
                endAngle={180 - angle}
                innerRadius={radius - 20}
                outerRadius={radius + 10}
                fill="url(#gaugeGradient)"
                stroke="none"
                dataKey="value"
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
                transform: `rotate(${angle - 90}deg)`,
                // width: "clamp(20px, 5vw, 30px)", // Smaller needle size
                // height: "clamp(20px, 5vw, 30px)", // Smaller needle size
              }}
            >
              <img src="/needle.svg" alt="gauge needle" />
              <div
              className="value-display"
              style={{
                position: "absolute",
                transform: "translate(-50%, -600%)",
                fontSize: "clamp(20px, 5vw, 28px)", // Larger font size
                fontWeight: "700", // Bolder text
              }}
            >
              {gaugeValue}%
            </div>
            </div>

            
          </div>

          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter value (0-100)"
              className="gauge-input"
              style={{
                fontSize: "clamp(16px, 4vw, 20px)", // Larger font size
                fontWeight: "600", // Bolder text
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
