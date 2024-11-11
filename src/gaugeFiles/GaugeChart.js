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
        const width = containerRef.current.offsetWidth;
        // Increase height to accommodate the value display
        setDimensions({
          width: width,
          height: width / 2 + 80, // Added extra space for the value display
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
  const centerY = height - 50; // Adjust center point to make room for value display
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
                  cornerRadius={5}
                />

                <Pie
                  data={valueData}
                  cx={centerX}
                  cy={centerY}
                  startAngle={180}
                  endAngle={180 - angle}
                  innerRadius={radius - 90}
                  outerRadius={radius + 20}
                  fill="#090909"
                  stroke="none"
                  dataKey="value"
                  cornerRadius={2}
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
                  cornerRadius={2}
                />

                {/* <Pie
                  data={valueData}
                  cx={centerX}
                  cy={centerY}
                  startAngle={180 - angle + 0.5}
                  endAngle={180 - angle + 0.5}
                  innerRadius={radius - 40}
                  outerRadius={radius + 40}
                  fill="var(--gauge-text-highlight)"
                  stroke="none"
                  dataKey="value"
                /> */}

                <defs>
                  <linearGradient
                    id="gaugeGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="var(--gauge-gradient-start)" />
                    <stop offset="100%" stopColor="var(--gauge-gradient-end)" />
                  </linearGradient>
                </defs>

                {labels.map((label) => {
                  const labelX =
                    centerX +
                    (label.radius - 20) *
                      Math.cos((label.angle * Math.PI) / 180);
                  const labelY =
                    centerY +
                    (label.radius - 20) *
                      Math.sin((label.angle * Math.PI) / 180);

                  return (
                    <g key={label.value}>
                      <text
                        x={labelX}
                        y={labelY}
                        fill="var(--gauge-label-text)"
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
              </PieChart>
            )}

            {width > 0 && (
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
                    color: `var(--gauge-text-highlight)`,
                    position: "absolute",
                    top: `-${radius + 50}px`, // Adjust this value to position the display properly
                    left: "50%",
                    transform: `translateX(-50%)`,
                    fontSize: "clamp(20px, 5vw, 28px)",
                    fontWeight: "700",
                  }}
                >
                  {gaugeValue}%
                </div>
                <div
                  className="line-display"
                  style={{
                    width: 2,
                    height: `65px`,
                    backgroundColor: `var(--gauge-text)`,
                    position: "absolute",
                    top: `-${radius }px`, // Adjust this value to position the display properly
                    left: "50%",
                    transform: `translateX(-50%)`,
                    fontSize: "clamp(20px, 5vw, 28px)",
                    fontWeight: "700",
                    
                  }}
                />
              </div>
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
