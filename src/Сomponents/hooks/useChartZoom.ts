import { useState } from "react";

export const useChartZoom = (dataLength: number) => {
    const [zoomRange, setZoomRange] = useState([0, dataLength - 1]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const [dragEndX, setDragEndX] = useState<number | null>(null);


    const zoomIn = () => {
        const [start, end] = zoomRange;
        if (end - start <= 3) return;
        setZoomRange([start + 1, end - 1]);
    };

    const zoomOut = () => {
        const [start, end] = zoomRange;
        setZoomRange([
            Math.max(0, start - 1),
            Math.min(dataLength - 1, end + 1),
        ]);
    };

    const resetZoom = () => setZoomRange([0, dataLength - 1]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartX(e.clientX);
        setDragEndX(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || dragStartX === null) return;
        setDragEndX(e.clientX);
    };

    const handleMouseUp = (dataLength: number, chartLeft: number, chartWidth: number) => {
        if (isDragging && dragStartX !== null && dragEndX !== null) {
            const startRatio = Math.min(dragStartX, dragEndX) - chartLeft;
            const endRatio = Math.max(dragStartX, dragEndX) - chartLeft;

            const startIndex = Math.floor((startRatio / chartWidth) * dataLength);
            const endIndex = Math.floor((endRatio / chartWidth) * dataLength);

            setZoomRange([
                Math.max(0, startIndex),
                Math.min(dataLength - 1, endIndex),
            ]);
        }

        setIsDragging(false);
        setDragStartX(null);
        setDragEndX(null);
    };

    return {
        zoomRange,
        zoomIn,
        zoomOut,
        resetZoom,
        isDragging,
        dragStartX,
        dragEndX,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        setZoomRange,
    };
};
