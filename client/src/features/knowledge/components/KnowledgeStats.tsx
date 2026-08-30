import * as React from "react"
import { Card, CardContent } from "@/components/ui"
import { FileText, CheckCircle2, RefreshCw, Layers } from "lucide-react"
import type { KnowledgeStatsData } from "../knowledge.types"
import { cn } from "@/lib/utils"

export interface KnowledgeStatsProps {
  stats?: KnowledgeStatsData
  className?: string
}

export const KnowledgeStats: React.FC<KnowledgeStatsProps> = ({
  stats = {
    totalDocuments: 0,
    readyCount: 0,
    processingCount: 0,
    failedCount: 0,
    totalChunks: 0,
  },
  className,
}) => {
  const cards = [
    {
      label: "Total Materials",
      value: stats.totalDocuments,
      sublabel: "Personal resources",
      icon: FileText,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Ready for AI",
      value: stats.readyCount,
      sublabel: "Indexed & searchable",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "In Processing",
      value: stats.processingCount,
      sublabel: "Extracting & chunking",
      icon: RefreshCw,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Indexed Chunks",
      value: stats.totalChunks,
      sublabel: "Vector embeddings",
      icon: Layers,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4", className)}>
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="p-4 transition-all">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground truncate">{card.label}</p>
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                    card.bgColor,
                    card.iconColor
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {card.value}
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                  {card.sublabel}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default KnowledgeStats
