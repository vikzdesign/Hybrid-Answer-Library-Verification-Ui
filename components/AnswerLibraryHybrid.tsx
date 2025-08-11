import React, { useMemo, useState, useEffect } from "react";
import { Search, Plus, Upload, Download, Tag, ShieldCheck, Edit3, Save, X, ArrowUpDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

// --- Sample data ------------------------------------------------------------

type Confidence = "High" | "Medium" | "Low" | "Unanswered";
type Status = "Verified" | "Needs Review" | "Unverified" | "Unanswered";

type QA = {
  id: string;
  agent: string;
  question: string;
  answer: string;
  confidence: Confidence;
  status: Status;
  tags: string[];
  references: number;
  lastUpdated: string; // ISO date
  assignee?: string;
};

const seed: QA[] = [
  {
    id: "1",
    agent: "Demand Gen Agent",
    question: "Does your solution integrate with existing CRM systems?",
    answer:
      "Yes. Docket integrates natively with Salesforce and HubSpot. For other CRMs, we support REST APIs and Zapier-based workflows.",
    confidence: "High",
    status: "Verified",
    tags: ["integration", "crm"],
    references: 3,
    lastUpdated: "2025-08-01",
    assignee: "Clay Wiese",
  },
  {
    id: "2",
    agent: "Demand Gen Agent",
    question: "What are the key features of your product?",
    answer:
      "Docket is a virtual sales engineer designed for enterprise SaaS. It helps AEs draft technical answers, assemble RFP responses, and keep sources linked for auditability.",
    confidence: "Medium",
    status: "Needs Review",
    tags: ["features", "overview"],
    references: 5,
    lastUpdated: "2025-08-06",
    assignee: "Anoop T.",
  },
  {
    id: "3",
    agent: "Demand Gen Agent",
    question: "Please describe your customer support options and response times.",
    answer:
      "Support is available 24/7 via chat and email. P1 responses under 1 hour on average; standard tickets within 1 business day.",
    confidence: "Medium",
    status: "Verified",
    tags: ["support"],
    references: 2,
    lastUpdated: "2025-08-07",
  },
  {
    id: "4",
    agent: "Demand Gen Agent",
    question: "Are you compliant with GDPR and other relevant regulations?",
    answer:
      "Yes. Docket adheres to GDPR and SOC 2 Type II. Data residency options are available for EU customers.",
    confidence: "Low",
    status: "Unverified",
    tags: ["security", "compliance"],
    references: 4,
    lastUpdated: "2025-07-20",
  },
  {
    id: "5",
    agent: "Demand Gen Agent",
    question: "How do you ensure data security and privacy for your clients?",
    answer:
      "We employ end‑to‑end encryption, regular security audits, and multi‑factor authentication to safeguard data.",
    confidence: "High",
    status: "Verified",
    tags: ["security"],
    references: 6,
    lastUpdated: "2025-07-30",
  },
  {
    id: "6",
    agent: "Demand Gen Agent",
    question: "Can you provide references from similar clients?",
    answer: "Yes. Notable references include Pathify and Whatfix (with permission).",
    confidence: "High",
    status: "Verified",
    tags: ["references"],
    references: 3,
    lastUpdated: "2025-08-09",
  },
  {
    id: "7",
    agent: "Demand Gen Agent",
    question: "What is your pricing model?",
    answer:
      "Our platform includes 20 seats for $36,000 USD annually. Additional seats are available; usage-based add-ons for overage and premium features.",
    confidence: "Medium",
    status: "Needs Review",
    tags: ["pricing"],
    references: 1,
    lastUpdated: "2025-08-05",
  },
  {
    id: "8",
    agent: "Demand Gen Agent",
    question: "Do you offer any training programs for new users?",
    answer:
      "Yes. We provide live onboarding, role‑based enablement paths, and an on-demand academy.",
    confidence: "High",
    status: "Verified",
    tags: ["training"],
    references: 2,
    lastUpdated: "2025-08-02",
  },
  {
    id: "9",
    agent: "Demand Gen Agent",
    question: "Describe your product's scalability options.",
    answer:
      "The system scales to 10,000 users without performance loss and supports multi‑tenant architectures.",
    confidence: "High",
    status: "Verified",
    tags: ["scalability"],
    references: 2,
    lastUpdated: "2025-07-28",
  },
  {
    id: "10",
    agent: "Marketing Agent",
    question: "How does Docket help a small, scaling team grow revenue?",
    answer:
      "Each rep can reclaim up to six hours a week by automating research and drafting. Teams have seen up to a 12% lift in win rates.",
    confidence: "Medium",
    status: "Verified",
    tags: ["value", "roi"],
    references: 3,
    lastUpdated: "2025-08-03",
  },
  {
    id: "11",
    agent: "Marketing Agent",
    question: "What are the key features of your product?",
    answer:
      "Real‑time collaboration, customizable dashboards, answer traceability, and approvals.",
    confidence: "High",
    status: "Verified",
    tags: ["features"],
    references: 2,
    lastUpdated: "2025-08-01",
  },
  {
    id: "12",
    agent: "Marketing Agent",
    question: "Please describe your customer support options and response times.",
    answer: "24/7 chat & email support; P1 < 1 hour; typical SLA 1 business day.",
    confidence: "Medium",
    status: "Verified",
    tags: ["support"],
    references: 2,
    lastUpdated: "2025-08-07",
  },
];

const CONF_OPTIONS: Array<Confidence | "All"> = [
  "All",
  "High",
  "Medium",
  "Low",
  "Unanswered",
];

const STATUS_OPTIONS: Array<Status | "All"> = [
  "All",
  "Verified",
  "Needs Review",
  "Unverified",
  "Unanswered",
];

const confidenceBadge = (c: Confidence) => {
  const tone =
    c === "High"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : c === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : c === "Low"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`text-xs border ${tone} px-2 py-1 rounded-full`}>{c}</span>
  );
};

