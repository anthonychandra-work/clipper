import { Icon } from '@/shared/ui';

import type { SettingsEditor } from '../hooks/use-settings';
import { type ChoiceName, SETTING_FIELDS, type Settings } from '../lib/setting-options';

interface SelectRowProps {
  name: ChoiceName;
  settings: Settings;
  choose: SettingsEditor['choose'];
}

export function SelectRow({ name, settings, choose }: SelectRowProps) {
  const field = SETTING_FIELDS[name];
  return (
    <label className="row" htmlFor={`setting-${name}`}>
      <span className="row__label">{field.label}</span>
      <span className="menu-button">
        <select id={`setting-${name}`} value={settings[name]} onChange={(event) => choose(name, event.target.value)}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-up-down" />
      </span>
    </label>
  );
}
