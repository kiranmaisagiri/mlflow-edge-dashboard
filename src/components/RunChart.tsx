import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, TrendingUp, Hash, Calendar, Settings } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Metric {
  key: string;
  value: number;
  timestamp: number;
}

interface Run {
  info: { run_id: string; run_name?: string; start_time?: number; status?: string };
  data: { metrics: Metric[]; params: Record<string, string> };
}

interface RunChartProps {
  run: Run;
  onClose: () => void;
}

export const RunChart: React.FC<RunChartProps> = ({ run, onClose }) => {
  const getChartData = () => {
    if (run.data.metrics.length === 0) {
      return null;
    }

    // Group metrics by key and create time series data
    const metricGroups = run.data.metrics.reduce((acc, metric) => {
      if (!acc[metric.key]) {
        acc[metric.key] = [];
      }
      acc[metric.key].push({
        x: new Date(metric.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }),
        y: metric.value,
        timestamp: metric.timestamp,
      });
      return acc;
    }, {} as Record<string, Array<{ x: string; y: number; timestamp: number }>>);

    // Create datasets with different colors
    const colors = [
      'hsl(142, 86%, 28%)', // mlflow-primary
      'hsl(262, 83%, 58%)', // mlflow-secondary  
      'hsl(195, 100%, 50%)', // mlflow-tertiary
      'hsl(43, 96%, 56%)', // mlflow-warning
      'hsl(0, 84%, 60%)', // mlflow-error
    ];

    const datasets = Object.entries(metricGroups).map(([key, data], index) => ({
      label: key,
      data: data.sort((a, b) => a.timestamp - b.timestamp),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + '20',
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: colors[index % colors.length],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }));

    const allLabels = [...new Set(
      Object.values(metricGroups)
        .flat()
        .map(point => point.x)
    )].sort();

    return {
      labels: allLabels,
      datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'hsl(210, 40%, 98%)',
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Metrics Over Time',
        color: 'hsl(210, 40%, 98%)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'hsl(220, 13%, 12%)',
        titleColor: 'hsl(210, 40%, 98%)',
        bodyColor: 'hsl(215, 20.2%, 65.1%)',
        borderColor: 'hsl(217.2, 32.6%, 17.5%)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'hsl(217.2, 32.6%, 17.5%)',
        },
        ticks: {
          color: 'hsl(215, 20.2%, 65.1%)',
        },
      },
      y: {
        grid: {
          color: 'hsl(217.2, 32.6%, 17.5%)',
        },
        ticks: {
          color: 'hsl(215, 20.2%, 65.1%)',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const chartData = getChartData();

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="bg-gradient-card border-border/50 animate-scale-in">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-mlflow-primary" />
              <span>Run Analytics</span>
            </CardTitle>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-foreground">
                  {run.info.run_id.slice(0, 16)}...
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatTime(run.info.start_time)}</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Run Info */}
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-mlflow-primary/10 text-mlflow-primary border-mlflow-primary/20">
            {run.info.run_name || `Run ${run.info.run_id.slice(0, 8)}`}
          </Badge>
          <Badge variant="outline">
            {run.data.metrics.length} metrics
          </Badge>
          <Badge variant="outline">
            {Object.keys(run.data.params).length} parameters
          </Badge>
        </div>

        {/* Chart */}
        {chartData && chartData.datasets.length > 0 ? (
          <div className="h-80 bg-card/30 rounded-lg p-4">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center bg-card/30 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No metric data available for visualization</p>
            </div>
          </div>
        )}

        {/* Metrics Table */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold text-foreground">Detailed Metrics</h4>
          </div>
          
          <ScrollArea className="h-48 bg-card/30 rounded-lg">
            <div className="p-4 space-y-3">
              {run.data.metrics.length > 0 ? (
                run.data.metrics.map((metric, index) => (
                  <div key={`${metric.key}-${index}`} className="flex justify-between items-center py-2 border-b border-border/30 last:border-b-0">
                    <span className="text-sm text-muted-foreground font-medium">
                      {metric.key}
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {typeof metric.value === 'number' 
                        ? metric.value.toFixed(6) 
                        : String(metric.value)
                      }
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No metrics available
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Parameters */}
        {Object.keys(run.data.params).length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Parameters</h4>
            <ScrollArea className="h-32 bg-card/30 rounded-lg">
              <div className="p-4 space-y-2">
                {Object.entries(run.data.params).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-1">
                    <span className="text-sm text-muted-foreground font-medium">{key}</span>
                    <span className="font-mono text-sm text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};