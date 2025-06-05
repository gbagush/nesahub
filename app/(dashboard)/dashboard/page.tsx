"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";
import { TrendingDown, TrendingUp, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    counts: {
      users: number;
      posts: number;
      pendingReports: number;
    };
    growth: {
      users: number;
      posts: number;
    };
    graphs: {
      users: {
        date: string;
        count: number;
      }[];
      posts: {
        date: string;
        count: number;
      }[];
    };
  }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/dashboard");
        setStats(response.data.data);
      } catch (error) {
        addToast({
          description: "Failed to fetch stats",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <h4 className="text-2xl font-semibold mb-4">Dashboard</h4>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-4 flex-shrink-0">
              {stats && (
                <>
                  <StatCard
                    title="Registered Users"
                    count={stats.counts.users}
                    growth={stats.growth.users}
                  />
                  <StatCard
                    title="Created Posts"
                    count={stats.counts.posts}
                    growth={stats.growth.posts}
                  />
                  <StatCard
                    title="Pending Reports"
                    count={stats.counts.pendingReports}
                    description="Reports awaiting moderator action"
                  />
                </>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4 flex-shrink-0">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Total User Registered</CardTitle>
                  <CardDescription>
                    Total user register each day in a week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "User register",
                        color: "var(--chart-1)",
                      },
                    }}
                    className="min-h-[250px] w-full"
                  >
                    <AreaChart
                      accessibilityLayer
                      data={stats?.graphs.users}
                      margin={{
                        top: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={0}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <Area dataKey="count" type="monotone" />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Total Users Post</CardTitle>
                  <CardDescription>
                    Total users post each day in a week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: { label: "User posts", color: "var(--chart-1)" },
                    }}
                    className="min-h-[250px] w-full"
                  >
                    <AreaChart
                      accessibilityLayer
                      data={stats?.graphs.posts}
                      margin={{
                        top: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={0}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <Area dataKey="count" type="monotone" />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const StatCard = ({
  title,
  count,
  growth,
  description,
}: {
  title: string;
  count: number;
  growth?: number;
  description?: string;
}) => {
  const isPositive = (growth ?? 0) > 0;

  return (
    <Card className="w-full h-full flex flex-col justify-between">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-semibold">{count}</CardTitle>
      </CardHeader>

      <CardFooter className="text-sm">
        {growth !== undefined && (
          <div
            className={`flex items-center gap-2 ${
              isPositive ? "text-success" : "text-danger"
            }`}
          >
            <div
              className={`p-1 rounded-full ${
                isPositive ? "bg-success-50" : "bg-danger-50"
              }`}
            >
              {isPositive ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>
            <span className="font-semibold">
              {isPositive ? "+" : "-"}
              {Math.abs(growth).toFixed(1)}%
            </span>
            <span className="text-foreground-500">than last week</span>
          </div>
        )}
        {description && (
          <span className="text-foreground-500">{description}</span>
        )}
      </CardFooter>
    </Card>
  );
};
