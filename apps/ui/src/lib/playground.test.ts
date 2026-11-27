import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PLAYGROUND_SCHEMAS,
  buildPlaygroundSnippet,
  getInitialPlaygroundState,
  serializeJsxProps,
} from './playground';

test('every playground schema has valid defaults, bounds, and single-package nthgui imports', () => {
  const schemas = Object.values(PLAYGROUND_SCHEMAS);
  assert.ok(schemas.length >= 16, `Expected at least 16 playground schemas, found ${schemas.length}`);

  for (const schema of schemas) {
    assert.ok(
      schema.importPath === 'nthgui' ||
        schema.importPath === 'nthgui/icons' ||
        schema.importPath === 'nthgui/glyph',
      `Unexpected importPath "${schema.importPath}" for ${schema.slug}`,
    );

    const state = getInitialPlaygroundState(schema);
    for (const ctrl of schema.controls) {
      assert.equal(state[ctrl.name], ctrl.defaultValue);
      if (ctrl.kind === 'select') {
        assert.ok(
          ctrl.options.includes(ctrl.defaultValue),
          `${schema.slug}.${ctrl.name} default "${ctrl.defaultValue}" not in options`,
        );
      } else if (ctrl.kind === 'number') {
        assert.ok(
          ctrl.defaultValue >= ctrl.min && ctrl.defaultValue <= ctrl.max,
          `${schema.slug}.${ctrl.name} default ${ctrl.defaultValue} outside [${ctrl.min}, ${ctrl.max}]`,
        );
      }
    }

    const snippet = buildPlaygroundSnippet(schema, state);
    assert.ok(snippet.includes(`import { ${schema.componentName} } from "${schema.importPath}";`));
    assert.ok(snippet.includes(`<${schema.componentName}`));
    assert.equal(snippet.includes('@nothing-ui/'), false);
    assert.equal(snippet.includes('undefined'), false);
    assert.equal(snippet.includes('NaN'), false);
  }
});

test('serializeJsxProps handles special component mappings, explicit false overrides, and quote escaping', () => {
  // DotIcon signal boolean converts to color="#D71921"
  const dotIcon = PLAYGROUND_SCHEMAS['dot-icon'];
  const dotState = { ...getInitialPlaygroundState(dotIcon), signal: true };
  assert.ok(serializeJsxProps(dotIcon, dotState).includes('color="#D71921"'));
  assert.equal(serializeJsxProps(dotIcon, dotState).includes('signal'), false);

  // GlyphMatrix resolution serializes as numeric prop rather than string
  const glyph = PLAYGROUND_SCHEMAS['glyph-matrix'];
  const glyphState = { ...getInitialPlaygroundState(glyph), resolution: '13', interactive: false };
  const glyphProps = serializeJsxProps(glyph, glyphState);
  assert.ok(glyphProps.includes('resolution={13}'));
  assert.ok(glyphProps.includes('interactive={false}'));

  // Button childrenProp renders as JSX children rather than attribute and escapes quotes in text props
  const button = PLAYGROUND_SCHEMAS.button;
  const btnState = {
    ...getInitialPlaygroundState(button),
    label: 'Flash OS',
    loading: true,
    loadingText: 'Flashing "Phone (3)"',
  };
  const snippet = buildPlaygroundSnippet(button, btnState);
  assert.ok(snippet.includes('>\n      Flash OS\n    </Button>'));
  assert.ok(snippet.includes('loadingText="Flashing &quot;Phone (3)&quot;"'));
  assert.equal(snippet.includes('label="Flash OS"'), false);
});
