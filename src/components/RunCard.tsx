import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Hash, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Metric {
  key: string;
  value: number;
  timestamp: number;
}

interface Run {
  info: { run_id: string; run_name?: string; start_time?: number; status?: string };
  data: { metrics: Metric[]; params: Record<string, string> };
}

interface RunCardProps {
  run: Run;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export const RunCard: React.FC<RunCardProps> = ({
  run,
  index,
  isSelected,
  onClick
}) => {
  const getStatusIcon = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'FINISHED':
        return <CheckCircle className="h-4 w-4 text-mlflow-success" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-mlflow-error" />;
      case 'RUNNING':
        return <Activity className="h-4 w-4 text-mlflow-warning animate-pulse" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'FINISHED':
        return 'bg-mlflow-success/10 text-mlflow-success border-mlflow-success/20';
      case 'FAILED':
        return 'bg-mlflow-error/10 text-mlflow-error border-mlflow-error/20';
      case 'RUNNING':
        return 'bg-mlflow-warning/10 text-mlflow-warning border-mlflow-warning/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const topMetrics = run.data.metrics.slice(0, 3);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 animate-fade-in hover:scale-[1.02] ${
        isSelected 
          ? 'bg-mlflow-primary/10 border-mlflow-primary shadow-glow' 
          : 'bg-gradient-card border-border/50 hover:border-mlflow-primary/50'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm text-foreground">
                  {run.info.run_id.slice(0, 8)}...
                </span>
              </div>
              <h4 className="font-medium text-foreground">
                {run.info.run_name || `Run ${run.info.run_id.slice(0, 8)}`}
              </h4>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(run.info.status)}
              <Badge className={getStatusColor(run.info.status)}>
                {run.info.status || 'Unknown'}
              </Badge>
            </div>
          </div>

          {/* Metrics Preview */}
          {topMetrics.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Top Metrics</p>
              <div className="grid grid-cols-1 gap-1">
                {topMetrics.map((metric) => (
                  <div key={metric.key} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground truncate">{metric.key}</span>
                    <span className="font-mono text-foreground ml-2">
                      {typeof metric.value === 'number' ? metric.value.toFixed(4) : String(metric.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(run.info.start_time)}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {run.data.metrics.length} metrics
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};