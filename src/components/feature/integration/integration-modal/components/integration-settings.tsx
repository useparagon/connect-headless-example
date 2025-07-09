import {
  ConnectInputValue,
  IntegrationSharedInputStateMap,
  paragon,
  SerializedConnectInput,
} from '@useparagon/connect';
import { useState } from 'react';

import { SerializedConnectInputPicker } from '@/components/feature/serialized-connect-input-picker';
import { Button } from '@/components/ui/button';

export function IntegrationSettingsSection(props: { integration: string }) {
  const settings =
    paragon.getIntegrationConfig(props.integration).availableUserSettings ?? [];

  if (!settings || settings.length === 0) {
    return null;
  }

  const user = paragon.getUser();

  if (!user.authenticated) {
    throw new Error('User is not authenticated');
  }

  const integration = user.integrations[props.integration];

  if (!integration) {
    throw new Error('Integration not found');
  }

  const sharedSettings = integration.sharedSettings ?? {};

  return (
    <div>
      <fieldset className="border rounded-md p-4">
        <legend className="text-lg font-bold px-2">
          User integration settings
        </legend>
        <IntegrationSettings
          integration={props.integration}
          settings={settings}
          settingsState={sharedSettings}
        />
      </fieldset>
    </div>
  );
}

function IntegrationSettings(props: {
  integration: string;
  settings: SerializedConnectInput[];
  settingsState: IntegrationSharedInputStateMap;
}) {
  const { settings, settingsState } = props;
  const [formState, setFormState] = useState<Record<string, ConnectInputValue>>(
    () =>
      Object.fromEntries(
        settings.map((setting) => [setting.id, settingsState[setting.id]])
      )
  );
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (id: string, value: ConnectInputValue) => {
    setFormState((current) => ({
      ...current,
      [id]: value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    paragon
      .updateIntegrationUserSettings(props.integration, formState)
      .catch((error) => {
        console.error('Failed to update integration user settings', error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="flex flex-col gap-6">
      {settings?.map((setting) => (
        <SerializedConnectInputPicker
          key={setting.id}
          integration={props.integration}
          field={setting}
          value={formState[setting.id]}
          onChange={(value) => updateField(setting.id, value)}
        />
      ))}
      <div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
