"use client";

import * as React from "react";
import { Plus, Filter, Users, Calendar, DollarSign, Activity } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverviewPage() {
  const [viewState, setViewState] = React.useState<"empty" | "loading" | "preview">("preview");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspace Overview"
        description="Foundation preview validating dashboard density, feedback states, and UI primitives."
        actions={
          <div className="flex items-center gap-2">
            <div className="border-border bg-muted/40 flex rounded-md border p-1 text-xs">
              <button
                onClick={() => setViewState("preview")}
                className={`rounded-xs px-2.5 py-1 transition-colors ${
                  viewState === "preview"
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setViewState("loading")}
                className={`rounded-xs px-2.5 py-1 transition-colors ${
                  viewState === "loading"
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Skeleton
              </button>
              <button
                onClick={() => setViewState("empty")}
                className={`rounded-xs px-2.5 py-1 transition-colors ${
                  viewState === "empty"
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Empty
              </button>
            </div>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New Entry
            </Button>
          </div>
        }
      />

      {/* KPI Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {viewState === "loading" ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-20" />
                <Skeleton className="h-3 w-36" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-xs font-medium">
                  Active Customers
                </CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">--</div>
                <CardDescription className="mt-1 text-xs">
                  Awaiting backend CRM sync
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-xs font-medium">
                  Upcoming Bookings
                </CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">--</div>
                <CardDescription className="mt-1 text-xs">
                  Scheduling domain uninitialized
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-xs font-medium">
                  Invoiced Volume
                </CardTitle>
                <DollarSign className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">--</div>
                <CardDescription className="mt-1 text-xs">
                  Invoicing domain uninitialized
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-xs font-medium">
                  API Status
                </CardTitle>
                <Activity className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-warning border-warning/40 text-xs">
                    Awaiting Express API
                  </Badge>
                </div>
                <CardDescription className="mt-1 text-xs">Backend boundary ready</CardDescription>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Section: Data View / Empty State Verification */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-base font-bold">Operations Activity Queue</h2>
          <Button variant="outline" size="sm">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filter
          </Button>
        </div>

        {viewState === "loading" ? (
          <Card className="space-y-4 p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ) : viewState === "empty" ? (
          <EmptyState
            title="No activity recorded in this workspace"
            description="When team members schedule appointments, create customer records, or issue invoices, activity logs will appear here."
            action={<Button size="sm">Create First Record</Button>}
          />
        ) : (
          <Card>
            <div className="text-muted-foreground p-6 text-center text-sm">
              <p className="text-foreground font-semibold">Domain data placeholder</p>
              <p className="mx-auto mt-1 max-w-md text-xs">
                In adherence with the architecture master prompt, business CRUD features remain
                unbuilt. Use the state toggles above to inspect Skeleton loading and EmptyState
                feedback behaviors.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
