import React, { useState, useMemo, useRef } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import jsonData from "../../data/data.json";
import { conversionRate } from "../../utils/calcConversionRate";
import styles from './Chart.module.css';
import { CalendarIcon } from "../Icons/CalendarIcon";
import { WinnerIcon } from "../Icons/WinnerIcon";
import { DataItem, Variation } from "./interface";
import { toPng } from "html-to-image";

const variations: Variation[] = jsonData.variations;
const rawData: DataItem[] = jsonData.data;

export const Chart: React.FC = () => {
    const [selectedVariation, setSelectedVariation] = useState<string>("All");
    const [period, setPeriod] = useState<"Day" | "Week">("Day");
    const [lineStyle, setLineStyle] = useState<"Line" | "Smooth" | "Area">("Line");
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const chartRef = useRef<HTMLDivElement>(null);
    // Drag–zoom state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const [dragEndX, setDragEndX] = useState<number | null>(null);

    // === Step 2: Drag Handlers ===
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartX(e.clientX);
        setDragEndX(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || dragStartX === null) return;
        setDragEndX(e.clientX);
    };

    const handleMouseUp = () => {
        if (isDragging && dragStartX !== null && dragEndX !== null) {
            const rect = chartRef.current?.getBoundingClientRect();
            if (!rect) return;

            const startRatio = Math.min(dragStartX, dragEndX) - rect.left;
            const endRatio = Math.max(dragStartX, dragEndX) - rect.left;
            const chartWidth = rect.width;

            const startIndex = Math.floor((startRatio / chartWidth) * processedData.length);
            const endIndex = Math.floor((endRatio / chartWidth) * processedData.length);

            setZoomRange([
                Math.max(0, startIndex),
                Math.min(processedData.length - 1, endIndex),
            ]);
        }

        setIsDragging(false);
        setDragStartX(null);
        setDragEndX(null);
    };



    const exportToPNG = async () => {
        if (!chartRef.current) return;

        try {
            const dataUrl = await toPng(chartRef.current, {
                cacheBust: true,
                backgroundColor: theme === "dark" ? "#111" : "#fff",
                width: chartRef.current.clientWidth,
                height: chartRef.current.clientHeight,
            });

            const link = document.createElement("a");
            link.download = "chart.png";
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    const getColorMap = (theme: "light" | "dark") => ({
        "0": theme === "light" ? "#000000" : "#ffffff",
        "10001": "#0000ff",
        "10002": "#ffa500",
        "10003": "#008000",
    });

    const colors = getColorMap(theme);

    const processedData = useMemo(() => {
        let data = rawData.map((item) => {
            const res: Record<string, number | string | null> & { date: string } = { date: item.date };
            Object.keys(item.visits).forEach((key) => {
                const visits = item.visits[key] || 0;
                const conv = item.conversions[key] || 0;
                res[key] = conversionRate(visits, conv);
            });

            return res;
        });

        if (period === "Week") {
            const weekData: typeof data = [];
            for (let i = 0; i < data.length; i += 7) {
                const weekSlice = data.slice(i, i + 7);
                const weekItem: Record<string, number | string> & { date: string } = { date: weekSlice[0].date };
                Object.keys(weekSlice[0]).forEach((key) => {
                    if (key === "date") return;
                    const sum = weekSlice.reduce((acc, cur) => acc + Number(cur[key] || 0), 0);
                    weekItem[key] = sum / weekSlice.length;
                });
                weekData.push(weekItem);
            }
            data = weekData;
        }

        return data;
    }, [period]);

    const [zoomRange, setZoomRange] = useState([0, processedData.length - 1]);
    const visibleData = processedData.slice(zoomRange[0], zoomRange[1] + 1);

    const zoomIn = () => {
        const [start, end] = zoomRange;
        if (end - start <= 3) return;
        setZoomRange([start + 1, end - 1]);
    };

    const zoomOut = () => {
        const [start, end] = zoomRange;
        setZoomRange([
            Math.max(0, start - 1),
            Math.min(processedData.length - 1, end + 1),
        ]);
    };

    const resetZoom = () => {
        setZoomRange([0, processedData.length - 1]);
    };

    const linesToShow = useMemo(() => {
        if (selectedVariation === "All") return variations;
        return variations.filter((variant) => (variant.id?.toString() || "0") === selectedVariation);
    }, [selectedVariation]);

    const renderTooltip = ({ active, payload }: any) => {
        if (!active || !payload || payload.length === 0) return null;

        const date = new Date(payload[0].payload.date);
        const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(
            date.getMonth() + 1
        ).padStart(2, "0")}/${date.getFullYear()}`;

        const sortedPayload = [...payload].sort((a, b) => Number(b.value) - Number(a.value));

        return (
            <div
                className={styles.tooltipContainer}
                onMouseEnter={(e) => e.stopPropagation()}
            >
                <div className={styles.formattedDateContainer}>
                    <CalendarIcon />
                    <div className={styles.formattedDate}>{formattedDate}</div>
                </div>
                <div className={styles.line} />
                {sortedPayload.map((p, i) => {
                    const variation = variations.find((variant) => (variant.id?.toString() || "0") === p.dataKey);
                    const name = variation ? variation.name : p.dataKey;
                    return (
                        <div
                            key={i}
                            className={styles.tooltipRow}
                        >
                            <div className={styles.tooltipRowItems}>
                                <span
                                    className={styles.colorDot}
                                    style={{ backgroundColor: p.color }}
                                />
                                <div> {name}</div>
                                {i === 0 && <WinnerIcon style={{ marginLeft: 5, marginTop: 4 }} />}
                            </div>
                            <div className={styles.percentageValue}>{Number(p.value).toFixed(2)}%</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`${styles.container} ${theme === "light" ? styles.lightTheme : styles.darkTheme}`}>
            <div className={styles.dragHint}>
                Drag on the chart to zoom
            </div>
            <div className={styles.selectContainer}>
                <div className={styles.groupContainer}>
                    <select className={styles.selectStyle} value={selectedVariation} onChange={(e) => setSelectedVariation(e.target.value)}>
                        <option value="All">All variations selected</option>
                        {variations.map((v) => (
                            <option key={v.id || 0} value={v.id?.toString() || "0"}>
                                {v.name}
                            </option>
                        ))}
                    </select>

                    <select className={styles.selectStyle} value={period} onChange={(e) => setPeriod(e.target.value as "Day" | "Week")}>
                        <option value="Day">Day</option>
                        <option value="Week">Week</option>
                    </select>
                </div>
                <div className={styles.groupContainer}>
                    <select className={styles.selectStyle} value={lineStyle} onChange={(e) => setLineStyle(e.target.value as "Line" | "Smooth" | "Area")}>
                        <option value="Line">Line style: Line</option>
                        <option value="Smooth">Line style: Smooth</option>
                        <option value="Area">Line style: Area</option>
                    </select>
                    <button
                        className={`${styles.button} ${theme === "light" ? styles.lightButton : styles.darkButton}`}
                        onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
                    >
                        {theme === "light" ? "Light Theme" : "Dark Theme"}
                    </button>
                    <button
                        className={`${styles.button} ${theme === "light" ? styles.lightButton : styles.darkButton}`}
                        onClick={exportToPNG}
                        style={{ marginLeft: 8 }}
                    >
                        Export chart to PNG
                    </button>
                    <div className={styles.zoomContainer}>
                        <button className={styles.zoom} onClick={zoomIn}>+</button>
                        <button className={styles.zoom} onClick={zoomOut}>−</button>
                        <button className={styles.zoom} onClick={resetZoom}>⟳</button>
                    </div>
                </div>
            </div>
            <div ref={chartRef} style={{ position: "relative" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}>
                <ResponsiveContainer width="100%" height={400}>
                    {lineStyle === "Area" ? (
                        <AreaChart data={visibleData}>
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => {
                                    const d = new Date(value);
                                    const day = String(d.getDate()).padStart(2, "0");
                                    const month = String(d.getMonth() + 1).padStart(2, "0");
                                    const year = d.getFullYear();
                                    return `${day}/${month}/${year}`;
                                }}
                            />

                            <YAxis unit="%" domain={[0, 40]} />
                            <Tooltip content={renderTooltip} />
                            {linesToShow.map((v) => (
                                <Area
                                    key={v.id || 0}
                                    type="monotone"
                                    dataKey={v.id?.toString() || "0"}
                                    stroke={colors[v.id?.toString() as keyof typeof colors || "0"]}
                                    fill={colors[v.id?.toString() as keyof typeof colors || "0"]}
                                />
                            ))}
                        </AreaChart>
                    ) : (
                        <LineChart data={visibleData}>
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => {
                                    const d = new Date(value);
                                    const day = String(d.getDate()).padStart(2, "0");
                                    const month = String(d.getMonth() + 1).padStart(2, "0");
                                    const year = d.getFullYear();
                                    return `${day}/${month}/${year}`;
                                }}
                            />

                            <YAxis unit="%" domain={[0, 40]} />
                            <Tooltip content={renderTooltip} />
                            {linesToShow.map((v) => (
                                <Line
                                    key={v.id || 0}
                                    type={lineStyle === "Smooth" ? "monotone" : "linear"}
                                    dataKey={v.id?.toString() || "0"}
                                    stroke={colors[v.id?.toString() as keyof typeof colors || "0"]}
                                    dot={false}
                                    connectNulls={true}
                                />
                            ))}
                        </LineChart>
                    )}
                </ResponsiveContainer>
                {isDragging && dragStartX !== null && dragEndX !== null && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: Math.min(dragStartX, dragEndX) - chartRef.current!.getBoundingClientRect().left,
                            width: Math.abs(dragEndX - dragStartX),
                            height: "100%",
                            backgroundColor: "rgba(0, 123, 255, 0.2)",
                            pointerEvents: "none",
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Chart;
