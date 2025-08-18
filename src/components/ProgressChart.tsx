import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useLanguage } from "@/hooks/useLanguage";

interface ProgressChartProps {
  period: "7days" | "30days";
}

const ProgressChart = ({ period }: ProgressChartProps) => {
  const { t } = useLanguage();
  
  // Mock data for the chart
  const mockData = period === "7days" 
    ? [
        { date: "Lun", ascolto: 65, lettura: 70, scrittura: 58, produzione_orale: 62 },
        { date: "Mar", ascolto: 68, lettura: 72, scrittura: 62, produzione_orale: 65 },
        { date: "Mer", ascolto: 72, lettura: 75, scrittura: 65, produzione_orale: 68 },
        { date: "Gio", ascolto: 75, lettura: 78, scrittura: 68, produzione_orale: 72 },
        { date: "Ven", ascolto: 78, lettura: 80, scrittura: 72, produzione_orale: 75 },
        { date: "Sab", ascolto: 80, lettura: 82, scrittura: 75, produzione_orale: 78 },
        { date: "Dom", ascolto: 82, lettura: 85, scrittura: 78, produzione_orale: 80 },
      ]
    : [
        { date: "Sett 1", ascolto: 60, lettura: 65, scrittura: 55, produzione_orale: 58 },
        { date: "Sett 2", ascolto: 65, lettura: 70, scrittura: 60, produzione_orale: 62 },
        { date: "Sett 3", ascolto: 70, lettura: 75, scrittura: 65, produzione_orale: 68 },
        { date: "Sett 4", ascolto: 78, lettura: 82, scrittura: 72, produzione_orale: 75 },
      ];

  // Check if we have actual data (in this case, we'll show placeholder if no real data)
  const hasData = true; // For demo purposes, set to true

  if (!hasData) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            Progresso per Competenza ({period === "7days" ? "Ultimi 7 giorni" : "Ultimi 30 giorni"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Dati non disponibili</p>
              <p className="text-sm">Completa alcune simulazioni per vedere i tuoi progressi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="w-5 h-5 text-primary" />
          Progresso per Competenza ({period === "7days" ? "Ultimi 7 giorni" : "Ultimi 30 giorni"})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line 
                type="monotone" 
                dataKey="ascolto" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name={t("ascolto")}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="lettura" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                name={t("lettura")}
                dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="scrittura" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name={t("scrittura")}
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="produzione_orale" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                name={t("produzione_orale")}
                dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;