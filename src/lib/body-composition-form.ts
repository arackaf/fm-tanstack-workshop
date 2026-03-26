import { useForm } from "@tanstack/react-form";

import type { BodyCompositionMeasurementState } from "@/data/body-composition/body-composition-state";

const defaultMeasurementDate = () => {
  return new Date();
};

export const createDefaultBodyCompositionMeasurement =
  (): BodyCompositionMeasurementState => {
    return {
      bodyCompositionMetricId: 0,
      measurementDate: defaultMeasurementDate(),
      value: "",
      lengthUnit: null,
      weightUnit: null,
    };
  };

export const useBodyCompositionMeasurementForm = (
  submitValue: (value: BodyCompositionMeasurementState) => void | Promise<void>,
  defaultValues: BodyCompositionMeasurementState = createDefaultBodyCompositionMeasurement(),
) => {
  return useForm({
    defaultValues,

    onSubmit: async ({ value }) => {
      await submitValue(value);
    },
  });
};

export type BodyCompositionMeasurementForm = ReturnType<
  typeof useBodyCompositionMeasurementForm
>;
