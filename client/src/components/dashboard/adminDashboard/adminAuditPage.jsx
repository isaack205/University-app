// Imports
import React, { useEffect, useState } from "react";
import { auditService } from "@/services/auditApi";
import dayjs from "dayjs";
import {
  ShieldAlertIcon,
  ShieldCheckIcon,
  SearchIcon,
  FilterIcon,
  RefreshCwIcon,
  InfoIcon,
  AlertTriangleIcon,
  LaptopIcon,
  GlobeIcon,
  UserIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ZapIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    criticalToday: 0,
    warningsToday: 0,
    systemStatus: "HEALTHY"
  });
  const [recentThreats, setRecentThreats] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const [category, setCategory] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Inspector Dialog state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await auditService.getAuditStats();
      if (data?.stats) setStats(data.stats);
      if (data?.recentThreats) setRecentThreats(data.recentThreats);
    } catch (err) {
      console.error("Failed to load audit stats:", err);
    }
  };

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await auditService.getAuditLogs({
        category,
        severity,
        search,
        page,
        limit: 15
      });
      setLogs(data.logs || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      toast.error("Failed to load system audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLogs(1);

    // Auto-refresh every 30s
    const interval = setInterval(() => {
      fetchStats();
      fetchLogs(pagination.page);
    }, 30000);
    return () => clearInterval(interval);
  }, [category, severity, search]);

  const handleInspectLog = (log) => {
    setSelectedLog(log);
    setIsInspectorOpen(true);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
            <AlertTriangleIcon size={12} className="animate-pulse" /> Critical
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <ZapIcon size={12} /> Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <InfoIcon size={12} /> Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              <ShieldAlertIcon size={22} />
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Security Audit Terminal 🛡️
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Real-time user activity logs, IP footprints, role elevation audit trails, and anomaly monitoring.
          </p>
        </div>

        <Button
          onClick={() => {
            fetchStats();
            fetchLogs(1);
            toast.success("Audit log refreshed");
          }}
          className="self-start md:self-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-2 shadow-md transition-all active:scale-95"
        >
          <RefreshCwIcon size={14} className={loading ? "animate-spin" : ""} />
          Refresh Terminal
        </Button>
      </div>

      {/* Security Threat Radar Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: System Status */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">
              System Radar Status
            </span>
            {stats.criticalToday > 0 ? (
              <ShieldAlertIcon size={18} className="text-red-500 animate-pulse" />
            ) : (
              <ShieldCheckIcon size={18} className="text-emerald-500" />
            )}
          </div>
          <div className="mt-3">
            <span className={`text-lg md:text-xl font-black ${stats.criticalToday > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {stats.criticalToday > 0 ? '⚡ ATTENTION REQUIRED' : '🛡️ SYSTEM SECURE'}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              {stats.criticalToday > 0 ? `${stats.criticalToday} critical anomalies detected today` : 'No security breaches detected'}
            </p>
          </div>
        </div>

        {/* Card 2: Today's Total Events */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">
              Total Logged Events
            </span>
            <ClockIcon size={18} className="text-purple-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-black text-foreground">
              {stats.totalToday}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Recorded today</p>
          </div>
        </div>

        {/* Card 3: Warnings Today */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">
              Security Warnings
            </span>
            <ZapIcon size={18} className="text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-black text-foreground">
              {stats.warningsToday}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Elevations & overrides</p>
          </div>
        </div>

        {/* Card 4: Critical Today */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">
              Critical Alerts
            </span>
            <AlertTriangleIcon size={18} className="text-red-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-black text-foreground">
              {stats.criticalToday}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">High severity flags</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, email, action, or IP address..."
            className="pl-9 text-xs md:text-sm font-medium bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-32 text-xs font-bold bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="SECURITY">Security</SelectItem>
              <SelectItem value="AUTH">Auth</SelectItem>
              <SelectItem value="ACADEMICS">Academics</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-32 text-xs font-bold bg-background">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Severities</SelectItem>
              <SelectItem value="INFO">Info 🔵</SelectItem>
              <SelectItem value="WARNING">Warning 🟡</SelectItem>
              <SelectItem value="CRITICAL">Critical 🔴</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audit Log Stream View */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-black uppercase text-muted-foreground tracking-wider">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-medium">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">{getSeverityBadge(log.severity)}</td>
                    <td className="py-3 px-4 font-bold text-foreground">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold block text-foreground">{log.userName}</span>
                        <span className="text-[10px] text-muted-foreground">{log.userEmail || log.userRole}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-muted-foreground uppercase text-[10px]">
                      {log.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {log.ipAddress}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {dayjs(log.createdAt).format("MMM D, YYYY • HH:mm:ss")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleInspectLog(log)}
                        className="h-8 text-xs font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                      >
                        <EyeIcon size={14} className="mr-1" /> Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium">
                    No system audit logs found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-border">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log._id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  {getSeverityBadge(log.severity)}
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {dayjs(log.createdAt).format("MMM D • HH:mm")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{log.action}</h4>
                    <p className="text-xs text-muted-foreground font-medium">
                      {log.userName} ({log.userRole})
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleInspectLog(log)}
                    className="h-8 text-xs font-bold shrink-0"
                  >
                    Inspect
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <span className="flex items-center gap-1 font-mono">
                    <GlobeIcon size={12} /> {log.ipAddress}
                  </span>
                  <span className="uppercase font-bold text-[10px] bg-muted px-1.5 py-0.5 rounded">
                    {log.category}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground font-medium text-xs">
              No audit logs found.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <span className="text-xs text-muted-foreground font-medium">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} total logs)
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="h-8 text-xs font-bold"
              >
                <ChevronLeftIcon size={14} /> Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="h-8 text-xs font-bold"
              >
                Next <ChevronRightIcon size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Log Inspector Dialog */}
      <Dialog open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
        <DialogContent className="sm:max-w-[540px] p-6 bg-card text-card-foreground border-border shadow-2xl rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedLog && getSeverityBadge(selectedLog.severity)}
              <DialogTitle className="text-lg font-black text-foreground">
                Audit Log Detail Inspector 🔍
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Detailed event payload, device metadata, and network footprint.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 text-xs mt-2">
              <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Action Event</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{selectedLog.action}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">User</span>
                  <span className="font-bold text-foreground">{selectedLog.userName} ({selectedLog.userEmail || selectedLog.userRole})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground uppercase text-[10px]">Timestamp</span>
                  <span className="text-muted-foreground">{dayjs(selectedLog.createdAt).format("YYYY-MM-DD HH:mm:ss")}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <GlobeIcon size={14} className="text-blue-500" />
                  Network & Device Footprint
                </div>
                <div className="text-[11px] font-mono space-y-1 text-muted-foreground pl-5">
                  <p>IP Address: <strong className="text-foreground">{selectedLog.ipAddress}</strong></p>
                  <p className="break-all">User Agent: {selectedLog.userAgent}</p>
                </div>
              </div>

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div className="space-y-1">
                  <span className="font-bold text-xs text-foreground">Event Payload Details:</span>
                  <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-800">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
