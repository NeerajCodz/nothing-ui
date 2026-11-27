export { DotIcon, type DotIconProps } from '@nothing-ui/dot-icons/react';

// Family 14: Glyph Matrix (10 Nothing UI exclusive components)
export {
  GlyphMatrix,
  GlyphMatrix25,
  GlyphMatrix13,
  GlyphCell,
  GlyphPatternPreview,
  GlyphPatternPicker,
  GlyphProgress,
  GlyphAnimator,
  GlyphEditor,
  GlyphTimeline,
  type GlyphMatrixProps,
  type GlyphCellProps,
} from './components/glyph-matrix';

// Family 15: Dotted UI (DotIcon + DotText, DotLoader, DotCounter, DotProgress, DotMatrixClock)
export {
  DotText,
  DotCounter,
  DotProgress,
  DotMatrixClock,
  type DotTextProps,
  type DotCounterProps,
  type DotProgressProps,
  type DotMatrixClockProps,
} from './components/dotted-ui';

// Family 16: Hardware-Inspired (RotaryKnob, SegmentedBar, LEDIndicator, SignalMeter, QuickSettingTile, Stepper)
export {
  LEDIndicator,
  SignalMeter,
  QuickSettingTile,
  type LEDIndicatorProps,
  type SignalMeterProps,
  type QuickSettingTileProps,
} from './components/hardware-ui';

// Standard UI additions across Actions, Forms, Chat, Charts, Media, Motion, Productivity, Brand
export {
  NothingLogo,
  ButtonGroup,
  SensitiveInput,
  TagInput,
  ChatBubble,
  NothingSparkline,
  NothingBarChart,
  NothingRadialChart,
  NothingAudioPlayer,
  NothingLocationCard,
  MotionPresetStage,
  NothingSortableList,
  NothingOnboardingChecklist,
} from './components/standard-extras';

// Stateful Hardware, Clock, Media & Productivity Widgets
export * from './components/widgets';
export * from './lib/widgets/clock-engine';
export * from './lib/widgets/analog-clock-physics';
export * from './lib/widgets/calendar-widget-logic';
export * from './lib/widgets/hardware-widget-logic';
export * from './lib/widgets/utility-widget-logic';
export {
  DEFAULT_SEARCH_BAR_ITEMS,
  DEFAULT_VOICE_SAMPLES,
  MAX_SEARCH_BAR_HISTORY,
  SEARCH_BAR_HISTORY_KEY,
  SEARCH_BAR_SCOPES,
  filterSearchBarItems,
  moveActiveResultIndex,
  pushRecentQuery,
  readSearchBarHistory,
  removeRecentQuery,
  splitHighlightSegments,
  writeSearchBarHistory,
  type HighlightSegment,
  type SearchBarItem,
  type SearchBarScope,
} from './lib/search-bar-logic';

// Family 09: Interactive, Configurable Charts & Data Visualizations (all 9 chart modules)
export {
  CHART_PALETTES,
  DEFAULT_CHART_STYLE,
  getPaletteColors,
  resolveSeriesColor,
  computeNiceDomain,
  buildLinePath,
  buildAreaPath,
  computeSeriesStats,
  clampBrushDomain,
  polarToCartesian,
  describeDonutSlicePath,
  formatMetricNumber,
  serializeChartCsv,
  prepareStandaloneSvgString,
  exportSvgElementToSvg,
  exportSvgElementToPng,
  exportCsvFile,
  copyTextSafely,
  type ChartCurveMode,
  type ChartGridMode,
  type ChartPaletteId,
  type ChartPalettePreset,
  type ChartStyleConfig,
  type Point2D,
  type NiceDomain,
  type SeriesStats,
} from './lib/chart-engine';
export {
  InteractiveChartFrame,
  ChartFloatingTooltip,
  type ChartLegendSeries,
  type ChartBreakdownStat,
  type ChartTooltipRow,
  type ChartTooltipPayload,
  type ChartScrubberProps,
  type ChartConfigCapabilities,
  type InteractiveChartFrameProps,
} from './components/charts/chart-frame';
export {
  InteractiveCoreCharts,
  InteractiveSparklineStrip,
  InteractiveTimeseriesChart,
  InteractiveCustomChart,
  type BaseInteractiveChartProps,
  type InteractiveCoreChartsProps,
} from './components/charts/cartesian-charts';
export {
  InteractiveRadarChart,
  InteractivePieChart,
  type InteractiveRadarChartProps,
  type InteractivePieChartProps,
} from './components/charts/polar-charts';
export {
  InteractiveSankeyChart,
  InteractiveMapChart,
  InteractiveFlowChart,
} from './components/charts/network-charts';

