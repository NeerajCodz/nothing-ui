import * as React from 'react';
import {
  InteractiveCustomChart,
  InteractiveFlowChart,
  InteractiveMapChart,
  InteractivePieChart,
  InteractiveSankeyChart,
  InteractiveTimeseriesChart,
} from '@nothing-ui/ui';

export function PieChartDemo() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InteractivePieChart />
    </div>
  );
}

export function TimeseriesDemo() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InteractiveTimeseriesChart />
    </div>
  );
}

export function SankeyDemo() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InteractiveSankeyChart />
    </div>
  );
}

export function MapChartDemo() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InteractiveMapChart />
    </div>
  );
}

export function FlowDemo() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InteractiveFlowChart />
    </div>
  );
}

export function CustomChartDemo() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InteractiveCustomChart />
    </div>
  );
}
