import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Beaker, Hash } from "lucide-react";

interface Experiment {
  experiment_id: string;
  name: string;
}

interface ExperimentCardProps {
  experiment: Experiment;
  index: number;
  onClick: () => void;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  index,
  onClick
}) => {
  return (
    <Card 
      className="group cursor-pointer bg-gradient-card border-border/50 hover:border-mlflow-primary/50 transition-all duration-300 hover:shadow-glow hover:scale-105 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 bg-mlflow-primary/10 rounded-lg">
                <Beaker className="h-5 w-5 text-mlflow-primary" />
              </div>
              <Badge variant="secondary" className="bg-mlflow-secondary/10 text-mlflow-secondary">
                Experiment
              </Badge>
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-mlflow-primary transition-colors">
              {experiment.name || `Experiment ${index + 1}`}
            </h3>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Hash className="h-4 w-4" />
              <span className="font-mono">{experiment.experiment_id.slice(0, 8)}...</span>
            </div>
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-mlflow-primary group-hover:translate-x-1 transition-all duration-300" />
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge className="bg-mlflow-success/10 text-mlflow-success border-mlflow-success/20">
              Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};