export { Button, NothingButton, type NothingButtonProps, type ButtonVariant, type ButtonSize } from './components/button';
export {
  Loader,
  NothingLoader,
  type NothingLoaderProps,
  type NothingLoadingProps,
} from './components/loader';
export {
  LoadingConfigProvider,
  useLoadingConfig,
  useResolvedLoading,
  useAsyncAction,
  type LoadingConfigProviderProps,
} from './hooks/loading-provider';
export {
  LOADER_VARIANTS,
  LOADING_POSITIONS,
  DEFAULT_LOADER_VARIANT,
  DEFAULT_LOADING_CONFIG,
  COMPONENT_LOADING_PROFILES,
  resolveLoaderVariant,
  resolveLoadingFlag,
  getComponentLoadingProfile,
  type LoaderVariant,
  type LoadingPosition,
  type SkeletonAnimation,
  type LoadingArchetype,
  type LoadingConfigState,
  type ComponentLoadingProfile,
} from './lib/loading-logic';
export {
  THEME_STORAGE_KEY,
  ThemeProvider,
  ScopedTheme,
  useTheme,
  useOptionalTheme,
  isThemeMode,
  readStoredTheme,
  writeStoredTheme,
  applyThemeToRoot,
  type ThemeContextValue,
} from './hooks/theme-provider';
export { cn } from './lib/cn';
export {
  ARIA_INVALID_INPUT_CLASSES,
  DEVICE_SERIAL_FORMAT,
  DEVICE_SERIAL_PATTERN,
  DEVICE_SERIAL_REGEX_SOURCE,
  REGEX_VALIDATION_PRESETS,
  compileValidationRegex,
  formatRegexErrorMessage,
  formatSubmitShortcutLabel,
  isAriaInvalidValue,
  isFormSubmitShortcut,
  validateDeviceSerial,
  validateFormSchema,
  validateWithRegex,
  type AriaInvalidInput,
  type CompiledRegexResult,
  type RegexNormalizationMode,
  type RegexValidationPreset,
  type RegexValidationResult,
  type RegexValidationRule,
  type SubmitShortcutEventLike,
} from './lib/form-logic';

// Canonical single-package public re-exports of all battle-tested @ui-sdk/react Nothing components
export {
  NothingInput,
  NothingSearchInput,
  NothingTextarea,
  CopyField,
  CopyField as NothingCopyField,
} from '@/components/nothing/Input';
export {
  NothingSwitch,
  NothingCheckbox,
  NothingRadioGroup,
  NothingSlider,
  NothingRating,
  NothingNumberInput,
  NothingNumberInput as NothingNumberStepper,
  NothingOTPInput,
  NothingSegmentedControl,
  NothingToggleGroup,
  RotaryKnob,
  RotaryKnob as NothingRotaryKnob,
} from '@/components/nothing/Controls';
export {
  NothingTabs,
  NothingAccordion,
  NothingCollapsible,
  NothingPagination,
  NothingDropdownMenu,
  NothingSelect,
  NothingTreeView,
  NothingCommandInline,
  NothingCommandInline as NothingCommandPreview,
} from '@/components/nothing/Navigation';
export {
  appToaster,
  NothingToastRegion,
  NothingDialogDemo,
  NothingDrawerDemo,
  NothingPopoverTooltipDemo,
} from '@/components/nothing/Overlays';
export {
  NothingAlert,
  NothingBanner,
  NothingProgress,
  NothingMeter,
  SegmentedBar,
  SegmentedBar as NothingSegmentedBar,
  NothingStepper,
  NothingStepper as Stepper,
  DotLoader,
  DotLoader as NothingDotLoader,
  NothingSkeleton,
  NothingEmptyState,
  NothingBreadcrumb,
  NothingSeparator,
  NothingKbd,
  NothingCodeBlock,
  NothingAvatarGroup,
  InteractiveChipsDemo,
} from '@/components/nothing/Feedback';
export {
  NothingCard,
  NothingCalendar,
  NothingTimeline,
  ActivityStream,
  ActivityStream as NothingActivityStream,
  MetricCard,
  MetricCard as NothingMetricCard,
  LiveCounter,
  LiveCounter as NothingLiveCounter,
  NothingDataTable,
  NothingDropzone,
} from '@/components/nothing/DataDisplay';
