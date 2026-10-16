export interface ChartCoord {
    x: number;
    y: number;
    label: string;
}

export interface ChartYLabel {
    text: string;
    y: number;
}

export interface ChartGeometry {
    coords: ChartCoord[];
    strokePath: string;
    fillPath: string;
    lastCoord: { x: number; y: number };
    yLabels: ChartYLabel[];
}

interface DonationsChartVectorProps {
    chartGeometry: ChartGeometry;
}

function DonationsChartVector({ chartGeometry }: DonationsChartVectorProps) {
    return (
        <div className="w-full mt-1.5 flex-1 flex items-end">
            <svg
                viewBox="0 0 360 150"
                className="w-full h-40"
                role="img"
                aria-label="Monthly donations trend"
            >
                <defs>
                    <linearGradient id="donationsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#0B8A63" stopOpacity="0.35" />
                        <stop offset="1" stopColor="#0B8A63" stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* Y-Axis Value Labels */}
                <g fontSize="9" fill="#5E766E" className="font-sans">
                    {chartGeometry.yLabels.map((lbl) => (
                        <text key={lbl.y} x="0" y={lbl.y}>
                            {lbl.text}
                        </text>
                    ))}

                    {/* X-Axis Milestone Date Labels */}
                    {chartGeometry.coords.map((c) => (
                        <text
                            key={c.x}
                            x={c.x}
                            y="146"
                            textAnchor="middle"
                            className="text-[9px]"
                        >
                            {c.label}
                        </text>
                    ))}
                </g>

                {/* Grid lines */}
                <g stroke="#EAF1EE" className="dark:stroke-border/40">
                    <line x1="28" x2="360" y1="7" y2="7" />
                    <line x1="28" x2="360" y1="45" y2="45" />
                    <line x1="28" x2="360" y1="83" y2="83" />
                    <line x1="28" x2="360" y1="121" y2="121" />
                </g>

                {/* Area Fill */}
                <path d={chartGeometry.fillPath} fill="url(#donationsGradient)" />

                {/* Area Stroke */}
                <path
                    d={chartGeometry.strokePath}
                    fill="none"
                    stroke="#0B8A63"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* Active Highlight Dot on latest milestone */}
                <circle
                    cx={chartGeometry.lastCoord.x}
                    cy={chartGeometry.lastCoord.y}
                    r="4"
                    fill="#0B8A63"
                />
                <circle
                    cx={chartGeometry.lastCoord.x}
                    cy={chartGeometry.lastCoord.y}
                    r="7"
                    fill="#0B8A63"
                    fillOpacity="0.2"
                />
            </svg>
        </div>
    )
}

export default DonationsChartVector