"use client";

import * as React from "react";
import { Clock, Shield, Users, Eye, Edit3, Share2, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ServiceItem } from "@/features/services/types";

interface ServiceCardProps {
  service: ServiceItem;
  publicBookingUrl?: string;
  onQuickPeek: (service: ServiceItem) => void;
  onEdit: (service: ServiceItem) => void;
}

export function ServiceCard({ service, publicBookingUrl, onQuickPeek, onEdit }: ServiceCardProps) {
  const [copied, setCopied] = React.useState(false);

  const totalMinutes =
    service.durationMinutes + (service.bufferBefore || 0) + (service.bufferAfter || 0);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!publicBookingUrl) return;
    try {
      await navigator.clipboard.writeText(publicBookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Card
      onClick={() => onQuickPeek(service)}
      className={`group border-border/80 from-card to-card/90 hover:border-primary/50 hover:shadow-primary/5 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b shadow-2xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        service.isActive ? "" : "opacity-65"
      }`}
    >
      {/* Luxury Gradient Accent Top Line */}
      <div className="to-primary absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 opacity-80 transition-opacity group-hover:opacity-100" />

      <CardContent className="flex h-full flex-col justify-between space-y-4 p-5">
        <div>
          {/* Card Top: Category, Live Beacon & Price */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                {service.category || "General Offering"}
              </span>

              <span
                className={`relative flex h-2 w-2 ${
                  service.isActive ? "text-emerald-500" : "text-slate-400"
                }`}
                title={service.isActive ? "Active in Catalog" : "Inactive"}
              >
                {service.isActive && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    service.isActive ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </span>
            </div>

            <div className="text-right">
              <span className="text-foreground font-mono text-xl font-black tracking-tight">
                ${service.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground ml-1 text-[11px] font-medium">/ session</span>
            </div>
          </div>

          {/* Service Name & Description */}
          <h3 className="text-foreground group-hover:text-primary mt-3 text-base font-bold transition-colors">
            {service.name}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 min-h-[34px] text-xs leading-relaxed">
            {service.description || "No public description provided for this catalog offering."}
          </p>

          {/* Timeline Protection Capsule */}
          <div className="border-border/60 bg-muted/30 backdrop-blur-2xs mt-3.5 space-y-2 rounded-xl border p-2.5">
            <div className="text-muted-foreground flex items-center justify-between text-[10px] font-semibold">
              <span className="flex items-center gap-1">
                <Clock className="text-primary h-3 w-3" />
                <span>Timeline Schedule</span>
              </span>
              <span className="text-foreground font-mono font-bold">{totalMinutes} min window</span>
            </div>

            {/* Visual Capsule Breakdown */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
              {/* Prep Buffer */}
              <div
                className={`rounded-lg border px-1 py-1 transition-colors ${
                  service.bufferBefore > 0
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    : "border-border/40 bg-muted/40 text-muted-foreground/50"
                }`}
                title={`Prep buffer: ${service.bufferBefore || 0}m`}
              >
                <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                  Prep
                </span>
                <span className="font-mono">{service.bufferBefore || 0}m</span>
              </div>

              {/* Core Session Duration */}
              <div
                className="border-primary/30 bg-primary/10 text-primary rounded-lg border px-1 py-1 font-mono shadow-2xs"
                title={`Core session duration: ${service.durationMinutes}m`}
              >
                <span className="text-primary/80 block text-[9px] font-semibold uppercase">
                  Session
                </span>
                <span>{service.durationMinutes}m</span>
              </div>

              {/* Cleanup / Transition Buffer */}
              <div
                className={`rounded-lg border px-1 py-1 transition-colors ${
                  service.bufferAfter > 0
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-border/40 bg-muted/40 text-muted-foreground/50"
                }`}
                title={`Cleanup buffer: ${service.bufferAfter || 0}m`}
              >
                <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                  Buffer
                </span>
                <span className="font-mono">{service.bufferAfter || 0}m</span>
              </div>
            </div>
          </div>

          {/* Deposit Requirement Badge (if required) */}
          {service.requireDeposit && (
            <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span>
                Deposit:{" "}
                {service.depositType === "PERCENTAGE"
                  ? `${service.depositAmount}% ($${((service.price * (service.depositAmount || 0)) / 100).toFixed(2)})`
                  : `$${Number(service.depositAmount).toFixed(2)}`}
              </span>
            </div>
          )}
        </div>

        {/* Card Footer: Assigned Specialists & Action Buttons */}
        <div className="border-border/60 flex items-center justify-between border-t pt-3">
          {/* Specialists Avatar Stack */}
          <div className="flex items-center gap-1.5">
            <Users className="text-muted-foreground h-3.5 w-3.5" />
            {service.staffMembers && service.staffMembers.length > 0 ? (
              <div className="flex items-center -space-x-1.5">
                {service.staffMembers.slice(0, 3).map((sm) => (
                  <div
                    key={sm.id}
                    title={`${sm.name} (${sm.roleTitle})`}
                    className={`ring-card flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-2xs ring-2 ${
                      sm.avatarBg || "bg-blue-600"
                    }`}
                  >
                    {sm.initials}
                  </div>
                ))}
                {service.staffMembers.length > 3 && (
                  <span className="text-muted-foreground pl-1.5 text-[10px] font-semibold">
                    +{service.staffMembers.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground/60 text-[10px] italic">Unassigned</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {publicBookingUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                title="Copy direct booking link"
                className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onQuickPeek(service)}
              className="text-muted-foreground hover:text-foreground h-7.5 px-2 text-xs"
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              Peek
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(service)}
              className="border-primary/30 text-primary hover:bg-primary/10 h-7.5 px-2 text-xs font-semibold"
            >
              <Edit3 className="mr-1 h-3 w-3" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
