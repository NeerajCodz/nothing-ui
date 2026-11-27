import * as React from 'react';
import {
  AspectRatioDemo,
  CarouselDemo,
  DirectionDemo,
  FormDemo,
  GridDemo,
  LayerCardDemo,
  LayerDialogDemo,
  MarkerDemo,
  MenubarDemo,
  MessageScrollerDemo,
  NativeSelectDemo,
  NavigationMenuDemo,
  QuestionnaireDemo,
  ResizablePanelsDemo,
  ScrollAreaDemo,
} from './v04-forms-overlays-layout';
import {
  AudioRecorderDemo,
  CalendarCanvasDemo,
  CameraCaptureDemo,
  CustomChartDemo,
  EditorDemo,
  FlowDemo,
  MapChartDemo,
  MediaStudioDemo,
  MediaViewerDemo,
  PieChartDemo,
  SankeyDemo,
  TimeseriesDemo,
  VideoRecorderDemo,
} from './v04-charts-media-productivity';

export const V04_FORMS_OVERLAYS_LAYOUT_SLUGS: ReadonlySet<string> = new Set([
  'form',
  'native-select',
  'questionnaire',
  'layer-dialog',
  'menubar',
  'navigation-menu',
  'layer-card',
  'marker',
  'carousel',
  'resizable-panels',
  'scroll-area',
  'aspect-ratio',
  'grid',
  'direction',
  'message-scroller',
]);

export const V04_CHARTS_MEDIA_PRODUCTIVITY_SLUGS: ReadonlySet<string> = new Set([
  'pie-chart',
  'timeseries',
  'sankey',
  'map-chart',
  'flow',
  'custom-chart',
  'audio-recorder',
  'video-recorder',
  'camera-capture',
  'media-studio',
  'media-viewer',
  'editor',
  'calendar-canvas',
]);

export const V04_COMPLETE_SLUGS: ReadonlySet<string> = new Set([
  ...V04_FORMS_OVERLAYS_LAYOUT_SLUGS,
  ...V04_CHARTS_MEDIA_PRODUCTIVITY_SLUGS,
]);

export function V04CompleteDemo({ slug }: { slug: string }) {
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
    default:
      return null;
  }
}