const statusBadge = (s: Status) => {
  const tone =
    s === "Verified"
      ? "bg-emerald-100 text-emerald-800"
      : s === "Needs Review"
      ? "bg-amber-100 text-amber-800"
      : s === "Unverified"
      ? "bg-slate-200 text-slate-800"
      : "bg-slate-100 text-slate-700";
  return (
    <Badge className={`rounded-full px-2 py-1 ${tone}`} variant="secondary">
      {s}
    </Badge>
  );
};

function useFilteredData(data: QA[]) {
  const [search, setSearch] = useState("");
  const [agent, setAgent] = useState<string>("All agents");
  const [conf, setConf] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [tag, setTag] = useState<string>("All");

  const tags = useMemo(
    () => Array.from(new Set(data.flatMap((d) => d.tags))).sort(),
    [data]
  );
  const agents = useMemo(
    () => Array.from(new Set(data.map((d) => d.agent))).sort(),
    [data]
  );

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const matchesSearch = `${d.question} ${d.answer}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesAgent = agent === "All agents" || d.agent === agent;
      const matchesConf = conf === "All" || d.confidence === conf;
      const matchesStatus = status === "All" || d.status === status;
      const matchesTag = tag === "All" || d.tags.includes(tag);
      return (
        matchesSearch &&
        matchesAgent &&
        matchesConf &&
        matchesStatus &&
        matchesTag
      );
    });
  }, [data, search, agent, conf, status, tag]);

  return {
    filtered,
    search,
    setSearch,
    agent,
    setAgent,
    conf,
    setConf,
    status,
    setStatus,
    tag,
    setTag,
    tags,
    agents,
  };
}

export default function AnswerLibraryHybrid() {
  const [rows, setRows] = useState<QA[]>(seed);
  const {
    filtered,
    search,
    setSearch,
    agent,
    setAgent,
    conf,
    setConf,
    status,
    setStatus,
    tag,
    setTag,
    tags,
    agents,
  } = useFilteredData(rows);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<QA | null>(null);
  const [view, setView] = useState<"table" | "continuous">("table");
  const [sortBy, setSortBy] = useState<keyof QA>("lastUpdated");
  const [sortAsc, setSortAsc] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  // --- DEV sanity tests (non-blocking) -------------------------------------
  useEffect(() => {
    try {
      console.assert(seed.length === 12, "Seed count expected to be 12");
      console.assert(CONF_OPTIONS.includes("All"), "Conf options missing 'All'");
      console.assert(STATUS_OPTIONS.includes("Verified"), "Status options missing 'Verified'");
      const securityTagged = seed.filter((d) => d.tags.includes("security"));
      console.assert(securityTagged.length > 0, "Expect at least one security-tagged row");
      const sortedDates = [...seed].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
      console.assert(sortedDates[0].lastUpdated >= sortedDates[1].lastUpdated, "Dates should sort desc by default in test");
      const root = document.getElementById("answer-library-root");
      console.assert(root && root.className.includes("bg-white"), "Root should have bg-white");
      const filters = document.getElementById("filters-row");
      console.assert(filters && !filters.className.includes("overflow-x-auto"), "Filters should not scroll horizontally");
      console.assert(document.getElementById("filters-search-row"), "Search row should exist");
      console.assert(document.getElementById("filters-controls-row"), "Controls row should exist");
    } catch (e) {
      // keep UI safe
    }
  }, []);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortBy === "lastUpdated")
        return (
          ((aVal as string).localeCompare(bVal as string)) * (sortAsc ? 1 : -1)
        );
      if (typeof aVal === "string" && typeof bVal === "string")
        return aVal.localeCompare(bVal) * (sortAsc ? 1 : -1);
      return 0;
    });
    return copy;
  }, [filtered, sortBy, sortAsc]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const el = document.getElementById("searchbox");
        (el as HTMLInputElement)?.focus();
      }
      if (e.key.toLowerCase() === "v" && selected.size > 0) {
        e.preventDefault();
        bulkVerify();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const toggleSelectAll = (checked: boolean) => {
    setSelected(new Set(checked ? sorted.map((r) => r.id) : []));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const openDetail = (qa: QA) => {
    setActive(qa);
    setOpen(true);
  };

  const saveDraft = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              answer: draft,
              lastUpdated: new Date().toISOString().slice(0, 10),
              status: "Needs Review",
            }
          : r
      )
    );
    setEditingId(null);
  };

  const bulkVerify = () => {
    setRows((prev) =>
      prev.map((r) =>
        selected.has(r.id)
          ? {
              ...r,
              status: "Verified",
              confidence: r.confidence === "Unanswered" ? "Low" : r.confidence,
            }
          : r
      )
    );
    setSelected(new Set());
  };

  const quickActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Upload className="h-4 w-4 mr-1" />Import
      </Button>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-1" />Export
      </Button>
      <Button size="sm" className="bg-black text-white hover:bg-black/90">
        <Plus className="h-4 w-4 mr-1" />Add
      </Button>
    </div>
  );

  const filterBar = (
    <div id="filters-row" className="space-y-3">
      {/* Row 1: Search only */}
      <div id="filters-search-row" className="flex items-center gap-2">
        <Search className="h-4 w-4 text-slate-500" />
        <Input
          id="searchbox"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions or answers"
          className="w-full"
        />
      </div>

      {/* Row 2: Controls */}
      <div id="filters-controls-row" className="flex items-center gap-3 flex-wrap">
        {/* Agent */}
        <div className="inline-flex items-center gap-2">
          <span className="text-xs text-slate-500">Agent</span>
          <Select value={agent} onValueChange={setAgent}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All agents">All agents</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Confidence */}
        <div className="inline-flex items-center gap-2">
          <span className="text-xs text-slate-500">Confidence</span>
          <Select value={conf} onValueChange={setConf}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              {(CONF_OPTIONS as string[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All confidence" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="inline-flex items-center gap-2">
          <span className="text-xs text-slate-500">Status</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {(STATUS_OPTIONS as string[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "All" ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tag */}
        <div className="inline-flex items-center gap-2">
          <span className="text-xs text-slate-500">Tag</span>
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All tags</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <div id="answer-library-root" className="w-full min-h-screen bg-white">
      <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Answer Library</h1>
          <p className="text-sm text-slate-600">
            Hybrid workflow for verification: fast table + deep-reading detail.
          </p>
        </div>
        {quickActions}
      </div>

      <Card className="mb-3">
        <CardContent className="py-4">
          {filterBar}
        </CardContent>
      </Card>

      {selected.size > 0 && (
        <div className="sticky top-2 z-40 bg-white/90 backdrop-blur border rounded-xl p-3 mb-3 shadow-sm flex items-center justify-between">
          <div className="text-sm">{selected.size} selected</div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={bulkVerify}>
              <ShieldCheck className="h-4 w-4 mr-1" />Verify
            </Button>
            <Button size="sm" variant="outline">
              <Tag className="h-4 w-4 mr-1" />Tag
            </Button>
            <Button size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-1" />Delete
            </Button>
          </div>
        </div>
      )}

      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="table">Table view</TabsTrigger>
          <TabsTrigger value="continuous">Card View</TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="space-y-3">
          <Card>
            <CardHeader className="py-3"></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selected.size === sorted.length && sorted.length > 0}
                          onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                        />
                      </TableHead>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead className="min-w-[260px]">
                        <button
                          className="inline-flex items-center gap-1"
                          onClick={() => {
                            setSortBy("question");
                            setSortAsc(sortBy === "question" ? !sortAsc : true);
                          }}
                        >
                          Question <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[380px]">Answer</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Refs</TableHead>
                      <TableHead>
                        <button
                          className="inline-flex items-center gap-1"
                          onClick={() => {
                            setSortBy("lastUpdated");
                            setSortAsc(
                              sortBy === "lastUpdated" ? !sortAsc : false
                            );
                          }}
                        >
                          Updated <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((qa) => (
                      <TableRow
                        key={qa.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={(e) => {
                          const isControl = (e.target as HTMLElement).closest(
                            "input,button,svg,span[data-stop]"
                          );
                          if (!isControl) openDetail(qa);
                        }}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selected.has(qa.id)}
                            onCheckedChange={() => toggleSelect(qa.id)}
                          />
                        </TableCell>
                        <TableCell>{qa.id}</TableCell>
                        <TableCell className="font-medium">{qa.question}</TableCell>
                        <TableCell>
                          {editingId === qa.id ? (
                            <div
                              className="space-y-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                className="min-h-[100px]"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => saveDraft(qa.id)}>
                                  <Save className="h-4 w-4 mr-1" />Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingId(null)}
                                >
                                  <X className="h-4 w-4 mr-1" />Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-slate-700">
                                {qa.answer.length > 160
                                  ? qa.answer.slice(0, 160) + "…"
                                  : qa.answer}
                              </p>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(qa.id);
                                  setDraft(qa.answer);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{confidenceBadge(qa.confidence)}</TableCell>
                        <TableCell>{statusBadge(qa.status)}</TableCell>
                        <TableCell className="max-w-[160px]">
                          <div className="flex flex-wrap gap-1">
                            {qa.tags.map((t) => (
                              <span
                                key={t}
                                className="text-xs bg-slate-100 px-2 py-0.5 rounded-full"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{qa.references}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {qa.lastUpdated}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card View */}
        <TabsContent value="continuous" className="space-y-3">
          {sorted.map((qa) => (
            <Card
              key={qa.id}
              className="hover:shadow-sm transition cursor-pointer"
              onClick={() => openDetail(qa)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{qa.question}</CardTitle>
                  <div className="flex items-center gap-2">
                    {confidenceBadge(qa.confidence)}
                    {statusBadge(qa.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-700 mb-3">{qa.answer}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {qa.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-slate-100 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">
                    Refs: {qa.references} · Updated {qa.lastUpdated}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[540px] sm:w-[600px] overflow-y-auto">
          {active && (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle className="text-xl">{active.question}</SheetTitle>
                <SheetDescription>Agent: {active.agent}</SheetDescription>
              </SheetHeader>

              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={active.answer}
                  onChange={(e) => setActive({ ...active, answer: e.target.value })}
                  className="min-h-[160px]"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!active) return;
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === active.id
                            ? {
                                ...active,
                                lastUpdated: new Date()
                                  .toISOString()
                                  .slice(0, 10),
                                status: "Needs Review",
                              }
                            : r
                        )
                      );
                    }}
                  >
                    <Save className="h-4 w-4 mr-1" />Save draft
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
                    <X className="h-4 w-4 mr-1" />Close
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Confidence</Label>
                  <Select
                    value={active.confidence}
                    onValueChange={(v) =>
                      setActive({ ...active!, confidence: v as Confidence })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Unanswered">Unanswered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={active.status}
                    onValueChange={(v) =>
                      setActive({ ...active!, status: v as Status })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Verified">Verified</SelectItem>
                      <SelectItem value="Needs Review">Needs Review</SelectItem>
                      <SelectItem value="Unverified">Unverified</SelectItem>
                      <SelectItem value="Unanswered">Unanswered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {active.tags.map((t, i) => (
                    <Badge key={t + i} variant="secondary" className="rounded-full">
                      {t}
                    </Badge>
                  ))}
                  <Button size="sm" variant="outline">
                    <Tag className="h-4 w-4 mr-1" />Add tag
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Sources & Traceability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                  <div>• Linked sources: {active.references}</div>
                  <div>• Version history retained on save. (Mock)</div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={active.status === "Verified"}
                    onCheckedChange={(v) =>
                      setActive({ ...active!, status: v ? "Verified" : "Unverified" })
                    }
                  />
                  <span className="text-sm">Mark as Verified</span>
                </div>
                <Button
                  onClick={() => {
                    if (!active) return;
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === active.id
                          ? { ...active, lastUpdated: new Date().toISOString().slice(0, 10) }
                          : r
                      )
                    );
                    setOpen(false);
                  }}
                  className="bg-black text-white hover:bg-black/90"
                >
                  <ShieldCheck className="h-4 w-4 mr-1" />Publish
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <footer className="text-xs text-slate-500 mt-6">
        Tips: ⌘/Ctrl+F to focus search · V to verify selected. This is a static prototype; wire to your data/API.
      </footer>
      </div>
    </div>
  );
}
