'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Chart({
  data,
  title,
  type = 'bar',
  color = '#8b5cf6',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = height - (i * height) / 4;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    // Draw bars or line
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = (width - 60) / data.length - 10;

    data.forEach((item, index) => {
      const x = 45 + index * (barWidth + 10);
      const barHeight = (item.value / maxValue) * (height - 60);
      const y = height - 20 - barHeight;

      if (type === 'bar') {
        // Draw bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw label
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px sans-serif';
        ctx.fillText(item.label, x + barWidth / 2 - 10, height - 5);
      } else {
        // Line chart
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (index > 0) {
          const prevX = 45 + (index - 1) * (barWidth + 10);
          const prevY =
            height - 20 - (data[index - 1].value / maxValue) * (height - 60);
          ctx.lineTo(prevX, prevY);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [data, type, color]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className="w-full h-auto"
        style={{ maxHeight: '250px' }}
      />
    </motion.div>
  );
}
