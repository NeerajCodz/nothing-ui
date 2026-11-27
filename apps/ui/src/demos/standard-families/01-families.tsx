import * as React from 'react';
import {
  ButtonGroup,
  ChatBubble,
  InteractiveCoreCharts,
  MotionPresetStage,
  NothingAudioPlayer,
  NothingLocationCard,
  NothingLogo,
  NothingOnboardingChecklist,
  NothingSortableList,
  SensitiveInput,
  TagInput,
} from '@nothing-ui/ui';

export function StandardFamilyDemo({ slug }: { slug: string }) {
  const [groupVal, setGroupVal] = React.useState('25x25');

  if (slug === 'brand-logo') {
    return (
      <div className="flex flex-wrap items-center gap-8">
        <NothingLogo size="sm" />
        <NothingLogo size="md" />
        <NothingLogo size="lg" />
        <NothingLogo size="lg" showWordmark={false} />
      </div>
    );
  }

  if (slug === 'chat') {
    return (
      <div className="w-full max-w-md space-y-3">
        <ChatBubble role="incoming" author="GLYPH CORE" timestamp="14:22">
          Synced 25×25 circular mask with 481 addressable LEDs. Ready to flash sequence.
        </ChatBubble>
        <ChatBubble
          role="outgoing"
          author="ENGINEER"
          timestamp="14:23"
          attachment={{ name: 'heartbeat-v1.json', size: '4.2 KB' }}
        >
          Exported GlyphPatternV1 payload and verified 13×13 area resampling.
        </ChatBubble>
      </div>
    );
  }

  if (slug === 'charts') {
    return (
      <div className="w-full max-w-4xl">
        <InteractiveCoreCharts />
      </div>
    );
  }

  if (slug === 'media-kit') {
    return (
      <div className="w-full max-w-2xl space-y-4">
        <NothingAudioPlayer />
        <NothingLocationCard />
      </div>
    );
  }

  if (slug === 'motion-kit') {
    return <MotionPresetStage />;
  }

  if (slug === 'productivity-kit') {
    return (
      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        <NothingSortableList />
        <NothingOnboardingChecklist />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-md">
      <ButtonGroup
        value={groupVal}
        onValueChange={setGroupVal}
        items={[
          { id: '25x25', label: '25×25' },
          { id: '13x13', label: '13×13' },
          { id: '9x9', label: '9×9 Icons' },
        ]}
      />
      <SensitiveInput />
      <TagInput />
    </div>
  );
}
