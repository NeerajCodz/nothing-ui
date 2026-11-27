import * as React from 'react';
import {
  FormDemo,
  LayerCardDemo,
  LayerDialogDemo,
  MarkerDemo,
  MenubarDemo,
  NativeSelectDemo,
  NavigationMenuDemo,
  QuestionnaireDemo,
} from './forms-overlays';
import {
  AspectRatioDemo,
  CarouselDemo,
  DirectionDemo,
  GridDemo,
  MessageScrollerDemo,
  ResizablePanelsDemo,
  ScrollAreaDemo,
} from './layout-chat';
import {
  CustomChartDemo,
  FlowDemo,
  MapChartDemo,
  PieChartDemo,
  SankeyDemo,
  TimeseriesDemo,
} from './charts-advanced';
import {
  AudioRecorderDemo,
  CalendarCanvasDemo,
  CameraCaptureDemo,
  EditorDemo,
  MediaStudioDemo,
  MediaViewerDemo,
  SearchBarDemo,
  VideoRecorderDemo,
} from './media-productivity';

import formsOverlaysRaw from './forms-overlays.tsx?raw';
import layoutChatRaw from './layout-chat.tsx?raw';
import chartsAdvancedRaw from './charts-advanced.tsx?raw';
import mediaProductivityRaw from './media-productivity.tsx?raw';
import searchBarWidgetRaw from '../../../../../packages/ui/src/components/widgets/search-bar-widget.tsx?raw';
import { WIDGET_DEMO_SLUGS, WidgetSuiteDemo, getWidgetDemoSource } from '../widgets';

const FORMS_OVERLAYS_SLUGS = new Set([
  'form',
  'native-select',
  'questionnaire',
  'layer-dialog',
  'menubar',
  'navigation-menu',
  'layer-card',
  'marker',
]);

const LAYOUT_CHAT_SLUGS = new Set([
  'carousel',
  'resizable-panels',
  'scroll-area',
  'aspect-ratio',
  'grid',
  'direction',
  'message-scroller',
]);

const CHARTS_ADVANCED_SLUGS = new Set([
  'pie-chart',
  'timeseries',
  'sankey',
  'map-chart',
  'flow',
  'custom-chart',
]);

const MEDIA_PRODUCTIVITY_SLUGS = new Set([
  'audio-recorder',
  'video-recorder',
  'camera-capture',
  'media-studio',
  'media-viewer',
  'editor',
  'calendar-canvas',
  'search-bar',
]);

export const V03_COMPLETE_SLUGS = new Set<string>([
  ...FORMS_OVERLAYS_SLUGS,
  ...LAYOUT_CHAT_SLUGS,
  ...CHARTS_ADVANCED_SLUGS,
  ...MEDIA_PRODUCTIVITY_SLUGS,
  ...WIDGET_DEMO_SLUGS,
]);

export function getCompleteDemoSource(slug: string): { code: string; label: string } {
  const widgetSource = getWidgetDemoSource(slug);
  if (widgetSource) {
    return widgetSource;
  }
  if (slug === 'search-bar') {
    return {
      code: searchBarWidgetRaw.trim(),
      label: 'packages/ui/src/components/widgets/search-bar-widget.tsx',
    };
  }
  if (FORMS_OVERLAYS_SLUGS.has(slug)) {
    return { code: formsOverlaysRaw.trim(), label: 'apps/ui/src/demos/complete/forms-overlays.tsx' };
  }
  if (LAYOUT_CHAT_SLUGS.has(slug)) {
    return { code: layoutChatRaw.trim(), label: 'apps/ui/src/demos/complete/layout-chat.tsx' };
  }
  if (CHARTS_ADVANCED_SLUGS.has(slug)) {
    return { code: chartsAdvancedRaw.trim(), label: 'apps/ui/src/demos/complete/charts-advanced.tsx' };
  }
  return { code: mediaProductivityRaw.trim(), label: 'apps/ui/src/demos/complete/media-productivity.tsx' };
}

export function V03CompleteDemo({ slug }: { slug: string }) {
  if (WIDGET_DEMO_SLUGS.has(slug)) {
    return <WidgetSuiteDemo slug={slug} />;
  }
  switch (slug) {
    case 'form':
      return <FormDemo />;
    case 'native-select':
      return <NativeSelectDemo />;
    case 'questionnaire':
      return <QuestionnaireDemo />;
    case 'layer-dialog':
      return <LayerDialogDemo />;
    case 'menubar':
      return <MenubarDemo />;
    case 'navigation-menu':
      return <NavigationMenuDemo />;
    case 'layer-card':
      return <LayerCardDemo />;
    case 'marker':
      return <MarkerDemo />;
    case 'carousel':
      return <CarouselDemo />;
    case 'resizable-panels':
      return <ResizablePanelsDemo />;
    case 'scroll-area':
      return <ScrollAreaDemo />;
    case 'aspect-ratio':
      return <AspectRatioDemo />;
    case 'grid':
      return <GridDemo />;
    case 'direction':
      return <DirectionDemo />;
    case 'message-scroller':
      return <MessageScrollerDemo />;
    case 'pie-chart':
      return <PieChartDemo />;
    case 'timeseries':
      return <TimeseriesDemo />;
    case 'sankey':
      return <SankeyDemo />;
    case 'map-chart':
      return <MapChartDemo />;
    case 'flow':
      return <FlowDemo />;
    case 'custom-chart':
      return <CustomChartDemo />;
    case 'audio-recorder':
      return <AudioRecorderDemo />;
    case 'video-recorder':
      return <VideoRecorderDemo />;
    case 'camera-capture':
      return <CameraCaptureDemo />;
    case 'media-studio':
      return <MediaStudioDemo />;
    case 'media-viewer':
      return <MediaViewerDemo />;
    case 'editor':
      return <EditorDemo />;
    case 'calendar-canvas':
      return <CalendarCanvasDemo />;
    case 'search-bar':
      return <SearchBarDemo />;
    default:
      return null;
  }
}
