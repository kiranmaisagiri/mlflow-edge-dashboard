import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Play, Clock, TrendingUp, BarChart3, Hash, Calendar } from "lucide-react";
import { RunCard } from "./RunCard";
import { RunChart } from "./RunChart";

interface Experiment {
  experiment_id: string;
  name: string;
}

interface Metric {
  key: string;
  value: number;
  timestamp: number;
}

interface Run {
  info: { run_id: string; run_name?: string; start_time?: number; status?: string };
  data: { metrics: Metric[]; params: Record<string, string> };
}

interface RunDetailsProps {
  experiment: Experiment;
  runs: Run[];
  loading: boolean;
  onBack: () => void;
}

export const RunDetails: React.FC<RunDetailsProps> = ({
  experiment,
  runs,
  loading,
  onBack
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);

  const handleRunClick = (runId: string) => {
    setSelectedRunId(runId);
    setShowChart(true);
  };

  const selectedRun = runs.find(run => run.info.run_id === selectedRunId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="bg-card/50 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Experiments
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-mlflow-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-mlflow-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {experiment.name}
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono">{experiment.experiment_id.slice(0, 16)}...</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-mlflow-success/10 text-mlflow-success border-mlflow-success/20">
                {runs.length} Runs
              </Badge>
              <Badge variant="secondary">
                Active Experiment
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Runs List */}
          <div className="space-y-4">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-mlflow-primary" />
                  <span>Experiment Runs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 bg-card/50" />
                      ))}
                    </div>
                  ) : runs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-4 bg-card/50 rounded-xl inline-block mb-4">
                        <Play className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No runs found for this experiment</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {runs.map((run, index) => (
                        <RunCard
                          key={run.info.run_id}
                          run={run}
                          index={index}
                          isSelected={selectedRunId === run.info.run_id}
                          onClick={() => handleRunClick(run.info.run_id)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chart Area */}
          <div className="space-y-4">
            {showChart && selectedRun ? (
              <RunChart 
                run={selectedRun}
                onClose={() => setShowChart(false)}
              />
            ) : (
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <div className="p-4 bg-card/50 rounded-xl inline-block mb-4">
                      <TrendingUp className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Select a Run</h3>
                    <p className="text-muted-foreground">
                      Click on a run card to view its metrics and charts
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};