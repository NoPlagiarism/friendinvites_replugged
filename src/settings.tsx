import { components, settings, util } from "replugged";
const { Flex, SelectItem, CheckboxItem } = components;

export interface Settings {
  mode: string;
  alwaysSendSimple: boolean;
}

export const defaultSettings: Partial<Settings> = {
  mode: "simple",
  alwaysSendSimple: true,
};

export const cfg = await settings.init<Settings, keyof typeof defaultSettings>(
  "xyz.noplagi.friendinvites",
  defaultSettings,
);

const ModeOptions = [
  {
    label: "Simple - default",
    value: "simple",
  },
  {
    label: "Escaped - piOS compatible (and other themes that transforms ephemeral text)",
    value: "escaped",
  },
];

export function SettingsWindow(): React.ReactElement {
  return (
    <Flex style={{ gap: "1vh" }} direction={Flex.Direction.VERTICAL}>
      <SelectItem {...util.useSetting(cfg, "mode")} options={ModeOptions}>
        Message mode
      </SelectItem>
      <CheckboxItem {...util.useSetting(cfg, "alwaysSendSimple")}>
        Always Send simple embeddable invite message to chat
      </CheckboxItem>
    </Flex>
  );
}
