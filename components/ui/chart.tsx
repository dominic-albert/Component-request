"use client"

import * as React from "react"
import { LabelList } from "recharts"

import { cn } from "@/lib/utils"

const ChartContext = React.createContext<
  | {
      config: Record<string, { color?: string; label?: string }>
    }
  | undefined
>(undefined)

function ChartContainer({
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: Record<string, { color?: string; label?: string }>
}) {
  const id = React.useId()
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        className={cn(
          "flex aspect-video justify-center text-foreground [&_.recharts-tooltip-wrapper]:outline-none [&_.recharts-cartesian-grid]:stroke-border [&_.recharts-bar]:fill-[var(--color-graph)] [&_.recharts-area]:fill-[var(--color-graph)] [&_.recharts-line]:stroke-[var(--color-graph)] [&_.recharts-dot]:fill-[var(--color-graph)] [&_.recharts-active-dot]:stroke-[var(--color-graph)] [&_.recharts-tooltip_.recharts-tooltip-item]:text-foreground [&_.recharts-tooltip-content]:fill-background [&_.recharts-tooltip-label]:font-bold [&_.recharts-tooltip-content]:stroke-border [&_.recharts-tooltip-content]:text-sm [&_.recharts-tooltip-cursor]:fill-muted [&_.recharts-tooltip-cursor]:fill-opacity-20 [&_.recharts-polar-grid_line]:stroke-border [&_.recharts-radial-bar-background]:fill-muted [&_.recharts-sector]:fill-[var(--color-graph)] [&_.recharts-surface]:fill-[var(--color-graph)] [&_.recharts-legend-item_text]:text-muted-foreground [&_.recharts-active-label]:fill-foreground [&_.recharts-legend-item]:gap-1 [&_.recharts-tooltip-item]:gap-1 [&_.recharts-reference-line-line]:stroke-border [&_.recharts-x-axis_line]:stroke-border [&_.recharts-y-axis_line]:stroke-border [&_.recharts-x-axis_tick]:fill-foreground [&_.recharts-y-axis_tick]:fill-foreground [&_.recharts-y-axis_tick_line]:stroke-border [&_[data-value='']]:opacity-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof ChartTooltipContent>>(
  ({ active, payload, className, ...props }, ref) => {
    const { config } = React.useContext(ChartContext)!

    if (active && payload && payload.length) {
      return (
        <div ref={ref} className={cn("rounded-lg border bg-background p-2 text-sm shadow-md", className)} {...props}>
          {payload.map((item: any) => {
            const key = item.dataKey || item.name
            const content = config[key]

            return (
              <div key={item.dataKey} className="flex items-center justify-between gap-2">
                {content?.label ? <span className="text-muted-foreground">{content.label}:</span> : null}
                <span
                  className="font-medium"
                  style={{
                    color: content?.color || item.color,
                  }}
                >
                  {item.value}
                </span>
              </div>
            )
          })}
        </div>
      )
    }

    return null
  },
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = ({
  className,
  viewBox,
  ...props
}: React.ComponentProps<typeof ChartTooltip> & {
  viewBox?: { x: number; y: number; width: number; height: number }
}) => {
  return <ChartTooltip className={cn("z-50", className)} coordinate={viewBox} {...props} />
}

const ChartLegend = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props} />
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChartLegend> & {
    payload?: { value: string; color: string }[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)!

  return (
    <ChartLegend ref={ref} className={cn("gap-2", className)} {...props}>
      {payload?.map((item) => {
        const key = item.value
        if (!config[key]) {
          return null
        }

        return (
          <div key={key} className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3">
            <svg
              viewBox="0 0 24 24"
              fill={config[key]?.color || item.color}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
            {config[key]?.label}
          </div>
        )
      })}
    </ChartLegend>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof LabelList> & {
    config?: Record<string, { color?: string }>
  }
>(({ className, config, ...props }, ref) => {
  const { config: contextConfig } = React.useContext(ChartContext)!
  const chartConfig = config || contextConfig

  return (
    <LabelList
      ref={ref}
      className={cn("fill-foreground", className)}
      content={({ value, index, ...props }) => {
        const key = props.dataKey as string
        const content = chartConfig[key]

        return (
          <text
            x={props.x}
            y={props.y}
            className={cn("fill-foreground", className)}
            fill={content?.color || "currentColor"}
            textAnchor={props.textAnchor}
            dominantBaseline={props.dominantBaseline}
          >
            {value}
          </text>
        )
      }}
      {...props}
    />
  )
})
ChartLabel.displayName = "ChartLabel"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartLabel }
