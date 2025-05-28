import { useFieldOptions } from "@/lib/hooks";
import { SelectField } from "../form/select-field";
import { MultiSelectField } from "../form/multi-select-field";
import { TextInputField } from "../form/text-input-field";
import { ComboboxField } from "@/components/form/combobox-field";

type Props = {
  integration: string;
  sourceType: string;
  mainInputValue: string;
  mainInputKey: string;
  dependantInputValue: string;
  dependantInputKey: string;
  customConfig: Record<string, string | object>;
  setCustomConfig: (config: object) => void;
  optionFilter: string;
  setOptionFilter: (filter: string) => void;
};

export const VariableInput = ({
  integration,
  sourceType,
  mainInputValue,
  mainInputKey,
  dependantInputValue,
  dependantInputKey,
  customConfig,
  setCustomConfig,
  optionFilter,
  setOptionFilter,
}: Props) => {
  const { data: options, isFetching } = useFieldOptions({
    integration: integration,
    sourceType: sourceType,
    search: "",
    parameters: [
      {
        cacheKey: mainInputKey,
        value: mainInputValue,
      },
      {
        cacheKey: dependantInputKey,
        value: dependantInputValue,
      },
    ],
  });
  const { required, nonRequired } = separateOptions(options.data);
  
  const handleAddCustomField = (value: string | null) => {
    const customOption = options.data.find((o: Option) => o.id === value);
    
    setOptionFilter("");
    setCustomConfig((customConfig: object) => ({
      ...customConfig,
      [customOption.id]: "",
    }));
    
    return;
  }

  if (isFetching) {
    return <>loading...</>
  }

  return (
    <div className="flex flex-col gap-6 pl-4 border-l border-gray-200">
      {!isFetching &&
        required.map((o) => (
          <InputSwitch
            key={o.id}
            option={o}
            value={o.id in customConfig ? customConfig[o.id] : ""}
            onChange={(value) => {
              setCustomConfig((customConfig: object) => ({
                ...customConfig,
                [o.id]: value,
              }));
            }}
          />
        ))}
      {nonRequired.filter(option => option.id in customConfig).map((o) => (
        <div className="flex items-center justify-between">
          <InputSwitch
            key={o.id}
            option={o}
            value={customConfig[o.id] || ""}
            onChange={(value) => {
              setCustomConfig((customConfig: object) => ({
                ...customConfig,
                [o.id]: value,
              }));
            }}
          />
          <span
            onClick={() => {
              const pruned = { ...customConfig };
              delete pruned[o.id];
              setCustomConfig(pruned);
            }}
          >
            🗑️
          </span>
        </div>
      ))}
      {!isFetching && nonRequired.length && (
        <ComboboxField
          id={`${integration}-custom-variable-field-selector`}
          title={"Add field"}
          required={false}
          value={optionFilter}
          placeholder={optionFilter || "Select an option..."}
          onSelect={handleAddCustomField}
          isFetching={isFetching}
          onDebouncedChange={setOptionFilter}
          
        >
          {nonRequired
            .filter((option) => !(option.id in customConfig))
            .filter((option) =>
              option?.title?.toLowerCase().includes(optionFilter.toLowerCase()),
            )
            .map((option) => {
              return (
                <ComboboxField.Item key={option.id} value={option.id}>
                  {option.title}
                </ComboboxField.Item>
              );
            })}
        </ComboboxField>
      )}
    </div>
  );
};

const InputSwitch = ({
  option,
  value,
  onChange,
}: {
  value: string | object | Array<string>;
  onChange: (x: unknown) => void;
  option: Option;
}) => {
  switch (option.type) {
    case "multi":
    case "multiCheckbox":
      return (
        <MultiSelectField
          id={option.id}
          title={option.title}
          required={option.required}
          value={value as string[]}
          onChange={onChange}
          allowClear
        >
          {option.items && option.items.map((option) => (
            <MultiSelectField.Item key={option.value} value={option.value}>
              {option.label}
            </MultiSelectField.Item>
          ))}
        </MultiSelectField>
      );
    case "dropdown":
      return (
        <SelectField
          id={option.id}
          title={option.title}
          required={option.required}
          value={value as string}
          onChange={onChange}
          allowClear
        >
          {option.items && option.items.map((option) => (
            <SelectField.Item key={option.value} value={option.value}>
              {option.label}
            </SelectField.Item>
          ))}
        </SelectField>
      );
    case "number":
      return (
        <TextInputField
          id={option.id}
          type={"number"}
          title={option.title}
          value={value as string}
          onChange={onChange}
          disabled={false}
          required={option.required}
        />
      );
    case "string":
      return (
        <TextInputField
          id={option.id}
          type={"text"}
          title={option.title}
          value={value as string}
          onChange={onChange}
          disabled={false}
          required={option.required}
        />
      );
    default:
      return null;
  }
};

type Option = {
  id: string;
  title: string;
  required: boolean;
  value: string;
  onChange: (value: string) => void;
  type: "multi" | "string" | "dropdown" | "multiCheckbox" | "number";
  items?: Array<{ value: string; label: string }>;
}

const separateOptions = (
  options: Array<Option>,
): { required: Array<Option>; nonRequired: Array<Option> } => {
  const organized: { required: Array<Option>; nonRequired: Array<Option> } = {
    required: [],
    nonRequired: [],
  };

  for (const option of options) {
    if (option.required) {
      organized.required.push(option);
    } else {
      organized.nonRequired.push(option);
    }
  }

  return organized;
};
