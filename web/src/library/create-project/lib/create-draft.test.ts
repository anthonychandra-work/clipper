import { describe, expect, it } from 'vitest';

import { chooseLength, createDraft, takeDefaultLength } from './create-draft';

describe('a draft of a new project', () => {
  it('starts at 25–60 s with no length chosen', () => {
    expect(createDraft()).toMatchObject({ length: 'standard', isLengthChosen: false });
  });

  it('takes the default length of Settings while no length was chosen', () => {
    const draft = { ...createDraft(), link: 'https://video.example/talk' };

    expect(takeDefaultLength(draft, 'long')).toEqual({ ...draft, length: 'long' });
    expect(takeDefaultLength(takeDefaultLength(draft, 'long'), 'short').length).toBe('short');
  });

  it('keeps a length that was chosen in the sheet when the default arrives', () => {
    const chosen = chooseLength(createDraft(), 'short');

    expect(chosen).toMatchObject({ length: 'short', isLengthChosen: true });
    expect(takeDefaultLength(chosen, 'long')).toBe(chosen);
  });

  it('keeps 25–60 s when it was chosen in the sheet over another default', () => {
    const chosen = chooseLength(createDraft(), 'standard');

    expect(takeDefaultLength(chosen, 'long').length).toBe('standard');
  });

  it('counts a length chosen after the default arrived as chosen', () => {
    const chosen = chooseLength(takeDefaultLength(createDraft(), 'long'), 'short');

    expect(takeDefaultLength(chosen, 'long').length).toBe('short');
  });
});
