import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, RefreshCw, Activity, TrendingUp, Clock, ChevronRight } from "lucide-react";
import axios, { AxiosResponse, AxiosError } from "axios";
import axiosRetry from "axios-retry";
import { ExperimentCard } from "./ExperimentCard";
import { RunDetails } from "./RunDetails";

// Define MLflow API response types
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

interface SearchExperimentsResponse {
  experiments: Array<{ experiment_id: string; name: string }>;
  next_page_token?: string;
}

interface SearchRunsResponse {
  runs: Run[];
  next_page_token?: string;
}

// Configure axios retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error: AxiosError): boolean =>
    error.code === "ERR_NETWORK" ||
    (error.response && [502, 503, 504].includes(error.response.status)) || false,
});

const MLflowDashboard: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);
  const { toast } = useToast();

  const BASE = "http://10.1.8.78:5003/api/2.0/mlflow";

  const fetchExperiments = useCallback(async () => {
    try {
      setLoading(true);
      let allExperiments: Experiment[] = [];
      let pageToken: string | undefined = undefined;

      do {
        const resp: AxiosResponse<SearchExperimentsResponse> = await axios.post(
          `${BASE}/experiments/search`,
          {
            max_results: 100,
            page_token: pageToken,
          }
        );
        const expList = resp.data.experiments.map((exp: any) => ({
          experiment_id: exp.experiment_id,
          name: exp.name,
        }));
        allExperiments = [...allExperiments, ...expList];
        pageToken = resp.data.next_page_token;
      } while (pageToken);

      // Filter out Weather_Evaluation
      const filteredExperiments = allExperiments.filter(exp => exp.name !== "Weather_Evaluation");
      setExperiments(filteredExperiments);
      setFilteredExperiments(filteredExperiments);
      
      toast({
        title: "Experiments loaded",
        description: `Successfully loaded ${filteredExperiments.length} experiments`,
      });
    } catch (e) {
      const msg = e instanceof AxiosError
        ? `Error ${e.response?.status ?? ""}: ${e.response?.data?.error || e.message}`
        : "Unexpected error loading experiments";
      
      toast({
        title: "Error loading experiments",
        description: msg,
        variant: "destructive",
      });
      console.error("Fetch experiments error:", e);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchRuns = useCallback(async (experimentId: string) => {
    try {
      setLoading(true);
      let allRuns: Run[] = [];
      let pageToken: string | undefined = undefined;

      do {
        const resp: AxiosResponse<SearchRunsResponse> = await axios.post(
          `${BASE}/runs/search`,
          {
            experiment_ids: [experimentId],
            max_results: 50,
            order_by: ["start_time DESC"],
            page_token: pageToken,
          }
        );
        
        if (!resp.data.runs || !Array.isArray(resp.data.runs)) {
          throw new Error("Invalid runs data format from server");
        }

        const fetchedRuns = resp.data.runs.map((r: any) => ({
          info: { 
            run_id: r.info.run_id, 
            run_name: r.info.run_name,
            start_time: r.info.start_time,
            status: r.info.status
          },
          data: {
            metrics: r.data.metrics?.map((m: any) => ({
              key: m.key,
              value: m.value,
              timestamp: m.timestamp,
            })) || [],
            params: r.data.params || {},
          },
        }));
        
        allRuns = [...allRuns, ...fetchedRuns];
        pageToken = resp.data.next_page_token;
      } while (pageToken);

      setRuns(allRuns);
      
      toast({
        title: "Runs loaded",
        description: `Found ${allRuns.length} runs for this experiment`,
      });
    } catch (e) {
      const msg = e instanceof AxiosError
        ? `Error ${e.response?.status ?? ""}: ${e.response?.data?.error || e.message}`
        : "Unexpected error loading runs";
      
      toast({
        title: "Error loading runs",
        description: msg,
        variant: "destructive",
      });
      console.error("Fetch runs error:", e);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  useEffect(() => {
    const filtered = experiments.filter(exp =>
      exp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExperiments(filtered);
  }, [searchTerm, experiments]);

  const handleExperimentSelect = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    fetchRuns(experiment.experiment_id);
  };

  const handleBack = () => {
    setSelectedExperiment(null);
    setRuns([]);
  };

  if (selectedExperiment) {
    return (
      <RunDetails 
        experiment={selectedExperiment}
        runs={runs}
        loading={loading}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30 animate-glow-pulse" />
      
      {/* Header */}
      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-glow">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  AI at the Edge Lifecycle Management
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage and monitor your MLflow experiments and runs
                </p>
              </div>
            </div>
            
            <Button
              onClick={fetchExperiments}
              variant="outline"
              size="lg"
              disabled={loading}
              className="bg-card/50 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Search and Stats */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search experiments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card/50 backdrop-blur-sm border-border/50"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="flex items-center space-x-2 p-4">
                  <TrendingUp className="h-5 w-5 text-mlflow-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Experiments</p>
                    <p className="text-2xl font-bold text-foreground">{experiments.length}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="flex items-center space-x-2 p-4">
                  <Filter className="h-5 w-5 text-mlflow-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Filtered</p>
                    <p className="text-2xl font-bold text-foreground">{filteredExperiments.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Experiments Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 bg-card/50" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredExperiments.map((experiment, index) => (
                <ExperimentCard
                  key={experiment.experiment_id}
                  experiment={experiment}
                  index={index}
                  onClick={() => handleExperimentSelect(experiment)}
                />
              ))}
            </div>
          )}

          {filteredExperiments.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="p-4 bg-card/50 rounded-xl inline-block mb-4">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No experiments found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'No experiments available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLflowDashboard;